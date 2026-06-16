jest.mock('axios');

import axios from 'axios';
import { GET, POST } from '@/app/api/projects/route';
import { NextResponse } from 'next/server';

const mockAxiosGet = axios.get as jest.Mock;
const mockAxiosPost = axios.post as jest.Mock;

function createRequest(options: { url?: string; headers?: Record<string, string>; body?: any }) {
  const url = new URL(options.url || 'http://localhost:3000/api/projects');
  return {
    nextUrl: url,
    headers: { get: (name: string) => options.headers?.[name] || null },
    json: jest.fn().mockResolvedValue(options.body || {}),
  } as any;
}

describe('/api/projects', () => {
  beforeEach(() => { jest.clearAllMocks(); process.env.BASE_URL = 'http://test-api.com'; });

  describe('GET', () => {
    it('returns projects', async () => {
      mockAxiosGet.mockResolvedValue({ data: { results: [{ id: 1 }] } });
      await GET(createRequest({ headers: { authorization: 'Token test' } }));
      expect(NextResponse.json).toHaveBeenCalledWith([{ id: 1 }]);
    });

    it('returns error on failure', async () => {
      mockAxiosGet.mockRejectedValue({ message: 'fail' });
      await GET(createRequest({ headers: { authorization: 'Token test' } }));
      expect(NextResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({ error: 'Failed to fetch projects' }),
        expect.objectContaining({ status: 500 })
      );
    });
  });

  describe('POST', () => {
    it('creates a project', async () => {
      mockAxiosPost.mockResolvedValue({ data: { id: 1, display_name: 'New' } });
      await POST(createRequest({ headers: { authorization: 'Token test' }, body: { display_name: 'New' } }));
      expect(NextResponse.json).toHaveBeenCalledWith({ id: 1, display_name: 'New' });
    });

    it('returns error for invalid response', async () => {
      mockAxiosPost.mockResolvedValue({ data: {} });
      await POST(createRequest({ headers: { authorization: 'Token test' }, body: { display_name: 'Bad' } }));
      expect(NextResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({ status: 500 }),
        expect.objectContaining({ status: 500 })
      );
    });
  });
});
