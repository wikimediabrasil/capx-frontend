import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query');
    const format = searchParams.get('format') || 'json';

    if (!query) {
      return NextResponse.json({ error: 'Query parameter is required' }, { status: 400 });
    }

    // Validate query before processing
    if (typeof query !== 'string' || query.trim() === '') {
      console.error('❌ Invalid query received:', { query, type: typeof query });
      return NextResponse.json({ error: 'Invalid query format' }, { status: 400 });
    }

    // Make the request from the server side to bypass Anubis protection
    let metabaseUrl;
    try {
      metabaseUrl = `https://metabase.wikibase.cloud/query/sparql?format=${format}&query=${encodeURIComponent(query)}`;

      // Validate URL length (some servers have limits)
      if (metabaseUrl.length > 8192) {
        console.warn('⚠️ URL is very long:', metabaseUrl.length, 'characters');
      }
    } catch (urlError) {
      console.error('❌ Error constructing URL:', urlError);
      return NextResponse.json({ error: 'Error constructing request URL' }, { status: 500 });
    }

    const response = await fetch(metabaseUrl, {
      method: 'GET',
      headers: {
        Accept: 'application/sparql-results+json',
        'User-Agent': 'CapX-NextJS/1.0 (https://github.com/your-org/capx-frontend)',
        // Add some headers to look more like a regular browser request
        'Accept-Language': 'en-US,en;q=0.9',
        'Cache-Control': 'no-cache',
        Pragma: 'no-cache',
      },
    });

    if (!response.ok) {
      console.error('❌ Metabase request failed:', response.status, response.statusText);
      return NextResponse.json(
        { error: `Metabase request failed: ${response.status} ${response.statusText}` },
        { status: response.status }
      );
    }

    const contentType = response.headers.get('content-type');

    if (contentType?.includes('application/json') || contentType?.includes('sparql-results+json')) {
      const data = await response.json();
      return NextResponse.json(data);
    } else {
      // If we get HTML, it's likely the Anubis protection page
      const text = await response.text();
      console.warn('⚠️ Got HTML response instead of JSON (likely Anubis protection)');

      return NextResponse.json(
        {
          error: 'Metabase returned HTML instead of JSON (anti-bot protection active)',
          isAnubisProtection: true,
        },
        { status: 503 }
      );
    }
  } catch (error) {
    console.error('❌ Server-side Metabase request error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
