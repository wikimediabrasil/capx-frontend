jest.mock('axios');

import axios from 'axios';
import { GET, POST } from '@/app/api/projects/route';
import { NextResponse } from 'next/server';
import { createMockNextRequest, setupApiTest } from '../helpers/apiTestHelpers';

const mockAxiosGet = axios.get as jest.Mock;
const mockAxiosPost = axios.post as jest.Mock;

describe('/api/projects', () => {
  beforeEach(() => setupApiTest());

  describe('GET', () => {
    it('returns projects', async () => {
      mockAxiosGet.mockResolvedValue({ data: { results: [{ id: 1 }] } });
      await GET(createMockNextRequest('https://localhost:3000/api/projects', { headers: { authorization: 'Token test' } }));
      expect(NextResponse.json).toHaveBeenCalledWith([{ id: 1 }]);
    });

    it('returns error on failure', async () => {
      mockAxiosGet.mockRejectedValue({ message: 'fail' });
      await GET(createMockNextRequest('https://localhost:3000/api/projects', { headers: { authorization: 'Token test' } }));
      expect(NextResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({ error: 'Failed to fetch projects' }),
        expect.objectContaining({ status: 500 })
      );
    });
  });

  describe('POST', () => {
    it('creates a project', async () => {
      mockAxiosPost.mockResolvedValue({ data: { id: 1, display_name: 'New' } });
      await POST(
        createMockNextRequest('https://localhost:3000/api/projects', { headers: { authorization: 'Token test' }, body: { display_name: 'New' } })
      );
      expect(NextResponse.json).toHaveBeenCalledWith({ id: 1, display_name: 'New' });
    });

    it('returns error for invalid response', async () => {
      mockAxiosPost.mockResolvedValue({ data: {} });
      await POST(
        createMockNextRequest('https://localhost:3000/api/projects', { headers: { authorization: 'Token test' }, body: { display_name: 'Bad' } })
      );
      expect(NextResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({ status: 500 }),
        expect.objectContaining({ status: 500 })
      );
    });
  });
});
