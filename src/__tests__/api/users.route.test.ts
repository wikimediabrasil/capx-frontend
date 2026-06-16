jest.mock('axios');

import axios from 'axios';
import { GET } from '@/app/api/users/route';
import { NextResponse } from 'next/server';

const mockAxiosGet = axios.get as jest.Mock;

function createRequest(url = 'http://localhost:3000/api/users', headers: Record<string, string> = {}) {
  return {
    nextUrl: new URL(url),
    headers: { get: (name: string) => headers[name] || null },
  } as any;
}

describe('GET /api/users', () => {
  beforeEach(() => { jest.clearAllMocks(); process.env.BASE_URL = 'http://test-api.com'; });

  it('returns users', async () => {
    mockAxiosGet.mockResolvedValue({ data: { results: [{ id: 1 }] } });
    await GET(createRequest('http://localhost:3000/api/users', { authorization: 'Token test' }));
    expect(NextResponse.json).toHaveBeenCalledWith({ results: [{ id: 1 }] });
  });

  it('returns 401 without auth', async () => {
    await GET(createRequest());
    expect(NextResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({ error: 'Unauthorized' }),
      expect.objectContaining({ status: 401 })
    );
  });

  it('returns 500 on error', async () => {
    mockAxiosGet.mockRejectedValue(new Error('fail'));
    await GET(createRequest('http://localhost:3000/api/users', { authorization: 'Token test' }));
    expect(NextResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({ error: 'Failed to fetch user data' }),
      expect.objectContaining({ status: 500 })
    );
  });
});
