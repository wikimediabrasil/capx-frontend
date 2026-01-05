import { MessageService } from '@/services/messageService';
import axios from 'axios';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('MessageService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('checkEmailable', () => {
    it('should call API with receiver only', async () => {
      const mockResponse = {
        data: {
          sender_emailable: true,
          receiver_emailable: true,
          can_send_email: true,
        },
      };

      mockedAxios.post.mockResolvedValueOnce(mockResponse);

      const result = await MessageService.checkEmailable('TestReceiver', 'test-token');

      expect(mockedAxios.post).toHaveBeenCalledWith(
        '/api/messages/check_emailable',
        { receiver: 'TestReceiver', sender: undefined },
        {
          headers: {
            Authorization: 'Token test-token',
            'Content-Type': 'application/json',
          },
        }
      );

      expect(result).toEqual(mockResponse.data);
    });

    it('should call API with both sender and receiver', async () => {
      const mockResponse = {
        data: {
          sender_emailable: true,
          receiver_emailable: true,
          can_send_email: true,
        },
      };

      mockedAxios.post.mockResolvedValueOnce(mockResponse);

      const result = await MessageService.checkEmailable(
        'TestReceiver',
        'test-token',
        'TestSender'
      );

      expect(mockedAxios.post).toHaveBeenCalledWith(
        '/api/messages/check_emailable',
        { receiver: 'TestReceiver', sender: 'TestSender' },
        {
          headers: {
            Authorization: 'Token test-token',
            'Content-Type': 'application/json',
          },
        }
      );

      expect(result).toEqual(mockResponse.data);
    });

    it('should return false when email is not available', async () => {
      const mockResponse = {
        data: {
          sender_emailable: false,
          receiver_emailable: true,
          can_send_email: false,
        },
      };

      mockedAxios.post.mockResolvedValueOnce(mockResponse);

      const result = await MessageService.checkEmailable(
        'TestReceiver',
        'test-token',
        'TestSender'
      );

      expect(result.can_send_email).toBe(false);
      expect(result.sender_emailable).toBe(false);
      expect(result.receiver_emailable).toBe(true);
    });

    it('should throw error when API call fails', async () => {
      const mockError = new Error('Network error');
      mockedAxios.post.mockRejectedValueOnce(mockError);

      await expect(MessageService.checkEmailable('TestReceiver', 'test-token')).rejects.toThrow(
        'Network error'
      );

      expect(mockedAxios.post).toHaveBeenCalledTimes(1);
    });

    it('should handle 401 authentication error', async () => {
      const mockError = {
        response: {
          status: 401,
          data: { error: 'Unauthorized' },
        },
      };

      mockedAxios.post.mockRejectedValueOnce(mockError);

      await expect(MessageService.checkEmailable('TestReceiver', 'invalid-token')).rejects.toEqual(
        mockError
      );
    });
  });

  describe('checkReceiverEmailable', () => {
    it('should return true when receiver can receive emails', async () => {
      const mockResponse = {
        data: {
          sender_emailable: true,
          receiver_emailable: true,
          can_send_email: true,
        },
      };

      mockedAxios.post.mockResolvedValueOnce(mockResponse);

      const result = await MessageService.checkReceiverEmailable('TestReceiver', 'test-token');

      expect(result).toBe(true);
    });

    it('should return false when receiver cannot receive emails', async () => {
      const mockResponse = {
        data: {
          sender_emailable: true,
          receiver_emailable: false,
          can_send_email: false,
        },
      };

      mockedAxios.post.mockResolvedValueOnce(mockResponse);

      const result = await MessageService.checkReceiverEmailable('TestReceiver', 'test-token');

      expect(result).toBe(false);
    });

    it('should return false when API call fails', async () => {
      mockedAxios.post.mockRejectedValueOnce(new Error('Network error'));

      const result = await MessageService.checkReceiverEmailable('TestReceiver', 'test-token');

      expect(result).toBe(false);
    });
  });

  describe('sendMessage', () => {
    it('should send message with all required fields', async () => {
      const mockMessage = {
        receiver: 'TestReceiver',
        subject: 'Test Subject',
        message: 'Test message content',
        method: 'email',
      };

      const mockResponse = {
        data: {
          id: '123',
          ...mockMessage,
        },
      };

      mockedAxios.post.mockResolvedValueOnce(mockResponse);

      const result = await MessageService.sendMessage({
        message: mockMessage,
        token: 'test-token',
      });

      expect(mockedAxios.post).toHaveBeenCalledWith(
        '/api/messages',
        {
          receiver: mockMessage.receiver,
          subject: mockMessage.subject,
          message: mockMessage.message,
          method: mockMessage.method,
        },
        {
          headers: {
            Authorization: 'Token test-token',
            'Content-Type': 'application/json',
          },
        }
      );

      expect(result).toEqual(mockResponse.data);
    });

    it('should throw error when sending fails', async () => {
      const mockMessage = {
        receiver: 'TestReceiver',
        subject: 'Test Subject',
        message: 'Test message content',
        method: 'email',
      };

      mockedAxios.post.mockRejectedValueOnce(new Error('Failed to send'));

      await expect(
        MessageService.sendMessage({
          message: mockMessage,
          token: 'test-token',
        })
      ).rejects.toThrow('Failed to send');
    });
  });

  describe('getMessages', () => {
    it('should fetch messages with token', async () => {
      const mockMessages = [
        {
          id: '1',
          receiver: 'User1',
          subject: 'Subject 1',
          message: 'Message 1',
        },
        {
          id: '2',
          receiver: 'User2',
          subject: 'Subject 2',
          message: 'Message 2',
        },
      ];

      mockedAxios.get.mockResolvedValueOnce({ data: mockMessages });

      const result = await MessageService.getMessages('test-token');

      expect(mockedAxios.get).toHaveBeenCalledWith('/api/messages', {
        headers: {
          Authorization: 'Token test-token',
          'Content-Type': 'application/json',
        },
      });

      expect(result).toEqual(mockMessages);
    });

    it('should throw error when fetching fails', async () => {
      mockedAxios.get.mockRejectedValueOnce(new Error('Failed to fetch'));

      await expect(MessageService.getMessages('test-token')).rejects.toThrow('Failed to fetch');
    });
  });
});
