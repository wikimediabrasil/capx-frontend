jest.mock('axios');

import axios from 'axios';
import { GET } from '@/app/api/statistics/route';
import { NextResponse } from 'next/server';

const mockAxiosGet = axios.get as jest.Mock;

describe('GET /api/statistics', () => {
  beforeEach(() => jest.clearAllMocks());

  it('returns statistics data on success', async () => {
    const mockData = { total_users: 100, active_users: 50 };
    mockAxiosGet.mockResolvedValue({ data: mockData });

    await GET();

    expect(mockAxiosGet).toHaveBeenCalledWith(
      expect.stringContaining('capx-backend.toolforge.org/statistics/'),
      expect.any(Object)
    );
    expect(NextResponse.json).toHaveBeenCalledWith(mockData, expect.any(Object));
  });

  it('returns fallback data with error on failure', async () => {
    mockAxiosGet.mockRejectedValue(new Error('Network error'));

    await GET();

    expect(NextResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({ total_users: 0, error: 'Failed to fetch statistics' }),
      expect.objectContaining({ status: 500 })
    );
  });
});
