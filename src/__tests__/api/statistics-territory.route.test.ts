jest.mock('axios');
import axios from 'axios';
import { NextResponse } from 'next/server';
import { createMockNextRequest, setupApiTest } from '../helpers/apiTestHelpers';

const mockAxiosGet = axios.get as jest.Mock;

describe('Statistics territory routes', () => {
  beforeEach(() => setupApiTest());

  describe('GET /api/statistics/capacities-by-territory', () => {
    it('returns data', async () => {
      const { GET } = require('@/app/api/statistics/capacities-by-territory/route');
      mockAxiosGet.mockResolvedValue({ data: { '18': { '10': { known: 5 } } } });
      await GET(
        createMockNextRequest('https://localhost:3000/api/statistics/capacities-by-territory', {
          headers: { authorization: 'Token t' },
        })
      );
      expect(NextResponse.json).toHaveBeenCalledWith({ '18': { '10': { known: 5 } } });
    });

    it('returns 500 on error', async () => {
      const { GET } = require('@/app/api/statistics/capacities-by-territory/route');
      mockAxiosGet.mockRejectedValue(new Error('fail'));
      await GET(
        createMockNextRequest('https://localhost:3000/api/statistics/capacities-by-territory', {})
      );
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
      await GET(
        createMockNextRequest('https://localhost:3000/api/statistics/languages-by-territory', {
          headers: { authorization: 'Token t' },
        })
      );
      expect(NextResponse.json).toHaveBeenCalledWith({ '18': { en: 5 } });
    });

    it('returns 500 on error', async () => {
      const { GET } = require('@/app/api/statistics/languages-by-territory/route');
      mockAxiosGet.mockRejectedValue(new Error('fail'));
      await GET(
        createMockNextRequest('https://localhost:3000/api/statistics/languages-by-territory', {})
      );
      expect(NextResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({ error: expect.stringContaining('Failed') }),
        expect.objectContaining({ status: 500 })
      );
    });
  });
});
