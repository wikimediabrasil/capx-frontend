jest.mock('axios');
import axios from 'axios';
import { GET } from '@/app/api/wikimedia_project/route';
import { NextResponse } from 'next/server';
const mockAxiosGet = axios.get as jest.Mock;
function createRequest(headers: Record<string, string> = {}) {
  return {
    nextUrl: new URL('https://localhost:3000/api/wikimedia_project'),
    headers: { get: (n: string) => headers[n] || null },
  } as any;
}
describe('GET /api/wikimedia_project', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.BASE_URL = 'https://test-api.com';
  });
  it('returns projects', async () => {
    mockAxiosGet.mockResolvedValue({ data: { results: [{ id: 1 }] } });
    await GET(createRequest({ authorization: 'Token t' }));
    expect(NextResponse.json).toHaveBeenCalledWith([{ id: 1 }]);
  });
  it('returns 500 on error', async () => {
    mockAxiosGet.mockRejectedValue(new Error('fail'));
    await GET(createRequest({ authorization: 'Token t' }));
    expect(NextResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({ error: 'Failed to fetch projects' }),
      expect.objectContaining({ status: 500 })
    );
  });
});
