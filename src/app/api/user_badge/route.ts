import axios from 'axios';
import { NextRequest, NextResponse } from 'next/server';

// GET handler
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const authHeader = request.headers.get('authorization');
  const limit = searchParams.get('limit');
  const offset = searchParams.get('offset');

  try {
    const response = await axios.get(`${process.env.BASE_URL}/user_badge`, {
      headers: {
        Authorization: authHeader,
      },
      params: {
        limit,
        offset,
      },
    });

    return NextResponse.json(response.data);
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to fetch user badges' },
      { status: error.response?.status || 500 }
    );
  }
}

// PUT handler
export async function PUT(request: NextRequest) {
  const body = await request.json();
  const authHeader = request.headers.get('authorization');

  try {
    const response = await axios.put(`${process.env.BASE_URL}/user_badge/${body.id}`, body, {
      headers: {
        Authorization: authHeader,
        'Content-Type': 'application/json',
      },
    });

    return NextResponse.json(response.data);
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to update user badge' },
      { status: error.response?.status || 500 }
    );
  }
}
