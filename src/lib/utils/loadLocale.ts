import fs from 'fs';
import path from 'path';

export function loadLocale(language: string): Record<string, string> {
  const filePath = path.join(process.cwd(), 'locales', `${language}.json`);
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}
