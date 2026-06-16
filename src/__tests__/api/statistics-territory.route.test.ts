jest.mock('axios');
import axios from 'axios';
import { NextResponse } from 'next/server';

const mockAxiosGet = axios.get as jest.Mock;

function createRequest(headers: Record<string, string> = {}) {
  return { headers: { get: (n: string) => headers[n] || null } } as any;
}

describe('Statistics territory routes', () => {
  beforeEach(() => { jest.clearAllMocks(); process.env.BASE_URL = 'https://test-api.com'; });

  describe('GET /api/statistics/capacities-by-territory', () => {
    it('returns data', async () => {
      const { GET } = require('@/app/api/statistics/capacities-by-territory/route');
      mockAxiosGet.mockResolvedValue({ data: { '18': { '10': { known: 5 } } } });
      await GET(createRequest({ authorization: 'Token t' }));
      expect(NextResponse.json).toHaveBeenCalledWith({ '18': { '10': { known: 5 } } });
    });

    it('returns 500 on error', async () => {
      const { GET } = require('@/app/api/statistics/capacities-by-territory/route');
      mockAxiosGet.mockRejectedValue(new Error('fail'));
      await GET(createRequest());
      expect(NextResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({ error: expect.stringContaining('Failed') }),
        expect.objectContaining({ status: 500 })
      );
    });
  });

  describe('GET /api/statistics/languages-by-territory', () => {
    it('returns data', async () => {
      const { GET } = require('@/app/api/statistics/languages-by-territory/route');
      mockAxiosGet.mockResolvedValue({ data: { '18': { en: 5 } } });
      await GET(createRequest({ authorization: 'Token t' }));
      expect(NextResponse.json).toHaveBeenCalledWith({ '18': { en: 5 } });
    });

    it('returns 500 on error', async () => {
      const { GET } = require('@/app/api/statistics/languages-by-territory/route');
      mockAxiosGet.mockRejectedValue(new Error('fail'));
      await GET(createRequest());
      expect(NextResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({ error: expect.stringContaining('Failed') }),
        expect.objectContaining({ status: 500 })
      );
    });
  });
});
