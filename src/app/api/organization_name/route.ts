export const dynamic = 'force-dynamic';

import axios from 'axios';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  const searchParams = request.nextUrl.searchParams;

  const params: Record<string, string> = {};

  if (searchParams.get('organization')) {
    params.organization = searchParams.get('organization')!;
  }
  if (searchParams.get('language_code')) {
    params.language_code = searchParams.get('language_code')!;
  }
  if (searchParams.get('limit')) {
    params.limit = searchParams.get('limit')!;
  }
  if (searchParams.get('offset')) {
    params.offset = searchParams.get('offset')!;
  }
  if (searchParams.get('ordering')) {
    params.ordering = searchParams.get('ordering')!;
  }

  try {
    const response = await axios.get(`${process.env.BASE_URL}/organization_name/`, {
      headers: {
        Authorization: authHeader,
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      params,
    });

    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error('Error fetching organization names:', error.response?.data || error.message);
    return NextResponse.json(
      {
        error: 'Failed to fetch organization names',
        details: error.response?.data || error.message,
      },
      { status: error.response?.status || 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get('authorization');

  try {
    const body = await request.json();

    const response = await axios.post(`${process.env.BASE_URL}/organization_name/`, body, {
      headers: {
        Authorization: authHeader,
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    });

    return NextResponse.json(response.data, { status: 201 });
  } catch (error: any) {
    console.error('Error creating organization name:', error.response?.data || error.message);
    return NextResponse.json(
      {
        error: 'Failed to create organization name',
        details: error.response?.data || error.message,
      },
      { status: error.response?.status || 500 }
    );
  }
}
