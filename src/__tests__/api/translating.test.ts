import { GET, POST } from '@/app/api/translating/route';
import axios from 'axios';
import { NextRequest } from 'next/server';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

const BASE_URL = 'http://localhost:8000';

function makeMockGetRequest(params: Record<string, string | null>, token?: string): NextRequest {
  return {
    headers: {
      get: jest.fn((h: string) => (h === 'authorization' ? (token ?? null) : null)),
    },
    nextUrl: {
      searchParams: {
        get: jest.fn((k: string) => params[k] ?? null),
      },
    },
  } as unknown as NextRequest;
}

function makeMockPostRequest(body: unknown, token?: string): NextRequest {
  return {
    headers: {
      get: jest.fn((h: string) => (h === 'authorization' ? (token ?? null) : null)),
    },
    json: jest.fn().mockResolvedValue(body),
  } as unknown as NextRequest;
}

describe('GET /api/translating', () => {
  beforeAll(() => {
    process.env.BASE_URL = BASE_URL;
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns 400 when lang is missing', async () => {
    const req = makeMockGetRequest({ lang: null });
    const res = await GET(req);
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data).toEqual({ error: 'Missing lang parameter' });
  });

  it('proxies request to backend with lang and fallback', async () => {
    const mockData = { results: [] };
    mockedAxios.get.mockResolvedValueOnce({ data: mockData });

    const req = makeMockGetRequest({ lang: 'pt', fallback: 'es' }, 'Token abc');
    const res = await GET(req);
    const data = await res.json();

    expect(mockedAxios.get).toHaveBeenCalledWith(`${BASE_URL}/translating/`, {
      headers: { Authorization: 'Token abc' },
      params: { lang: 'pt', fallback: 'es' },
    });
    expect(res.status).toBe(200);
    expect(data).toEqual(mockData);
  });

  it('defaults fallback to en when not provided', async () => {
    mockedAxios.get.mockResolvedValueOnce({ data: { results: [] } });

    const req = makeMockGetRequest({ lang: 'pt', fallback: null });
    await GET(req);

    expect(mockedAxios.get).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({ params: { lang: 'pt', fallback: 'en' } })
    );
  });

  it('returns 500 with error details on backend failure', async () => {
    mockedAxios.get.mockRejectedValueOnce({
      response: { status: 503, data: { detail: 'Service unavailable' } },
    });

    const req = makeMockGetRequest({ lang: 'pt' });
    const res = await GET(req);
    const data = await res.json();

    expect(res.status).toBe(503);
    expect(data.error).toBe('Failed to fetch capacities');
    expect(data.details).toEqual({ detail: 'Service unavailable' });
  });

  it('returns 500 when error has no response', async () => {
    mockedAxios.get.mockRejectedValueOnce(new Error('Network timeout'));

    const req = makeMockGetRequest({ lang: 'pt' });
    const res = await GET(req);
    const data = await res.json();

    expect(res.status).toBe(500);
    expect(data.details).toBe('Network timeout');
  });
});

describe('POST /api/translating', () => {
  beforeAll(() => {
    process.env.BASE_URL = BASE_URL;
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('proxies body and auth header to backend', async () => {
    const body = { qid: 'Q42', lang: 'pt', label: 'Rótulo' };
    const mockData = { status: 'ok', changed: ['label'], metabase_id: '42' };
    mockedAxios.post.mockResolvedValueOnce({ data: mockData });

    const req = makeMockPostRequest(body, 'Token tok');
    const res = await POST(req);
    const data = await res.json();

    expect(mockedAxios.post).toHaveBeenCalledWith(`${BASE_URL}/translating/`, body, {
      headers: { Authorization: 'Token tok' },
    });
    expect(res.status).toBe(200);
    expect(data).toEqual(mockData);
  });

  it('returns 500 with error details on backend failure', async () => {
    mockedAxios.post.mockRejectedValueOnce({
      response: { status: 422, data: { error: 'Invalid payload' } },
    });

    const req = makeMockPostRequest({ qid: 'Q1', lang: 'pt' });
    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(422);
    expect(data.error).toBe('Failed to submit translation');
  });
});
