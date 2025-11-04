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

export class MessageService {
  /**
   * Checks if a user has an email address linked to their account
   * @param username - The username to check
   * @param token - Authentication token
   * @returns Object with hasEmail boolean and optional email/username
   */
  static async checkUserHasEmail(username: string, token: string): Promise<UserEmailCheckResult> {
    try {
      const response = await axios.get('/api/users', {
        params: {
          username: username,
        },
        headers: {
          Authorization: `Token ${token}`,
          'Content-Type': 'application/json',
        },
      });

      // API returns paginated results
      const users = response.data?.results || response.data;

      if (!users || users.length === 0) {
        throw new Error('User not found');
      }

      const user = users[0];
      const hasEmail = Boolean(user.user?.email || user.email);

      return {
        hasEmail,
        email: user.user?.email || user.email,
        username: user.user?.username || user.username,
      };
    } catch (error) {
      console.error('Failed to check user email:', error);
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
