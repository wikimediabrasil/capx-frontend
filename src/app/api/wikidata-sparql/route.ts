export const dynamic = 'force-dynamic';

import { WIKIMEDIA_USER_AGENT } from '@/constants/wikimedia';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query');
    const format = searchParams.get('format') || 'json';

    if (!query?.trim()) {
      return NextResponse.json({ error: 'query parameter is required' }, { status: 400 });
    }

    const response = await fetch(
      `https://query.wikidata.org/sparql?${new URLSearchParams({ format, query })}`,
      {
        headers: {
          Accept: 'application/sparql-results+json',
          'User-Agent': WIKIMEDIA_USER_AGENT,
        },
      }
    );

    if (!response.ok) {
      const text = await response.text();
      console.error('Wikidata SPARQL error:', response.status, text.slice(0, 200));
      return NextResponse.json(
        { error: `Wikidata SPARQL error: ${response.status}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in wikidata-sparql API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
