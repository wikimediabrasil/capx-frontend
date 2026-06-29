import axios from 'axios';
import { LetsConnectExistsService } from '@/services/letsConnectExistsService';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('LetsConnectExistsService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('checkUserExists', () => {
    it('should return exists: true when user is found', async () => {
      const mockResponse = { data: { exists: true } };
      mockedAxios.get.mockResolvedValueOnce(mockResponse);

      const result = await LetsConnectExistsService.checkUserExists('alice', 'test-token');

      expect(result).toEqual({ exists: true });
    });

    it('should return exists: false when user is not found', async () => {
      const mockResponse = { data: { exists: false } };
      mockedAxios.get.mockResolvedValueOnce(mockResponse);

      const result = await LetsConnectExistsService.checkUserExists('unknown', 'test-token');

      expect(result).toEqual({ exists: false });
    });

    it('should call GET /api/lets_connect/exists with encoded username and auth header', async () => {
      mockedAxios.get.mockResolvedValueOnce({ data: { exists: true } });

      await LetsConnectExistsService.checkUserExists('alice wonder', 'mytoken');

      expect(mockedAxios.get).toHaveBeenCalledWith(
        `/api/lets_connect/exists?username=${encodeURIComponent('alice wonder')}`,
        {
          headers: {
            Authorization: 'Token mytoken',
          },
        }
      );
    });

    it('should encode special characters in username', async () => {
      mockedAxios.get.mockResolvedValueOnce({ data: { exists: true } });

      await LetsConnectExistsService.checkUserExists('user@test+1', 'token');

      expect(mockedAxios.get).toHaveBeenCalledWith(
        `/api/lets_connect/exists?username=${encodeURIComponent('user@test+1')}`,
        expect.any(Object)
      );
    });

    it('should throw when the API call fails', async () => {
      const error = new Error('Network error');
      mockedAxios.get.mockRejectedValueOnce(error);

      await expect(LetsConnectExistsService.checkUserExists('alice', 'test-token')).rejects.toThrow(
        'Network error'
      );
    });

    it('should throw on 401 unauthorized', async () => {
      const error = { response: { status: 401, data: { detail: 'Unauthorized' } } };
      mockedAxios.get.mockRejectedValueOnce(error);

      await expect(LetsConnectExistsService.checkUserExists('alice', 'bad-token')).rejects.toEqual(
        error
      );
    });

    it('should throw on 500 server error', async () => {
      const error = { response: { status: 500, data: { detail: 'Internal Server Error' } } };
      mockedAxios.get.mockRejectedValueOnce(error);

      await expect(LetsConnectExistsService.checkUserExists('alice', 'test-token')).rejects.toEqual(
        error
      );
    });
  });
});
