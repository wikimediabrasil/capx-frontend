jest.mock('axios');

import axios from 'axios';
import { GET, POST, OPTIONS } from '@/app/api/report/route';
import { NextResponse } from 'next/server';
import { createAuthenticatedRequest, setupApiTest } from '../helpers/apiTestHelpers';

const mockAxiosGet = axios.get as jest.Mock;
const mockAxiosPost = axios.post as jest.Mock;
const mockAxiosOptions = axios.options as jest.Mock;

describe('/api/report', () => {
  beforeEach(() => setupApiTest());

  describe('GET', () => {
    it('returns reports', async () => {
      mockAxiosGet.mockResolvedValue({ data: { results: [{ id: 1 }] } });
      await GET(createAuthenticatedRequest('/api/report'));
      expect(NextResponse.json).toHaveBeenCalledWith([{ id: 1 }]);
    });

    it('returns error on failure', async () => {
      mockAxiosGet.mockRejectedValue({ response: { status: 500 } });
      await GET(createAuthenticatedRequest('/api/report'));
      expect(NextResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({ error: 'Failed to fetch report' }),
        expect.objectContaining({ status: 500 })
      );
    });
  });

  describe('POST', () => {
    it('creates a report', async () => {
      mockAxiosPost.mockResolvedValue({ data: { id: 1 } });
      await POST(createAuthenticatedRequest('/api/report', { body: { title: 'Bug' } }));
      expect(NextResponse.json).toHaveBeenCalledWith({ id: 1 });
    });
  });

  describe('OPTIONS', () => {
    it('returns form fields', async () => {
      mockAxiosOptions.mockResolvedValue({ data: { actions: { PUT: { user: {}, title: {} } } } });
      await OPTIONS(
        createAuthenticatedRequest('/api/report', {
          url: 'https://localhost:3000/api/report?reportId=1',
        })
      );
      expect(NextResponse.json).toHaveBeenCalledWith({ title: {} });
    });
  });
});
