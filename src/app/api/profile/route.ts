import axios from 'axios';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const userId = searchParams.get('userId');

  const authHeader = request.headers.get('authorization');

  try {
    const response = await axios.get(
      `${process.env.BASE_URL}/profile/${encodeURIComponent(userId || '')}`,
      {
        headers: {
          Authorization: authHeader,
        },
      }
    );

    if (response.data) {
      return NextResponse.json(response.data.results);
    } else {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
  } catch (error: any) {
    console.error('Error fetching user profile:', error.response?.data || error.message);
    return NextResponse.json(
      { error: 'Failed to fetch user profile', details: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  const userId = request.nextUrl.searchParams.get('userId');
  let searchParams = new URLSearchParams(request.nextUrl.search);
  const formData = await request.json();

  // Convert body data to URL parameters
  Object.entries(formData).forEach(([key, value]) => {
    if (value !== null && value !== undefined) {
      if (Array.isArray(value)) {
        value.forEach(v => searchParams.append(key, v));
      } else {
        searchParams.set(key, value.toString());
      }
    }
  });

  try {
    const response = await axios.put(
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
        { error: 'Failed to update user profile' },
        { status: response.status }
      );
    }
  } catch (error) {
    console.error('PUT request error:', error);
    return NextResponse.json({ error: 'Failed to update user profile.' }, { status: 500 });
  }
}

export async function OPTIONS(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const userId = searchParams.get('userId');
  const authHeader = request.headers.get('authorization');

  try {
    const response = await axios.options(`${process.env.BASE_URL}/profile/${userId}`, {
      headers: {
        Authorization: authHeader,
      },
    });
    // Removing "user" key/value
    const { user, ...formFields } = response.data.actions.PUT;

    return NextResponse.json(formFields);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch options' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const body = await request.json();
  const authHeader = request.headers.get('authorization');
  const userId = body.user.id;

  try {
    const response = await axios.delete(process.env.BASE_URL + '/profile/' + userId, {
      headers: {
        Authorization: authHeader,
      },
    });

    if (response.status === 200) {
      return NextResponse.json(response.data);
    } else {
      return NextResponse.json(
        { error: 'Failed to delete user profile' },
        { status: response.status }
      );
    }
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete user profile' }, { status: 500 });
  }
}
