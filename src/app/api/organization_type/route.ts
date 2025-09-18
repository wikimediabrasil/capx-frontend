export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  const searchParams = request.nextUrl.searchParams;
  const limit = searchParams.get('limit');
  const offset = searchParams.get('offset');

  try {
    const response = await axios.get(`${process.env.BASE_URL}/organization_type/`, {
      headers: {
        Authorization: authHeader,
      },
      params: {
        limit,
        offset,
      },
    });

    if (response.data) {
      return NextResponse.json(response.data.results);
    } else {
      return NextResponse.json({ error: 'Organization type not found' }, { status: 404 });
    }
  } catch (error: any) {
    console.error('Error fetching organization type:', error.response?.data || error.message);
    return NextResponse.json(
      { error: 'Failed to fetch organization type', details: error.message },
      { status: 500 }
    );
  }
}
