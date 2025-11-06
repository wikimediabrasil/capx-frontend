export const dynamic = 'force-dynamic';

import axios from 'axios';
import { NextRequest, NextResponse } from 'next/server';
import { handleApiError } from '@/lib/utils/api-error-handler';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');

    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const response = await axios.get(`${process.env.BASE_URL}/recommendation/`, {
      headers: {
        Authorization: authHeader,
      },
    });

    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error('Recommendation API error:', error);
    return handleApiError(error);
  }
}

