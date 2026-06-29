import { handleApiError } from '@/lib/utils/api-error-handler';
import axios from 'axios';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');

    if (!authHeader) {
      return NextResponse.json({ error: 'Token não fornecido' }, { status: 401 });
    }

    // Extract user id from request body to proxy to the backend profile endpoint
    const body = await request.json().catch(() => ({}));
    const userId = body.userId;

    const backendUrl = userId
      ? `${process.env.BASE_URL}/profile/${encodeURIComponent(userId)}/`
      : `${process.env.BASE_URL}/profile/`;

    await axios.get(backendUrl, {
      headers: { Authorization: authHeader },
    });

    return NextResponse.json({ valid: true, status: 'authenticated' });
  } catch (error: any) {
    if (error.response?.status === 401) {
      return NextResponse.json(
        { error: 'Invalid token.', detail: 'Invalid token.', shouldLogout: true },
        { status: 401 }
      );
    }
    return handleApiError(error);
  }
}
