import axios from 'axios';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const authHeader = request.headers.get('authorization');

    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const params = {
      limit: searchParams.get('limit') || undefined,
      offset: searchParams.get('offset') || undefined,
      user__username: searchParams.get('username') || undefined,
      territory: searchParams.get('territory') || undefined,
      languageproficiency__language: searchParams.get('language') || undefined,
      skills_wanted: searchParams.get('skills_wanted') || undefined,
      skills_available: searchParams.get('skills_available') || undefined,
      has_any_skills: searchParams.get('has_any_skills') === 'true' ? true : undefined,
      has_skills_wanted: searchParams.get('has_skills_wanted') === 'true' ? true : undefined,
      has_skills_available: searchParams.get('has_skills_available') === 'true' ? true : undefined,
    };

    const cleanParams = Object.fromEntries(
      Object.entries(params).filter(([_, value]) => value !== undefined)
    );

    const queryResponse = await axios.get(`${process.env.BASE_URL}/users/`, {
      headers: { Authorization: authHeader },
      params: cleanParams,
    });

    return NextResponse.json(queryResponse.data);
  } catch (error) {
    console.error('Failed to fetch user by id', error);
    return NextResponse.json({ error: 'Failed to fetch user data' }, { status: 500 });
  }
}
