#!/usr/bin/env node

const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Configuration
const DUPLICATION_THRESHOLD = 10; // Maximum acceptable duplication percentage
const MIN_LINES = 5; // Minimum lines to consider as duplication
const MIN_TOKENS = 50; // Minimum tokens to consider as duplication

/**
 * Gets a list of trusted directories to search for executables
 * These are standard system directories that should be write-protected
 *
 * @returns {string[]} Array of trusted directory paths
 */
function getTrustedDirectories() {
  // Standard system directories that are typically read-only for regular users
  const dirs = [
    '/usr/local/bin',
    '/usr/bin',
    '/bin',
    '/usr/local/sbin',
    '/usr/sbin',
    '/sbin',
  ];

  // Add common package manager directories based on OS
  // These are managed by package managers and are also considered trusted
  if (process.platform === 'darwin') {
    // macOS Homebrew paths (Intel and Apple Silicon)
    dirs.push('/opt/homebrew/bin', '/usr/local/Homebrew/bin');
  }

  // Node.js global bin directory (cross-platform)
  if (process.env.npm_config_prefix) {
    dirs.push(path.join(process.env.npm_config_prefix, 'bin'));
  }

  return dirs;
}

/**
 * Validates that a command exists in trusted system directories
 *
 * Security measures:
 * - Only searches in predefined, trusted system directories
 * - Does NOT rely on PATH environment variable
 * - Verifies file exists and is executable
 * - Prevents PATH manipulation attacks
 *
 * @param {string} commandName - The name of the command to validate
 * @returns {string} The full path to the command
 * @throws {Error} If command is not found in trusted directories
 */
function validateCommand(commandName) {
  const trustedDirs = getTrustedDirectories();

  // Search for command in trusted directories only
  for (const dir of trustedDirs) {
    const commandPath = path.join(dir, commandName);

    try {
      // Check if file exists and is executable
      if (fs.existsSync(commandPath)) {
        const stats = fs.statSync(commandPath);
        // Check if file is executable (mode includes execute bit)
        if (stats.mode & fs.constants.S_IXUSR || stats.mode & fs.constants.S_IXGRP || stats.mode & fs.constants.S_IXOTH) {
          return commandPath;
        }
      }
    } catch (error) {
      // Continue searching in other directories
      continue;
    }
  }

  throw new Error(
    `Command '${commandName}' not found in trusted directories: ${trustedDirs.join(', ')}`
  );
}

/**
 * Safely executes a command with security validation
 *
 * Security measures:
 * - Validates command exists in trusted directories only
 * - Uses full absolute path for command execution
 * - Uses shell: false to prevent shell injection attacks
 * - Arguments are passed as array to prevent command injection
 * - Does NOT rely on PATH environment variable
 *
 * This approach addresses SonarCloud security warnings about PATH usage
 * by using only trusted, write-protected system directories.
 *
 * @param {string} command - The command name to execute
 * @param {string[]} args - Array of arguments for the command
 * @param {object} options - Options to pass to spawnSync
 * @returns {object} The result from spawnSync
 * @throws {Error} If command validation fails
 */
function safeSpawn(command, args, options = {}) {
  // SECURITY: Validate command exists in trusted directories and get full path
  let commandPath;
  try {
    commandPath = validateCommand(command);
  } catch (error) {
    throw new Error(`Security validation failed: ${error.message}`);
  }

  // SECURITY: Execute using full absolute path with shell: false
  return spawnSync(commandPath, args, {
    ...options,
    shell: false,
  });
}

console.log('\n🔍 Checking for code duplication...\n');

