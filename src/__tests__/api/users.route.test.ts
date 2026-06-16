jest.mock('axios');

import axios from 'axios';
import { GET } from '@/app/api/users/route';
import { NextResponse } from 'next/server';
import { createMockNextRequest, setupApiTest } from '../helpers/apiTestHelpers';

const mockAxiosGet = axios.get as jest.Mock;

describe('GET /api/users', () => {
  beforeEach(() => setupApiTest());

  it('returns users', async () => {
    mockAxiosGet.mockResolvedValue({ data: { results: [{ id: 1 }] } });
    await GET(createMockNextRequest('https://localhost:3000/api/users', { headers: { authorization: 'Token test' } }));
    expect(NextResponse.json).toHaveBeenCalledWith({ results: [{ id: 1 }] });
  });

  it('returns 401 without auth', async () => {
    await GET(createMockNextRequest('https://localhost:3000/api/users', {}));
    expect(NextResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({ error: 'Unauthorized' }),
      expect.objectContaining({ status: 401 })
    );
  });

  it('returns 500 on error', async () => {
    mockAxiosGet.mockRejectedValue(new Error('fail'));
    await GET(createMockNextRequest('https://localhost:3000/api/users', { headers: { authorization: 'Token test' } }));
    expect(NextResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({ error: 'Failed to fetch user data' }),
      expect.objectContaining({ status: 500 })
    );
  });
});
