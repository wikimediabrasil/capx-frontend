export const dynamic = 'force-dynamic';

import axios from 'axios';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');

  try {
    const response = await axios.get(`${process.env.BASE_URL}/translating_oauth/status/`, {
      headers: { Authorization: authHeader },
    });
    return NextResponse.json(response.data);
  } catch (error: unknown) {
    const err = error as { response?: { status?: number; data?: unknown }; message?: string };
    return NextResponse.json(
      { error: 'Failed to fetch OAuth status', details: err.response?.data ?? err.message },
      { status: err.response?.status ?? 500 }
    );
  }
}
