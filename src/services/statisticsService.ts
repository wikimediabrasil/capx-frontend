import { Statistics } from '@/types/statistics';
import axios, { AxiosRequestConfig } from 'axios';

/**
 * Service to get platform statistics
 */
export const statisticsService = {
  fetchStatistics: async (config?: AxiosRequestConfig): Promise<Statistics> => {
    try {
      const response = await axios.get('/api/statistics', config);
      return response.data;
    } catch (error) {
      console.error('Error fetching statistics:', error);
      // Return empty data in case of error
      return {
        total_users: 0,
        new_users: 0,
        total_capacities: 0,
        new_capacities: 0,
        total_messages: 0,
        new_messages: 0,
        total_organizations: 0,
        new_organizations: 0,
      };
    }
  },
};
