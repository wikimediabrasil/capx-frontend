import axios from 'axios';
import { UserBadgeService } from '@/services/userBadgeService';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('UserBadgeService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getUserBadges', () => {
    it('should GET /api/user_badge with Authorization and Content-Type headers', async () => {
      const mockResponse = { count: 2, results: [{ id: 1 }, { id: 2 }] };
      mockedAxios.get.mockResolvedValueOnce({ data: mockResponse });

      const result = await UserBadgeService.getUserBadges('test-token');

      expect(mockedAxios.get).toHaveBeenCalledWith('/api/user_badge', {
        headers: {
          Authorization: 'Token test-token',
          'Content-Type': 'application/json',
        },
      });
      expect(result).toEqual(mockResponse);
    });

    it('should work when no token is provided (undefined)', async () => {
      const mockResponse = { count: 0, results: [] };
      mockedAxios.get.mockResolvedValueOnce({ data: mockResponse });

      const result = await UserBadgeService.getUserBadges(undefined);

      expect(mockedAxios.get).toHaveBeenCalledWith('/api/user_badge', {
        headers: {
          Authorization: 'Token undefined',
          'Content-Type': 'application/json',
        },
      });
      expect(result).toEqual(mockResponse);
    });

    it('should return badges data on success', async () => {
      const mockBadges = {
        count: 3,
        results: [
          { id: 1, badge: { name: 'Newcomer' }, is_displayed: true },
          { id: 2, badge: { name: 'Editor' }, is_displayed: false },
        ],
      };
      mockedAxios.get.mockResolvedValueOnce({ data: mockBadges });

      const result = await UserBadgeService.getUserBadges('token');

      expect(result).toEqual(mockBadges);
    });

    it('should throw on network error', async () => {
      mockedAxios.get.mockRejectedValueOnce(new Error('Network error'));

      await expect(UserBadgeService.getUserBadges('token')).rejects.toThrow('Network error');
    });

    it('should throw on 401 unauthorized', async () => {
      const error = { response: { status: 401, data: { detail: 'Unauthorized' } } };
      mockedAxios.get.mockRejectedValueOnce(error);

      await expect(UserBadgeService.getUserBadges('bad-token')).rejects.toEqual(error);
    });
  });

  describe('updateUserBadge', () => {
    const params = { id: 5, is_displayed: true };

    it('should PUT /api/user_badge with params and Authorization header', async () => {
      const mockBadge = { id: 5, is_displayed: true };
      mockedAxios.put.mockResolvedValueOnce({ data: mockBadge });

      const result = await UserBadgeService.updateUserBadge(params, 'test-token');

      expect(mockedAxios.put).toHaveBeenCalledWith('/api/user_badge', params, {
        headers: {
          Authorization: 'Token test-token',
          'Content-Type': 'application/json',
        },
      });
      expect(result).toEqual(mockBadge);
    });

    it('should update is_displayed to false correctly', async () => {
      const hideParams = { id: 3, is_displayed: false };
      mockedAxios.put.mockResolvedValueOnce({ data: { id: 3, is_displayed: false } });

      const result = await UserBadgeService.updateUserBadge(hideParams, 'token');

      const sentBody = mockedAxios.put.mock.calls[0][1] as any;
      expect(sentBody.is_displayed).toBe(false);
      expect(result.is_displayed).toBe(false);
    });

    it('should return updated badge data on success', async () => {
      const mockUpdated = { id: 5, badge: { name: 'Editor' }, is_displayed: true };
      mockedAxios.put.mockResolvedValueOnce({ data: mockUpdated });

      const result = await UserBadgeService.updateUserBadge(params, 'token');

      expect(result).toEqual(mockUpdated);
    });

    it('should work when no token is provided (undefined)', async () => {
      mockedAxios.put.mockResolvedValueOnce({ data: {} });

      await UserBadgeService.updateUserBadge(params, undefined);

      expect(mockedAxios.put).toHaveBeenCalledWith(
        '/api/user_badge',
        params,
        expect.objectContaining({
          headers: expect.objectContaining({ Authorization: 'Token undefined' }),
        })
      );
    });

    it('should throw on network error', async () => {
      mockedAxios.put.mockRejectedValueOnce(new Error('Network error'));

      await expect(UserBadgeService.updateUserBadge(params, 'token')).rejects.toThrow(
        'Network error'
      );
    });

    it('should throw on 400 validation error', async () => {
      const error = { response: { status: 400, data: { id: ['Invalid pk'] } } };
      mockedAxios.put.mockRejectedValueOnce(error);

      await expect(
        UserBadgeService.updateUserBadge({ id: -1, is_displayed: true }, 'token')
      ).rejects.toEqual(error);
    });
  });
});
