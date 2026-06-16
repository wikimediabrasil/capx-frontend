import axios from 'axios';
import {
  fetchWikimediaProjects,
  fetchWikimediaProjectImages,
} from '@/services/wikimediaProjectService';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('wikimediaProjectService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('fetchWikimediaProjects', () => {
    it('should return {} when no token is provided', async () => {
      const result = await fetchWikimediaProjects(undefined);

      expect(result).toEqual({});
      expect(mockedAxios.get).not.toHaveBeenCalled();
    });

    it('should GET /api/list/wikimedia_project/ with Authorization header when token is provided', async () => {
      const mockProjects = { 1: 'Wikipedia', 2: 'Wikidata' };
      mockedAxios.get.mockResolvedValueOnce({ data: mockProjects });

      const result = await fetchWikimediaProjects('test-token');

      expect(mockedAxios.get).toHaveBeenCalledWith('/api/list/wikimedia_project/', {
        headers: { Authorization: 'Token test-token' },
        timeout: 8000,
      });
      expect(result).toEqual(mockProjects);
    });

    it('should return projects data on success', async () => {
      const mockProjects = { 1: 'Wikipedia', 2: 'Wikidata', 3: 'Commons' };
      mockedAxios.get.mockResolvedValueOnce({ data: mockProjects });

      const result = await fetchWikimediaProjects('token');

      expect(result).toEqual(mockProjects);
    });

    it('should return {} when response data is null/falsy', async () => {
      mockedAxios.get.mockResolvedValueOnce({ data: null });

      const result = await fetchWikimediaProjects('token');

      expect(result).toEqual({});
    });

    it('should return {} on network error', async () => {
      mockedAxios.get.mockRejectedValueOnce(new Error('Network error'));

      const result = await fetchWikimediaProjects('token');

      expect(result).toEqual({});
    });

    it('should return {} on 401 unauthorized error', async () => {
      mockedAxios.get.mockRejectedValueOnce({ response: { status: 401 } });

      const result = await fetchWikimediaProjects('bad-token');

      expect(result).toEqual({});
    });

    it('should return {} on timeout error', async () => {
      mockedAxios.get.mockRejectedValueOnce(new Error('timeout of 8000ms exceeded'));

      const result = await fetchWikimediaProjects('token');

      expect(result).toEqual({});
    });
  });

  describe('fetchWikimediaProjectImages', () => {
    it('should throw when projectId is 0 (falsy)', async () => {
      await expect(fetchWikimediaProjectImages(0, 'test-token')).rejects.toThrow(
        'Project ID is required'
      );
      expect(mockedAxios.get).not.toHaveBeenCalled();
    });

    it('should throw when token is undefined', async () => {
      await expect(fetchWikimediaProjectImages(1, undefined)).rejects.toThrow('Token is required');
      expect(mockedAxios.get).not.toHaveBeenCalled();
    });

    it('should GET /api/wikimedia_project/{id} with auth header', async () => {
      const mockResponse = { wikimedia_project_picture: 'https://example.com/image.png' };
      mockedAxios.get.mockResolvedValueOnce({ data: mockResponse });

      const result = await fetchWikimediaProjectImages(5, 'test-token');

      expect(mockedAxios.get).toHaveBeenCalledWith('/api/wikimedia_project/5', {
        headers: { Authorization: 'Token test-token' },
        timeout: 8000,
      });
      expect(result).toBe('https://example.com/image.png');
    });

    it('should return the wikimedia_project_picture URL on success', async () => {
      const imageUrl = 'https://upload.wikimedia.org/wikipedia/commons/thumb/test.png';
      mockedAxios.get.mockResolvedValueOnce({
        data: { wikimedia_project_picture: imageUrl },
      });

      const result = await fetchWikimediaProjectImages(3, 'token');

      expect(result).toBe(imageUrl);
    });

    it('should throw when wikimedia_project_picture is missing from response', async () => {
      mockedAxios.get.mockResolvedValueOnce({ data: { other_field: 'value' } });

      await expect(fetchWikimediaProjectImages(1, 'token')).rejects.toThrow(
        'No image found for project'
      );
    });

    it('should throw when wikimedia_project_picture is empty string', async () => {
      mockedAxios.get.mockResolvedValueOnce({ data: { wikimedia_project_picture: '' } });

      await expect(fetchWikimediaProjectImages(1, 'token')).rejects.toThrow(
        'No image found for project'
      );
    });

    it('should throw on network error', async () => {
      mockedAxios.get.mockRejectedValueOnce(new Error('Network error'));

      await expect(fetchWikimediaProjectImages(1, 'token')).rejects.toThrow('Network error');
    });

    it('should throw on 404 not found', async () => {
      const error = { response: { status: 404, data: { detail: 'Not found.' } } };
      mockedAxios.get.mockRejectedValueOnce(error);

      await expect(fetchWikimediaProjectImages(999, 'token')).rejects.toEqual(error);
    });

    it('should throw on timeout', async () => {
      mockedAxios.get.mockRejectedValueOnce(new Error('timeout of 8000ms exceeded'));

      await expect(fetchWikimediaProjectImages(1, 'token')).rejects.toThrow(
        'timeout of 8000ms exceeded'
      );
    });
  });
});
