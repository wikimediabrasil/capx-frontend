jest.mock('axios');
jest.mock('@/lib/utils/api-error-handler', () => ({
  handleApiError: jest.fn(() => ({ status: 500 })),
}));

import axios from 'axios';
import { GET } from '@/app/api/recommendation/route';
import { NextResponse } from 'next/server';
import { createMockNextRequest, setupApiTest } from '../helpers/apiTestHelpers';

const mockAxiosGet = axios.get as jest.Mock;

describe('GET /api/recommendation', () => {
  beforeEach(() => setupApiTest());

  it('returns recommendations', async () => {
    mockAxiosGet.mockResolvedValue({ data: { profiles: [] } });
    const req = createMockNextRequest('https://localhost:3000/api/recommendation', { headers: { authorization: 'Token test' } });
    await GET(req);
    expect(NextResponse.json).toHaveBeenCalledWith({ profiles: [] });
  });

  it('returns 401 without auth', async () => {
    const req = createMockNextRequest('https://localhost:3000/api/recommendation', {});
    await GET(req);
    expect(NextResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({ error: 'Unauthorized' }),
      expect.objectContaining({ status: 401 })
    );
  });

  it('calls handleApiError on failure', async () => {
    const { handleApiError } = require('@/lib/utils/api-error-handler');
    mockAxiosGet.mockRejectedValue(new Error('fail'));
    const req = createMockNextRequest('https://localhost:3000/api/recommendation', { headers: { authorization: 'Token test' } });
    await GET(req);
    expect(handleApiError).toHaveBeenCalled();
  });
});
