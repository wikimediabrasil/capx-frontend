jest.mock('axios');

import axios from 'axios';
import { GET, PUT } from '@/app/api/user_badge/route';
import { NextResponse } from 'next/server';
import { createAuthenticatedRequest, setupApiTest } from '../helpers/apiTestHelpers';

const mockAxiosGet = axios.get as jest.Mock;
const mockAxiosPut = axios.put as jest.Mock;

describe('/api/user_badge', () => {
  beforeEach(() => setupApiTest());

  describe('GET', () => {
    it('returns user badges', async () => {
      mockAxiosGet.mockResolvedValue({ data: [{ id: 1 }] });
      await GET(createAuthenticatedRequest('/api/user_badge'));
      expect(NextResponse.json).toHaveBeenCalledWith([{ id: 1 }]);
    });

    it('returns error on failure', async () => {
      mockAxiosGet.mockRejectedValue({ response: { status: 500 } });
      await GET(createAuthenticatedRequest('/api/user_badge'));
      expect(NextResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({ error: 'Failed to fetch user badges' }),
        expect.objectContaining({ status: 500 })
      );
    });
  });

  describe('PUT', () => {
    it('updates user badge', async () => {
      mockAxiosPut.mockResolvedValue({ data: { id: 1, badge: 'updated' } });
      await PUT(
        createAuthenticatedRequest('/api/user_badge', {
          body: { id: 1, badge: 'updated' },
        })
      );
      expect(NextResponse.json).toHaveBeenCalledWith({ id: 1, badge: 'updated' });
    });
  });
});
