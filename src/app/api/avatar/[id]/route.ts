import { NextResponse, NextRequest } from 'next/server';
import axios from 'axios';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const authHeader = request.headers.get('authorization');

    if (!authHeader) {
      return NextResponse.json({ error: 'No authorization token provided' }, { status: 401 });
    }

    const response = await axios.get(`${process.env.BASE_URL}/avatar/${params.id}/`, {
      headers: {
        Authorization: authHeader,
      },
    });

    if (!response.data) {
      throw new Error('No data received from backend');
    }

    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error('Avatar fetch error:', {
      url: `${process.env.BASE_URL}/avatar/${params.id}/`,
      error: error.response?.data || error.message,
      status: error.response?.status,
      headers: error.config?.headers,
    });
    return NextResponse.json(
      {
        error: 'Failed to fetch avatar',
        details: error.response?.data || error.message,
      },
      { status: error.response?.status || 500 }
    );
  }
}
