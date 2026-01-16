export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const categoryTag = searchParams.get('category');
    const tagId = searchParams.get('id') || '';

    if (!categoryTag) {
      return NextResponse.json({ error: 'Category parameter is required' }, { status: 400 });
    }

    const authorization = request.headers.get('authorization');
    if (!authorization) {
      return NextResponse.json({ error: 'Authorization header is required' }, { status: 401 });
    }

    const [codeList, userList] = await Promise.all([
      axios.get(`${process.env.BASE_URL}/list/${categoryTag}/`, {
        headers: { Authorization: authorization },
      }),
      axios.get(`${process.env.BASE_URL}/tags/${categoryTag}/${tagId}/`, {
        headers: { Authorization: authorization },
      }),
    ]);

    if (!Object.hasOwn(codeList.data, tagId)) {
      return NextResponse.json({ error: 'No item for this tag id.' }, { status: 404 });
    }

    const tagData = {
      code: tagId,
      name: codeList.data[tagId],
      users: userList.data,
    };

    return NextResponse.json(tagData);
  } catch (error) {
    console.error('Tag API error:', error);
    return NextResponse.json({ error: 'Failed to fetch tag data' }, { status: 500 });
  }
}
