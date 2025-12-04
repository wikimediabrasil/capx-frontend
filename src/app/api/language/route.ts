export const dynamic = 'force-dynamic';

import fs from 'fs';
import path from 'path';
import { NextRequest, NextResponse } from 'next/server';

/**
 * Returns the absolute path to the `locales` directory.
 * Centralized to avoid repeating `process.cwd()` path joins.
 */
function getLocalesDir() {
  return path.join(process.cwd(), 'locales');
}

/**
 * Reads a JSON file from disk and parses its contents.
 * Synchronous by design because API routes run on the server and files are small.
 */
function readJson(filePath: string) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

/**
 * Extracts placeholder tokens from a string.
 * Supports `$token` and `{token}` patterns to keep translations consistent with defaults.
 */
function getPlaceholders(str: string): Set<string> {
  const dollar = str.match(/\$[A-Za-z0-9_-]+/g) || [];
  const braces = str.match(/\{[A-Za-z0-9_-]+\}/g) || [];
  return new Set([...dollar, ...braces]);
}

/**
 * Compiles translated content ensuring placeholder integrity.
 */
function compileWithPlaceholders(
  defaultContent: Record<string, any>,
  translation: Record<string, any>
): Record<string, any> {
  const compileEntry = (defVal: any, trVal: any) => {
    // Non-string values are returned as-is, preferring translation when available
    if (typeof defVal !== 'string') {
      return trVal === undefined ? defVal : trVal;
    }

    // For string values, ensure placeholders match
    if (typeof trVal !== 'string') {
      return defVal;
    }

    // Check for placeholders in the default value
    // If no placeholders, return the translation directly
    const defPlaceholders = getPlaceholders(defVal);
    if (defPlaceholders.size === 0) {
      return trVal;
    }

    // Verify all default placeholders are present in the translation
    const trPlaceholders = getPlaceholders(trVal);
    const missing = Array.from(defPlaceholders).some(ph => !trPlaceholders.has(ph));

    // If any placeholders are missing in the translation, fall back to the default
    return missing ? defVal : trVal;
  };

  const compiled: Record<string, any> = {};
  for (const key of Object.keys(defaultContent)) {
    const defVal = defaultContent[key];
    const trVal = translation[key];
    compiled[key] = compileEntry(defVal, trVal);
  }
  return compiled;
}

/**
 * Lists available language codes from the `locales` folder.
 * Filters out `qqq.json` (message documentation file not intended for UI).
 */
function listLanguages(): string[] {
  const files = fs.readdirSync(getLocalesDir());
  return files.filter(file => file !== 'qqq.json').map(file => path.basename(file, '.json'));
}

/**
 * GET /api/language
 * - Without `lang` query: returns available language codes.
 * - With `lang` query: returns compiled translations ensuring placeholders match defaults.
 * Errors:
 * - ENOENT (missing file) -> 404
 * - Other failures -> 500 with logged details
 */
export async function GET(request: NextRequest) {
  const lang = request.nextUrl.searchParams.get('lang');

  try {
    if (!lang) {
      return NextResponse.json(listLanguages());
    }

    const localesDir = getLocalesDir();
    const defaultContent = readJson(path.join(localesDir, 'en.json'));
    const translation = readJson(path.join(localesDir, `${lang}.json`));
    const compiled = compileWithPlaceholders(defaultContent, translation);
    return NextResponse.json(compiled);
  } catch (error: any) {
    // Provide meaningful status codes and log the error for observability
    const status = error?.code === 'ENOENT' ? 404 : 500;
    const message = error?.message || 'Failed to fetch language data';
    console.error('Language API error:', error);
    return NextResponse.json({ error: message }, { status });
  }
}
