jest.mock('axios');
jest.mock('@/constants/wikimedia', () => ({ WIKIMEDIA_USER_AGENT: 'TestAgent/1.0' }));

import axios from 'axios';
import { GET } from '@/app/api/profile_image/route';
import { NextResponse } from 'next/server';
import { createMockNextRequest } from '../helpers/apiTestHelpers';

const mockAxiosGet = axios.get as jest.Mock;

describe('GET /api/profile_image - extended', () => {
  beforeEach(() => jest.clearAllMocks());

  it('returns 500 on query search error', async () => {
    mockAxiosGet.mockRejectedValue(new Error('Network error'));
    await GET(
      createMockNextRequest('https://localhost:3000/api/profile_image', {
        url: 'https://localhost:3000/api/profile_image?query=cat',
      })
    );
    expect(NextResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({ error: 'Failed to fetch images' }),
      expect.objectContaining({ status: 500 })
    );
  });

  it('returns 500 on title fetch error', async () => {
    mockAxiosGet.mockRejectedValue(new Error('Network error'));
    await GET(
      createMockNextRequest('https://localhost:3000/api/profile_image', {
        url: 'https://localhost:3000/api/profile_image?title=File:Test.png',
      })
    );
    expect(NextResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({ error: 'Failed to fetch image' }),
      expect.objectContaining({ status: 500 })
    );
  });

  it('uses thumb suffix when thumb param present', async () => {
    mockAxiosGet.mockResolvedValue({
      request: { res: { responseUrl: 'https://example.com/thumb.png' } },
    });
    await GET(
      createMockNextRequest('https://localhost:3000/api/profile_image', {
        url: 'https://localhost:3000/api/profile_image?title=File:Test.png&thumb=true',
      })
    );
    expect(mockAxiosGet).toHaveBeenCalledWith(
      expect.stringContaining('width=100&height=50'),
      expect.anything()
    );
  });
});
