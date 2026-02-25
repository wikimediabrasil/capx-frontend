import axios from 'axios';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  try {
    const response = await axios.get(
      `${process.env.BASE_URL}/statistics/languages-by-territory/`,
      {
        headers: {
          Authorization: authHeader,
        },
      }
    );
    return NextResponse.json(response.data);
  } catch (error) {
    console.error('Error fetching languages by territory:', error);
    return NextResponse.json(
      { error: 'Failed to fetch languages by territory' },
      { status: 500 }
    );
  }
}
