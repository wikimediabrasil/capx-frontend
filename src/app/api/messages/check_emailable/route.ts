export const dynamic = 'force-dynamic';

import axios from 'axios';
import { NextRequest, NextResponse } from 'next/server';

// POST handler for checking if users can send/receive emails
export async function POST(request: NextRequest) {
  const authHeader = request.headers.get('authorization');

  try {
    const body = await request.json();
    const response = await axios.post(
      `${process.env.BASE_URL}/messages/check_emailable/`,
      body,
      {
        headers: {
          Authorization: authHeader,
        },
      }
    );
    return NextResponse.json(response.data);
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to check email availability' },
      { status: error.response?.status || 500 }
    );
  }
}
