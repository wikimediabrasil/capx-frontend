import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

export async function DELETE(
  request: NextRequest,
  { params: _params }: { params: { id: string } }
) {
  try {
    const authHeader = request.headers.get('authorization');
    const id = request.nextUrl.pathname.split('/').pop();

    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await axios.delete(`${process.env.BASE_URL}/saved_item/${id}/`, {
      headers: {
        Authorization: authHeader,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error details:', {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
    });
    return NextResponse.json(
      { error: 'Failed to delete saved item' },
      { status: error.response?.status || 500 }
    );
  }
}
