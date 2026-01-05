export const dynamic = 'force-dynamic';

import axios from 'axios';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization');
    const searchParams = request.nextUrl.searchParams;
    const limit = searchParams.get('limit');
    const offset = searchParams.get('offset');

    if (!authHeader) {
      return NextResponse.json({ error: 'No authorization token provided' }, { status: 401 });
    }

    const response = await axios.get(`${process.env.BASE_URL}/avatar/`, {
      headers: {
        Authorization: authHeader,
      },
      params: {
        limit,
        offset,
      },
    });

    if (!response.data) {
      throw new Error('No data received from backend');
    }

    return NextResponse.json(response.data.results);
  } catch (error: any) {
    console.error('Avatar fetch error:', {
      url: `${process.env.BASE_URL}/avatar/`,
      error: error.response?.data || error.message,
      status: error.response?.status,
    });
    return NextResponse.json(
      { error: 'Failed to fetch avatars' },
      { status: error.response?.status || 500 }
    );
  }
}
