import { NextResponse } from 'next/server';
import axios from 'axios';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const authHeader = request.headers.get('authorization');

  try {
    const response = await axios.get(`${process.env.BASE_URL}/organizations/${params.id}/`, {
      headers: {
        Authorization: authHeader,
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    });

    return NextResponse.json(response.data);
  } catch (error: any) {
    return NextResponse.json(
      {
        error: 'Failed to fetch organization',
        details: error.response?.data || error.message,
      },
      { status: error.response?.status || 500 }
    );
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const body = await request.json();
    const authHeader = request.headers.get('authorization');

    const updateResponse = await axios.put(
      `${process.env.BASE_URL}/organizations/${params.id}/`,
      body,
      {
        headers: {
          Authorization: authHeader,
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
      }
    );

    return NextResponse.json(updateResponse.data);
  } catch (error: any) {
    console.error('Error details:', error.response?.data || error);
    return NextResponse.json(
      {
        error: 'Failed to update organization',
        details: error.response?.data || error.message,
      },
      { status: error.response?.status || 500 }
    );
  }
}
