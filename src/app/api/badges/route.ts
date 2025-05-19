import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

// GET handler
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const badgeId = searchParams.get("badgeId");
  const authHeader = request.headers.get("authorization");
  const limit = searchParams.get("limit");
  const offset = searchParams.get("offset");

  try {
    const req_url = badgeId ? `/badges/${badgeId}` : "/badges";
    const response = await axios.get(`${process.env.BASE_URL}${req_url}`, {
      headers: {
        Authorization: authHeader,
      },
      params: {
        limit,
        offset,
      },
    });

    return NextResponse.json(response.data);
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to fetch badges" },
      { status: error.response?.status || 500 }
    );
  }
}
