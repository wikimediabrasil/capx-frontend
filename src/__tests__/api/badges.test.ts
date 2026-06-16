jest.mock('axios');

import axios from 'axios';
import { NextResponse } from 'next/server';
import { GET } from '@/app/api/badges/route';

function createMockNextRequest(options: {
  method?: string;
  url?: string;
  searchParams?: Record<string, string>;
  headers?: Record<string, string>;
  body?: any;
}) {
  const url = new URL(options.url || 'http://localhost:3000/api/badges');
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

describe('GET /api/badges', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.BASE_URL = 'http://test-api.com';
  });

  it('fetches all badges when no badgeId is provided', async () => {
    const mockData = [{ id: 1, name: 'Badge 1' }, { id: 2, name: 'Badge 2' }];
    (axios.get as jest.Mock).mockResolvedValueOnce({ data: mockData });

    const request = createMockNextRequest({
      headers: { authorization: 'Token abc123' },
    });

    await GET(request);

    expect(axios.get).toHaveBeenCalledWith('http://test-api.com/badges', {
      headers: { Authorization: 'Token abc123' },
      params: { limit: null, offset: null },
    });
    expect(NextResponse.json).toHaveBeenCalledWith(mockData);
  });

  it('fetches a specific badge when badgeId is provided', async () => {
    const mockData = { id: 5, name: 'Special Badge' };
    (axios.get as jest.Mock).mockResolvedValueOnce({ data: mockData });

    const request = createMockNextRequest({
      searchParams: { badgeId: '5' },
      headers: { authorization: 'Token abc123' },
    });

    await GET(request);

    expect(axios.get).toHaveBeenCalledWith('http://test-api.com/badges/5', {
      headers: { Authorization: 'Token abc123' },
      params: { limit: null, offset: null },
    });
    expect(NextResponse.json).toHaveBeenCalledWith(mockData);
  });

  it('passes limit and offset params to the backend', async () => {
    (axios.get as jest.Mock).mockResolvedValueOnce({ data: [] });

    const request = createMockNextRequest({
      searchParams: { limit: '10', offset: '20' },
      headers: { authorization: 'Token abc123' },
    });

    await GET(request);

    expect(axios.get).toHaveBeenCalledWith('http://test-api.com/badges', {
      headers: { Authorization: 'Token abc123' },
      params: { limit: '10', offset: '20' },
    });
  });

  it('returns 500 error when axios call fails', async () => {
    const error = { response: { status: 500 } };
    (axios.get as jest.Mock).mockRejectedValueOnce(error);

    const request = createMockNextRequest({
      headers: { authorization: 'Token abc123' },
    });

    await GET(request);

    expect(NextResponse.json).toHaveBeenCalledWith(
      { error: 'Failed to fetch badges' },
      { status: 500 }
    );
  });

  it('returns the upstream status code on error', async () => {
    const error = { response: { status: 403 } };
    (axios.get as jest.Mock).mockRejectedValueOnce(error);

    const request = createMockNextRequest({
      headers: { authorization: 'Token abc123' },
    });

    await GET(request);

    expect(NextResponse.json).toHaveBeenCalledWith(
      { error: 'Failed to fetch badges' },
      { status: 403 }
    );
  });

  it('handles missing authorization header gracefully', async () => {
    const mockData = [{ id: 1, name: 'Badge 1' }];
    (axios.get as jest.Mock).mockResolvedValueOnce({ data: mockData });

    const request = createMockNextRequest({});

    await GET(request);

    expect(axios.get).toHaveBeenCalledWith('http://test-api.com/badges', {
      headers: { Authorization: null },
      params: { limit: null, offset: null },
    });
  });
});
