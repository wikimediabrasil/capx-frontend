jest.mock('axios');
import axios from 'axios';
import { GET, POST } from '@/app/api/organization_name/route';
import { NextResponse } from 'next/server';
import { createMockNextRequest, setupApiTest } from '../helpers/apiTestHelpers';
const mockAxiosGet = axios.get as jest.Mock;
const mockAxiosPost = axios.post as jest.Mock;
describe('/api/organization_name', () => {
  beforeEach(() => setupApiTest());
  it('GET returns names', async () => {
    mockAxiosGet.mockResolvedValue({ data: { results: [{ id: 1, name: 'Test' }] } });
    await GET(
      createMockNextRequest('https://localhost:3000/api/organization_name', {
        headers: { authorization: 'Token t' },
      })
    );
    expect(NextResponse.json).toHaveBeenCalledWith({ results: [{ id: 1, name: 'Test' }] });
  });
  it('POST creates name', async () => {
    mockAxiosPost.mockResolvedValue({ data: { id: 1 } });
    await POST(
      createMockNextRequest('https://localhost:3000/api/organization_name', {
        headers: { authorization: 'Token t' },
        body: { name: 'Test', language_code: 'en' },
      })
    );
    expect(NextResponse.json).toHaveBeenCalledWith(
      { id: 1 },
      expect.objectContaining({ status: 201 })
    );
  });
  it('GET returns error on failure', async () => {
    mockAxiosGet.mockRejectedValue({ message: 'fail', response: { status: 500 } });
    await GET(
      createMockNextRequest('https://localhost:3000/api/organization_name', {
        headers: { authorization: 'Token t' },
      })
    );
    expect(NextResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({ error: expect.stringContaining('Failed') }),
      expect.objectContaining({ status: 500 })
    );
  });
});
