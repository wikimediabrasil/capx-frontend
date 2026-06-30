import axios from 'axios';
import { NextResponse } from 'next/server';

/**
 * Creates a simple GET handler that proxies a backend endpoint.
 * Used by API routes that only need to fetch a list resource.
 */
export function makeSimpleGetHandler(path: string, resourceName: string) {
  return async function GET() {
    try {
      const response = await axios.get(`${process.env.BASE_URL}/${path}/`);
      return NextResponse.json(response.data);
    } catch (error: unknown) {
      const err = error as { response?: { status?: number; data?: unknown }; message?: string };
      console.error(`Error fetching ${resourceName}:`, err.message, err.response?.data);
      return NextResponse.json(
        { error: `Failed to fetch ${resourceName}`, details: err.response?.data || err.message },
        { status: err.response?.status || 500 }
      );
    }
  };
}
