import axios from 'axios';
import { capacityService, fetchAllCapacities } from '@/services/capacityService';

jest.mock('axios');
jest.mock('@/lib/utils/capacitiesUtils', () => ({
  fetchMetabase: jest.fn(),
  fetchWikidata: jest.fn(),
}));

const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('capacityService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('fetchCapacities', () => {
    it('should fetch capacities with params', async () => {
      const mockData = [{ code: 10, name: 'Organizational' }];
      mockedAxios.get.mockResolvedValueOnce({ data: mockData });

      const result = await capacityService.fetchCapacities({
        params: { language: 'en' },
        headers: { Authorization: 'Token test' },
      });

      expect(mockedAxios.get).toHaveBeenCalledWith('/api/capacity', {
        params: { language: 'en' },
        headers: { Authorization: 'Token test' },
      });
      expect(result).toEqual(mockData);
    });

    it('should throw on error', async () => {
      mockedAxios.get.mockRejectedValueOnce(new Error('Failed'));
      await expect(
        capacityService.fetchCapacities({
          params: {},
          headers: { Authorization: 'Token test' },
        })
      ).rejects.toThrow('Failed');
    });
  });

  describe('fetchCapacitiesByType', () => {
    it('should fetch by type with language', async () => {
      mockedAxios.get.mockResolvedValueOnce({ data: { '100': 'Sub capacity' } });

      const result = await capacityService.fetchCapacitiesByType('10', undefined, 'pt');
      expect(mockedAxios.get).toHaveBeenCalledWith('/api/capacity/type/10', {
        params: { language: 'pt' },
      });
      expect(result).toEqual({ '100': 'Sub capacity' });
    });
  });

  describe('fetchCapacityById', () => {
    it('should fetch capacity by id', async () => {
      const mockData = { code: 10, name: 'Organizational' };
      mockedAxios.get.mockResolvedValueOnce({ data: mockData });

      const result = await capacityService.fetchCapacityById('10');
      expect(mockedAxios.get).toHaveBeenCalledWith('/api/capacity/10', undefined);
      expect(result).toEqual(mockData);
    });
  });

  describe('searchCapacities', () => {
    it('should search with query string', async () => {
      mockedAxios.get.mockResolvedValueOnce({ data: [{ code: 10 }] });

      const result = await capacityService.searchCapacities('org');
      expect(mockedAxios.get).toHaveBeenCalledWith('/api/capacity/search', {
        params: { q: 'org' },
      });
      expect(result).toEqual([{ code: 10 }]);
    });
  });

  describe('fetchCapacityDescription', () => {
    it('should fetch description', async () => {
      mockedAxios.get.mockResolvedValueOnce({
        data: { name: 'Test', description: 'Desc', wd_code: 'Q1', metabase_code: 'M1' },
      });

      const result = await capacityService.fetchCapacityDescription(10, undefined, 'en');
      expect(result).toEqual({
        name: 'Test',
        description: 'Desc',
        wdCode: 'Q1',
        metabaseCode: 'M1',
      });
    });
  });
});

describe('fetchAllCapacities', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should fetch all with limit 1000', async () => {
    const mockData = [{ code: 10 }];
    mockedAxios.get.mockResolvedValueOnce({ data: mockData });

    const result = await fetchAllCapacities('test-token');
    expect(mockedAxios.get).toHaveBeenCalledWith('/api/skill/', {
      headers: { Authorization: 'Token test-token' },
      params: { limit: 1000, offset: 0 },
    });
    expect(result).toEqual(mockData);
  });
});

