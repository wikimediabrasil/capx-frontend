jest.mock('axios');
jest.mock('@/constants/wikimedia', () => ({ WIKIMEDIA_USER_AGENT: 'TestAgent/1.0' }));

import axios from 'axios';
import { GET } from '@/app/api/profile_image/route';
import { NextResponse } from 'next/server';

const mockAxiosGet = axios.get as jest.Mock;

function createRequest(url: string) {
  return { nextUrl: new URL(url) } as any;
}

describe('GET /api/profile_image', () => {
  beforeEach(() => jest.clearAllMocks());

  it('searches images by query', async () => {
    mockAxiosGet.mockResolvedValue({
      data: { query: { search: [{ title: 'File:Image.png' }] } },
    });
    await GET(createRequest('http://localhost:3000/api/profile_image?query=cat'));
    expect(NextResponse.json).toHaveBeenCalledWith(['File:Image.png']);
  });

  it('returns 404 when no images found', async () => {
    mockAxiosGet.mockResolvedValue({ data: {} });
    await GET(createRequest('http://localhost:3000/api/profile_image?query=xxx'));
    expect(NextResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'No images found' }),
      expect.objectContaining({ status: 404 })
    );
  });

  it('fetches image by title', async () => {
    mockAxiosGet.mockResolvedValue({
      request: { res: { responseUrl: 'https://example.com/image.png' } },
    });
    await GET(createRequest('http://localhost:3000/api/profile_image?title=File:Image.png'));
    expect(NextResponse.json).toHaveBeenCalledWith({ image: 'https://example.com/image.png' });
  });

  it('returns 400 for invalid query', async () => {
    await GET(createRequest('http://localhost:3000/api/profile_image'));
    expect(NextResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'Invalid query' }),
      expect.objectContaining({ status: 400 })
    );
  });
});
