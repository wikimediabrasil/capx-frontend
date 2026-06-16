jest.mock('axios');

import axios from 'axios';
import { NextResponse } from 'next/server';
import { GET, PUT } from '@/app/api/profile/[id]/route';

function createMockNextRequest(options: {
  method?: string;
  url?: string;
  searchParams?: Record<string, string>;
  headers?: Record<string, string>;
  body?: any;
}) {
  const url = new URL(options.url || 'https://localhost:3000/api/profile/42');
  if (options.searchParams) {
    Object.entries(options.searchParams).forEach(([k, v]) => url.searchParams.set(k, v));
  }
  return {
    method: options.method || 'GET',
    url: url.toString(),
    nextUrl: url,
    headers: {
      get: jest.fn((name: string) => options.headers?.[name] || null),
    },
    json: jest.fn().mockResolvedValue(options.body || {}),
  } as any;
}

describe('GET /api/profile/[id]', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.BASE_URL = 'https://test-api.com';
  });

  it('fetches user profile by id successfully', async () => {
    const mockData = { id: 42, username: 'testuser' };
    (axios.get as jest.Mock).mockResolvedValueOnce({ data: mockData });

    const request = createMockNextRequest({
      headers: { authorization: 'Token abc123' },
    });
    const params = Promise.resolve({ id: '42' });

    await GET(request, { params });

    expect(axios.get).toHaveBeenCalledWith('https://test-api.com/profile/42/', {
      headers: { Authorization: 'Token abc123' },
    });
    expect(NextResponse.json).toHaveBeenCalledWith(mockData);
  });

  it('returns error response when axios throws', async () => {
    const error = {
      response: { status: 404, data: 'Not found' },
      message: 'Not found',
    };
    (axios.get as jest.Mock).mockRejectedValueOnce(error);

    const request = createMockNextRequest({
      headers: { authorization: 'Token abc123' },
    });
    const params = Promise.resolve({ id: '99' });

    await GET(request, { params });

    expect(NextResponse.json).toHaveBeenCalledWith(
      { error: 'Failed to get user profile', details: 'Not found' },
      { status: 404 }
    );
  });

  it('returns 500 when error has no response', async () => {
    const error = { message: 'Network error' };
    (axios.get as jest.Mock).mockRejectedValueOnce(error);

    const request = createMockNextRequest({
      headers: { authorization: 'Token abc123' },
    });
    const params = Promise.resolve({ id: '42' });

    await GET(request, { params });

    expect(NextResponse.json).toHaveBeenCalledWith(
      { error: 'Failed to get user profile', details: 'Network error' },
      { status: 500 }
    );
  });
});

describe('PUT /api/profile/[id]', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.BASE_URL = 'https://test-api.com';
  });

  it('updates user profile by id successfully', async () => {
    const mockResponseData = { id: 42, username: 'updateduser' };
    (axios.put as jest.Mock).mockResolvedValueOnce({ data: mockResponseData });

    const request = createMockNextRequest({
      method: 'PUT',
      headers: { authorization: 'Token abc123' },
      body: { username: 'updateduser', bio: 'Hello' },
    });
    const params = Promise.resolve({ id: '42' });

    await PUT(request, { params });

    expect(axios.put).toHaveBeenCalledWith(
      'https://test-api.com/profile/42/',
      { username: 'updateduser', bio: 'Hello', user: { id: 42 } },
      { headers: { Authorization: 'Token abc123' } }
    );
    expect(NextResponse.json).toHaveBeenCalledWith(mockResponseData);
  });

  it('returns error response when axios throws with response', async () => {
    const error = {
      response: { status: 400, data: { detail: 'Bad request' } },
      message: 'Bad request',
    };
    (axios.put as jest.Mock).mockRejectedValueOnce(error);

    const request = createMockNextRequest({
      method: 'PUT',
      headers: { authorization: 'Token abc123' },
      body: { username: 'updateduser' },
    });
    const params = Promise.resolve({ id: '42' });

    await PUT(request, { params });

    expect(NextResponse.json).toHaveBeenCalledWith(
      {
        error: 'Failed to update user profile',
        details: { detail: 'Bad request' },
      },
      { status: 400 }
    );
  });

  it('returns 500 when error has no response', async () => {
    const error = { message: 'Network error' };
    (axios.put as jest.Mock).mockRejectedValueOnce(error);

    const request = createMockNextRequest({
      method: 'PUT',
      headers: { authorization: 'Token abc123' },
      body: {},
    });
    const params = Promise.resolve({ id: '42' });

    await PUT(request, { params });

    expect(NextResponse.json).toHaveBeenCalledWith(
      { error: 'Failed to update user profile', details: 'Network error' },
      { status: 500 }
    );
  });
});
