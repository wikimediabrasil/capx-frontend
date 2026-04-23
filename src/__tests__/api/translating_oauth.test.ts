import { POST as beginOAuth } from '@/app/api/translating_oauth/begin/route';
import { DELETE as disconnectOAuth } from '@/app/api/translating_oauth/disconnect/route';
import { GET as oauthStatus } from '@/app/api/translating_oauth/status/route';
import axios from 'axios';
import { NextRequest } from 'next/server';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

const BASE_URL = 'http://localhost:8000';

function mockReq(token?: string): NextRequest {
  return {
    headers: {
      get: jest.fn((h: string) => (h === 'authorization' ? (token ?? null) : null)),
    },
  } as unknown as NextRequest;
}

beforeAll(() => {
  process.env.BASE_URL = BASE_URL;
});

beforeEach(() => {
  jest.clearAllMocks();
});

// ---------------------------------------------------------------------------
// POST /api/translating_oauth/begin
// ---------------------------------------------------------------------------
describe('POST /api/translating_oauth/begin', () => {
  it('proxies auth header and returns authorization_url', async () => {
    const mockData = { authorization_url: 'https://meta.example/oauth', state: 'xyz' };
    mockedAxios.post.mockResolvedValueOnce({ data: mockData });

    const res = await beginOAuth(mockReq('Token tok'));
    const data = await res.json();

    expect(mockedAxios.post).toHaveBeenCalledWith(
      `${BASE_URL}/translating_oauth/begin/`,
      {},
      { headers: { Authorization: 'Token tok' } }
    );
    expect(res.status).toBe(200);
    expect(data).toEqual(mockData);
  });

  it('returns upstream error status on failure', async () => {
    mockedAxios.post.mockRejectedValueOnce({
      response: { status: 403, data: { detail: 'Forbidden' } },
    });

    const res = await beginOAuth(mockReq('Token tok'));
    const data = await res.json();

    expect(res.status).toBe(403);
    expect(data.error).toBe('Failed to begin OAuth');
    expect(data.details).toEqual({ detail: 'Forbidden' });
  });

  it('returns 500 when error has no response', async () => {
    mockedAxios.post.mockRejectedValueOnce(new Error('Network failure'));

    const res = await beginOAuth(mockReq());
    const data = await res.json();

    expect(res.status).toBe(500);
    expect(data.details).toBe('Network failure');
  });
});

// ---------------------------------------------------------------------------
// GET /api/translating_oauth/status
// ---------------------------------------------------------------------------
describe('GET /api/translating_oauth/status', () => {
  it('returns connected status with username', async () => {
    const mockData = { connected: true, username: 'wikiuser' };
    mockedAxios.get.mockResolvedValueOnce({ data: mockData });

    const res = await oauthStatus(mockReq('Token tok'));
    const data = await res.json();

    expect(mockedAxios.get).toHaveBeenCalledWith(`${BASE_URL}/translating_oauth/status/`, {
      headers: { Authorization: 'Token tok' },
    });
    expect(res.status).toBe(200);
    expect(data).toEqual(mockData);
  });

  it('returns disconnected status', async () => {
    mockedAxios.get.mockResolvedValueOnce({ data: { connected: false, username: '' } });

    const res = await oauthStatus(mockReq('Token tok'));
    const data = await res.json();

    expect(data.connected).toBe(false);
  });

  it('returns upstream error on backend failure', async () => {
    mockedAxios.get.mockRejectedValueOnce({
      response: { status: 401, data: { detail: 'Unauthorized' } },
    });

    const res = await oauthStatus(mockReq('Token bad'));
    const data = await res.json();

    expect(res.status).toBe(401);
    expect(data.error).toBe('Failed to fetch OAuth status');
  });
});

// ---------------------------------------------------------------------------
// DELETE /api/translating_oauth/disconnect
// ---------------------------------------------------------------------------
describe('DELETE /api/translating_oauth/disconnect', () => {
  it('proxies auth header and returns backend response', async () => {
    const mockData = { status: 'ok' };
    mockedAxios.delete.mockResolvedValueOnce({ data: mockData });

    const res = await disconnectOAuth(mockReq('Token tok'));
    const data = await res.json();

    expect(mockedAxios.delete).toHaveBeenCalledWith(`${BASE_URL}/translating_oauth/disconnect/`, {
      headers: { Authorization: 'Token tok' },
    });
    expect(res.status).toBe(200);
    expect(data).toEqual(mockData);
  });

  it('returns upstream error status on failure', async () => {
    mockedAxios.delete.mockRejectedValueOnce({
      response: { status: 404, data: { detail: 'Not found' } },
    });

    const res = await disconnectOAuth(mockReq('Token tok'));
    const data = await res.json();

    expect(res.status).toBe(404);
    expect(data.error).toBe('Failed to disconnect OAuth');
  });

  it('returns 500 when error has no response', async () => {
    mockedAxios.delete.mockRejectedValueOnce(new Error('Connection reset'));

    const res = await disconnectOAuth(mockReq());
    const data = await res.json();

    expect(res.status).toBe(500);
    expect(data.details).toBe('Connection reset');
  });
});
