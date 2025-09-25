import axios from 'axios';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;

  // Busca por imagens
  if (searchParams.has('query')) {
    const query = encodeURIComponent(searchParams.get('query')!);
    try {
      const queryResponse = await axios.get(
        `https://commons.wikimedia.org/w/api.php?action=query&list=search&srnamespace=6&srlimit=10&format=json&srsearch=${query}`
      );

      if (!queryResponse.data.hasOwnProperty('query')) {
        return NextResponse.json({ message: 'No images found' }, { status: 404 });
      }

      const images = queryResponse.data.query.search.map((image: { title: string }) => image.title);

      return NextResponse.json(images);
    } catch (error: any) {
      console.error('Error fetching images:', error?.message || error);

      return NextResponse.json(
        {
          error: 'Failed to fetch images',
          details: error?.response?.data || error?.message,
        },
        { status: 500 }
      );
    }
  }

  // Busca por título específico
  if (searchParams.has('title')) {
    const title = encodeURIComponent(searchParams.get('title')!);
    const suffix = searchParams.has('thumb') ? '&width=100&height=50' : '&width=300&height=300';

    try {
      const queryResponse = await axios.get(
        `https://commons.wikimedia.org/w/index.php?title=Special:Redirect/file/${title}${suffix}`
      );

      const image = queryResponse.request?.res?.responseUrl;
      return NextResponse.json({ image });
    } catch (error: any) {
      console.error('Error fetching image:', error?.message || error);

      return NextResponse.json(
        {
          error: 'Failed to fetch image',
          details: error?.response?.data || error?.message,
        },
        { status: 500 }
      );
    }
  }

  return NextResponse.json({ message: 'Invalid query' }, { status: 400 });
}
