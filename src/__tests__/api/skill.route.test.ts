import axios from 'axios';
import { GET } from '@/app/api/skill/route';

jest.mock('axios');

function createMockNextRequest(options: {
  method?: string;
  url?: string;
  searchParams?: Record<string, string>;
  headers?: Record<string, string>;
  body?: any;
}) {
  const url = new URL(options.url || 'https://localhost:3000/api/skill');
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

describe('GET /api/skill', () => {
  beforeEach(() => {
    process.env.BASE_URL = 'https://test-api.com';
    jest.clearAllMocks();
  });

  it('returns skill results on success', async () => {
    const mockResults = [
      { id: 1, name: 'JavaScript' },
      { id: 2, name: 'Python' },
    ];
    (axios.get as jest.Mock).mockResolvedValueOnce({ data: { results: mockResults } });

    const request = createMockNextRequest({
      headers: { authorization: 'Token abc123' },
    });

    const response = await GET(request);

    expect(axios.get).toHaveBeenCalledWith('https://test-api.com/skill', {
      headers: { Authorization: 'Token abc123' },
      params: { limit: null, offset: null },
    });
    expect(response.status).toBe(200);
  });

  it('returns skills with limit and offset params', async () => {
    const mockResults = [{ id: 1, name: 'JavaScript' }];
    (axios.get as jest.Mock).mockResolvedValueOnce({ data: { results: mockResults } });

    const request = createMockNextRequest({
      searchParams: { limit: '10', offset: '20' },
      headers: { authorization: 'Token abc123' },
    });

    await GET(request);

    expect(axios.get).toHaveBeenCalledWith('https://test-api.com/skill', {
      headers: { Authorization: 'Token abc123' },
      params: { limit: '10', offset: '20' },
    });
  });

  it('returns 500 error when response has no results', async () => {
    (axios.get as jest.Mock).mockResolvedValueOnce({ data: {} });

    const request = createMockNextRequest({});

    const response = await GET(request);

    expect(response.status).toBe(500);
  });

  it('returns 500 error on axios failure', async () => {
    (axios.get as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

    const request = createMockNextRequest({});

    const response = await GET(request);

    expect(response.status).toBe(500);
  });
});
