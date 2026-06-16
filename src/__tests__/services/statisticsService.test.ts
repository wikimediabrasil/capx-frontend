import axios from 'axios';
import { statisticsService } from '@/services/statisticsService';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

const defaultEmptyStats = {
  total_users: 0,
  new_users: 0,
  total_capacities: 0,
  new_capacities: 0,
  total_messages: 0,
  new_messages: 0,
  total_organizations: 0,
  new_organizations: 0,
  active_users: 0,
  users_with_territory: 0,
  users_with_language: 0,
  users_with_capacities: 0,
  territory_user_counts: {},
  language_user_counts: {},
  skill_known_user_counts: {},
  skill_available_user_counts: {},
  skill_wanted_user_counts: {},
};

describe('statisticsService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('fetchStatistics', () => {
    it('should GET /api/statistics', async () => {
      const mockStats = { ...defaultEmptyStats, total_users: 1500, new_users: 10 };
      mockedAxios.get.mockResolvedValueOnce({ data: mockStats });

      const result = await statisticsService.fetchStatistics();

      expect(mockedAxios.get).toHaveBeenCalledWith('/api/statistics', undefined);
      expect(result).toEqual(mockStats);
    });

    it('should pass optional config to axios.get', async () => {
      mockedAxios.get.mockResolvedValueOnce({ data: defaultEmptyStats });

      const config = { headers: { Authorization: 'Token my-token' } };
      await statisticsService.fetchStatistics(config);

      expect(mockedAxios.get).toHaveBeenCalledWith('/api/statistics', config);
    });

    it('should return full statistics data on success', async () => {
      const mockStats = {
        ...defaultEmptyStats,
        total_users: 5000,
        active_users: 1200,
        territory_user_counts: { NWE: 300, LAC: 200 },
        language_user_counts: { en: 4000, pt: 500 },
      };
      mockedAxios.get.mockResolvedValueOnce({ data: mockStats });

      const result = await statisticsService.fetchStatistics();

      expect(result).toEqual(mockStats);
    });

    it('should return default empty stats object on error', async () => {
      mockedAxios.get.mockRejectedValueOnce(new Error('Network error'));

      const result = await statisticsService.fetchStatistics();

      expect(result).toEqual(defaultEmptyStats);
    });

    it('should return default empty stats on 500 server error', async () => {
      mockedAxios.get.mockRejectedValueOnce({ response: { status: 500 } });

      const result = await statisticsService.fetchStatistics();

      expect(result).toEqual(defaultEmptyStats);
    });

    it('should return default empty stats on 401 unauthorized', async () => {
      mockedAxios.get.mockRejectedValueOnce({ response: { status: 401 } });

      const result = await statisticsService.fetchStatistics();

      expect(result).toEqual(defaultEmptyStats);
    });

    it('should include all required keys in the default stats', async () => {
      mockedAxios.get.mockRejectedValueOnce(new Error('Fail'));

      const result = await statisticsService.fetchStatistics();

      expect(result).toHaveProperty('total_users');
      expect(result).toHaveProperty('new_users');
      expect(result).toHaveProperty('total_capacities');
      expect(result).toHaveProperty('new_capacities');
      expect(result).toHaveProperty('total_messages');
      expect(result).toHaveProperty('new_messages');
      expect(result).toHaveProperty('total_organizations');
      expect(result).toHaveProperty('new_organizations');
      expect(result).toHaveProperty('active_users');
      expect(result).toHaveProperty('users_with_territory');
      expect(result).toHaveProperty('users_with_language');
      expect(result).toHaveProperty('users_with_capacities');
      expect(result).toHaveProperty('territory_user_counts');
      expect(result).toHaveProperty('language_user_counts');
      expect(result).toHaveProperty('skill_known_user_counts');
      expect(result).toHaveProperty('skill_available_user_counts');
      expect(result).toHaveProperty('skill_wanted_user_counts');
    });
  });
});
