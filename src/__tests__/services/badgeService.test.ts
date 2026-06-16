import axios from 'axios';
import { BadgeService } from '@/services/badgeService';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('BadgeService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getBadges', () => {
    it('should fetch badges with token', async () => {
      const mockData = { results: [{ id: 1, name: 'Badge 1' }] };
      mockedAxios.get.mockResolvedValueOnce({ data: mockData });

      const result = await BadgeService.getBadges('test-token');

      expect(mockedAxios.get).toHaveBeenCalledWith('/api/badges', {
        headers: {
          Authorization: 'Token test-token',
          'Content-Type': 'application/json',
        },
      });
      expect(result).toEqual(mockData);
    });

    it('should throw on error', async () => {
      mockedAxios.get.mockRejectedValueOnce(new Error('Network error'));
      await expect(BadgeService.getBadges('token')).rejects.toThrow('Network error');
    });
  });

  describe('getBadgeById', () => {
    it('should fetch badge by id', async () => {
      const mockData = { results: [{ id: 1, name: 'Badge 1' }] };
      mockedAxios.get.mockResolvedValueOnce({ data: mockData });

      const result = await BadgeService.getBadgeById('1', 'test-token');

      expect(mockedAxios.get).toHaveBeenCalledWith('/api/badges?badgeId=1', {
        headers: {
          Authorization: 'Token test-token',
          'Content-Type': 'application/json',
        },
      });
      expect(result).toEqual(mockData);
    });
  });
});
