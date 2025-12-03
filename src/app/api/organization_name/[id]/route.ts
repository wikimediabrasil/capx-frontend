export const dynamic = 'force-dynamic';

import axios from 'axios';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const authHeader = request.headers.get('authorization');

  try {
    const response = await axios.get(`${process.env.BASE_URL}/organization_name/${params.id}/`, {
      headers: {
        Authorization: authHeader,
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    });

    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error('Error fetching organization name:', error.response?.data || error.message);
    return NextResponse.json(
      {
        error: 'Failed to fetch organization name',
        details: error.response?.data || error.message,
      },
      { status: error.response?.status || 500 }
    );
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const authHeader = request.headers.get('authorization');

  try {
    const body = await request.json();

    const response = await axios.put(
      `${process.env.BASE_URL}/organization_name/${params.id}/`,
      body,
      {
        headers: {
          Authorization: authHeader,
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
      }
    );

    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error('Error updating organization name:', error.response?.data || error.message);
    return NextResponse.json(
      {
        error: 'Failed to update organization name',
        details: error.response?.data || error.message,
      },
      { status: error.response?.status || 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const authHeader = request.headers.get('authorization');

  try {
    await axios.delete(`${process.env.BASE_URL}/organization_name/${params.id}/`, {
      headers: {
        Authorization: authHeader,
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    });

    return NextResponse.json({ success: true }, { status: 204 });
  } catch (error: any) {
    console.error('Error deleting organization name:', error.response?.data || error.message);
    return NextResponse.json(
      {
        error: 'Failed to delete organization name',
        details: error.response?.data || error.message,
      },
      { status: error.response?.status || 500 }
    );
  }
}
