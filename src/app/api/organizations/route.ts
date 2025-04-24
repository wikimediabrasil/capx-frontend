import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    const searchParams = request.nextUrl.searchParams;

    const params = {
      limit: searchParams.get("limit") || undefined,
      offset: searchParams.get("offset") || undefined,
      search: searchParams.get("search") || undefined,
      territory: searchParams.get("territory") || undefined,
      available_capacities: searchParams.get("available_capacities") || undefined,
      wanted_capacities: searchParams.get("wanted_capacities") || undefined,
      has_capacities_wanted: searchParams.get("has_capacities_wanted") === "true" ? true : undefined,
      has_capacities_available: searchParams.get("has_capacities_available") === "true" ? true : undefined,
    };

    const cleanParams = Object.fromEntries(
      Object.entries(params).filter(([_, value]) => value !== undefined)
    );

    const response = await axios.get(`${process.env.BASE_URL}/organizations/`, {
      headers: {
        Authorization: authHeader,
      },
      params: cleanParams
    });
    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error("Error details:", {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
    });
    return NextResponse.json(
      { error: "Failed to fetch organizations" },
      { status: error.response?.status || 500 }
    );
  }
}
