import axios from 'axios';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const authHeader = request.headers.get('authorization');
  const id = params.id;

  try {
    const response = await axios.get(`${process.env.BASE_URL}/projects/${id}`, {
      headers: {
        Authorization: authHeader,
      },
    });
    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error('Project fetch error:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      url: `${process.env.BASE_URL}/projects/${id}`,
      headers: {
        Authorization: authHeader ? 'Present' : 'Missing',
      },
    });

    return NextResponse.json(
      {
        error: 'Failed to fetch project with id ' + id,
        details: error.response?.data || error.message,
      },
      { status: error.response?.status || 500 }
    );
  }
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const authHeader = request.headers.get('authorization');
  const id = params.id;
  const body = await request.json();
  try {
    const response = await axios.post(`${process.env.BASE_URL}/projects/${id}`, body, {
      headers: {
        Authorization: authHeader,
      },
    });
    return NextResponse.json(response.data);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update project' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const authHeader = request.headers.get('authorization');
  const id = params.id;
  const body = await request.json();
  try {
    const response = await axios.put(`${process.env.BASE_URL}/projects/${id}/`, body, {
      headers: {
        Authorization: authHeader,
        'Content-Type': 'application/json',
      },
    });
    return NextResponse.json(response.data);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update project' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const authHeader = request.headers.get('authorization');
  const id = params.id;
  try {
    const response = await axios.delete(`${process.env.BASE_URL}/projects/${id}/`, {
      headers: {
        Authorization: authHeader,
        'Content-Type': 'application/json',
      },
    });
    return NextResponse.json(response.data);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete project' }, { status: 500 });
  }
}
