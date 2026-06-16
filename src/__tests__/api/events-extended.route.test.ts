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
  jsonError?: boolean;
}) {
  const url = new URL(options.url || 'https://localhost:3000/api/events');
  return {
    url: url.toString(),
    nextUrl: url,
    headers: { get: (name: string) => options.headers?.[name] || null },
    json: options.jsonError
      ? jest.fn().mockRejectedValue(new Error('Invalid JSON'))
      : jest.fn().mockResolvedValue(options.body || {}),
  } as any;
}

describe('GET /api/events - extended', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.BASE_URL = 'https://test-api.com';
  });

  it('passes all query params to backend', async () => {
    mockAxiosGet.mockResolvedValue({ data: { results: [], count: 0 } });
    const url =
      'https://localhost:3000/api/events?limit=10&offset=5&related_skills=1,2&territories=18&type_of_location=virtual&start_date=2024-01-01&end_date=2024-12-31&organization_id=5';
    await GET(createRequest({ url }));
    expect(mockAxiosGet).toHaveBeenCalledWith(
      'https://test-api.com/events/',
      expect.objectContaining({
        params: expect.objectContaining({
          limit: '10',
          offset: '5',
          related_skills: '1,2',
          territories: '18',
          type_of_location: 'virtual',
          start_date: '2024-01-01',
          end_date: '2024-12-31',
          organization_id: '5',
        }),
      })
    );
  });

  it('handles missing results in response', async () => {
    mockAxiosGet.mockResolvedValue({ data: {} });
    await GET(createRequest({}));
    expect(NextResponse.json).toHaveBeenCalledWith({ results: [], count: 0 });
  });
});

describe('POST /api/events - extended', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.BASE_URL = 'https://test-api.com';
  });

  it('includes optional fields when provided', async () => {
    mockAxiosPost.mockResolvedValue({ status: 201, data: { id: 1 } });
    const body = {
      name: 'Test Event',
      organization: 1,
      time_begin: '2024-01-01T00:00:00Z',
      time_end: '2024-01-01T02:00:00Z',
      url: 'https://example.com',
      wikidata_qid: 'Q123',
      image_url: 'https://example.com/img.png',
      description: 'A test event',
      related_skills: [1, 2],
      openstreetmap_id: '12345',
    };
    await POST(
      createRequest({ headers: { authorization: 'Token test' }, body })
    );
    const sentData = mockAxiosPost.mock.calls[0][1];
    expect(sentData).toEqual(
      expect.objectContaining({
        name: 'Test Event',
        url: 'https://example.com',
        wikidata_qid: 'Q123',
        image_url: 'https://example.com/img.png',
        description: 'A test event',
        related_skills: [1, 2],
        openstreetmap_id: '12345',
      })
    );
  });

  it('handles backend non-2xx response', async () => {
    mockAxiosPost.mockResolvedValue({ status: 422, data: { detail: 'Validation error' } });
    await POST(
      createRequest({
        headers: { authorization: 'Token test' },
        body: { name: 'Test', organization: 1, time_begin: '2024-01-01T00:00:00Z' },
      })
    );
    expect(NextResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({ error: 'Backend API error', details: { detail: 'Validation error' } }),
      expect.objectContaining({ status: 422 })
    );
  });

  it('handles ENOTFOUND connection error', async () => {
    const error: any = new Error('getaddrinfo ENOTFOUND');
    error.code = 'ENOTFOUND';
    mockAxiosPost.mockRejectedValue(error);
    await POST(
      createRequest({
        headers: { authorization: 'Token test' },
        body: { name: 'Test', organization: 1, time_begin: '2024-01-01T00:00:00Z' },
      })
    );
    expect(NextResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({ error: 'Backend service unavailable', type: 'connection_error' }),
      expect.objectContaining({ status: 503 })
    );
  });

  it('handles ETIMEDOUT error', async () => {
    const error: any = new Error('timeout');
    error.code = 'ETIMEDOUT';
    mockAxiosPost.mockRejectedValue(error);
    await POST(
      createRequest({
        headers: { authorization: 'Token test' },
        body: { name: 'Test', organization: 1, time_begin: '2024-01-01T00:00:00Z' },
      })
    );
    expect(NextResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({ error: 'Request timeout', type: 'timeout_error' }),
      expect.objectContaining({ status: 408 })
    );
  });

  it('handles backend API error with response data', async () => {
    const error: any = new Error('Bad request');
    error.response = { status: 400, data: { detail: 'Invalid data' } };
    mockAxiosPost.mockRejectedValue(error);
    await POST(
      createRequest({
        headers: { authorization: 'Token test' },
        body: { name: 'Test', organization: 1, time_begin: '2024-01-01T00:00:00Z' },
      })
    );
    expect(NextResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({ error: 'Backend API error', type: 'api_error' }),
      expect.objectContaining({ status: 400 })
    );
  });

  it('handles generic server error', async () => {
    mockAxiosPost.mockRejectedValue(new Error('Something went wrong'));
    await POST(
      createRequest({
        headers: { authorization: 'Token test' },
        body: { name: 'Test', organization: 1, time_begin: '2024-01-01T00:00:00Z' },
      })
    );
    expect(NextResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({ error: 'Failed to create event', type: 'server_error' }),
      expect.objectContaining({ status: 500 })
    );
  });

  it('defaults time_end when not provided', async () => {
    mockAxiosPost.mockResolvedValue({ status: 201, data: { id: 1 } });
    await POST(
      createRequest({
        headers: { authorization: 'Token test' },
        body: { name: 'Test', organization: 1, time_begin: '2024-01-01T00:00:00Z' },
      })
    );
    const sentData = mockAxiosPost.mock.calls[0][1];
    expect(sentData.time_end).toBeDefined();
    expect(sentData.type_of_location).toBe('virtual');
  });
});