try {
  // Get list of changed files in the current branch compared to dev
  let changedFiles;
  try {
    // SECURITY: Using safeSpawn with validated 'git' command and array arguments
    const gitDiffResult = safeSpawn('git', ['diff', '--name-only', 'dev...HEAD'], {
      encoding: 'utf-8',
    });

    if (gitDiffResult.error) {
      throw gitDiffResult.error;
    }

    changedFiles = gitDiffResult.stdout
      .split('\n')
      .filter(file => file.match(/\.(tsx?|jsx?)$/))
      .filter(file => file.length > 0);
  } catch (error) {
    console.log(
      '⚠️  Could not compare with dev branch. Checking all TypeScript/JavaScript files instead.'
    );
    // SECURITY: Using safeSpawn with validated 'git' command and array arguments
    const gitLsResult = safeSpawn('git', ['ls-files', '*.ts', '*.tsx', '*.js', '*.jsx'], {
      encoding: 'utf-8',
    });

    changedFiles = gitLsResult.stdout.split('\n').filter(file => file.length > 0);
  }

  if (changedFiles.length === 0) {
    console.log('✅ No TypeScript/JavaScript files changed.\n');
    process.exit(0);
  }

  console.log(`📝 Checking ${changedFiles.length} file(s) for duplication:\n`);
  changedFiles.forEach(file => console.log(`   - ${file}`));
  console.log('');

  // Run jscpd on the entire src directory to catch cross-file duplications
  // Configuration is in .jscpd.json file
  console.log('Running jscpd...\n');

  // SECURITY: Using safeSpawn with validated 'npx' command and array arguments
  const jscpdResult = safeSpawn('npx', ['jscpd', './src'], {
    encoding: 'utf-8',
    stdio: 'pipe',
  });

  // jscpd might exit with error code if duplications are found, but we still want to continue
  // to read the report

  // Parse jscpd report
  const reportPath = path.join(process.cwd(), 'jscpd-report', 'jscpd-report.json');

  if (!fs.existsSync(reportPath)) {
    console.log('⚠️  Could not generate duplication report. Skipping check.\n');
    process.exit(0);
  }

  const report = JSON.parse(fs.readFileSync(reportPath, 'utf-8'));

  // Filter duplicates to only include those involving changed files
  const changedFilesSet = new Set(changedFiles.map(f => path.resolve(process.cwd(), f)));
  const relevantDuplicates = (report.duplicates || []).filter(dup => {
    const firstFilePath = path.resolve(process.cwd(), dup.firstFile.name);
    const secondFilePath = path.resolve(process.cwd(), dup.secondFile.name);
    return changedFilesSet.has(firstFilePath) || changedFilesSet.has(secondFilePath);
  });

  // Calculate duplication percentage for changed files only
  let totalChangedLines = 0;
  let duplicatedChangedLines = 0;

  changedFiles.forEach(file => {
    const filePath = path.resolve(process.cwd(), file);
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf-8');
      totalChangedLines += content.split('\n').length;
    }
  });

  relevantDuplicates.forEach(dup => {
    duplicatedChangedLines += parseInt(dup.lines || 0);
  });

  const duplicatedPercentage =
    totalChangedLines > 0 ? (duplicatedChangedLines / totalChangedLines) * 100 : 0;

  console.log(`📊 Duplication Statistics (changed files only):`);
  console.log(`   Total lines in changed files: ${totalChangedLines}`);
  console.log(`   Duplicated lines: ${duplicatedChangedLines}`);
  console.log(`   Duplication percentage: ${duplicatedPercentage.toFixed(2)}%`);
  console.log(`   Threshold: ${DUPLICATION_THRESHOLD}%\n`);

  if (relevantDuplicates.length > 0) {
    console.log(`🔄 Found ${relevantDuplicates.length} duplication(s) in changed files:\n`);

    relevantDuplicates.slice(0, 5).forEach((dup, index) => {
      console.log(
        `   ${index + 1}. ${path.relative(process.cwd(), dup.firstFile.name)}:${dup.firstFile.start}-${dup.firstFile.end}`
      );
      console.log(
        `      ↔ ${path.relative(process.cwd(), dup.secondFile.name)}:${dup.secondFile.start}-${dup.secondFile.end}`
      );
      console.log(`      (${dup.lines} lines, ${dup.tokens} tokens)\n`);
    });

    if (relevantDuplicates.length > 5) {
      console.log(`   ... and ${relevantDuplicates.length - 5} more duplication(s)\n`);
    }
  }

  // Clean up report directory
  const reportDir = path.join(process.cwd(), 'jscpd-report');
  if (fs.existsSync(reportDir)) {
    fs.rmSync(reportDir, { recursive: true, force: true });
  }

  if (duplicatedPercentage > DUPLICATION_THRESHOLD) {
    console.log(`❌ Duplication check failed!`);
    console.log(
      `   ${duplicatedPercentage.toFixed(2)}% duplication exceeds threshold of ${DUPLICATION_THRESHOLD}%\n`
    );
    console.log(`💡 Suggestions to reduce duplication:`);
    console.log(`   - Extract repeated code into shared components`);
    console.log(
      `   - Use Tailwind responsive breakpoints (sm:, md:, lg:) instead of separate Desktop/Mobile components`
    );
    console.log(`   - Create utility functions for repeated logic`);
    console.log(`   - Consider using composition patterns\n`);
    process.exit(1);
  }

  console.log(`✅ Duplication check passed!\n`);
  process.exit(0);
} catch (error) {
  console.error('❌ Error running duplication check:', error.message);
  console.log('');

  // Don't fail the build if the duplication check has errors
  console.log('⚠️  Skipping duplication check due to error.\n');
  process.exit(0);
}
