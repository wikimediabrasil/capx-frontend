export const dynamic = 'force-dynamic';

import axios from 'axios';
import { NextRequest, NextResponse } from 'next/server';
import { handleApiError } from '@/lib/utils/api-error-handler';

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const response = await axios.post(
      `${process.env.BASE_URL}/mentorship_form_mentee_response/`,
      body,
      { headers: { Authorization: authHeader } }
    );
    return NextResponse.json(response.data);
  } catch (error: unknown) {
    console.error('Error submitting mentee response:', error);
    return handleApiError(error as Parameters<typeof handleApiError>[0]);
  }
}
