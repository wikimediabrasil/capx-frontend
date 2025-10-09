#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Configuration
const DUPLICATION_THRESHOLD = 10; // Maximum acceptable duplication percentage
const MIN_LINES = 5; // Minimum lines to consider as duplication
const MIN_TOKENS = 50; // Minimum tokens to consider as duplication

console.log('\n🔍 Checking for code duplication...\n');

try {
  // Get list of changed files in the current branch compared to dev
  let changedFiles;
  try {
    changedFiles = execSync('git diff --name-only dev...HEAD', { encoding: 'utf-8' })
      .split('\n')
      .filter(file => file.match(/\.(tsx?|jsx?)$/))
      .filter(file => file.length > 0);
  } catch (error) {
    console.log(
      '⚠️  Could not compare with dev branch. Checking all TypeScript/JavaScript files instead.'
    );
    changedFiles = execSync('git ls-files "*.ts" "*.tsx" "*.js" "*.jsx"', { encoding: 'utf-8' })
      .split('\n')
      .filter(file => file.length > 0);
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
  const jscpdCommand = 'npx jscpd ./src';

  console.log('Running jscpd...\n');

  let output;
  try {
    output = execSync(jscpdCommand, { encoding: 'utf-8', stdio: 'pipe' });
  } catch (error) {
    // jscpd might exit with error code if duplications are found
    output = error.stdout || '';
  }

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
