jest.mock('axios');

import axios from 'axios';
import { GET, POST } from '@/app/api/messages/route';
import { NextResponse } from 'next/server';

const mockAxiosGet = axios.get as jest.Mock;
const mockAxiosPost = axios.post as jest.Mock;

function createRequest(options: { url?: string; headers?: Record<string, string>; body?: any }) {
  const url = new URL(options.url || 'https://localhost:3000/api/messages');
  return {
    nextUrl: url,
    headers: { get: (name: string) => options.headers?.[name] || null },
    json: jest.fn().mockResolvedValue(options.body || {}),
  } as any;
}

describe('/api/messages', () => {
  beforeEach(() => { jest.clearAllMocks(); process.env.BASE_URL = 'https://test-api.com'; });

  describe('GET', () => {
    it('returns messages', async () => {
      mockAxiosGet.mockResolvedValue({ data: { results: [{ id: 1 }] } });
      await GET(createRequest({ headers: { authorization: 'Token test' } }));
      expect(NextResponse.json).toHaveBeenCalledWith([{ id: 1 }]);
    });

    it('returns error on failure', async () => {
      mockAxiosGet.mockRejectedValue({ response: { status: 500 } });
      await GET(createRequest({ headers: { authorization: 'Token test' } }));
      expect(NextResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({ error: 'Failed to fetch message' }),
        expect.objectContaining({ status: 500 })
      );
    });
  });

  describe('POST', () => {
    it('creates a message', async () => {
      mockAxiosPost.mockResolvedValue({ data: { id: 1 } });
      await POST(createRequest({ headers: { authorization: 'Token test' }, body: { content: 'Hello' } }));
      expect(NextResponse.json).toHaveBeenCalledWith({ id: 1 });
    });
  });
});
