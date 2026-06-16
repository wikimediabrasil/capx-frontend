import axios from 'axios';
import { GET } from '@/app/api/tag/route';

jest.mock('axios');

function createMockNextRequest(options: {
  method?: string;
  url?: string;
  searchParams?: Record<string, string>;
  headers?: Record<string, string>;
  body?: any;
}) {
  const url = new URL(options.url || 'http://localhost:3000/api/tag');
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

describe('GET /api/tag', () => {
  beforeEach(() => {
    process.env.BASE_URL = 'http://test-api.com';
    jest.clearAllMocks();
  });

  it('returns 400 when category parameter is missing', async () => {
    const request = createMockNextRequest({
      headers: { authorization: 'Token abc123' },
    });

    const response = await GET(request);

    expect(response.status).toBe(400);
  });

  it('returns 401 when authorization header is missing', async () => {
    const request = createMockNextRequest({
      searchParams: { category: 'skill' },
    });

    const response = await GET(request);

    expect(response.status).toBe(401);
  });

  it('returns tag data on success', async () => {
    const tagId = '42';
    const codeListData = { [tagId]: 'JavaScript' };
    const userListData = [{ id: 1, username: 'user1' }];

    (axios.get as jest.Mock)
      .mockResolvedValueOnce({ data: codeListData })
      .mockResolvedValueOnce({ data: userListData });

    const request = createMockNextRequest({
      searchParams: { category: 'skill', id: tagId },
      headers: { authorization: 'Token abc123' },
    });

    const response = await GET(request);

    expect(response.status).toBe(200);
    expect(axios.get).toHaveBeenCalledTimes(2);
  });

  it('returns 404 when tag id not found in code list', async () => {
    const codeListData = { '99': 'SomethingElse' };
    const userListData = [];

    (axios.get as jest.Mock)
      .mockResolvedValueOnce({ data: codeListData })
      .mockResolvedValueOnce({ data: userListData });

    const request = createMockNextRequest({
      searchParams: { category: 'skill', id: '42' },
      headers: { authorization: 'Token abc123' },
    });

    const response = await GET(request);

    expect(response.status).toBe(404);
  });

  it('returns 500 on axios failure', async () => {
    (axios.get as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

    const request = createMockNextRequest({
      searchParams: { category: 'skill', id: '42' },
      headers: { authorization: 'Token abc123' },
    });

    const response = await GET(request);

    expect(response.status).toBe(500);
  });
});
