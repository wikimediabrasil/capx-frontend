export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest, { params }: { params: Promise<{ tag: string }> }) {
  try {
    const { tag } = await params;
    const formattedTag = tag.toLowerCase().replace(/\s+/g, '-');
    const url = `https://diffapi.toolforge.org/tags/${encodeURIComponent(formattedTag)}/`;

    const response = await fetch(url);

    // A 404 from diffapi just means no Diff category matches this tag (e.g. an
    // org's "tag" is actually a post URL, or a keyword that was never used as
    // a category) - a normal empty result, not a failure. Respond 200 with no
    // posts so the browser doesn't log this as a failed network request.
    if (response.status === 404) {
      return NextResponse.json({ posts: [] });
    }

    if (!response.ok) {
      return NextResponse.json({ error: 'Failed to fetch news data' }, { status: response.status });
    }

    const data = await response.json();

    return NextResponse.json(data, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  } catch (error) {
    console.error('Error fetching news:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
