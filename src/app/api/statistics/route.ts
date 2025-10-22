import { NextResponse } from 'next/server';
import axios from 'axios';

export async function GET() {
  try {
    const backendUrl = 'https://capx-backend.toolforge.org/statistics/';
    const response = await axios.get(backendUrl, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
    return NextResponse.json(response.data, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
  } catch (error) {
    console.error('Error fetching statistics from backend:', error);
    return NextResponse.json(
      {
        total_users: 0,
        new_users: 0,
        total_capacities: 0,
        new_capacities: 0,
        total_messages: 0,
        new_messages: 0,
        total_organizations: 0,
        new_organizations: 0,
        error: 'Failed to fetch statistics',
      },
      {
        status: 500,
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      }
    );
  }
}
