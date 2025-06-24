import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import { handleApiError, isInvalidTokenError } from "@/lib/utils/api-error-handler";

export async function GET(
  request: NextRequest,
  { params }: { params: { resource: string } }
) {
  try {
    const resource = `/list/${params.resource}/`;

    // Get authorization header
    const authorization = request.headers.get("authorization");
    if (!authorization) {
      return NextResponse.json(
        { error: "Authorization header is required" },
        { status: 401 }
      );
    }

    const response = await axios.get(`${process.env.BASE_URL}${resource}`, {
      headers: {
        Authorization: authorization,
      },
    });

    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error("List API error:", error);
    
    // Use the new error handling that detects token expired
    return handleApiError(error);
  }
}
