import { NextResponse } from 'next/server';
import axios from 'axios';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const backendUrl = 'https://capx-backend.toolforge.org/statistics/';

    const timestamp = Date.now();
    const urlWithTimestamp = `${backendUrl}?_t=${timestamp}`;

    const response = await axios.get(urlWithTimestamp, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        Pragma: 'no-cache',
        Expires: '0',
      },
    });
    return NextResponse.json(response.data, {
      headers: {
        'Cache-Control': 'no-store, max-age=0',
        'X-Data-Timestamp': timestamp.toString(),
        Pragma: 'no-cache',
        Expires: '0',
      },
    });
  } catch (error) {
    console.error('Error fetching statistics from backend:', error);
    return NextResponse.json(
      {
        total_users: 0,
        new_users: 0,
        active_users: 0,
        users_with_territory: 0,
        users_with_language: 0,
        users_with_capacities: 0,
        total_capacities: 0,
        new_capacities: 0,
        total_messages: 0,
        new_messages: 0,
        total_organizations: 0,
        new_organizations: 0,
        territory_user_counts: {},
        language_user_counts: {},
        skill_known_user_counts: {},
        skill_available_user_counts: {},
        skill_wanted_user_counts: {},
        error: 'Failed to fetch statistics',
      },
      {
        status: 500,
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          Pragma: 'no-cache',
          Expires: '0',
        },
      }
    );
  }
}
