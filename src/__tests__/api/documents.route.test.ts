jest.mock('axios');

import axios from 'axios';
import { GET, POST } from '@/app/api/documents/route';
import { NextResponse } from 'next/server';
import { createMockNextRequest, setupApiTest } from '../helpers/apiTestHelpers';

const mockAxiosGet = axios.get as jest.Mock;
const mockAxiosPost = axios.post as jest.Mock;

describe('/api/documents', () => {
  beforeEach(() => setupApiTest());

  describe('GET', () => {
    it('returns documents', async () => {
      mockAxiosGet.mockResolvedValue({ data: { results: [{ id: 1 }] } });
      await GET(createMockNextRequest('https://localhost:3000/api/documents', { headers: { Authorization: 'Token test' } }));
      expect(NextResponse.json).toHaveBeenCalledWith([{ id: 1 }]);
    });

    it('returns 401 without auth', async () => {
      await GET(createMockNextRequest('https://localhost:3000/api/documents', {}));
      expect(NextResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({ error: 'No authorization token provided' }),
        expect.objectContaining({ status: 401 })
      );
    });
  });

  describe('POST', () => {
    it('creates a document', async () => {
      mockAxiosPost.mockResolvedValue({ data: { id: 1 } });
      await POST(
        createMockNextRequest('https://localhost:3000/api/documents', {
          headers: { Authorization: 'Token test' },
          body: { url: 'https://example.com', organization: 1 },
        })
      );
      expect(NextResponse.json).toHaveBeenCalledWith({ id: 1 });
    });

    it('returns 401 without auth', async () => {
      await POST(createMockNextRequest('https://localhost:3000/api/documents', { body: { url: 'https://example.com' } }));
      expect(NextResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({ error: 'No authorization token provided' }),
        expect.objectContaining({ status: 401 })
      );
    });

    it('returns 400 for missing url', async () => {
      await POST(createMockNextRequest('https://localhost:3000/api/documents', { headers: { Authorization: 'Token test' }, body: {} }));
      expect(NextResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({ error: 'Invalid request body' }),
        expect.objectContaining({ status: 400 })
      );
    });

    it('returns 400 for invalid organization', async () => {
      await POST(
        createMockNextRequest('https://localhost:3000/api/documents', {
          headers: { Authorization: 'Token test' },
          body: { url: 'https://example.com', organization: -1 },
        })
      );
      expect(NextResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({ error: 'Invalid organization ID' }),
        expect.objectContaining({ status: 400 })
      );
    });
  });
});
