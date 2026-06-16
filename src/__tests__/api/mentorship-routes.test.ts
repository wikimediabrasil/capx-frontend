jest.mock('axios');
import axios from 'axios';
import { NextResponse } from 'next/server';

const mockAxiosGet = axios.get as jest.Mock;

describe('Mentorship API routes', () => {
  beforeEach(() => { jest.clearAllMocks(); process.env.BASE_URL = 'https://test-api.com'; });

  describe('GET /api/mentorship_form_mentor', () => {
    it('returns mentor forms', async () => {
      const { GET } = require('@/app/api/mentorship_form_mentor/route');
      mockAxiosGet.mockResolvedValue({ data: [{ id: 1 }] });
      await GET();
      expect(NextResponse.json).toHaveBeenCalledWith([{ id: 1 }]);
    });

    it('returns error on failure', async () => {
      const { GET } = require('@/app/api/mentorship_form_mentor/route');
      mockAxiosGet.mockRejectedValue({ message: 'fail', response: { status: 500 } });
      await GET();
      expect(NextResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({ error: expect.stringContaining('Failed') }),
        expect.objectContaining({ status: 500 })
      );
    });
  });

  describe('GET /api/mentorship_form_mentee', () => {
    it('returns mentee forms', async () => {
      const { GET } = require('@/app/api/mentorship_form_mentee/route');
      mockAxiosGet.mockResolvedValue({ data: [{ id: 1 }] });
      await GET();
      expect(NextResponse.json).toHaveBeenCalledWith([{ id: 1 }]);
    });

    it('returns error on failure', async () => {
      const { GET } = require('@/app/api/mentorship_form_mentee/route');
      mockAxiosGet.mockRejectedValue({ message: 'fail', response: { status: 500 } });
      await GET();
      expect(NextResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({ error: expect.stringContaining('Failed') }),
        expect.objectContaining({ status: 500 })
      );
    });
  });

  describe('GET /api/mentorship_availability', () => {
    it('returns availability', async () => {
      const { GET } = require('@/app/api/mentorship_availability/route');
      mockAxiosGet.mockResolvedValue({ data: [{ id: 1 }] });
      await GET();
      expect(NextResponse.json).toHaveBeenCalledWith([{ id: 1 }]);
    });

    it('returns error on failure', async () => {
      const { GET } = require('@/app/api/mentorship_availability/route');
      mockAxiosGet.mockRejectedValue({ message: 'fail', response: { status: 500 } });
      await GET();
      expect(NextResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({ error: expect.stringContaining('Failed') }),
        expect.objectContaining({ status: 500 })
      );
    });
  });
});
