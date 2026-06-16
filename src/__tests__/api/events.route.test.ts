jest.mock('axios');

import axios from 'axios';
import { GET, POST } from '@/app/api/events/route';
import { NextResponse } from 'next/server';
import { createMockNextRequest, setupApiTest } from '../helpers/apiTestHelpers';

const mockAxiosGet = axios.get as jest.Mock;
const mockAxiosPost = axios.post as jest.Mock;

describe('GET /api/events', () => {
  beforeEach(() => setupApiTest());

  it('returns events on success', async () => {
    const mockData = { results: [{ id: 1 }], count: 1 };
    mockAxiosGet.mockResolvedValue({ data: mockData });

    const req = createMockNextRequest('https://localhost:3000/api/events', {});
    await GET(req);

    expect(NextResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({ results: [{ id: 1 }], count: 1 })
    );
  });

  it('returns error on failure', async () => {
    mockAxiosGet.mockRejectedValue({ message: 'fail', response: { status: 500, data: 'error' } });

    const req = createMockNextRequest('https://localhost:3000/api/events', {});
    await GET(req);

    expect(NextResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({ error: 'Failed to fetch events' }),
      expect.objectContaining({ status: 500 })
    );
  });
});

describe('POST /api/events', () => {
  beforeEach(() => setupApiTest());

  it('creates event on success', async () => {
    mockAxiosPost.mockResolvedValue({ status: 201, data: { id: 1, name: 'Test' } });

    const req = createMockNextRequest('https://localhost:3000/api/events', {
      headers: { authorization: 'Token test' },
      body: { name: 'Test', organization: 1, time_begin: '2024-01-01T00:00:00Z' },
    });
    await POST(req);

    expect(NextResponse.json).toHaveBeenCalledWith(expect.objectContaining({ id: 1 }));
  });

  it('returns 401 when no authorization', async () => {
    const req = createMockNextRequest('https://localhost:3000/api/events', {
      body: { name: 'Test', organization: 1, time_begin: '2024-01-01T00:00:00Z' },
    });
    await POST(req);

    expect(NextResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({ error: 'Authorization header missing' }),
      expect.objectContaining({ status: 401 })
    );
  });

  it('returns 400 for missing required fields', async () => {
    const req = createMockNextRequest('https://localhost:3000/api/events', {
      headers: { authorization: 'Token test' },
      body: { name: 'Test' },
    });
    await POST(req);

    expect(NextResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({ error: 'Missing required fields' }),
      expect.objectContaining({ status: 400 })
    );
  });

  it('returns 400 for invalid JSON', async () => {
    const req = {
      ...createMockNextRequest('https://localhost:3000/api/events', {
        headers: { authorization: 'Token test' },
      }),
      json: jest.fn().mockRejectedValue(new Error('Invalid JSON')),
    } as any;
    await POST(req);

    expect(NextResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({ error: 'Invalid JSON in request body' }),
      expect.objectContaining({ status: 400 })
    );
  });
});
