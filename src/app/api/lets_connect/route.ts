import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

// POST handler
export async function POST(request: NextRequest) {
  const authHeader = request.headers.get('authorization');

  try {
    const body = await request.json();

    const response = await axios.post(`${process.env.BASE_URL}/letsconnect/`, body, {
      headers: {
        Authorization: authHeader,
      },
    });
    return NextResponse.json(response.data);
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to send lets connect data' },
      { status: error.response?.status || 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const BASE_URL = "https://letsconn.toolforge.org/profile/";
  const username = request.nextUrl.searchParams.get("username");
  try {
    const response = await axios.get(`${BASE_URL}?username=${username}`, {
      headers: {
        Authorization: authHeader,
      },
    }); 
    return NextResponse.json(response.data);
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to get lets connect data" },
      { status: error.response?.status || 500 }
    );
  }
}
