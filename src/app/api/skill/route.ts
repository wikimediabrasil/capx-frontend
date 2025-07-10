import axios from "axios";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

// returns all skills
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");

  const limit = request.nextUrl.searchParams.get("limit");
  const offset = request.nextUrl.searchParams.get("offset");

  try {
    const response = await axios.get(`${process.env.BASE_URL}/skill`, {
      headers: {
        Authorization: authHeader,
      },
      params: {
        limit,
        offset,
      },
    });

    if (response.data.results) {
      return NextResponse.json(response.data.results);
    } else {
      return NextResponse.json(
        { error: "Failed to fetch skills" },
        { status: 500 }
      );
    }
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch skills" },
      { status: 500 }
    );
  }
}
