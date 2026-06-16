jest.mock('axios');

import axios from 'axios';
import { GET, PUT } from '@/app/api/user_badge/route';
import { NextResponse } from 'next/server';
import { createMockNextRequest, setupApiTest } from '../helpers/apiTestHelpers';

const mockAxiosGet = axios.get as jest.Mock;
const mockAxiosPut = axios.put as jest.Mock;

describe('/api/user_badge', () => {
  beforeEach(() => setupApiTest());

  describe('GET', () => {
    it('returns user badges', async () => {
      mockAxiosGet.mockResolvedValue({ data: [{ id: 1 }] });
      const req = createMockNextRequest('https://localhost:3000/api/user_badge', { headers: { authorization: 'Token test' } });
      await GET(req);
      expect(NextResponse.json).toHaveBeenCalledWith([{ id: 1 }]);
    });

    it('returns error on failure', async () => {
      mockAxiosGet.mockRejectedValue({ response: { status: 500 } });
      const req = createMockNextRequest('https://localhost:3000/api/user_badge', { headers: { authorization: 'Token test' } });
      await GET(req);
      expect(NextResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({ error: 'Failed to fetch user badges' }),
        expect.objectContaining({ status: 500 })
      );
    });
  });

  describe('PUT', () => {
    it('updates user badge', async () => {
      mockAxiosPut.mockResolvedValue({ data: { id: 1, badge: 'updated' } });
      const req = createMockNextRequest('https://localhost:3000/api/user_badge', {
        headers: { authorization: 'Token test' },
        body: { id: 1, badge: 'updated' },
      });
      await PUT(req);
      expect(NextResponse.json).toHaveBeenCalledWith({ id: 1, badge: 'updated' });
    });
  });
});
