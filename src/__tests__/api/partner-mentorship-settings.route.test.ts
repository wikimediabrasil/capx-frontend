jest.mock('axios');
import axios from 'axios';
import { GET } from '@/app/api/partner_mentorship_settings/route';
import { NextResponse } from 'next/server';

const mockAxiosGet = axios.get as jest.Mock;

describe('GET /api/partner_mentorship_settings', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.BASE_URL = 'https://test-api.com';
  });

  it('returns settings (array format)', async () => {
    mockAxiosGet.mockResolvedValue({ data: [{ id: 1, organization: null }] });
    await GET();
    expect(NextResponse.json).toHaveBeenCalledWith([{ id: 1, organization: null }]);
  });

  it('returns settings (paginated format)', async () => {
    mockAxiosGet.mockResolvedValue({
      data: { results: [{ id: 1, organization: null }], count: 1 },
    });
    await GET();
    expect(NextResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({ results: expect.any(Array) })
    );
  });

  it('enriches with organization data when missing', async () => {
    mockAxiosGet
      .mockResolvedValueOnce({ data: [{ id: 1, organization: 5 }] })
      .mockResolvedValueOnce({ data: { profile_image: 'img.png', display_name: 'Org Name' } });
    await GET();
    expect(NextResponse.json).toHaveBeenCalledWith([
      expect.objectContaining({ profile_image: 'img.png', name: 'Org Name' }),
    ]);
  });

  it('returns error on failure', async () => {
    mockAxiosGet.mockRejectedValue({ message: 'fail', response: { status: 500 } });
    await GET();
    expect(NextResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({ error: expect.stringContaining('Failed') }),
      expect.objectContaining({ status: 500 })
    );
  });
});
