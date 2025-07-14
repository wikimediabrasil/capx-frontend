import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const authHeader = request.headers.get('authorization');
  const id = params.id;

  try {
    const response = await axios.get(`${process.env.BASE_URL}/tag_diff/${id}`, {
      headers: { Authorization: authHeader },
    });
    return NextResponse.json(response.data);
  } catch (error: any) {
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
    return NextResponse.json({ error: 'Failed to delete news' }, { status: 500 });
  }
}
