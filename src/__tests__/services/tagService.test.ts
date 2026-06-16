import axios from 'axios';
import { tagService } from '@/services/tagService';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('tagService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('fetchTagById', () => {
    const queryData = {
      params: { limit: 10 },
      headers: { Authorization: 'Token test-token' },
    };

    it('should GET /api/tag with id, category, and queryData params', async () => {
      const mockTag = { code: 'Q1', name: 'Test Tag', users: [] };
      mockedAxios.get.mockResolvedValueOnce({ data: mockTag });

      const result = await tagService.fetchTagById('Q1', 'skill', queryData);

      expect(mockedAxios.get).toHaveBeenCalledWith('/api/tag', {
        params: { id: 'Q1', category: 'skill', limit: 10 },
        headers: { Authorization: 'Token test-token' },
      });
      expect(result).toEqual(mockTag);
    });

    it('should merge queryData.params into the request params', async () => {
      const extendedQueryData = {
        params: { limit: 20, offset: 0 },
        headers: { Authorization: 'Token test-token' },
      };
      mockedAxios.get.mockResolvedValueOnce({ data: {} });

      await tagService.fetchTagById('Q5', 'territory', extendedQueryData);

      const [, config] = mockedAxios.get.mock.calls[0];
      expect(config?.params).toMatchObject({
        id: 'Q5',
        category: 'territory',
        limit: 20,
        offset: 0,
      });
    });

    it('should return tag data on success', async () => {
      const mockTag = { code: 'Q42', name: 'Douglas Adams', users: [{ id: 1 }] };
      mockedAxios.get.mockResolvedValueOnce({ data: mockTag });

      const result = await tagService.fetchTagById('Q42', 'person', queryData);

      expect(result).toEqual(mockTag);
    });

    it('should throw on network error', async () => {
      mockedAxios.get.mockRejectedValueOnce(new Error('Network error'));

      await expect(tagService.fetchTagById('Q1', 'skill', queryData)).rejects.toThrow(
        'Network error'
      );
    });

    it('should throw on 404 not found', async () => {
      const error = { response: { status: 404 } };
      mockedAxios.get.mockRejectedValueOnce(error);

      await expect(tagService.fetchTagById('QXXX', 'skill', queryData)).rejects.toEqual(error);
    });
  });

  describe('fetchTagsByCategory', () => {
    const queryData = {
      params: { limit: 50 },
      headers: { Authorization: 'Token test-token' },
    };

    it('should GET /api/list/{category} with params and headers', async () => {
      const mockTags = { Q1: 'Tag One', Q2: 'Tag Two' };
      mockedAxios.get.mockResolvedValueOnce({ data: mockTags });

      const result = await tagService.fetchTagsByCategory('skill', queryData);

      expect(mockedAxios.get).toHaveBeenCalledWith('/api/list/skill', {
        params: queryData.params,
        headers: queryData.headers,
      });
      expect(result).toEqual(mockTags);
    });

    it('should work with different category values', async () => {
      mockedAxios.get.mockResolvedValueOnce({ data: { NWE: 'Northern/Western Europe' } });

      await tagService.fetchTagsByCategory('territory', queryData);

      expect(mockedAxios.get).toHaveBeenCalledWith('/api/list/territory', expect.any(Object));
    });

    it('should return a record of string keys and string values', async () => {
      const mockRecord = { en: 'English', pt: 'Portuguese' };
      mockedAxios.get.mockResolvedValueOnce({ data: mockRecord });

      const result = await tagService.fetchTagsByCategory('language', queryData);

      expect(result).toEqual(mockRecord);
    });

    it('should throw on network error', async () => {
      mockedAxios.get.mockRejectedValueOnce(new Error('Network error'));

      await expect(tagService.fetchTagsByCategory('skill', queryData)).rejects.toThrow(
        'Network error'
      );
    });

    it('should throw on 401 unauthorized', async () => {
      const error = { response: { status: 401 } };
      mockedAxios.get.mockRejectedValueOnce(error);

      await expect(tagService.fetchTagsByCategory('skill', queryData)).rejects.toEqual(error);
    });
  });
});
