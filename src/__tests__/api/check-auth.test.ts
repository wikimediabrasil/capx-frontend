jest.mock('axios');
jest.mock('@/lib/utils/api-error-handler', () => ({
  handleApiError: jest.fn(() => ({ status: 500, json: jest.fn() })),
}));

import axios from 'axios';
import { POST } from '@/app/api/check-auth/route';
import { NextResponse } from 'next/server';

const mockAxiosGet = axios.get as jest.Mock;

function createRequest(options: { headers?: Record<string, string>; body?: any }) {
  return {
    headers: { get: (name: string) => options.headers?.[name] || null },
    json: jest.fn().mockResolvedValue(options.body || {}),
  } as any;
}

describe('POST /api/check-auth', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.BASE_URL = 'http://test-api.com';
  });

  it('returns 401 when no authorization header', async () => {
    const req = createRequest({ headers: {} });
    await POST(req);
    expect(NextResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({ error: expect.any(String) }),
      expect.objectContaining({ status: 401 })
    );
  });

  it('returns valid:true when auth is valid', async () => {
    mockAxiosGet.mockResolvedValue({ data: { id: 1 } });
    const req = createRequest({
      headers: { authorization: 'Token test-token' },
      body: { userId: 1 },
    });
    await POST(req);
    expect(NextResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({ valid: true, status: 'authenticated' })
    );
  });

  it('returns 401 when backend returns 401', async () => {
    mockAxiosGet.mockRejectedValue({ response: { status: 401 } });
    const req = createRequest({
      headers: { authorization: 'Token invalid' },
      body: {},
    });
    await POST(req);
    expect(NextResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({ shouldLogout: true }),
      expect.objectContaining({ status: 401 })
    );
  });
});
