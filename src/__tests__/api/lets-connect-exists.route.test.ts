jest.mock('axios');
import axios from 'axios';
import { GET } from '@/app/api/lets_connect/exists/route';
import { NextResponse } from 'next/server';
import { createMockNextRequest } from '../helpers/apiTestHelpers';
const mockAxiosGet = axios.get as jest.Mock;
describe('GET /api/lets_connect/exists', () => {
  beforeEach(() => jest.clearAllMocks());
  it('returns exists data', async () => {
    mockAxiosGet.mockResolvedValue({ data: { exists: true } });
    await GET(
      createMockNextRequest('https://localhost:3000/api/lets_connect/exists', {
        url: 'https://localhost:3000/api/lets_connect/exists?username=testuser',
        headers: { authorization: 'Token t' },
      })
    );
    expect(NextResponse.json).toHaveBeenCalledWith({ exists: true });
  });
  it('returns 400 without username', async () => {
    await GET(createMockNextRequest('https://localhost:3000/api/lets_connect/exists', {}));
    expect(NextResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({ error: 'Username is required' }),
      expect.objectContaining({ status: 400 })
    );
  });
  it('returns error on failure', async () => {
    mockAxiosGet.mockRejectedValue({ response: { status: 500 } });
    await GET(createMockNextRequest('https://localhost:3000/api/lets_connect/exists', { url: 'https://localhost:3000/api/lets_connect/exists?username=testuser' }));
    expect(NextResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({ error: expect.stringContaining('Failed') }),
      expect.objectContaining({ status: 500 })
    );
  });
});
