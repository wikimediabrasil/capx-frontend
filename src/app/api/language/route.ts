export const dynamic = 'force-dynamic';

import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const lang = searchParams.get('lang');

  try {
    if (lang) {
      const defaultFilePath = path.join(process.cwd(), 'locales', 'en.json');
      const defaultPageContent = JSON.parse(fs.readFileSync(defaultFilePath, 'utf8'));

      const filePath = path.join(process.cwd(), 'locales', `${lang}.json`);
      const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

      // Build placeholder-aware compiled data: if default has placeholders
      // that are missing in the translation, fall back to the English text
      const getPlaceholders = (str: string): Set<string> => {
        const dollar = str.match(/\$[A-Za-z0-9_-]+/g) || [];
        const braces = str.match(/\{[A-Za-z0-9_-]+\}/g) || [];
        return new Set([...dollar, ...braces]);
      };

      const compiledData: Record<string, any> = {};
      for (const key of Object.keys(defaultPageContent)) {
        const defVal = (defaultPageContent as any)[key];
        const trVal = (data as any)[key];

        if (typeof defVal === 'string') {
          const defPlaceholders = getPlaceholders(defVal);
          if (typeof trVal === 'string') {
            if (defPlaceholders.size > 0) {
              const trPlaceholders = getPlaceholders(trVal);
              // If any required placeholder is missing in translation, use default
              const missing = [...defPlaceholders].some(ph => !trPlaceholders.has(ph));
              compiledData[key] = missing ? defVal : trVal;
            } else {
              compiledData[key] = trVal;
            }
          } else if (trVal !== undefined) {
            // Non-string value provided in translation, keep default to be safe
            compiledData[key] = defVal;
          } else {
            compiledData[key] = defVal;
          }
        } else {
          // For non-string values, prefer translated when defined; else default
          compiledData[key] = trVal !== undefined ? trVal : defVal;
        }
      }

      return NextResponse.json(compiledData);
    } else {
      const localesDir = path.join(process.cwd(), 'locales');
      const files = fs.readdirSync(localesDir);
      const languages = files
        .filter(file => file !== 'qqq.json') // Ignora o arquivo qqq.json
        .map(file => path.basename(file, '.json'));

      return NextResponse.json(languages);
    }
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to fetch language data' }, { status: 500 });
  }
}
