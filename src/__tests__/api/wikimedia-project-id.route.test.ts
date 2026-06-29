jest.mock('axios');
import axios from 'axios';
import { GET } from '@/app/api/wikimedia_project/[id]/route';
import { NextResponse } from 'next/server';
import { createMockNextRequest, setupApiTest } from '../helpers/apiTestHelpers';
const mockAxiosGet = axios.get as jest.Mock;
describe('GET /api/wikimedia_project/[id]', () => {
  beforeEach(() => setupApiTest());
  it('returns project by id', async () => {
    mockAxiosGet.mockResolvedValue({ data: { id: 1, name: 'Wikipedia' } });
    await GET(
      createMockNextRequest('https://localhost:3000/api/wikimedia_project', {
        headers: { authorization: 'Token t' },
      }),
      {
        params: Promise.resolve({ id: '1' }),
      }
    );
    expect(NextResponse.json).toHaveBeenCalledWith({ id: 1, name: 'Wikipedia' });
  });
  it('returns 500 on error', async () => {
    mockAxiosGet.mockRejectedValue(new Error('fail'));
    await GET(
      createMockNextRequest('https://localhost:3000/api/wikimedia_project', {
        headers: { authorization: 'Token t' },
      }),
      {
        params: Promise.resolve({ id: '1' }),
      }
    );
    expect(NextResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({ error: 'Failed to fetch projects' }),
      expect.objectContaining({ status: 500 })
    );
  });
});