describe('capacityService - additional coverage', () => {
  const { fetchMetabase, fetchWikidata } = require('@/lib/utils/capacitiesUtils');
  const mockFetchMetabase = fetchMetabase as jest.Mock;
  const mockFetchWikidata = fetchWikidata as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('fetchCapacitiesByType with config', () => {
    it('should merge config params with language', async () => {
      mockedAxios.get.mockResolvedValueOnce({ data: { '100': 'Sub' } });

      await capacityService.fetchCapacitiesByType('10', { params: { extra: 'val' } }, 'fr');
      expect(mockedAxios.get).toHaveBeenCalledWith('/api/capacity/type/10', {
        params: { extra: 'val', language: 'fr' },
      });
    });

    it('should use default language en when not provided', async () => {
      mockedAxios.get.mockResolvedValueOnce({ data: {} });

      await capacityService.fetchCapacitiesByType('20');
      expect(mockedAxios.get).toHaveBeenCalledWith('/api/capacity/type/20', {
        params: { language: 'en' },
      });
    });

    it('should throw on error', async () => {
      mockedAxios.get.mockRejectedValueOnce(new Error('Type fetch failed'));
      await expect(capacityService.fetchCapacitiesByType('10')).rejects.toThrow(
        'Type fetch failed'
      );
    });
  });

  describe('fetchCapacityById with config', () => {
    it('should pass config to axios', async () => {
      mockedAxios.get.mockResolvedValueOnce({ data: { code: 10, name: 'Test' } });

      const config = { headers: { Authorization: 'Token t' } };
      await capacityService.fetchCapacityById('10', config);
      expect(mockedAxios.get).toHaveBeenCalledWith('/api/capacity/10', config);
    });

    it('should throw on error', async () => {
      mockedAxios.get.mockRejectedValueOnce(new Error('ID fetch failed'));
      await expect(capacityService.fetchCapacityById('10')).rejects.toThrow('ID fetch failed');
    });
  });

  describe('searchCapacities', () => {
    it('should merge config params with search query', async () => {
      mockedAxios.get.mockResolvedValueOnce({ data: [] });

      await capacityService.searchCapacities('wiki', { params: { language: 'pt' } });
      expect(mockedAxios.get).toHaveBeenCalledWith('/api/capacity/search', {
        params: { language: 'pt', q: 'wiki' },
      });
    });

    it('should throw on error', async () => {
      mockedAxios.get.mockRejectedValueOnce(new Error('Search failed'));
      await expect(capacityService.searchCapacities('query')).rejects.toThrow('Search failed');
    });
  });

  describe('fetchCapacityDescription', () => {
    it('should handle missing fields with empty strings', async () => {
      mockedAxios.get.mockResolvedValueOnce({ data: {} });

      const result = await capacityService.fetchCapacityDescription(10);
      expect(result).toEqual({ name: '', description: '', wdCode: '', metabaseCode: '' });
    });

    it('should merge config params', async () => {
      mockedAxios.get.mockResolvedValueOnce({
        data: { name: 'N', description: 'D', wd_code: 'Q', metabase_code: 'M' },
      });

      await capacityService.fetchCapacityDescription(10, { params: { extra: true } }, 'de');
      expect(mockedAxios.get).toHaveBeenCalledWith('/api/capacity/10', {
        params: { extra: true, language: 'de' },
      });
    });
  });

  describe('fetchMetabaseTranslations', () => {
    it('should call fetchMetabase and return results', async () => {
      const codes = [{ code: 1, wd_code: 'Q1' }];
      mockFetchMetabase.mockResolvedValueOnce([{ code: 1, name: 'Test' }]);

      const result = await capacityService.fetchMetabaseTranslations(codes, 'en');
      expect(mockFetchMetabase).toHaveBeenCalledWith(codes, 'en');
      expect(result).toEqual([{ code: 1, name: 'Test' }]);
    });

    it('should return empty array on error', async () => {
      mockFetchMetabase.mockRejectedValueOnce(new Error('Metabase error'));
      const result = await capacityService.fetchMetabaseTranslations([], 'en');
      expect(result).toEqual([]);
    });
  });

  describe('fetchWikidataTranslations', () => {
    it('should call fetchWikidata and return results', async () => {
      const codes = [{ code: 1, wd_code: 'Q1' }];
      mockFetchWikidata.mockResolvedValueOnce([{ code: 1, name: 'WikiTest' }]);

      const result = await capacityService.fetchWikidataTranslations(codes, 'pt');
      expect(mockFetchWikidata).toHaveBeenCalledWith(codes, 'pt');
      expect(result).toEqual([{ code: 1, name: 'WikiTest' }]);
    });

    it('should return empty array on error', async () => {
      mockFetchWikidata.mockRejectedValueOnce(new Error('Wikidata error'));
      const result = await capacityService.fetchWikidataTranslations([], 'en');
      expect(result).toEqual([]);
    });
  });

  describe('fetchTranslationsWithFallback', () => {
    it('should return Metabase results when available', async () => {
      const codes = [{ code: 1, wd_code: 'Q1' }];
      mockFetchMetabase.mockResolvedValueOnce([{ code: 1, name: 'Meta' }]);

      const result = await capacityService.fetchTranslationsWithFallback(codes, 'en');
      expect(result).toEqual([{ code: 1, name: 'Meta' }]);
      expect(mockFetchWikidata).not.toHaveBeenCalled();
    });

    it('should fall back to Wikidata when Metabase returns empty', async () => {
      const codes = [{ code: 1, wd_code: 'Q1' }];
      mockFetchMetabase.mockResolvedValueOnce([]);
      mockFetchWikidata.mockResolvedValueOnce([{ code: 1, name: 'Wiki' }]);

      const result = await capacityService.fetchTranslationsWithFallback(codes, 'en');
      expect(result).toEqual([{ code: 1, name: 'Wiki' }]);
    });

    it('should fall back to Wikidata when Metabase returns null', async () => {
      const codes = [{ code: 1, wd_code: 'Q1' }];
      mockFetchMetabase.mockResolvedValueOnce(null);
      mockFetchWikidata.mockResolvedValueOnce([{ code: 1, name: 'Wiki' }]);

      const result = await capacityService.fetchTranslationsWithFallback(codes, 'en');
      expect(result).toEqual([{ code: 1, name: 'Wiki' }]);
    });

    it('should use default language en', async () => {
      mockFetchMetabase.mockResolvedValueOnce([{ code: 1, name: 'En' }]);
      const result = await capacityService.fetchTranslationsWithFallback([]);
      expect(result).toEqual([{ code: 1, name: 'En' }]);
    });

    it('should return empty array on unexpected error', async () => {
      // fetchMetabaseTranslations internally catches errors and returns [],
      // but fetchTranslationsWithFallback also has a try/catch.
      // We test the top-level catch by mocking the method to throw synchronously.
      const spy = jest
        .spyOn(capacityService, 'fetchMetabaseTranslations')
        .mockRejectedValueOnce(new Error('Unexpected'));

      const result = await capacityService.fetchTranslationsWithFallback([]);
      expect(result).toEqual([]);

      spy.mockRestore();
    });
  });
});
