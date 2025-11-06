import axios from 'axios';
import { RecommendationsResponse } from '@/types/recommendation';

export const recommendationService = {
  async getRecommendations(token: string): Promise<RecommendationsResponse> {
    try {
      const response = await axios.get('/api/recommendation/', {
        headers: {
          Authorization: `Token ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching recommendations:', error);
      throw error;
    }
  },
};
