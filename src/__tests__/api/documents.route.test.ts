jest.mock('axios');

import axios from 'axios';
import { GET, POST } from '@/app/api/documents/route';
import { NextResponse } from 'next/server';

const mockAxiosGet = axios.get as jest.Mock;
const mockAxiosPost = axios.post as jest.Mock;

function createRequest(options: { url?: string; headers?: Record<string, string>; body?: any }) {
  const url = new URL(options.url || 'https://localhost:3000/api/documents');
  return {
    nextUrl: url,
    headers: { get: (name: string) => options.headers?.[name.toLowerCase()] || options.headers?.[name] || null },
    json: jest.fn().mockResolvedValue(options.body || {}),
  } as any;
}

describe('/api/documents', () => {
  beforeEach(() => { jest.clearAllMocks(); process.env.BASE_URL = 'https://test-api.com'; });

  describe('GET', () => {
    it('returns documents', async () => {
      mockAxiosGet.mockResolvedValue({ data: { results: [{ id: 1 }] } });
      await GET(createRequest({ headers: { Authorization: 'Token test' } }));
      expect(NextResponse.json).toHaveBeenCalledWith([{ id: 1 }]);
    });

    it('returns 401 without auth', async () => {
      await GET(createRequest({}));
      expect(NextResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({ error: 'No authorization token provided' }),
        expect.objectContaining({ status: 401 })
      );
    });
  });

  describe('POST', () => {
    it('creates a document', async () => {
      mockAxiosPost.mockResolvedValue({ data: { id: 1 } });
      await POST(createRequest({ headers: { Authorization: 'Token test' }, body: { url: 'https://example.com', organization: 1 } }));
      expect(NextResponse.json).toHaveBeenCalledWith({ id: 1 });
    });

    it('returns 401 without auth', async () => {
      await POST(createRequest({ body: { url: 'https://example.com' } }));
      expect(NextResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({ error: 'No authorization token provided' }),
        expect.objectContaining({ status: 401 })
      );
    });

    it('returns 400 for missing url', async () => {
      await POST(createRequest({ headers: { Authorization: 'Token test' }, body: {} }));
      expect(NextResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({ error: 'Invalid request body' }),
        expect.objectContaining({ status: 400 })
      );
    });

    it('returns 400 for invalid organization', async () => {
      await POST(createRequest({
        headers: { Authorization: 'Token test' },
        body: { url: 'https://example.com', organization: -1 },
      }));
      expect(NextResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({ error: 'Invalid organization ID' }),
        expect.objectContaining({ status: 400 })
      );
    });
  });
});
