jest.mock('axios');

import axios from 'axios';
import { GET } from '@/app/api/territory/route';
import { NextResponse } from 'next/server';

const mockAxiosGet = axios.get as jest.Mock;

function createRequest(url: string, headers: Record<string, string> = {}) {
  const parsedUrl = new URL(url);
  return {
    url,
    nextUrl: parsedUrl,
    headers: { get: (name: string) => headers[name] || null },
  } as any;
}

describe('GET /api/territory', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.BASE_URL = 'http://test-api.com';
  });

  it('returns territory data on success', async () => {
    const mockData = [{ id: 1, name: 'SSA' }];
    mockAxiosGet.mockResolvedValue({ data: mockData });

    const req = createRequest('http://localhost:3000/api/territory', { authorization: 'Token test' });
    await GET(req);

    expect(mockAxiosGet).toHaveBeenCalledWith(
      expect.stringContaining('http://test-api.com/territory/'),
      expect.any(Object)
    );
    expect(NextResponse.json).toHaveBeenCalledWith(mockData);
  });

  it('passes query params to backend', async () => {
    mockAxiosGet.mockResolvedValue({ data: [] });

    const req = createRequest('http://localhost:3000/api/territory?limit=10', { authorization: 'Token test' });
    await GET(req);

    expect(mockAxiosGet).toHaveBeenCalledWith(
      expect.stringContaining('limit=10'),
      expect.any(Object)
    );
  });

  it('returns 500 on error', async () => {
    mockAxiosGet.mockRejectedValue(new Error('fail'));

    const req = createRequest('http://localhost:3000/api/territory');
    await GET(req);

    expect(NextResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({ error: 'Failed to fetch territories' }),
      expect.objectContaining({ status: 500 })
    );
  });
});
