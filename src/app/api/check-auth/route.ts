import { NextRequest, NextResponse } from 'next/server';
import { handleApiError } from '@/lib/utils/api-error-handler';

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');

    if (!authHeader) {
      return NextResponse.json({ error: 'Token não fornecido' }, { status: 401 });
    }

    return NextResponse.json({ valid: true, status: 'authenticated' });
  } catch (error: any) {
    console.log('Token validation failed:', error.response?.status, error.response?.data);

    // It uses the standard error handling that detects expired token
    return handleApiError(error);
  }
}
