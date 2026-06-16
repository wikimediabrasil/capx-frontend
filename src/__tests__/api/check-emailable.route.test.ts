jest.mock('axios');
jest.mock('@/constants/wikimedia', () => ({ WIKIMEDIA_USER_AGENT: 'TestAgent/1.0' }));

import axios from 'axios';
import { POST, OPTIONS } from '@/app/api/messages/check_emailable/route';
import { NextResponse } from 'next/server';
import { createMockNextRequest, setupApiTest } from '../helpers/apiTestHelpers';

const mockAxiosGet = axios.get as jest.Mock;

describe('/api/messages/check_emailable', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST', () => {
    it('returns 400 without receiver', async () => {
      await POST(
        createMockNextRequest('https://localhost:3000/api/messages/check_emailable', { body: {} })
      );
      expect(NextResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({ error: 'Receiver username is required' }),
        expect.objectContaining({ status: 400 })
      );
    });

    it('checks receiver only when no sender', async () => {
      mockAxiosGet.mockResolvedValue({
        data: {
          query: {
            users: [{ name: 'receiver_user', emailable: true }],
          },
        },
      });
      await POST(
        createMockNextRequest('https://localhost:3000/api/messages/check_emailable', {
          body: { receiver: 'receiver_user' },
        })
      );
      expect(NextResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          sender_emailable: true,
          receiver_emailable: true,
          receiver_exists: true,
          can_send_email: true,
        })
      );
    });

    it('checks both sender and receiver', async () => {
      mockAxiosGet.mockResolvedValue({
        data: {
          query: {
            users: [
              { name: 'sender_user', emailable: true },
              { name: 'receiver_user', emailable: false },
            ],
          },
        },
      });
      await POST(
        createMockNextRequest('https://localhost:3000/api/messages/check_emailable', {
          body: { receiver: 'receiver_user', sender: 'sender_user' },
        })
      );
      expect(NextResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          sender_emailable: true,
          receiver_emailable: false,
          can_send_email: false,
        })
      );
    });

    it('handles missing receiver user', async () => {
      mockAxiosGet.mockResolvedValue({
        data: {
          query: {
            users: [{ name: 'receiver_user', missing: true }],
          },
        },
      });
      await POST(
        createMockNextRequest('https://localhost:3000/api/messages/check_emailable', {
          body: { receiver: 'receiver_user' },
        })
      );
      expect(NextResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          receiver_exists: false,
          receiver_emailable: false,
        })
      );
    });

    it('returns 500 on error', async () => {
      mockAxiosGet.mockRejectedValue(new Error('Network error'));
      await POST(
        createMockNextRequest('https://localhost:3000/api/messages/check_emailable', {
          body: { receiver: 'user' },
        })
      );
      expect(NextResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({ error: 'Failed to check email availability' }),
        expect.objectContaining({ status: 500 })
      );
    });
  });
});
