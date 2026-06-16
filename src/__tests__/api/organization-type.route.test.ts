jest.mock('axios');
import axios from 'axios';
import { GET } from '@/app/api/organization_type/route';
import { NextResponse } from 'next/server';
import { createMockNextRequest, setupApiTest } from '../helpers/apiTestHelpers';
const mockAxiosGet = axios.get as jest.Mock;
describe('GET /api/organization_type', () => {
  beforeEach(() => setupApiTest());
  it('returns org types', async () => {
    mockAxiosGet.mockResolvedValue({ data: { results: [{ id: 1 }] } });
    await GET(
      createMockNextRequest('https://localhost:3000/api/organization_type', { headers: { authorization: 'Token t' } })
    );
    expect(NextResponse.json).toHaveBeenCalledWith([{ id: 1 }]);
  });
  it('returns 500 on error', async () => {
    mockAxiosGet.mockRejectedValue({ message: 'fail' });
    await GET(
      createMockNextRequest('https://localhost:3000/api/organization_type', { headers: { authorization: 'Token t' } })
    );
    expect(NextResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({ error: expect.stringContaining('Failed') }),
      expect.objectContaining({ status: 500 })
    );
  });
});
