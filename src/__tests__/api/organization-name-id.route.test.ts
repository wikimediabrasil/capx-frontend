jest.mock('axios');
import axios from 'axios';
import { GET, PUT, DELETE } from '@/app/api/organization_name/[id]/route';
import { NextResponse } from 'next/server';
import { createMockNextRequest, setupApiTest } from '../helpers/apiTestHelpers';
const mockAxiosGet = axios.get as jest.Mock;
const mockAxiosPut = axios.put as jest.Mock;
const mockAxiosDelete = axios.delete as jest.Mock;
const params = { params: Promise.resolve({ id: '42' }) };
describe('/api/organization_name/[id]', () => {
  beforeEach(() => setupApiTest());
  it('GET returns name', async () => {
    mockAxiosGet.mockResolvedValue({ data: { id: 42, name: 'Test' } });
    await GET(
      createMockNextRequest('https://localhost:3000/api/organization_name/42', {
        headers: { authorization: 'Token t' },
      }),
      params
    );
    expect(NextResponse.json).toHaveBeenCalledWith({ id: 42, name: 'Test' });
  });
  it('PUT updates name', async () => {
    mockAxiosPut.mockResolvedValue({ data: { id: 42 } });
    await PUT(
      createMockNextRequest('https://localhost:3000/api/organization_name/42', {
        headers: { authorization: 'Token t' },
        body: { name: 'Updated' },
      }),
      params
    );
    expect(NextResponse.json).toHaveBeenCalledWith({ id: 42 });
  });
  it('DELETE deletes name', async () => {
    mockAxiosDelete.mockResolvedValue({});
    await DELETE(
      createMockNextRequest('https://localhost:3000/api/organization_name/42', {
        headers: { authorization: 'Token t' },
      }),
      params
    );
    expect(NextResponse.json).toHaveBeenCalledWith(
      { success: true },
      expect.objectContaining({ status: 200 })
    );
  });
  it('GET returns error on failure', async () => {
    mockAxiosGet.mockRejectedValue({ message: 'fail', response: { status: 404 } });
    await GET(
      createMockNextRequest('https://localhost:3000/api/organization_name/42', {
        headers: { authorization: 'Token t' },
      }),
      params
    );
    expect(NextResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({ error: expect.stringContaining('Failed') }),
      expect.objectContaining({ status: 404 })
    );
  });
});
