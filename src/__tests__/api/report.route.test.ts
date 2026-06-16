jest.mock('axios');

import axios from 'axios';
import { GET, POST, OPTIONS } from '@/app/api/report/route';
import { NextResponse } from 'next/server';

const mockAxiosGet = axios.get as jest.Mock;
const mockAxiosPost = axios.post as jest.Mock;
const mockAxiosOptions = axios.options as jest.Mock;

function createRequest(options: { url?: string; headers?: Record<string, string>; body?: any }) {
  const url = new URL(options.url || 'http://localhost:3000/api/report');
  return {
    nextUrl: url,
    headers: { get: (name: string) => options.headers?.[name] || null },
    json: jest.fn().mockResolvedValue(options.body || {}),
  } as any;
}

describe('/api/report', () => {
  beforeEach(() => { jest.clearAllMocks(); process.env.BASE_URL = 'http://test-api.com'; });

  describe('GET', () => {
    it('returns reports', async () => {
      mockAxiosGet.mockResolvedValue({ data: { results: [{ id: 1 }] } });
      const req = createRequest({ headers: { authorization: 'Token test' } });
      await GET(req);
      expect(NextResponse.json).toHaveBeenCalledWith([{ id: 1 }]);
    });

    it('returns error on failure', async () => {
      mockAxiosGet.mockRejectedValue({ response: { status: 500 } });
      const req = createRequest({ headers: { authorization: 'Token test' } });
      await GET(req);
      expect(NextResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({ error: 'Failed to fetch report' }),
        expect.objectContaining({ status: 500 })
      );
    });
  });

  describe('POST', () => {
    it('creates a report', async () => {
      mockAxiosPost.mockResolvedValue({ data: { id: 1 } });
      const req = createRequest({ headers: { authorization: 'Token test' }, body: { title: 'Bug' } });
      await POST(req);
      expect(NextResponse.json).toHaveBeenCalledWith({ id: 1 });
    });
  });

  describe('OPTIONS', () => {
    it('returns form fields', async () => {
      mockAxiosOptions.mockResolvedValue({ data: { actions: { PUT: { user: {}, title: {} } } } });
      const req = createRequest({
        url: 'http://localhost:3000/api/report?reportId=1',
        headers: { authorization: 'Token test' },
      });
      await OPTIONS(req);
      expect(NextResponse.json).toHaveBeenCalledWith({ title: {} });
    });
  });
});
