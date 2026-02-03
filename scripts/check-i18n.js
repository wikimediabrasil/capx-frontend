/*
 Checks that all keys accessed via pageContent['...'] or pageContent[expr.key] exist in locales/en.json
 and flags keys present in en.json that are not used anywhere in the codebase.
 Exits with non-zero code if any issues are found.
 Supports dynamic keys: in files that use pageContent[someVar.key], keys are also collected from
 object literals in that file that have a property "key" with a string value (e.g. key: 'i18n-key').
*/

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const SRC_DIR = path.join(ROOT, 'src');
const EN_JSON_PATH = path.join(ROOT, 'locales', 'en.json');
const EXCLUDED_DIRS = new Set(['.next', 'node_modules', 'coverage']);
const VALID_FILE_EXTENSIONS = /\.(ts|tsx|js|jsx)$/;
/** Matches pageContent['key'] or pageContent["key"] or pageContent?.['key'] */
const I18N_KEY_REGEX = /pageContent\s*(?:\?\.)?\[\s*([`'"])(.*?)\1\s*\]/g;
/** Matches dynamic access like pageContent[metadata.key] or pageContent[expr.key] */
const DYNAMIC_PAGECONTENT_REGEX = /pageContent\s*(?:\?\.)?\[\s*[^\s'"[\]]+\.key\s*\]/;
/** In files with dynamic access, matches object property key: 'value' or key: "value" */
const METADATA_KEY_REGEX = /key\s*:\s*['"]([^'"]+)['"]/g;
const MAX_PREVIEW_KEYS = 200;

function readJson(filePath) {
  const raw = fs.readFileSync(filePath, 'utf8');
  try {
    return JSON.parse(raw);
  } catch (e) {
    console.error(`Failed to parse JSON: ${filePath}`);
    throw e;
  }
}

function shouldProcessDirectory(dirName) {
  return !EXCLUDED_DIRS.has(dirName);
}

function shouldProcessFile(fileName) {
  return VALID_FILE_EXTENSIONS.test(fileName);
}

function* walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory() && shouldProcessDirectory(entry.name)) {
      yield* walk(full);
    } else if (entry.isFile() && shouldProcessFile(entry.name)) {
      yield full;
    }
  }
}

function extractKeysFromFile(filePath) {
  const keys = new Set();
  const content = fs.readFileSync(filePath, 'utf8');
  let match;

  I18N_KEY_REGEX.lastIndex = 0;
  while ((match = I18N_KEY_REGEX.exec(content)) !== null) {
    const key = match[2];
    if (key) keys.add(key);
  }

  return keys;
}

/**
 * In files that use dynamic pageContent access (e.g. pageContent[metadata.key]),
 * collect keys from object literals that have property key: 'i18n-key'.
 */
function extractDynamicKeysFromFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  if (!DYNAMIC_PAGECONTENT_REGEX.test(content)) return new Set();

  const keys = new Set();
  let match;
  METADATA_KEY_REGEX.lastIndex = 0;
  while ((match = METADATA_KEY_REGEX.exec(content)) !== null) {
    const key = match[1];
    if (key) keys.add(key);
  }
  return keys;
}

function collectUsedKeys() {
  const used = new Set();

  for (const file of walk(SRC_DIR)) {
    const fileKeys = extractKeysFromFile(file);
    fileKeys.forEach(key => used.add(key));

    const dynamicKeys = extractDynamicKeysFromFile(file);
    dynamicKeys.forEach(key => used.add(key));
  }

  return used;
}

function findMissingKeys(usedKeys, allEnKeys) {
  const missing = [];
  for (const key of usedKeys) {
    if (!allEnKeys.has(key)) missing.push(key);
  }
  return missing;
}

function findUnusedKeys(allEnKeys, usedKeys) {
  const unused = [];
  for (const key of allEnKeys) {
    if (!usedKeys.has(key)) unused.push(key);
  }
  return unused;
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

function getOtherLocaleFiles() {
  const localesDir = path.dirname(EN_JSON_PATH);
  return fs
    .readdirSync(localesDir)
    .filter(file => file.endsWith('.json') && file !== 'en.json')
    .map(file => path.join(localesDir, file));
}

function removeUnusedKeysFromAllLocales(unusedKeys) {
  console.log(`\nFound ${unusedKeys.length} unused i18n keys. Removing them...`);
  removeUnusedKeys(EN_JSON_PATH, unusedKeys);

  const localeFiles = getOtherLocaleFiles();
  for (const localeFile of localeFiles) {
    if (fs.existsSync(localeFile)) {
      removeUnusedKeys(localeFile, unusedKeys);
    }
  }
}

function reportMissingKeys(missing) {
  if (missing.length === 0) return false;

  console.error(`\nMissing i18n keys in en.json (${missing.length}):`);
  missing.sort().forEach(k => console.error(`  - ${k}`));
  return true;
}

function shouldFailOnUnused() {
  return (process.env.I18N_FAIL_ON_UNUSED || 'true').toLowerCase() !== 'false';
}

function reportUnusedKeys(unused) {
  const failOnUnused = shouldFailOnUnused();
  const preview = unused.sort().slice(0, MAX_PREVIEW_KEYS);
  const heading = `\nUnused i18n keys present in en.json (${unused.length} total, showing up to ${MAX_PREVIEW_KEYS}):`;

  const logFn = failOnUnused ? console.error : console.warn;
  logFn(heading);
  preview.forEach(k => logFn(`  - ${k}`));

  if (unused.length > preview.length) {
    logFn(`  ...and ${unused.length - preview.length} more`);
  }

  if (failOnUnused) {
    console.error('\nTo automatically remove unused keys, run: yarn lint:i18n:fix');
  }

  return failOnUnused;
}

function handleUnusedKeys(unused, isFixMode) {
  if (unused.length === 0) return false;

  if (isFixMode) {
    removeUnusedKeysFromAllLocales(unused);
    return false;
  }

  return reportUnusedKeys(unused);
}

function validateEnJsonExists() {
  if (!fs.existsSync(EN_JSON_PATH)) {
    console.error(`en.json not found at ${EN_JSON_PATH}`);
    process.exit(2);
  }
}

function printResults(hasErrors, isFixMode, unusedCount) {
  if (hasErrors) {
    console.error('\n✖ i18n check failed. Please update locales/en.json or usage.');
    process.exit(1);
  }

  if (isFixMode && unusedCount > 0) {
    console.log('\n✓ i18n check completed: unused keys removed successfully.');
  } else {
    console.log('✓ i18n check passed: all used keys exist and en.json has no unused keys.');
  }
}

function main() {
  const isFixMode = process.argv.includes('--fix');

  validateEnJsonExists();

  const en = readJson(EN_JSON_PATH);
  const allEnKeys = new Set(Object.keys(en));
  const usedKeys = collectUsedKeys();

  const missing = findMissingKeys(usedKeys, allEnKeys);
  const unused = findUnusedKeys(allEnKeys, usedKeys);

  const hasMissingErrors = reportMissingKeys(missing);
  const hasUnusedErrors = handleUnusedKeys(unused, isFixMode);

  const hasErrors = hasMissingErrors || hasUnusedErrors;

  printResults(hasErrors, isFixMode, unused.length);
}

main();
