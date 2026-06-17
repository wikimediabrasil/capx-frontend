jest.mock('axios');

import axios from 'axios';
import { GET, POST, OPTIONS } from '@/app/api/messages/route';
import { NextResponse } from 'next/server';
import { createMockNextRequest, setupApiTest } from '../helpers/apiTestHelpers';

const mockAxiosGet = axios.get as jest.Mock;
const mockAxiosPost = axios.post as jest.Mock;
const mockAxiosOptions = axios.options as jest.Mock;

describe('/api/messages - extended', () => {
  beforeEach(() => setupApiTest());

  describe('GET', () => {
    it('fetches single message by messageId', async () => {
      mockAxiosGet.mockResolvedValue({ data: { results: { id: 1, content: 'Hello' } } });
      await GET(
        createMockNextRequest('https://localhost:3000/api/messages', {
          url: 'https://localhost:3000/api/messages?messageId=42',
          headers: { authorization: 'Token test' },
        })
      );
      expect(mockAxiosGet).toHaveBeenCalledWith(
        'https://test-api.com/messages/42',
        expect.anything()
      );
    });

    it('passes limit and offset params', async () => {
      mockAxiosGet.mockResolvedValue({ data: { results: [] } });
      await GET(
        createMockNextRequest('https://localhost:3000/api/messages', {
          url: 'https://localhost:3000/api/messages?limit=10&offset=20',
          headers: { authorization: 'Token test' },
        })
      );
      expect(mockAxiosGet).toHaveBeenCalledWith(
        'https://test-api.com/messages',
        expect.objectContaining({
          params: expect.objectContaining({ limit: '10', offset: '20' }),
        })
      );
    });
  });

  describe('POST', () => {
    it('returns error on failure', async () => {
      mockAxiosPost.mockRejectedValue({ response: { status: 400 } });
      await POST(
        createMockNextRequest('https://localhost:3000/api/messages', {
          headers: { authorization: 'Token test' },
          body: { content: 'Hello' },
        })
      );
      expect(NextResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({ error: 'Failed to create message' }),
        expect.objectContaining({ status: 400 })
      );
    });
  });

  describe('OPTIONS', () => {
    it('returns form fields without user key', async () => {
      mockAxiosOptions.mockResolvedValue({
        data: {
          actions: {
            PUT: {
              user: { type: 'field' },
              content: { type: 'string' },
              subject: { type: 'string' },
            },
          },
        },
      });
      await OPTIONS(
        createMockNextRequest('https://localhost:3000/api/messages', {
          url: 'https://localhost:3000/api/messages?messageId=42',
          headers: { authorization: 'Token test' },
        })
      );
      expect(NextResponse.json).toHaveBeenCalledWith({
        content: { type: 'string' },
        subject: { type: 'string' },
      });
    });

    it('returns error on failure', async () => {
      mockAxiosOptions.mockRejectedValue({ response: { status: 500 } });
      await OPTIONS(
        createMockNextRequest('https://localhost:3000/api/messages', {
          url: 'https://localhost:3000/api/messages?messageId=42',
          headers: { authorization: 'Token test' },
        })
      );
      expect(NextResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({ error: 'Failed to fetch form fields' }),
        expect.objectContaining({ status: 500 })
      );
    });
  });
});
