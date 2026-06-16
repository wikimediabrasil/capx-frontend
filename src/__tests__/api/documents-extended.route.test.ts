jest.mock('axios');

import axios from 'axios';
import { GET, POST } from '@/app/api/documents/route';
import { NextResponse } from 'next/server';
import { createMockNextRequest, setupApiTest } from '../helpers/apiTestHelpers';

const mockAxiosGet = axios.get as jest.Mock;
const mockAxiosPost = axios.post as jest.Mock;

describe('/api/documents - extended', () => {
  beforeEach(() => setupApiTest());

  describe('GET', () => {
    it('passes limit and offset params', async () => {
      mockAxiosGet.mockResolvedValue({ data: { results: [] } });
      await GET(
        createMockNextRequest('https://localhost:3000/api/documents', {
          url: 'https://localhost:3000/api/documents?limit=5&offset=10',
          headers: { authorization: 'Token test' },
        })
      );
      expect(mockAxiosGet).toHaveBeenCalledWith(
        'https://test-api.com/document/',
        expect.objectContaining({
          params: expect.objectContaining({ limit: '5', offset: '10' }),
        })
      );
    });

    it('returns error on backend failure', async () => {
      mockAxiosGet.mockRejectedValue({
        response: { status: 503, data: 'Service unavailable' },
      });
      await GET(
        createMockNextRequest('https://localhost:3000/api/documents', {
          headers: { authorization: 'Token test' },
        })
      );
      expect(NextResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({ error: 'Failed to fetch documents' }),
        expect.objectContaining({ status: 503 })
      );
    });
  });

  describe('POST', () => {
    it('returns 400 for invalid creator', async () => {
      await POST(
        createMockNextRequest('https://localhost:3000/api/documents', {
          headers: { authorization: 'Token test' },
          body: { url: 'https://example.com', creator: -1 },
        })
      );
      expect(NextResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({ error: 'Invalid creator ID' }),
        expect.objectContaining({ status: 400 })
      );
    });

    it('returns 500 when BASE_URL not configured', async () => {
      delete process.env.BASE_URL;
      await POST(
        createMockNextRequest('https://localhost:3000/api/documents', {
          headers: { authorization: 'Token test' },
          body: { url: 'https://example.com' },
        })
      );
      expect(NextResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({ error: 'Backend URL not configured' }),
        expect.objectContaining({ status: 500 })
      );
    });

    it('returns error on axios failure', async () => {
      mockAxiosPost.mockRejectedValue({
        message: 'Network Error',
        response: { status: 502, data: { detail: 'Bad gateway' } },
        isAxiosError: true,
      });
      await POST(
        createMockNextRequest('https://localhost:3000/api/documents', {
          headers: { authorization: 'Token test' },
          body: { url: 'https://example.com' },
        })
      );
      expect(NextResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({ error: 'Failed to create document' }),
        expect.objectContaining({ status: 502 })
      );
    });
  });
});
