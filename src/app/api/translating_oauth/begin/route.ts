export const dynamic = 'force-dynamic';

import axios from 'axios';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get('authorization');

  try {
    const response = await axios.post(
      `${process.env.BASE_URL}/translating_oauth/begin/`,
      {},
      { headers: { Authorization: authHeader } }
    );
    return NextResponse.json(response.data);
  } catch (error: unknown) {
    const err = error as { response?: { status?: number; data?: unknown }; message?: string };
    return NextResponse.json(
      { error: 'Failed to begin OAuth', details: err.response?.data ?? err.message },
      { status: err.response?.status ?? 500 }
    );
  }
}
