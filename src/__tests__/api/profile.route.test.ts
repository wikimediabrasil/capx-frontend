jest.mock('axios');

import axios from 'axios';
import { NextResponse } from 'next/server';
import { GET, PUT, OPTIONS, DELETE } from '@/app/api/profile/route';

function createMockNextRequest(options: {
  method?: string;
  url?: string;
  searchParams?: Record<string, string>;
  headers?: Record<string, string>;
  body?: any;
}) {
  const url = new URL(options.url || 'http://localhost:3000/api/profile');
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

describe('GET /api/profile', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.BASE_URL = 'http://test-api.com';
  });

  it('fetches user profile successfully', async () => {
    const mockResults = [{ id: 1, username: 'testuser' }];
    (axios.get as jest.Mock).mockResolvedValueOnce({ data: { results: mockResults } });

    const request = createMockNextRequest({
      searchParams: { userId: '42' },
      headers: { authorization: 'Token abc123' },
    });

    await GET(request);

    expect(axios.get).toHaveBeenCalledWith(
      'http://test-api.com/profile/42',
      { headers: { Authorization: 'Token abc123' } }
    );
    expect(NextResponse.json).toHaveBeenCalledWith(mockResults);
  });

  it('returns 404 when response data is falsy', async () => {
    (axios.get as jest.Mock).mockResolvedValueOnce({ data: null });

    const request = createMockNextRequest({
      searchParams: { userId: '42' },
      headers: { authorization: 'Token abc123' },
    });

    await GET(request);

    expect(NextResponse.json).toHaveBeenCalledWith({ error: 'User not found' }, { status: 404 });
  });

  it('returns 500 on axios error', async () => {
    const error = { message: 'Network error', response: { data: 'Bad request' } };
    (axios.get as jest.Mock).mockRejectedValueOnce(error);

    const request = createMockNextRequest({
      searchParams: { userId: '42' },
      headers: { authorization: 'Token abc123' },
    });

    await GET(request);

    expect(NextResponse.json).toHaveBeenCalledWith(
      { error: 'Failed to fetch user profile', details: 'Network error' },
      { status: 500 }
    );
  });

  it('encodes userId in URL', async () => {
    (axios.get as jest.Mock).mockResolvedValueOnce({ data: { results: [] } });

    const request = createMockNextRequest({
      searchParams: { userId: 'user name' },
      headers: { authorization: 'Token abc123' },
    });

    await GET(request);

    expect(axios.get).toHaveBeenCalledWith(
      'http://test-api.com/profile/user%20name',
      expect.any(Object)
    );
  });
});

describe('PUT /api/profile', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.BASE_URL = 'http://test-api.com';
  });

  it('updates user profile successfully', async () => {
    const mockResponseData = { id: 42, username: 'updateduser' };
    (axios.put as jest.Mock).mockResolvedValueOnce({ status: 200, data: mockResponseData });

    const request = createMockNextRequest({
      method: 'PUT',
      searchParams: { userId: '42' },
      headers: { authorization: 'Token abc123' },
      body: { username: 'updateduser' },
    });

    await PUT(request);

    expect(axios.put).toHaveBeenCalled();
    expect(NextResponse.json).toHaveBeenCalledWith(mockResponseData);
  });

  it('returns error response when status is not 200', async () => {
    (axios.put as jest.Mock).mockResolvedValueOnce({ status: 400, data: {} });

    const request = createMockNextRequest({
      method: 'PUT',
      searchParams: { userId: '42' },
      headers: { authorization: 'Token abc123' },
      body: { username: 'updateduser' },
    });

    await PUT(request);

    expect(NextResponse.json).toHaveBeenCalledWith(
      { error: 'Failed to update user profile' },
      { status: 400 }
    );
  });

  it('returns 500 on axios error', async () => {
    (axios.put as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

    const request = createMockNextRequest({
      method: 'PUT',
      searchParams: { userId: '42' },
      headers: { authorization: 'Token abc123' },
      body: { username: 'updateduser' },
    });

    await PUT(request);

    expect(NextResponse.json).toHaveBeenCalledWith(
      { error: 'Failed to update user profile.' },
      { status: 500 }
    );
  });
});

describe('OPTIONS /api/profile', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.BASE_URL = 'http://test-api.com';
  });

  it('fetches form fields from options endpoint successfully', async () => {
    const mockActionsData = {
      actions: {
        PUT: {
          user: { type: 'integer' },
          username: { type: 'string' },
          email: { type: 'string' },
        },
      },
    };
    (axios.options as jest.Mock).mockResolvedValueOnce({ data: mockActionsData });

    const request = createMockNextRequest({
      method: 'OPTIONS',
      searchParams: { userId: '42' },
      headers: { authorization: 'Token abc123' },
    });

    await OPTIONS(request);

    expect(axios.options).toHaveBeenCalledWith('http://test-api.com/profile/42', {
      headers: { Authorization: 'Token abc123' },
    });
    // The "user" key should be stripped
    expect(NextResponse.json).toHaveBeenCalledWith({
      username: { type: 'string' },
      email: { type: 'string' },
    });
  });

  it('returns 500 on axios error', async () => {
    (axios.options as jest.Mock).mockRejectedValueOnce(new Error('Options error'));

    const request = createMockNextRequest({
      method: 'OPTIONS',
      searchParams: { userId: '42' },
      headers: { authorization: 'Token abc123' },
    });

    await OPTIONS(request);

    expect(NextResponse.json).toHaveBeenCalledWith(
      { error: 'Failed to fetch options' },
      { status: 500 }
    );
  });
});

describe('DELETE /api/profile', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.BASE_URL = 'http://test-api.com';
  });

  it('deletes user profile successfully with status 200', async () => {
    (axios.delete as jest.Mock).mockResolvedValueOnce({ status: 200 });

    const request = createMockNextRequest({
      method: 'DELETE',
      headers: { authorization: 'Token abc123' },
      body: { user: { id: 42 } },
    });

    await DELETE(request);

    expect(axios.delete).toHaveBeenCalledWith('http://test-api.com/profile/42/', {
      headers: { Authorization: 'Token abc123' },
    });
    expect(NextResponse.json).toHaveBeenCalledWith({ success: true });
  });

  it('deletes user profile successfully with status 204', async () => {
    (axios.delete as jest.Mock).mockResolvedValueOnce({ status: 204 });

    const request = createMockNextRequest({
      method: 'DELETE',
      headers: { authorization: 'Token abc123' },
      body: { user: { id: 42 } },
    });

    await DELETE(request);

    expect(NextResponse.json).toHaveBeenCalledWith({ success: true });
  });

  it('returns error when delete fails with non-200 status', async () => {
    (axios.delete as jest.Mock).mockResolvedValueOnce({ status: 400 });

    const request = createMockNextRequest({
      method: 'DELETE',
      headers: { authorization: 'Token abc123' },
      body: { user: { id: 42 } },
    });

    await DELETE(request);

    expect(NextResponse.json).toHaveBeenCalledWith(
      { error: 'Failed to delete user profile' },
      { status: 400 }
    );
  });

  it('returns 500 on axios exception', async () => {
    const error = { message: 'Network error' };
    (axios.delete as jest.Mock).mockRejectedValueOnce(error);

    const request = createMockNextRequest({
      method: 'DELETE',
      headers: { authorization: 'Token abc123' },
      body: { user: { id: 42 } },
    });

    await DELETE(request);

    expect(NextResponse.json).toHaveBeenCalledWith(
      { error: 'Failed to delete user profile', details: 'Network error' },
      { status: 500 }
    );
  });
});
