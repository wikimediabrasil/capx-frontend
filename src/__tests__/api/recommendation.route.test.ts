jest.mock('axios');
jest.mock('@/lib/utils/api-error-handler', () => ({
  handleApiError: jest.fn(() => ({ status: 500 })),
}));

import axios from 'axios';
import { GET } from '@/app/api/recommendation/route';
import { NextResponse } from 'next/server';

const mockAxiosGet = axios.get as jest.Mock;

function createRequest(headers: Record<string, string> = {}) {
  return {
    headers: { get: (name: string) => headers[name] || null },
  } as any;
}

describe('GET /api/recommendation', () => {
  beforeEach(() => { jest.clearAllMocks(); process.env.BASE_URL = 'http://test-api.com'; });

  it('returns recommendations', async () => {
    mockAxiosGet.mockResolvedValue({ data: { profiles: [] } });
    const req = createRequest({ authorization: 'Token test' });
    await GET(req);
    expect(NextResponse.json).toHaveBeenCalledWith({ profiles: [] });
  });

  it('returns 401 without auth', async () => {
    const req = createRequest();
    await GET(req);
    expect(NextResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({ error: 'Unauthorized' }),
      expect.objectContaining({ status: 401 })
    );
  });

  it('calls handleApiError on failure', async () => {
    const { handleApiError } = require('@/lib/utils/api-error-handler');
    mockAxiosGet.mockRejectedValue(new Error('fail'));
    const req = createRequest({ authorization: 'Token test' });
    await GET(req);
    expect(handleApiError).toHaveBeenCalled();
  });
});
