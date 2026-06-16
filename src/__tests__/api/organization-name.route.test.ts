jest.mock('axios');
import axios from 'axios';
import { GET, POST } from '@/app/api/organization_name/route';
import { NextResponse } from 'next/server';
const mockAxiosGet = axios.get as jest.Mock;
const mockAxiosPost = axios.post as jest.Mock;
function createRequest(options: { url?: string; headers?: Record<string, string>; body?: any }) {
  const url = new URL(options.url || 'http://localhost:3000/api/organization_name');
  return { nextUrl: url, headers: { get: (n: string) => options.headers?.[n] || null }, json: jest.fn().mockResolvedValue(options.body || {}) } as any;
}
describe('/api/organization_name', () => {
  beforeEach(() => { jest.clearAllMocks(); process.env.BASE_URL = 'http://test-api.com'; });
  it('GET returns names', async () => {
    mockAxiosGet.mockResolvedValue({ data: { results: [{ id: 1, name: 'Test' }] } });
    await GET(createRequest({ headers: { authorization: 'Token t' } }));
    expect(NextResponse.json).toHaveBeenCalledWith({ results: [{ id: 1, name: 'Test' }] });
  });
  it('POST creates name', async () => {
    mockAxiosPost.mockResolvedValue({ data: { id: 1 } });
    await POST(createRequest({ headers: { authorization: 'Token t' }, body: { name: 'Test', language_code: 'en' } }));
    expect(NextResponse.json).toHaveBeenCalledWith({ id: 1 }, expect.objectContaining({ status: 201 }));
  });
  it('GET returns error on failure', async () => {
    mockAxiosGet.mockRejectedValue({ message: 'fail', response: { status: 500 } });
    await GET(createRequest({ headers: { authorization: 'Token t' } }));
    expect(NextResponse.json).toHaveBeenCalledWith(expect.objectContaining({ error: expect.stringContaining('Failed') }), expect.objectContaining({ status: 500 }));
  });
});
