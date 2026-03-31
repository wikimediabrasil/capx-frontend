import axios from 'axios';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  try {
    const { searchParams } = new URL(request.url);
    const queryString = searchParams.toString();
    const url = `${process.env.BASE_URL}/territory/${queryString ? `?${queryString}` : ''}`;

    const response = await axios.get(url, {
      headers: {
        Authorization: authHeader,
      },
    });
    return NextResponse.json(response.data);
  } catch {
    return NextResponse.json({ error: 'Failed to fetch territories' }, { status: 500 });
  }
}
