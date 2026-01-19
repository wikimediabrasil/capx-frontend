import axios from 'axios';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  try {
    const response = await axios.get(`${process.env.BASE_URL}/territory`, {
      headers: {
        Authorization: authHeader,
      },
    });
    return NextResponse.json(response.data);
  } catch {
    return NextResponse.json({ error: 'Failed to fetch territories' }, { status: 500 });
  }
}
