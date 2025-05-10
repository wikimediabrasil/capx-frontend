import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;

  // Convert searchParams to object to pass all filters to the backend
  const params: Record<string, string> = {};

  // Extrair todos os parâmetros e adicionar ao objeto params
  searchParams.forEach((value, key) => {
    params[key] = value;
  });

  // Parâmetros específicos para garantir que estejam sendo enviados
  const limit = searchParams.get("limit");
  const offset = searchParams.get("offset");
  const capacities = searchParams.get("capacities");
  const territories = searchParams.get("territories");
  const location_type = searchParams.get("location_type");
  const start_date = searchParams.get("start_date");
  const end_date = searchParams.get("end_date");
  const organization_id = searchParams.get("organization_id");

  // Garantir que todos os parâmetros estejam incluídos
  if (limit) params.limit = limit;
  if (offset) params.offset = offset;
  if (capacities) params.capacities = capacities;
  if (territories) params.territories = territories;
  if (location_type) {
    params.location_type = location_type;
    console.log("API - Enviando location_type:", location_type);
  }
  if (start_date) params.start_date = start_date;
  if (end_date) params.end_date = end_date;
  if (organization_id) params.organization_id = organization_id;

  try {
    const response = await axios.get(`${process.env.BASE_URL}/events/`, {
      params,
    });

    // Return both the results and the total count
    return NextResponse.json({
      results: response.data.results || [],
      count: response.data.count || response.data.results?.length || 0,
    });
  } catch (error: any) {
    console.error(
      "Error fetching events:",
      error.message,
      error.response?.data
    );
    return NextResponse.json(
      {
        error: "Failed to fetch events",
        details: error.response?.data || error.message,
      },
      { status: error.response?.status || 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const event = await request.json();
  try {
    const response = await axios.post(
      `${process.env.BASE_URL}/events/`,
      event,
      {
        headers: {
          Authorization: authHeader,
          "Content-Type": "application/json",
        },
      }
    );

    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error("Event creation error:", {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      event: event,
      headers: {
        Authorization: authHeader,
        "Content-Type": "application/json",
      },
    });
    return NextResponse.json(
      {
        error: "Failed to create event",
        details: error.response?.data || error.message,
      },
      { status: error.response?.status || 500 }
    );
  }
}
