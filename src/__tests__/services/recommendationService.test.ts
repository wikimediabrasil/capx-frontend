import axios from 'axios';
import { recommendationService } from '@/services/recommendationService';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('recommendationService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getRecommendations', () => {
    const token = 'test-token';

    it('should GET /api/recommendation with Authorization header', async () => {
      const mockResponse = { users: [{ id: 1 }], organizations: [] };
      mockedAxios.get.mockResolvedValueOnce({ data: mockResponse });

      const result = await recommendationService.getRecommendations(token);

      expect(mockedAxios.get).toHaveBeenCalledWith('/api/recommendation', {
        headers: { Authorization: `Token ${token}` },
      });
      expect(result).toEqual(mockResponse);
    });

    it('should return the recommendations data on success', async () => {
      const mockData = {
        users: [{ id: 1, username: 'bob' }, { id: 2, username: 'carol' }],
        organizations: [{ id: 5, name: 'Wikimedia' }],
      };
      mockedAxios.get.mockResolvedValueOnce({ data: mockData });

      const result = await recommendationService.getRecommendations(token);

      expect(result).toEqual(mockData);
    });

    it('should throw on network error', async () => {
      mockedAxios.get.mockRejectedValueOnce(new Error('Network error'));

      await expect(recommendationService.getRecommendations(token)).rejects.toThrow(
        'Network error'
      );
    });

    it('should throw on 401 unauthorized', async () => {
      const error = { response: { status: 401, data: { detail: 'Authentication credentials were not provided.' } } };
      mockedAxios.get.mockRejectedValueOnce(error);

      await expect(recommendationService.getRecommendations('bad-token')).rejects.toEqual(error);
    });

    it('should throw on 500 server error', async () => {
      const error = { response: { status: 500, data: { detail: 'Internal Server Error' } } };
      mockedAxios.get.mockRejectedValueOnce(error);

      await expect(recommendationService.getRecommendations(token)).rejects.toEqual(error);
    });

    it('should use the provided token in the Authorization header', async () => {
      mockedAxios.get.mockResolvedValueOnce({ data: {} });

      await recommendationService.getRecommendations('my-special-token');

      const [, config] = mockedAxios.get.mock.calls[0];
      expect(config?.headers?.Authorization).toBe('Token my-special-token');
    });
  });
});
