import axios from "axios";
import fs from "fs";
import path from "path";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const lang = searchParams.get('lang');

  try {
    if (lang) {
      const defaultFilePath = path.join(process.cwd(), 'locales', 'en.json');
      const defaultPageContent = JSON.parse(fs.readFileSync(defaultFilePath, 'utf8'));

      const filePath = path.join(process.cwd(), 'locales', `${lang}.json`);
      const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

      const compiledData = { ...defaultPageContent, ...data };

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
