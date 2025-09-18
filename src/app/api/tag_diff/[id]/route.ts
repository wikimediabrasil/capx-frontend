import axios from 'axios';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const authHeader = request.headers.get('authorization');
  const id = params.id;

  try {
    const response = await axios.get(`${process.env.BASE_URL}/tag_diff/${id}`, {
      headers: { Authorization: authHeader },
    });
    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error('Error fetching tag_diff:', error);
    return NextResponse.json({ error: 'Failed to fetch news' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const authHeader = request.headers.get('authorization');
  const id = params.id;

  try {
    const response = await axios.delete(`${process.env.BASE_URL}/tag_diff/${id}`, {
      headers: { Authorization: authHeader },
    });
    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error('Error deleting tag_diff:', error);
    return NextResponse.json({ error: 'Failed to delete news' }, { status: 500 });
  }
}
