import axios from 'axios';
import { NextRequest, NextResponse } from 'next/server';

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const authHeader = request.headers.get('authorization');
  const formData = await request.json();

  try {
    const payload = {
      ...formData,
      user: {
        id: Number(params.id),
      },
    };

    const response = await axios.put(`${process.env.BASE_URL}/profile/${params.id}/`, payload, {
      headers: {
        Authorization: authHeader,
      },
    });

    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error('PUT request error:', error.response?.data || error.message);
    return NextResponse.json(
      {
        error: 'Failed to update user profile',
        details: error.response?.data || error.message,
      },
      { status: error.response?.status || 500 }
    );
  }
}

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const authHeader = request.headers.get('authorization');

  try {
    const response = await axios.get(`${process.env.BASE_URL}/profile/${params.id}/`, {
      headers: {
        Authorization: authHeader,
      },
    });

    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error('GET request error:', error.response?.data || error.message);
    return NextResponse.json(
      {
        error: 'Failed to get user profile',
        details: error.response?.data || error.message,
      },
      { status: error.response?.status || 500 }
    );
  }
}
