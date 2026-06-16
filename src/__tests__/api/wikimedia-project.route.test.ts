jest.mock('axios');
import axios from 'axios';
import { GET } from '@/app/api/wikimedia_project/route';
import { NextResponse } from 'next/server';
import { createMockNextRequest, setupApiTest } from '../helpers/apiTestHelpers';
const mockAxiosGet = axios.get as jest.Mock;
describe('GET /api/wikimedia_project', () => {
  beforeEach(() => setupApiTest());
  it('returns projects', async () => {
    mockAxiosGet.mockResolvedValue({ data: { results: [{ id: 1 }] } });
    await GET(
      createMockNextRequest('https://localhost:3000/api/wikimedia_project', {
        headers: { authorization: 'Token t' },
      })
    );
    expect(NextResponse.json).toHaveBeenCalledWith([{ id: 1 }]);
  });
  it('returns 500 on error', async () => {
    mockAxiosGet.mockRejectedValue(new Error('fail'));
    await GET(
      createMockNextRequest('https://localhost:3000/api/wikimedia_project', {
        headers: { authorization: 'Token t' },
      })
    );
    expect(NextResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({ error: 'Failed to fetch projects' }),
      expect.objectContaining({ status: 500 })
    );
  });
});
