import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

// GET handler
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const reportId = searchParams.get("reportId");
  const authHeader = request.headers.get("authorization");
  const limit = searchParams.get("limit");
  const offset = searchParams.get("offset");

  
  console.log("GET bugs limit ", limit)
  console.log("GET bugs authorization ", authHeader)
  console.log("GETbugs  offset ", offset)

  try {
    const req_url = reportId ? `/bugs/${reportId}` : "/bugs";
    const response = await axios.get(`${process.env.BASE_URL}${req_url}`, {
      headers: {
        Authorization: authHeader,
      },
      params: {
        limit,
        offset,
      },
    });

    console.log("GET bugs", response)

    return NextResponse.json(response.data.results);
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to fetch report" },
      { status: error.response?.status || 500 }
    );
  }
}

// POST handler
export async function POST(request: NextRequest) {
  const authHeader = request.headers.get("authorization");

  try {
    const body = await request.json();
    const { report: reportId, ...postBody } = body;

    const response = await axios.put(
      `${process.env.BASE_URL}/bugs/${reportId}/`,
      postBody,
      {
        headers: {
          Authorization: authHeader,
        },
      }
    );

    return NextResponse.json(response.data);
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to update report" },
      { status: error.response?.status || 500 }
    );
  }
}

// OPTIONS handler
export async function OPTIONS(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const reportId = searchParams.get("reportId");
  const authHeader = request.headers.get("authorization");

  try {
    const response = await axios.options(
      `${process.env.BASE_URL}/bugs/${reportId}`,
      {
        headers: {
          Authorization: authHeader,
        },
      }
    );

    // Removing "user" key/value from response
    const { user, ...formFields } = response.data.actions.PUT;

    return NextResponse.json(formFields);
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to fetch form fields" },
      { status: error.response?.status || 500 }
    );
  }
}
