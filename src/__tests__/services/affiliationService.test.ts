import axios from 'axios';
import { fetchAffiliations } from '@/services/affiliationService';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('fetchAffiliations', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should fetch affiliations with params', async () => {
    const mockData = { '1': 'Wikimedia Foundation' };
    mockedAxios.get.mockResolvedValueOnce({ data: mockData });
    (mockedAxios.isAxiosError as unknown as jest.Mock) = jest.fn().mockReturnValue(false);

    const result = await fetchAffiliations({
      params: { language: 'en' },
      headers: { Authorization: 'Token test-token' },
    });

    expect(mockedAxios.get).toHaveBeenCalledWith('/api/list/affiliation/', {
      params: { language: 'en' },
      headers: { Authorization: 'Token test-token' },
    });
    expect(result).toEqual(mockData);
  });

  it('should return empty object on error', async () => {
    mockedAxios.get.mockRejectedValueOnce(new Error('Network error'));
    (mockedAxios.isAxiosError as unknown as jest.Mock) = jest.fn().mockReturnValue(false);

    const result = await fetchAffiliations({
      headers: { Authorization: 'Token test-token' },
    });

    expect(result).toEqual({});
  });
});
