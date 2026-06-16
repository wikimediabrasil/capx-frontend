jest.mock('axios');

import axios from 'axios';
import { GET } from '@/app/api/territory/route';
import { NextResponse } from 'next/server';
import { createMockNextRequest, setupApiTest } from '../helpers/apiTestHelpers';

const mockAxiosGet = axios.get as jest.Mock;

describe('GET /api/territory', () => {
  beforeEach(() => setupApiTest());

  it('returns territory data on success', async () => {
    const mockData = [{ id: 1, name: 'SSA' }];
    mockAxiosGet.mockResolvedValue({ data: mockData });

    const req = createMockNextRequest('https://localhost:3000/api/territory', {
      headers: { authorization: 'Token test' },
    });
    await GET(req);

    expect(mockAxiosGet).toHaveBeenCalledWith(
      expect.stringContaining('https://test-api.com/territory/'),
      expect.any(Object)
    );
    expect(NextResponse.json).toHaveBeenCalledWith(mockData);
  });

  it('passes query params to backend', async () => {
    mockAxiosGet.mockResolvedValue({ data: [] });

    const req = createMockNextRequest('https://localhost:3000/api/territory', {
      url: 'https://localhost:3000/api/territory?limit=10',
      headers: { authorization: 'Token test' },
    });
    await GET(req);

    expect(mockAxiosGet).toHaveBeenCalledWith(
      expect.stringContaining('limit=10'),
      expect.any(Object)
    );
  });

  it('returns 500 on error', async () => {
    mockAxiosGet.mockRejectedValue(new Error('fail'));

    const req = createMockNextRequest('https://localhost:3000/api/territory', {});
    await GET(req);

    expect(NextResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({ error: 'Failed to fetch territories' }),
      expect.objectContaining({ status: 500 })
    );
  });
});
