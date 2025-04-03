import { NextRequest, NextResponse } from "next/server";
import { serverApi } from "@/lib/utils/api";

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");

  if (!authHeader) {
    return Response.json({ error: "Authentication required" }, { status: 401 });
  }

  try {
    const response = await serverApi.get("/profile/", {
      headers: {
        Authorization: authHeader,
      },
    });

    return Response.json(response.data);
  } catch (error: any) {
    // If the backend returned 401, it means the token is invalid
    if (error.response?.status === 401) {
      return new Response(JSON.stringify({ detail: "Invalid token." }), {
        status: 401,
        headers: {
          "Content-Type": "application/json",
        },
      });
    }

    return Response.json({ error: "Failed to fetch profile" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const userId = request.nextUrl.searchParams.get("userId");
  let searchParams = new URLSearchParams(request.nextUrl.search);
  const formData = await request.json();

  // Convert body data to URL parameters
  Object.entries(formData).forEach(([key, value]) => {
    if (value !== null && value !== undefined) {
      if (Array.isArray(value)) {
        value.forEach((v) => searchParams.append(key, v));
      } else {
        searchParams.set(key, value.toString());
      }
    }
  });

  try {
    const response = await serverApi.put(
      `${process.env.BASE_URL}/profile/${userId}/?${searchParams.toString()}`,
      formData,
      {
        headers: {
          Authorization: authHeader,
        },
      }
    );

    if (response.status === 200) {
      return NextResponse.json(response.data);
    } else {
      return NextResponse.json(
        { error: "Failed to update user profile" },
        { status: response.status }
      );
    }
  } catch (error) {
    console.error("PUT request error:", error);
    return NextResponse.json(
      { error: "Failed to update user profile." },
      { status: 500 }
    );
  }
}

export async function OPTIONS(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const userId = searchParams.get("userId");
  const authHeader = request.headers.get("authorization");

  try {
    const response = await serverApi.options(
      `${process.env.BASE_URL}/profile/${userId}`,
      {
        headers: {
          Authorization: authHeader,
        },
      }
    );
    // Removing "user" key/value
    const { user, ...formFields } = response.data.actions.PUT;

    return NextResponse.json(formFields);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch options" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  const body = await request.json();
  const authHeader = request.headers.get("authorization");
  const userId = body.user.id;

  try {
    const response = await serverApi.delete(
      process.env.BASE_URL + "/profile/" + userId,
      {
        headers: {
          Authorization: authHeader,
        },
      }
    );

    if (response.status === 200) {
      return NextResponse.json(response.data);
    } else {
      return NextResponse.json(
        { error: "Failed to delete user profile" },
        { status: response.status }
      );
    }
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete user profile" },
      { status: 500 }
    );
  }
}
