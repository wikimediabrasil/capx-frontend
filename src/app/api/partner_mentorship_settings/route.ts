export const dynamic = 'force-dynamic';

import axios from 'axios';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const response = await axios.get(`${process.env.BASE_URL}/partner_mentorship_settings/`);
    return NextResponse.json(response.data);
  } catch (error: unknown) {
    const err = error as { response?: { status?: number; data?: unknown }; message?: string };
    console.error('Error fetching partner mentorship settings:', err.message, err.response?.data);
    return NextResponse.json(
      {
        error: 'Failed to fetch partner mentorship settings',
        details: err.response?.data || err.message,
      },
      { status: err.response?.status || 500 }
    );
  }
}
