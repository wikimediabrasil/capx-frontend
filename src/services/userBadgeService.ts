import axios from 'axios';
import { UserBadge, UserBadgeResponse } from '@/types/badge';

interface UpdateUserBadgeParams {
  id: number;
  is_displayed: boolean;
}

export class UserBadgeService {
  static async getUserBadges(token?: string): Promise<UserBadgeResponse> {
    try {
      const response = await axios.get('/api/user_badge', {
        headers: {
          Authorization: `Token ${token}`,
          'Content-Type': 'application/json',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Failed to get user badges:', error);
      throw error;
    }
  }

  static async updateUserBadge(params: UpdateUserBadgeParams, token?: string): Promise<UserBadge> {
    try {
      const response = await axios.put('/api/user_badge', params, {
        headers: {
          Authorization: `Token ${token}`,
          'Content-Type': 'application/json',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Failed to update user badge:', error);
      throw error;
    }
  }
}
