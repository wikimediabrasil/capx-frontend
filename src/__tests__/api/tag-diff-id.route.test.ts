jest.mock('axios');
import axios from 'axios';
import { GET, DELETE } from '@/app/api/tag_diff/[id]/route';
import { NextResponse } from 'next/server';
const mockAxiosGet = axios.get as jest.Mock;
const mockAxiosDelete = axios.delete as jest.Mock;
function createRequest(headers: Record<string, string> = {}) {
  return { headers: { get: (n: string) => headers[n] || null } } as any;
}
const params = { params: Promise.resolve({ id: '1' }) };
describe('/api/tag_diff/[id]', () => {
  beforeEach(() => { jest.clearAllMocks(); process.env.BASE_URL = 'http://test-api.com'; });
  it('GET returns tag diff', async () => {
    mockAxiosGet.mockResolvedValue({ data: { id: 1 } });
    await GET(createRequest({ authorization: 'Token t' }), params);
    expect(NextResponse.json).toHaveBeenCalledWith({ id: 1 });
  });
  it('DELETE removes tag diff', async () => {
    mockAxiosDelete.mockResolvedValue({ data: {} });
    await DELETE(createRequest({ authorization: 'Token t' }), params);
    expect(NextResponse.json).toHaveBeenCalledWith({});
  });
  it('GET returns error on failure', async () => {
    mockAxiosGet.mockRejectedValue(new Error('fail'));
    await GET(createRequest({ authorization: 'Token t' }), params);
    expect(NextResponse.json).toHaveBeenCalledWith(expect.objectContaining({ error: 'Failed to fetch news' }), expect.objectContaining({ status: 500 }));
  });
});
