jest.mock('axios');
import axios from 'axios';
import { GET } from '@/app/api/lets_connect/exists/route';
import { NextResponse } from 'next/server';
const mockAxiosGet = axios.get as jest.Mock;
function createRequest(
  url = 'https://localhost:3000/api/lets_connect/exists',
  headers: Record<string, string> = {}
) {
  return { nextUrl: new URL(url), headers: { get: (n: string) => headers[n] || null } } as any;
}
describe('GET /api/lets_connect/exists', () => {
  beforeEach(() => jest.clearAllMocks());
  it('returns exists data', async () => {
    mockAxiosGet.mockResolvedValue({ data: { exists: true } });
    await GET(
      createRequest('https://localhost:3000/api/lets_connect/exists?username=testuser', {
        authorization: 'Token t',
      })
    );
    expect(NextResponse.json).toHaveBeenCalledWith({ exists: true });
  });
  it('returns 400 without username', async () => {
    await GET(createRequest());
    expect(NextResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({ error: 'Username is required' }),
      expect.objectContaining({ status: 400 })
    );
  });
  it('returns error on failure', async () => {
    mockAxiosGet.mockRejectedValue({ response: { status: 500 } });
    await GET(createRequest('https://localhost:3000/api/lets_connect/exists?username=testuser'));
    expect(NextResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({ error: expect.stringContaining('Failed') }),
      expect.objectContaining({ status: 500 })
    );
  });
});
