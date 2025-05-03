import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

// GET handler
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const messageId = searchParams.get("messageId");
  const authHeader = request.headers.get("authorization");
  const limit = searchParams.get("limit");
  const offset = searchParams.get("offset");

  try {
    const req_url = messageId ? `/messages/${messageId}` : "/messages";
    const response = await axios.get(`${process.env.BASE_URL}${req_url}`, {
      headers: {
        Authorization: authHeader,
      },
      params: {
        limit,
        offset,
      },
    });
    return NextResponse.json(response.data.results);
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to fetch message" },
      { status: error.response?.status || 500 }
    );
  }
}

// POST handler
export async function POST(request: NextRequest) {
  const authHeader = request.headers.get("authorization");

  try {
    const body = await request.json();
    const response = await axios.post(
      `${process.env.BASE_URL}/messages/`,
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
      { error: "Failed to create message" },
      { status: error.response?.status || 500 }
    );
  }
}

// OPTIONS handler
export async function OPTIONS(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const messageId = searchParams.get("messageId");
  const authHeader = request.headers.get("authorization");

  try {
    const response = await axios.options(
      `${process.env.BASE_URL}/messages/${messageId}`,
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
