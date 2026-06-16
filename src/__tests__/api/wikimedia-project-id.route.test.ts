jest.mock('axios');
import axios from 'axios';
import { GET } from '@/app/api/wikimedia_project/[id]/route';
import { NextResponse } from 'next/server';
const mockAxiosGet = axios.get as jest.Mock;
function createRequest(headers: Record<string, string> = {}) {
  return { headers: { get: (n: string) => headers[n] || null } } as any;
}
describe('GET /api/wikimedia_project/[id]', () => {
  beforeEach(() => { jest.clearAllMocks(); process.env.BASE_URL = 'https://test-api.com'; });
  it('returns project by id', async () => {
    mockAxiosGet.mockResolvedValue({ data: { id: 1, name: 'Wikipedia' } });
    await GET(createRequest({ authorization: 'Token t' }), { params: Promise.resolve({ id: '1' }) });
    expect(NextResponse.json).toHaveBeenCalledWith({ id: 1, name: 'Wikipedia' });
  });
  it('returns 500 on error', async () => {
    mockAxiosGet.mockRejectedValue(new Error('fail'));
    await GET(createRequest({ authorization: 'Token t' }), { params: Promise.resolve({ id: '1' }) });
    expect(NextResponse.json).toHaveBeenCalledWith(expect.objectContaining({ error: 'Failed to fetch projects' }), expect.objectContaining({ status: 500 }));
  });
});
