/*
 Checks that all keys accessed via pageContent['...'] exist in locales/en.json
 and flags keys present in en.json that are not used anywhere in the codebase.
 Exits with non-zero code if any issues are found.
*/

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const SRC_DIR = path.join(ROOT, 'src');
const EN_JSON_PATH = path.join(ROOT, 'locales', 'en.json');

function readJson(filePath) {
  const raw = fs.readFileSync(filePath, 'utf8');
  try {
    return JSON.parse(raw);
  } catch (e) {
    console.error(`Failed to parse JSON: ${filePath}`);
    throw e;
  }
}

function* walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      // Skip common folders that shouldn't affect i18n usage
      if (['.next', 'node_modules', 'coverage'].includes(entry.name)) continue;
      yield* walk(full);
    } else if (entry.isFile()) {
      // Consider TS/JS and JSX/TSX files only
      if (/\.(ts|tsx|js|jsx)$/.test(entry.name)) {
        yield full;
      }
    }
  }
}

function collectUsedKeys() {
  const used = new Set();
  // Match pageContent['key'] or pageContent?.['key']
  const fileRegex = /pageContent\s*(?:\?\.)?\[\s*([`'\"])(.*?)\1\s*\]/g;

  for (const file of walk(SRC_DIR)) {
    const content = fs.readFileSync(file, 'utf8');

    // Find bracket notation with string literal keys
    let match;
    while ((match = fileRegex.exec(content)) !== null) {
      const key = match[2];
      if (key) used.add(key);
    }

    // Intentionally avoid dot-notation (pageContent.key) to prevent false positives
    // like pageContent.match or pageContent.toString. Use bracket notation in codebase
    // for i18n keys to ensure they are detected here.
  }
  return used;
}

function removeUnusedKeys(filePath, unusedKeys) {
  const content = readJson(filePath);
  let removed = 0;

  for (const key of unusedKeys) {
    if (key in content) {
      delete content[key];
      removed++;
    }
  }

  if (removed > 0) {
    fs.writeFileSync(filePath, JSON.stringify(content, null, 2) + '\n', 'utf8');
    console.log(`✓ Removed ${removed} unused translation keys from ${path.basename(filePath)}`);
  }

  return removed;
}

function main() {
  const isFixMode = process.argv.includes('--fix');

  if (!fs.existsSync(EN_JSON_PATH)) {
    console.error(`en.json not found at ${EN_JSON_PATH}`);
    process.exit(2);
  }

  const en = readJson(EN_JSON_PATH);
  const allEnKeys = new Set(Object.keys(en));
  const usedKeys = collectUsedKeys();

  const missing = [];
  for (const key of usedKeys) {
    if (!allEnKeys.has(key)) missing.push(key);
  }

  const unused = [];
  for (const key of allEnKeys) {
    if (!usedKeys.has(key)) unused.push(key);
  }

  let hasErrors = false;

  if (missing.length) {
    hasErrors = true;
    console.error(`\nMissing i18n keys in en.json (${missing.length}):`);
    missing.sort().forEach(k => console.error(`  - ${k}`));
  }

  if (unused.length) {
    if (isFixMode) {
      console.log(`\nFound ${unused.length} unused i18n keys. Removing them...`);
      removeUnusedKeys(EN_JSON_PATH, unused);

      // Check for other locale files and remove from them too
      const localesDir = path.dirname(EN_JSON_PATH);
      const localeFiles = fs
        .readdirSync(localesDir)
        .filter(file => file.endsWith('.json') && file !== 'en.json')
        .map(file => path.join(localesDir, file));

      for (const localeFile of localeFiles) {
        if (fs.existsSync(localeFile)) {
          removeUnusedKeys(localeFile, unused);
        }
      }
    } else {
      const failOnUnused = (process.env.I18N_FAIL_ON_UNUSED || 'true').toLowerCase() !== 'false';
      if (failOnUnused) hasErrors = true;

      // Show a capped list to keep logs concise, but include total count
      const preview = unused.sort().slice(0, 200);
      const heading = `\nUnused i18n keys present in en.json (${unused.length} total, showing up to 200):`;
      if (failOnUnused) {
        console.error(heading);
      } else {
        console.warn(heading);
      }
      preview.forEach(k => (failOnUnused ? console.error(`  - ${k}`) : console.warn(`  - ${k}`)));
      if (unused.length > preview.length) {
        (failOnUnused ? console.error : console.warn)(
          `  ...and ${unused.length - preview.length} more`
        );
      }

      if (failOnUnused) {
        console.error('\nTo automatically remove unused keys, run: yarn lint:i18n:fix');
      }
    }
  }

  if (hasErrors) {
    console.error('\n✖ i18n check failed. Please update locales/en.json or usage.');
    process.exit(1);
  } else {
    if (isFixMode && unused.length > 0) {
      console.log('\n✓ i18n check completed: unused keys removed successfully.');
    } else {
      console.log('✓ i18n check passed: all used keys exist and en.json has no unused keys.');
    }
  }
}

main();
