jest.mock('axios');
jest.mock('@/lib/utils/api-error-handler', () => ({
  handleApiError: jest.fn(() => ({ status: 500, json: jest.fn() })),
}));

import axios from 'axios';
import { POST } from '@/app/api/check-auth/route';
import { NextResponse } from 'next/server';
import { createMockNextRequest, setupApiTest } from '../helpers/apiTestHelpers';

const mockAxiosGet = axios.get as jest.Mock;

describe('POST /api/check-auth', () => {
  beforeEach(() => setupApiTest());

  it('returns 401 when no authorization header', async () => {
    const req = createMockNextRequest('https://localhost:3000/api/check-auth', { headers: {} });
    await POST(req);
    expect(NextResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({ error: expect.any(String) }),
      expect.objectContaining({ status: 401 })
    );
  });

  it('returns valid:true when auth is valid', async () => {
    mockAxiosGet.mockResolvedValue({ data: { id: 1 } });
    const req = createMockNextRequest('https://localhost:3000/api/check-auth', {
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
    const req = createMockNextRequest('https://localhost:3000/api/check-auth', {
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
