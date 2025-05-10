import { NextRequest, NextResponse } from "next/server";
import axios from "axios";


// POST handler
export async function POST(request: NextRequest) {
  const authHeader = request.headers.get("authorization");

  try {
    const body = await request.json();

    const response = await axios.post(
      `${process.env.BASE_URL}/letsconnect/`,
      body,
      {
        headers: {
          Authorization: authHeader,
        },
      }
    );
    return NextResponse.json(response.data);
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to send lets connect data" },
      { status: error.response?.status || 500 }
    );
  }
}
