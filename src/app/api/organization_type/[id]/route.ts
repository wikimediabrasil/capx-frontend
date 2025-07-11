import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const organizationTypeId = searchParams.get('organizationTypeId');

  const authHeader = request.headers.get('authorization');

  try {
    const response = await axios.get(
      `${process.env.BASE_URL}/organization_type/${encodeURIComponent(organizationTypeId || '')}`,
      {
        headers: {
          Authorization: authHeader,
        },
      }
    );

    if (response.data) {
      return NextResponse.json(response.data);
    } else {
      return NextResponse.json({ error: 'organization_type' }, { status: 404 });
    }
  } catch (error: any) {
    console.error('Error fetching organization type:', error.response?.data || error.message);
    return NextResponse.json(
      { error: 'Failed to fetch organization type', details: error.message },
      { status: 500 }
    );
  }
}
