jest.mock('axios');
import axios from 'axios';
import { GET, DELETE } from '@/app/api/tag_diff/[id]/route';
import { NextResponse } from 'next/server';
import { createMockNextRequest, setupApiTest } from '../helpers/apiTestHelpers';
const mockAxiosGet = axios.get as jest.Mock;
const mockAxiosDelete = axios.delete as jest.Mock;
const params = { params: Promise.resolve({ id: '1' }) };
describe('/api/tag_diff/[id]', () => {
  beforeEach(() => setupApiTest());
  it('GET returns tag diff', async () => {
    mockAxiosGet.mockResolvedValue({ data: { id: 1 } });
    await GET(createMockNextRequest('https://localhost:3000/api/tag_diff', { headers: { authorization: 'Token t' } }), params);
    expect(NextResponse.json).toHaveBeenCalledWith({ id: 1 });
  });
  it('DELETE removes tag diff', async () => {
    mockAxiosDelete.mockResolvedValue({ data: {} });
    await DELETE(createMockNextRequest('https://localhost:3000/api/tag_diff', { headers: { authorization: 'Token t' } }), params);
    expect(NextResponse.json).toHaveBeenCalledWith({});
  });
  it('GET returns error on failure', async () => {
    mockAxiosGet.mockRejectedValue(new Error('fail'));
    await GET(createMockNextRequest('https://localhost:3000/api/tag_diff', { headers: { authorization: 'Token t' } }), params);
    expect(NextResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({ error: 'Failed to fetch news' }),
      expect.objectContaining({ status: 500 })
    );
  });
});
