import axios from 'axios';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  const username = request.nextUrl.searchParams.get('username');

  if (!username) {
    return NextResponse.json({ error: 'Username is required' }, { status: 400 });
  }

  try {
    const response = await axios.get(
      `https://letsconn.toolforge.org/exists/?username=${encodeURIComponent(username)}`,
      {
        headers: {
          Authorization: authHeader || '',
        },
      }
    );

    return NextResponse.json(response.data);
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to get LetsConnect exists data' },
      { status: error.response?.status || 500 }
    );
  }
}
