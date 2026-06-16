import axios from 'axios';
import { tagDiffService } from '@/services/tagDiffService';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('tagDiffService', () => {
  const token = 'test-token';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('fetchSingleNews', () => {
    it('should GET /api/tag_diff/{id}/ with auth header', async () => {
      const mockNews = { id: 1, title: 'News 1' };
      mockedAxios.get.mockResolvedValueOnce({ data: mockNews });

      const result = await tagDiffService.fetchSingleNews(token, 1);

      expect(mockedAxios.get).toHaveBeenCalledWith('/api/tag_diff/1/', {
        headers: { Authorization: `Token ${token}` },
      });
      expect(result).toEqual(mockNews);
    });

    it('should return news data on success', async () => {
      const mockNews = { id: 5, title: 'Another news', content: 'Some content' };
      mockedAxios.get.mockResolvedValueOnce({ data: mockNews });

      const result = await tagDiffService.fetchSingleNews(token, 5);

      expect(result).toEqual(mockNews);
    });

    it('should throw on 404 not found', async () => {
      const error = { response: { status: 404, data: { detail: 'Not found.' } } };
      mockedAxios.get.mockRejectedValueOnce(error);

      await expect(tagDiffService.fetchSingleNews(token, 999)).rejects.toEqual(error);
    });

    it('should throw on network error', async () => {
      mockedAxios.get.mockRejectedValueOnce(new Error('Network error'));

      await expect(tagDiffService.fetchSingleNews(token, 1)).rejects.toThrow('Network error');
    });
  });

  describe('fetchAllNews', () => {
    it('should GET /api/tag_diff/ with auth header', async () => {
      const mockNewsList = [{ id: 1 }, { id: 2 }];
      mockedAxios.get.mockResolvedValueOnce({ data: mockNewsList });

      const result = await tagDiffService.fetchAllNews(token);

      expect(mockedAxios.get).toHaveBeenCalledWith('/api/tag_diff/', {
        headers: { Authorization: `Token ${token}` },
        params: { limit: undefined, offset: undefined },
      });
      expect(result).toEqual(mockNewsList);
    });

    it('should pass limit and offset when provided', async () => {
      mockedAxios.get.mockResolvedValueOnce({ data: [] });

      await tagDiffService.fetchAllNews(token, 10, 20);

      expect(mockedAxios.get).toHaveBeenCalledWith('/api/tag_diff/', {
        headers: { Authorization: `Token ${token}` },
        params: { limit: 10, offset: 20 },
      });
    });

    it('should return an empty array when no news', async () => {
      mockedAxios.get.mockResolvedValueOnce({ data: [] });

      const result = await tagDiffService.fetchAllNews(token);

      expect(result).toEqual([]);
    });

    it('should throw on network error', async () => {
      mockedAxios.get.mockRejectedValueOnce(new Error('Network error'));

      await expect(tagDiffService.fetchAllNews(token)).rejects.toThrow('Network error');
    });
  });

  describe('createTag', () => {
    const newTag = { title: 'New Tag', content: 'Content' };

    it('should POST /api/tag_diff/ with tag data and auth header', async () => {
      const mockCreated = { id: 10, ...newTag };
      mockedAxios.post.mockResolvedValueOnce({ data: mockCreated });

      const result = await tagDiffService.createTag(newTag, token);

      expect(mockedAxios.post).toHaveBeenCalledWith('/api/tag_diff/', newTag, {
        headers: {
          Authorization: `Token ${token}`,
          'Content-Type': 'application/json',
        },
      });
      expect(result).toEqual(mockCreated);
    });

    it('should return the created tag on success', async () => {
      const mockCreated = { id: 20, title: 'New Tag', content: 'Content' };
      mockedAxios.post.mockResolvedValueOnce({ data: mockCreated });

      const result = await tagDiffService.createTag(newTag, token);

      expect(result).toEqual(mockCreated);
    });

    it('should throw when response data is empty/null', async () => {
      mockedAxios.post.mockResolvedValueOnce({ data: null });

      await expect(tagDiffService.createTag(newTag, token)).rejects.toThrow(
        'Empty response from server'
      );
    });

    it('should throw when response data is undefined', async () => {
      mockedAxios.post.mockResolvedValueOnce({ data: undefined });

      await expect(tagDiffService.createTag(newTag, token)).rejects.toThrow(
        'Empty response from server'
      );
    });

    it('should throw on network error', async () => {
      mockedAxios.post.mockRejectedValueOnce(new Error('Network error'));

      await expect(tagDiffService.createTag(newTag, token)).rejects.toThrow('Network error');
    });

    it('should throw on 400 validation error', async () => {
      const error = { response: { status: 400, data: { title: ['Required.'] } } };
      mockedAxios.post.mockRejectedValueOnce(error);

      await expect(tagDiffService.createTag({}, token)).rejects.toEqual(error);
    });
  });

  describe('deleteNews', () => {
    it('should DELETE /api/tag_diff/{id}/ with auth header', async () => {
      mockedAxios.delete.mockResolvedValueOnce({ data: null });

      await tagDiffService.deleteNews(token, 3);

      expect(mockedAxios.delete).toHaveBeenCalledWith('/api/tag_diff/3/', {
        headers: { Authorization: `Token ${token}` },
      });
    });

    it('should return void on success', async () => {
      mockedAxios.delete.mockResolvedValueOnce({ data: null });

      const result = await tagDiffService.deleteNews(token, 3);

      expect(result).toBeUndefined();
    });

    it('should throw on 404 not found', async () => {
      const error = { response: { status: 404 } };
      mockedAxios.delete.mockRejectedValueOnce(error);

      await expect(tagDiffService.deleteNews(token, 999)).rejects.toEqual(error);
    });

    it('should throw on network error', async () => {
      mockedAxios.delete.mockRejectedValueOnce(new Error('Network error'));

      await expect(tagDiffService.deleteNews(token, 1)).rejects.toThrow('Network error');
    });
  });
});
