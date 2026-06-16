jest.mock('axios');

import axios from 'axios';
import { GET } from '@/app/api/partners/route';
import { NextResponse } from 'next/server';

const mockAxiosGet = axios.get as jest.Mock;

describe('GET /api/partners', () => {
  beforeEach(() => { jest.clearAllMocks(); process.env.BASE_URL = 'https://test-api.com'; });

  it('returns partners', async () => {
    mockAxiosGet.mockResolvedValue({ data: [{ id: 1 }] });
    await GET();
    expect(NextResponse.json).toHaveBeenCalledWith([{ id: 1 }]);
  });

  it('returns error on failure', async () => {
    mockAxiosGet.mockRejectedValue({ message: 'fail', response: { status: 500 } });
    await GET();
    expect(NextResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({ error: 'Failed to fetch partners' }),
      expect.objectContaining({ status: 500 })
    );
  });
});
