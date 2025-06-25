import axios from "axios";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get("Authorization");
    if (!token) {
      return NextResponse.json(
        { error: "No authorization token provided" },
        { status: 401 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const limit = searchParams.get("limit");
    const offset = searchParams.get("offset");

    const backendUrl = process.env.BASE_URL;
    const response = await axios.get(`${backendUrl}/document/`, {
      headers: {
        Authorization: token,
        "Content-Type": "application/json",
      },
      params: {
        limit,
        offset,
      },
    });

    return NextResponse.json(response.data.results);
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to fetch documents", details: error.response?.data },
      { status: error.response?.status || 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  
  try {
    const token = request.headers.get("Authorization");
    if (!token) {
      console.error("❌ API route - No authorization token provided");
      return NextResponse.json(
        { error: "No authorization token provided" },
        { status: 401 }
      );
    }

    const body = await request.json();
    
    if (!body.url || typeof body.url !== 'string' || body.url.trim() === '') {
      console.error("❌ API route - Invalid URL in request body:", body);
      return NextResponse.json(
        { 
          error: "Invalid request body", 
          details: "URL is required and must be a non-empty string",
          received: body
        },
        { status: 400 }
      );
    }

    if (body.organization) {
      if (typeof body.organization !== 'number' || body.organization <= 0) {
        return NextResponse.json(
          { 
            error: "Invalid organization ID", 
            details: "Organization must be a positive number",
            received: body
          },
          { status: 400 }
        );
      }
    }

    if (body.creator) {
      if (typeof body.creator !== 'number' || body.creator <= 0) {
        return NextResponse.json(
          { 
            error: "Invalid creator ID", 
            details: "Creator must be a positive number",
            received: body
          },
          { status: 400 }
        );
      }
    }

    const backendUrl = process.env.BASE_URL;


    if (!backendUrl) {
      console.error("❌ API route - Backend URL not configured");
      return NextResponse.json(
        { error: "Backend URL not configured" },
        { status: 500 }
      );
    }

    const response = await axios.post(`${backendUrl}/document/`, body, {
      headers: {
        Authorization: token,
        "Content-Type": "application/json",
      },
    });
    
    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error("Document creation error:", {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      requestData: error.config?.data,
      backendUrl: process.env.BASE_URL,
      isAxiosError: error.isAxiosError,
      code: error.code
    });

    return NextResponse.json(
      {
        error: "Failed to create document",
        details: error.response?.data || error.message,
        status: error.response?.status,
        backendError: error.response?.data
      },
      { status: error.response?.status || 500 }
    );
  }
}
