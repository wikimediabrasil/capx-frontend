jest.mock('axios');
import axios from 'axios';
import { GET } from '@/app/api/organization_type/route';
import { NextResponse } from 'next/server';
const mockAxiosGet = axios.get as jest.Mock;
function createRequest(url = 'https://localhost:3000/api/organization_type', headers: Record<string, string> = {}) {
  return { nextUrl: new URL(url), headers: { get: (n: string) => headers[n] || null } } as any;
}
describe('GET /api/organization_type', () => {
  beforeEach(() => { jest.clearAllMocks(); process.env.BASE_URL = 'https://test-api.com'; });
  it('returns org types', async () => {
    mockAxiosGet.mockResolvedValue({ data: { results: [{ id: 1 }] } });
    await GET(createRequest('https://localhost:3000/api/organization_type', { authorization: 'Token t' }));
    expect(NextResponse.json).toHaveBeenCalledWith([{ id: 1 }]);
  });
  it('returns 500 on error', async () => {
    mockAxiosGet.mockRejectedValue({ message: 'fail' });
    await GET(createRequest('https://localhost:3000/api/organization_type', { authorization: 'Token t' }));
    expect(NextResponse.json).toHaveBeenCalledWith(expect.objectContaining({ error: expect.stringContaining('Failed') }), expect.objectContaining({ status: 500 }));
  });
});
