jest.mock('axios');
import axios from 'axios';
import { GET, POST } from '@/app/api/tag_diff/route';
import { NextResponse } from 'next/server';
const mockAxiosGet = axios.get as jest.Mock;
const mockAxiosPost = axios.post as jest.Mock;
function createRequest(options: { url?: string; headers?: Record<string, string>; body?: any }) {
  const url = new URL(options.url || 'https://localhost:3000/api/tag_diff');
  return {
    nextUrl: url,
    headers: { get: (n: string) => options.headers?.[n] || null },
    json: jest.fn().mockResolvedValue(options.body || {}),
  } as any;
}
describe('/api/tag_diff', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.BASE_URL = 'https://test-api.com';
  });
  it('GET returns tag diffs', async () => {
    mockAxiosGet.mockResolvedValue({ data: { results: [{ id: 1 }] } });
    await GET(createRequest({ headers: { authorization: 'Token t' } }));
    expect(NextResponse.json).toHaveBeenCalledWith([{ id: 1 }]);
  });
  it('GET returns error on failure', async () => {
    mockAxiosGet.mockRejectedValue({ message: 'fail', response: { status: 500 } });
    await GET(createRequest({ headers: { authorization: 'Token t' } }));
    expect(NextResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({ error: 'Failed to fetch news' }),
      expect.objectContaining({ status: 500 })
    );
  });
  it('POST creates tag diff', async () => {
    mockAxiosGet.mockRejectedValue(new Error('not found'));
    mockAxiosPost.mockResolvedValue({ data: { id: 1, tag: 'test' } });
    await POST(createRequest({ headers: { authorization: 'Token t' }, body: { tag: 'test' } }));
    expect(NextResponse.json).toHaveBeenCalledWith({ id: 1, tag: 'test' });
  });
  it('POST returns existing tag if found', async () => {
    mockAxiosGet.mockResolvedValue({ data: [{ id: 1, tag: 'test' }] });
    await POST(createRequest({ headers: { authorization: 'Token t' }, body: { tag: 'test' } }));
    expect(NextResponse.json).toHaveBeenCalledWith({ id: 1, tag: 'test' });
  });
});
