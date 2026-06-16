jest.mock('axios');

import axios from 'axios';
import { GET, POST } from '@/app/api/saved_item/route';
import { NextResponse } from 'next/server';
import { createMockNextRequest, setupApiTest } from '../helpers/apiTestHelpers';

const mockAxiosGet = axios.get as jest.Mock;
const mockAxiosPost = axios.post as jest.Mock;

describe('GET /api/saved_item', () => {
  beforeEach(() => setupApiTest());

  it('returns saved items', async () => {
    mockAxiosGet.mockResolvedValue({ data: [{ id: 1 }] });
    const req = createMockNextRequest('https://localhost:3000/api/saved_item', {
      headers: { authorization: 'Token test' },
    });
    await GET(req);
    expect(NextResponse.json).toHaveBeenCalledWith([{ id: 1 }]);
  });

  it('returns 401 without auth', async () => {
    const req = createMockNextRequest('https://localhost:3000/api/saved_item', {});
    await GET(req);
    expect(NextResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({ error: 'Unauthorized' }),
      expect.objectContaining({ status: 401 })
    );
  });

  it('returns error on failure', async () => {
    mockAxiosGet.mockRejectedValue({ message: 'fail', response: { status: 500 } });
    const req = createMockNextRequest('https://localhost:3000/api/saved_item', {
      headers: { authorization: 'Token test' },
    });
    await GET(req);
    expect(NextResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({ error: 'Failed to fetch saved items' }),
      expect.objectContaining({ status: 500 })
    );
  });
});

describe('POST /api/saved_item', () => {
  beforeEach(() => setupApiTest());

  it('creates saved item', async () => {
    mockAxiosPost.mockResolvedValue({ data: { id: 1 } });
    const req = createMockNextRequest('https://localhost:3000/api/saved_item', {
      headers: { authorization: 'Token test' },
      body: { profile: 1 },
    });
    await POST(req);
    expect(NextResponse.json).toHaveBeenCalledWith({ id: 1 });
  });

  it('returns 401 without auth', async () => {
    const req = createMockNextRequest('https://localhost:3000/api/saved_item', {
      body: { profile: 1 },
    });
    await POST(req);
    expect(NextResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({ error: 'Unauthorized' }),
      expect.objectContaining({ status: 401 })
    );
  });
});
