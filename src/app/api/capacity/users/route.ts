import axios from 'axios';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const capacityId = searchParams.get('id');
  const authHeader = request.headers.get('authorization');

  try {
    const response = await axios.get(`${process.env.BASE_URL}/skill/${searchParams}`, {
      headers: {
        Authorization: authHeader,
      },
    });
    return NextResponse.json(response.data);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch data.' }, { status: 500 });
  }
}
