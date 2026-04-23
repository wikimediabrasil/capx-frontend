export const dynamic = 'force-dynamic';

import axios from 'axios';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  const lang = request.nextUrl.searchParams.get('lang');
  const fallback = request.nextUrl.searchParams.get('fallback') ?? 'en';

  if (!lang) {
    return NextResponse.json({ error: 'Missing lang parameter' }, { status: 400 });
  }

  try {
    const response = await axios.get(`${process.env.BASE_URL}/translating/`, {
      headers: { Authorization: authHeader },
      params: { lang, fallback },
    });
    return NextResponse.json(response.data);
  } catch (error: unknown) {
    const err = error as { response?: { status?: number; data?: unknown }; message?: string };
    return NextResponse.json(
      { error: 'Failed to fetch capacities', details: err.response?.data ?? err.message },
      { status: err.response?.status ?? 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  const body = await request.json();

  try {
    const response = await axios.post(`${process.env.BASE_URL}/translating/`, body, {
      headers: { Authorization: authHeader },
    });
    return NextResponse.json(response.data);
  } catch (error: unknown) {
    const err = error as { response?: { status?: number; data?: unknown }; message?: string };
    return NextResponse.json(
      { error: 'Failed to submit translation', details: err.response?.data ?? err.message },
      { status: err.response?.status ?? 500 }
    );
  }
}
