import { POST } from '@/app/api/messages/check_emailable/route';
import { NextRequest } from 'next/server';
import axios from 'axios';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

// Helper to create a mock NextRequest
const createMockRequest = (body: any) => {
  const request = {
    json: jest.fn().mockResolvedValue(body),
  } as unknown as NextRequest;
  return request;
};

// Helper to create mock MediaWiki API response
const createMockApiResponse = (users: Array<{ name: string; emailable?: boolean }>) => ({
  data: {
    query: { users },
  },
});

// Helper to test email check scenarios
const testEmailCheck = async (
  requestBody: { sender?: string; receiver: string },
  mockUsers: Array<{ name: string; emailable?: boolean }>,
  expectedResult: {
    sender_emailable: boolean;
    receiver_emailable: boolean;
    can_send_email: boolean;
  }
) => {
  mockedAxios.get.mockResolvedValueOnce(createMockApiResponse(mockUsers));
  const request = createMockRequest(requestBody);
  const response = await POST(request);
  const data = await response.json();
  expect(data).toEqual(expectedResult);
  return { response, data };
};

describe('check_emailable API route', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST handler', () => {
    it('should return error when receiver is not provided', async () => {
      const request = createMockRequest({});
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Receiver username is required');
    });

    it('should check only receiver when sender is not provided', async () => {
      const { response } = await testEmailCheck(
        { receiver: 'TestReceiver' },
        [{ name: 'TestReceiver', emailable: true }],
        { sender_emailable: true, receiver_emailable: true, can_send_email: true }
      );

      expect(response.status).toBe(200);
      expect(mockedAxios.get).toHaveBeenCalledWith(
        'https://meta.wikimedia.org/w/api.php',
        expect.objectContaining({
          params: expect.objectContaining({ ususers: 'TestReceiver' }),
        })
      );
    });

    it('should check both sender and receiver when both are provided', async () => {
      const { response } = await testEmailCheck(
        { sender: 'TestSender', receiver: 'TestReceiver' },
        [
          { name: 'TestSender', emailable: true },
          { name: 'TestReceiver', emailable: true },
        ],
        { sender_emailable: true, receiver_emailable: true, can_send_email: true }
      );

      expect(response.status).toBe(200);
      expect(mockedAxios.get).toHaveBeenCalledWith(
        'https://meta.wikimedia.org/w/api.php',
        expect.objectContaining({
          params: expect.objectContaining({ ususers: 'TestSender|TestReceiver' }),
        })
      );
    });

    it('should return false when sender does not have email', async () => {
      await testEmailCheck(
        { sender: 'TestSender', receiver: 'TestReceiver' },
        [
          { name: 'TestSender', emailable: false },
          { name: 'TestReceiver', emailable: true },
        ],
        { sender_emailable: false, receiver_emailable: true, can_send_email: false }
      );
    });

    it('should return false when receiver does not have email', async () => {
      await testEmailCheck(
        { sender: 'TestSender', receiver: 'TestReceiver' },
        [
          { name: 'TestSender', emailable: true },
          { name: 'TestReceiver', emailable: false },
        ],
        { sender_emailable: true, receiver_emailable: false, can_send_email: false }
      );
    });

    it('should return false when both do not have email', async () => {
      await testEmailCheck(
        { sender: 'TestSender', receiver: 'TestReceiver' },
        [
          { name: 'TestSender', emailable: false },
          { name: 'TestReceiver', emailable: false },
        ],
        { sender_emailable: false, receiver_emailable: false, can_send_email: false }
      );
    });

    it('should handle API errors gracefully', async () => {
      mockedAxios.get.mockRejectedValueOnce(new Error('Network error'));

      const request = createMockRequest({ receiver: 'TestReceiver' });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Failed to check email availability');
    });

    it('should include proper User-Agent header in MediaWiki API request', async () => {
      mockedAxios.get.mockResolvedValueOnce({
        data: {
          query: {
            users: [{ name: 'TestReceiver', emailable: true }],
          },
        },
      });

      const request = createMockRequest({ receiver: 'TestReceiver' });

      await POST(request);

      expect(mockedAxios.get).toHaveBeenCalledWith(
        'https://meta.wikimedia.org/w/api.php',
        expect.objectContaining({
          headers: expect.objectContaining({
            'User-Agent': 'CapX/1.0 (https://capx.toolforge.org/; contact@capx.org) axios/1.0',
          }),
        })
      );
    });

    it('should handle users with emailable property not set', async () => {
      await testEmailCheck(
        { receiver: 'TestReceiver' },
        [{ name: 'TestReceiver' }], // emailable property is missing
        { sender_emailable: true, receiver_emailable: false, can_send_email: false }
      );
    });
  });
});
