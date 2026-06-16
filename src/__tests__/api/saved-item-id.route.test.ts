jest.mock('axios');

import axios from 'axios';
import { DELETE } from '@/app/api/saved_item/[id]/route';
import { NextResponse } from 'next/server';

const mockAxiosDelete = axios.delete as jest.Mock;

function createRequest(headers: Record<string, string> = {}) {
  return {
    nextUrl: { pathname: '/api/saved_item/42' },
    headers: { get: (name: string) => headers[name] || null },
  } as any;
}

describe('DELETE /api/saved_item/[id]', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.BASE_URL = 'https://test-api.com';
  });

  it('deletes saved item', async () => {
    mockAxiosDelete.mockResolvedValue({});
    const req = createRequest({ authorization: 'Token test' });
    await DELETE(req, { params: Promise.resolve({ id: '42' }) });
    expect(mockAxiosDelete).toHaveBeenCalledWith(
      'https://test-api.com/saved_item/42/',
      expect.any(Object)
    );
    expect(NextResponse.json).toHaveBeenCalledWith({ success: true });
  });

  it('returns 401 without auth', async () => {
    const req = createRequest();
    await DELETE(req, { params: Promise.resolve({ id: '42' }) });
    expect(NextResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({ error: 'Unauthorized' }),
      expect.objectContaining({ status: 401 })
    );
  });
});
