jest.mock('axios');

import axios from 'axios';
import { GET, PUT } from '@/app/api/user_badge/route';
import { NextResponse } from 'next/server';

const mockAxiosGet = axios.get as jest.Mock;
const mockAxiosPut = axios.put as jest.Mock;

function createRequest(options: { url?: string; headers?: Record<string, string>; body?: any }) {
  const url = new URL(options.url || 'https://localhost:3000/api/user_badge');
  return {
    nextUrl: url,
    headers: { get: (name: string) => options.headers?.[name] || null },
    json: jest.fn().mockResolvedValue(options.body || {}),
  } as any;
}

describe('/api/user_badge', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.BASE_URL = 'https://test-api.com';
  });

  describe('GET', () => {
    it('returns user badges', async () => {
      mockAxiosGet.mockResolvedValue({ data: [{ id: 1 }] });
      const req = createRequest({ headers: { authorization: 'Token test' } });
      await GET(req);
      expect(NextResponse.json).toHaveBeenCalledWith([{ id: 1 }]);
    });

    it('returns error on failure', async () => {
      mockAxiosGet.mockRejectedValue({ response: { status: 500 } });
      const req = createRequest({ headers: { authorization: 'Token test' } });
      await GET(req);
      expect(NextResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({ error: 'Failed to fetch user badges' }),
        expect.objectContaining({ status: 500 })
      );
    });
  });

  describe('PUT', () => {
    it('updates user badge', async () => {
      mockAxiosPut.mockResolvedValue({ data: { id: 1, badge: 'updated' } });
      const req = createRequest({
        headers: { authorization: 'Token test' },
        body: { id: 1, badge: 'updated' },
      });
      await PUT(req);
      expect(NextResponse.json).toHaveBeenCalledWith({ id: 1, badge: 'updated' });
    });
  });
});
