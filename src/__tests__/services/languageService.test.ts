import axios from 'axios';
import { fetchLanguages, updateLanguageProficiency } from '@/services/languageService';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('languageService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('fetchLanguages', () => {
    it('should fetch languages with token', async () => {
      const mockData = { '1': 'English', '2': 'Portuguese' };
      mockedAxios.get.mockResolvedValueOnce({ data: mockData });

      const result = await fetchLanguages('test-token');
      expect(mockedAxios.get).toHaveBeenCalledWith('/api/list/language/', {
        headers: { Authorization: 'Token test-token' },
        params: undefined,
      });
      expect(result).toEqual(mockData);
    });

    it('should pass language param when provided', async () => {
      mockedAxios.get.mockResolvedValueOnce({ data: {} });

      await fetchLanguages('test-token', 'pt');
      expect(mockedAxios.get).toHaveBeenCalledWith('/api/list/language/', {
        headers: { Authorization: 'Token test-token' },
        params: { lang: 'pt' },
      });
    });
  });

  describe('updateLanguageProficiency', () => {
    it('should update language proficiency', async () => {
      mockedAxios.put.mockResolvedValueOnce({ data: 'ok' });

      const languages = [{ id: 1, proficiency: '5', name: 'English' }];
      const result = await updateLanguageProficiency('test-token', 123, languages);

      expect(mockedAxios.put).toHaveBeenCalledWith('/api/profile/123/', {
        headers: expect.any(Object),
        body: JSON.stringify({ language: languages }),
      });
      expect(result).toBe('ok');
    });
  });
});
