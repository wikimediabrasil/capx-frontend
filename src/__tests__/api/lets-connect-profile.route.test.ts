jest.mock('axios');
import axios from 'axios';
import { GET, POST } from '@/app/api/lets_connect/profile/route';
import { NextResponse } from 'next/server';
const mockAxiosGet = axios.get as jest.Mock;
const mockAxiosPost = axios.post as jest.Mock;
function createRequest(options: { url?: string; headers?: Record<string, string>; body?: any }) {
  const url = new URL(options.url || 'http://localhost:3000/api/lets_connect/profile');
  return { nextUrl: url, headers: { get: (n: string) => options.headers?.[n] || null }, json: jest.fn().mockResolvedValue(options.body || {}) } as any;
}
describe('/api/lets_connect/profile', () => {
  beforeEach(() => { jest.clearAllMocks(); process.env.BASE_URL = 'http://test-api.com'; });
  it('GET returns profile', async () => {
    mockAxiosGet.mockResolvedValue({ data: { username: 'test' } });
    await GET(createRequest({ url: 'http://localhost:3000/api/lets_connect/profile?username=test', headers: { authorization: 'Token t' } }));
    expect(NextResponse.json).toHaveBeenCalledWith({ username: 'test' });
  });
  it('POST creates profile', async () => {
    mockAxiosPost.mockResolvedValue({ data: { id: 1 } });
    await POST(createRequest({ headers: { authorization: 'Token t' }, body: { type: 'mentor' } }));
    expect(NextResponse.json).toHaveBeenCalledWith({ id: 1 });
  });
  it('GET returns error on failure', async () => {
    mockAxiosGet.mockRejectedValue({ response: { status: 500 } });
    await GET(createRequest({ url: 'http://localhost:3000/api/lets_connect/profile?username=test' }));
    expect(NextResponse.json).toHaveBeenCalledWith(expect.objectContaining({ error: expect.stringContaining('Failed') }), expect.objectContaining({ status: 500 }));
  });
});
