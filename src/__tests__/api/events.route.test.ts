jest.mock('axios');

import axios from 'axios';
import { GET, POST } from '@/app/api/events/route';
import { NextResponse } from 'next/server';

const mockAxiosGet = axios.get as jest.Mock;
const mockAxiosPost = axios.post as jest.Mock;

function createRequest(options: {
  url?: string;
  headers?: Record<string, string>;
  body?: any;
}) {
  const url = new URL(options.url || 'http://localhost:3000/api/events');
  return {
    url: url.toString(),
    nextUrl: url,
    headers: { get: (name: string) => options.headers?.[name] || null },
    json: jest.fn().mockResolvedValue(options.body || {}),
  } as any;
}

describe('GET /api/events', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.BASE_URL = 'http://test-api.com';
  });

  it('returns events on success', async () => {
    const mockData = { results: [{ id: 1 }], count: 1 };
    mockAxiosGet.mockResolvedValue({ data: mockData });

    const req = createRequest({});
    await GET(req);

    expect(NextResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({ results: [{ id: 1 }], count: 1 })
    );
  });

  it('returns error on failure', async () => {
    mockAxiosGet.mockRejectedValue({ message: 'fail', response: { status: 500, data: 'error' } });

    const req = createRequest({});
    await GET(req);

    expect(NextResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({ error: 'Failed to fetch events' }),
      expect.objectContaining({ status: 500 })
    );
  });
});

describe('POST /api/events', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.BASE_URL = 'http://test-api.com';
  });

  it('creates event on success', async () => {
    mockAxiosPost.mockResolvedValue({ status: 201, data: { id: 1, name: 'Test' } });

    const req = createRequest({
      headers: { authorization: 'Token test' },
      body: { name: 'Test', organization: 1, time_begin: '2024-01-01T00:00:00Z' },
    });
    await POST(req);

    expect(NextResponse.json).toHaveBeenCalledWith(expect.objectContaining({ id: 1 }));
  });

  it('returns 401 when no authorization', async () => {
    const req = createRequest({
      body: { name: 'Test', organization: 1, time_begin: '2024-01-01T00:00:00Z' },
    });
    await POST(req);

    expect(NextResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({ error: 'Authorization header missing' }),
      expect.objectContaining({ status: 401 })
    );
  });

  it('returns 400 for missing required fields', async () => {
    const req = createRequest({
      headers: { authorization: 'Token test' },
      body: { name: 'Test' },
    });
    await POST(req);

    expect(NextResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({ error: 'Missing required fields' }),
      expect.objectContaining({ status: 400 })
    );
  });

  it('returns 400 for invalid JSON', async () => {
    const req = {
      ...createRequest({ headers: { authorization: 'Token test' } }),
      json: jest.fn().mockRejectedValue(new Error('Invalid JSON')),
    } as any;
    await POST(req);

    expect(NextResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({ error: 'Invalid JSON in request body' }),
      expect.objectContaining({ status: 400 })
    );
  });
});
