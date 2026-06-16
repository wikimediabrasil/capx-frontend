jest.mock('axios');

import axios from 'axios';
import { GET, POST } from '@/app/api/messages/route';
import { NextResponse } from 'next/server';
import { createAuthenticatedRequest, setupApiTest } from '../helpers/apiTestHelpers';

const mockAxiosGet = axios.get as jest.Mock;
const mockAxiosPost = axios.post as jest.Mock;

describe('/api/messages', () => {
  beforeEach(() => setupApiTest());

  describe('GET', () => {
    it('returns messages', async () => {
      mockAxiosGet.mockResolvedValue({ data: { results: [{ id: 1 }] } });
      await GET(createAuthenticatedRequest('/api/messages'));
      expect(NextResponse.json).toHaveBeenCalledWith([{ id: 1 }]);
    });

    it('returns error on failure', async () => {
      mockAxiosGet.mockRejectedValue({ response: { status: 500 } });
      await GET(createAuthenticatedRequest('/api/messages'));
      expect(NextResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({ error: 'Failed to fetch message' }),
        expect.objectContaining({ status: 500 })
      );
    });
  });

  describe('POST', () => {
    it('creates a message', async () => {
      mockAxiosPost.mockResolvedValue({ data: { id: 1 } });
      await POST(createAuthenticatedRequest('/api/messages', { body: { content: 'Hello' } }));
      expect(NextResponse.json).toHaveBeenCalledWith({ id: 1 });
    });
  });
});
