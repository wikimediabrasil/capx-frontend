export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';

// Only allow fetching Diff blog articles here - this endpoint exists to build
// a preview card for a *specific* article an org linked to (as opposed to
// /api/news/[tag], which searches by category). Restricting the host keeps
// this from becoming an open URL-fetching proxy.
const ALLOWED_HOSTNAME = 'diff.wikimedia.org';

const NAMED_ENTITIES: Record<string, string> = {
  amp: '&',
  lt: '<',
  gt: '>',
  quot: '"',
  apos: "'",
  nbsp: ' ',
};

function decodeHtmlEntities(value: string): string {
  return value
    .replace(/&#x([0-9a-fA-F]+);/g, (_, hex) => String.fromCodePoint(parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, dec) => String.fromCodePoint(parseInt(dec, 10)))
    .replace(/&([a-zA-Z]+);/g, (match, name) => NAMED_ENTITIES[name] ?? match);
}

function extractMetaContent(html: string, property: string): string | null {
  const escaped = property.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  // Property/content attribute order varies between pages, so try both.
  const patterns = [
    new RegExp(`<meta[^>]*(?:property|name)=["']${escaped}["'][^>]*content=["']([^"']*)["']`, 'i'),
    new RegExp(`<meta[^>]*content=["']([^"']*)["'][^>]*(?:property|name)=["']${escaped}["']`, 'i'),
  ];
  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match) return decodeHtmlEntities(match[1]);
  }
  return null;
}

export async function GET(request: NextRequest) {
  try {
    const articleUrl = request.nextUrl.searchParams.get('url');
    if (!articleUrl) {
      return NextResponse.json({ error: 'Missing url parameter' }, { status: 400 });
    }

    let parsedUrl: URL;
    try {
      parsedUrl = new URL(articleUrl);
    } catch {
      return NextResponse.json({ error: 'Invalid url' }, { status: 400 });
    }

    if (parsedUrl.protocol !== 'https:' || parsedUrl.hostname !== ALLOWED_HOSTNAME) {
      return NextResponse.json({ error: 'URL not allowed' }, { status: 400 });
    }

    const response = await fetch(parsedUrl.toString());

    // The article may have been deleted/moved - that's a normal empty
    // result, not a failure, so respond 200 with no posts either way.
    if (!response.ok) {
      return NextResponse.json({ posts: [] });
    }

    const html = await response.text();
    const title = extractMetaContent(html, 'og:title');

    if (!title) {
      return NextResponse.json({ posts: [] });
    }

    const post = {
      external_id: parsedUrl.toString(),
      language: extractMetaContent(html, 'og:locale') || 'en',
      description: extractMetaContent(html, 'og:description') || '',
      title,
      image_url: extractMetaContent(html, 'og:image') || '',
      link: extractMetaContent(html, 'og:url') || parsedUrl.toString(),
      pub_date: extractMetaContent(html, 'article:published_time') || new Date().toISOString(),
      categories: {},
    };

    return NextResponse.json(
      { posts: [post] },
      {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
      }
    );
  } catch (error) {
    console.error('Error fetching article preview:', error);
    return NextResponse.json({ posts: [] });
  }
}
