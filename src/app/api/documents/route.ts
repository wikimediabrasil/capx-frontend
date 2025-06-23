import axios from 'axios';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('Authorization');
    if (!token) {
      return NextResponse.json({ error: 'No authorization token provided' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const limit = searchParams.get('limit');
    const offset = searchParams.get('offset');

    const backendUrl = process.env.BASE_URL;
    const response = await axios.get(`${backendUrl}/document/`, {
      headers: {
        Authorization: token,
        'Content-Type': 'application/json',
      },
      params: {
        limit,
        offset,
      },
    });

    return NextResponse.json(response.data.results);
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to fetch documents', details: error.response?.data },
      { status: error.response?.status || 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('Authorization');
    if (!token) {
      return NextResponse.json({ error: 'No authorization token provided' }, { status: 401 });
    }

    const body = await request.json();

    const backendUrl = process.env.BASE_URL;
    const response = await axios.post(`${backendUrl}/document/`, body, {
      headers: {
        Authorization: token,
        'Content-Type': 'application/json',
      },
    });

    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error('API route - Document creation error:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
    });

    return NextResponse.json(
      {
        error: 'Failed to create document',
        details: error.response?.data || error.message,
      },
      { status: error.response?.status || 500 }
    );
  }
}
