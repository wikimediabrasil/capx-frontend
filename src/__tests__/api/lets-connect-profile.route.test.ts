jest.mock('axios');
import axios from 'axios';
import { GET, POST } from '@/app/api/lets_connect/profile/route';
import { NextResponse } from 'next/server';
import { createMockNextRequest, setupApiTest } from '../helpers/apiTestHelpers';
const mockAxiosGet = axios.get as jest.Mock;
const mockAxiosPost = axios.post as jest.Mock;
describe('/api/lets_connect/profile', () => {
  beforeEach(() => setupApiTest());
  it('GET returns profile', async () => {
    mockAxiosGet.mockResolvedValue({ data: { username: 'test' } });
    await GET(
      createMockNextRequest('https://localhost:3000/api/lets_connect/profile', {
        url: 'https://localhost:3000/api/lets_connect/profile?username=test',
        headers: { authorization: 'Token t' },
      })
    );
    expect(NextResponse.json).toHaveBeenCalledWith({ username: 'test' });
  });
  it('POST creates profile', async () => {
    mockAxiosPost.mockResolvedValue({ data: { id: 1 } });
    await POST(
      createMockNextRequest('https://localhost:3000/api/lets_connect/profile', {
        headers: { authorization: 'Token t' },
        body: { type: 'mentor' },
      })
    );
    expect(NextResponse.json).toHaveBeenCalledWith({ id: 1 });
  });
  it('GET returns error on failure', async () => {
    mockAxiosGet.mockRejectedValue({ response: { status: 500 } });
    await GET(
      createMockNextRequest('https://localhost:3000/api/lets_connect/profile', {
        url: 'https://localhost:3000/api/lets_connect/profile?username=test',
      })
    );
    expect(NextResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({ error: expect.stringContaining('Failed') }),
      expect.objectContaining({ status: 500 })
    );
  });
});
