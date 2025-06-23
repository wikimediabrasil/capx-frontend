import axios from 'axios';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const body = await request.json();
  const token = body.token;
  if (!token) {
    return NextResponse.json({ message: 'Token not provided' }, { status: 400 });
  }

  try {
    const response = await axios.post(`${process.env.BASE_URL}/api/login/social/check/`, {
      oauth_token: token,
    });

    return NextResponse.json(response.data);
  } catch (error) {
    return NextResponse.json({ message: 'Error: ' + error.message }, { status: 500 });
  }
}
