jest.mock('axios');

import axios from 'axios';
import { GET, POST } from '@/app/api/saved_item/route';
import { NextResponse } from 'next/server';

const mockAxiosGet = axios.get as jest.Mock;
const mockAxiosPost = axios.post as jest.Mock;

function createRequest(options: { url?: string; headers?: Record<string, string>; body?: any }) {
  const url = new URL(options.url || 'https://localhost:3000/api/saved_item');
  return {
    nextUrl: url,
    headers: { get: (name: string) => options.headers?.[name] || null },
    json: jest.fn().mockResolvedValue(options.body || {}),
  } as any;
}

describe('GET /api/saved_item', () => {
  beforeEach(() => { jest.clearAllMocks(); process.env.BASE_URL = 'https://test-api.com'; });

  it('returns saved items', async () => {
    mockAxiosGet.mockResolvedValue({ data: [{ id: 1 }] });
    const req = createRequest({ headers: { authorization: 'Token test' } });
    await GET(req);
    expect(NextResponse.json).toHaveBeenCalledWith([{ id: 1 }]);
  });

  it('returns 401 without auth', async () => {
    const req = createRequest({});
    await GET(req);
    expect(NextResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({ error: 'Unauthorized' }),
      expect.objectContaining({ status: 401 })
    );
  });

  it('returns error on failure', async () => {
    mockAxiosGet.mockRejectedValue({ message: 'fail', response: { status: 500 } });
    const req = createRequest({ headers: { authorization: 'Token test' } });
    await GET(req);
    expect(NextResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({ error: 'Failed to fetch saved items' }),
      expect.objectContaining({ status: 500 })
    );
  });
});

describe('POST /api/saved_item', () => {
  beforeEach(() => { jest.clearAllMocks(); process.env.BASE_URL = 'https://test-api.com'; });

  it('creates saved item', async () => {
    mockAxiosPost.mockResolvedValue({ data: { id: 1 } });
    const req = createRequest({ headers: { authorization: 'Token test' }, body: { profile: 1 } });
    await POST(req);
    expect(NextResponse.json).toHaveBeenCalledWith({ id: 1 });
  });

  it('returns 401 without auth', async () => {
    const req = createRequest({ body: { profile: 1 } });
    await POST(req);
    expect(NextResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({ error: 'Unauthorized' }),
      expect.objectContaining({ status: 401 })
    );
  });
});
