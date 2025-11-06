import { Message } from '@/types/message';
import axios from 'axios';

export interface MessageServiceParams {
  message: Partial<Message>;
  token: string;
}

export interface UserEmailCheckResult {
  hasEmail: boolean;
  email?: string;
  username?: string;
}

export interface EmailCheckResult {
  sender_emailable: boolean;
  receiver_emailable: boolean;
  can_send_email: boolean;
}

export class MessageService {
  /**
   * Checks if both sender and receiver can send/receive emails via MetaWiki.
   * This method uses the backend's check_emailable endpoint which validates
   * email capabilities through the MetaWiki API.
   *
   * @param receiver - The username of the message receiver
   * @param token - Authentication token
   * @returns Object with sender_emailable, receiver_emailable, and can_send_email flags
   */
  static async checkEmailable(receiver: string, token: string): Promise<EmailCheckResult> {
    try {
      const response = await axios.post(
        '/api/messages/check_emailable',
        { receiver },
        {
          headers: {
            Authorization: `Token ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error('Failed to check email availability:', error);
      throw error;
    }
  }

  static async sendMessage({ message, token }: MessageServiceParams): Promise<any> {
    try {
      const response = await axios.post(
        '/api/messages',
        {
          receiver: message.receiver,
          subject: message.subject,
          message: message.message,
          method: message.method,
        },
        {
          headers: {
            Authorization: `Token ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error('Failed to send message:', error);
      throw error;
    }
  }

  static async getMessages(token?: string): Promise<Message[]> {
    try {
      const response = await axios.get('/api/messages', {
        headers: {
          Authorization: `Token ${token}`,
          'Content-Type': 'application/json',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Failed to get messages:', error);
      throw error;
    }
  }
}
