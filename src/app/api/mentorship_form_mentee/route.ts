export const dynamic = 'force-dynamic';

import axios from 'axios';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const response = await axios.get(`${process.env.BASE_URL}/mentorship_form_mentee/`);
    return NextResponse.json(response.data);
  } catch (error: unknown) {
    const err = error as { response?: { status?: number; data?: unknown }; message?: string };
    console.error('Error fetching mentee forms:', err.message, err.response?.data);
    return NextResponse.json(
      { error: 'Failed to fetch mentee forms', details: err.response?.data || err.message },
      { status: err.response?.status || 500 }
    );
  }
}
