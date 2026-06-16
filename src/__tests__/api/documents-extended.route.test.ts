jest.mock('axios');

import axios from 'axios';
import { GET, POST } from '@/app/api/documents/route';
import { NextResponse } from 'next/server';

const mockAxiosGet = axios.get as jest.Mock;
const mockAxiosPost = axios.post as jest.Mock;

function createRequest(options: { url?: string; headers?: Record<string, string>; body?: any }) {
  const url = new URL(options.url || 'http://localhost:3000/api/documents');
  return {
    nextUrl: url,
    headers: {
      get: (name: string) => options.headers?.[name.toLowerCase()] || options.headers?.[name] || null,
    },
    json: jest.fn().mockResolvedValue(options.body || {}),
  } as any;
}

describe('/api/documents - extended', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.BASE_URL = 'http://test-api.com';
  });

  describe('GET', () => {
    it('passes limit and offset params', async () => {
      mockAxiosGet.mockResolvedValue({ data: { results: [] } });
      await GET(
        createRequest({
          url: 'http://localhost:3000/api/documents?limit=5&offset=10',
          headers: { authorization: 'Token test' },
        })
      );
      expect(mockAxiosGet).toHaveBeenCalledWith(
        'http://test-api.com/document/',
        expect.objectContaining({
          params: expect.objectContaining({ limit: '5', offset: '10' }),
        })
      );
    });

    it('returns error on backend failure', async () => {
      mockAxiosGet.mockRejectedValue({
        response: { status: 503, data: 'Service unavailable' },
      });
      await GET(createRequest({ headers: { authorization: 'Token test' } }));
      expect(NextResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({ error: 'Failed to fetch documents' }),
        expect.objectContaining({ status: 503 })
      );
    });
  });

  describe('POST', () => {
    it('returns 400 for invalid creator', async () => {
      await POST(
        createRequest({
          headers: { authorization: 'Token test' },
          body: { url: 'https://example.com', creator: -1 },
        })
      );
      expect(NextResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({ error: 'Invalid creator ID' }),
        expect.objectContaining({ status: 400 })
      );
    });

    it('returns 500 when BASE_URL not configured', async () => {
      delete process.env.BASE_URL;
      await POST(
        createRequest({
          headers: { authorization: 'Token test' },
          body: { url: 'https://example.com' },
        })
      );
      expect(NextResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({ error: 'Backend URL not configured' }),
        expect.objectContaining({ status: 500 })
      );
    });

    it('returns error on axios failure', async () => {
      mockAxiosPost.mockRejectedValue({
        message: 'Network Error',
        response: { status: 502, data: { detail: 'Bad gateway' } },
        isAxiosError: true,
      });
      await POST(
        createRequest({
          headers: { authorization: 'Token test' },
          body: { url: 'https://example.com' },
        })
      );
      expect(NextResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({ error: 'Failed to create document' }),
        expect.objectContaining({ status: 502 })
      );
    });
  });
});
