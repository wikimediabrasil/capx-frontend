jest.mock('axios');

import axios from 'axios';
import { GET } from '@/app/api/organizations/route';
import { NextResponse } from 'next/server';

const mockAxiosGet = axios.get as jest.Mock;

function createRequest(url = 'https://localhost:3000/api/organizations') {
  const parsedUrl = new URL(url);
  return { nextUrl: parsedUrl, headers: { get: () => null } } as any;
}

describe('GET /api/organizations', () => {
  beforeEach(() => { jest.clearAllMocks(); process.env.BASE_URL = 'https://test-api.com'; });

  it('returns organizations', async () => {
    mockAxiosGet.mockResolvedValue({ data: { results: [{ id: 1 }] } });
    await GET(createRequest());
    expect(NextResponse.json).toHaveBeenCalledWith({ results: [{ id: 1 }] });
  });

  it('passes search params', async () => {
    mockAxiosGet.mockResolvedValue({ data: [] });
    await GET(createRequest('https://localhost:3000/api/organizations?search=test&limit=10'));
    expect(mockAxiosGet).toHaveBeenCalledWith(
      'https://test-api.com/organizations/',
      expect.objectContaining({ params: expect.objectContaining({ search: 'test', limit: '10' }) })
    );
  });

  it('returns error on failure', async () => {
    mockAxiosGet.mockRejectedValue({ message: 'fail', response: { status: 500 } });
    await GET(createRequest());
    expect(NextResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({ error: 'Failed to fetch organizations' }),
      expect.objectContaining({ status: 500 })
    );
  });
});
