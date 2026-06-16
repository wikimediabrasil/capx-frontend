import axios from 'axios';
import { fetchTerritories } from '@/services/territoryService';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('fetchTerritories', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should GET /api/territory/ without auth header when no token provided', async () => {
    mockedAxios.get.mockResolvedValueOnce({
      data: { results: [], next: null },
    });

    await fetchTerritories();

    expect(mockedAxios.get).toHaveBeenCalledWith('/api/territory/', { headers: {} });
  });

  it('should include Authorization header when token is provided', async () => {
    mockedAxios.get.mockResolvedValueOnce({
      data: { results: [], next: null },
    });

    await fetchTerritories('test-token');

    expect(mockedAxios.get).toHaveBeenCalledWith('/api/territory/', {
      headers: { Authorization: 'Token test-token' },
    });
  });

  it('should return all results from a single page response', async () => {
    const mockTerritories = [
      { id: 1, name: 'NWE' },
      { id: 2, name: 'LAC' },
    ];
    mockedAxios.get.mockResolvedValueOnce({
      data: { results: mockTerritories, next: null },
    });

    const result = await fetchTerritories('token');

    expect(result).toEqual(mockTerritories);
  });

  it('should paginate through all pages when next URL is present', async () => {
    const page1 = [
      { id: 1, name: 'NWE' },
      { id: 2, name: 'LAC' },
    ];
    const page2 = [
      { id: 3, name: 'ESEAP' },
      { id: 4, name: 'SA' },
    ];

    mockedAxios.get
      .mockResolvedValueOnce({
        data: {
          results: page1,
          next: 'https://example.com/api/territory/?limit=2&offset=2',
        },
      })
      .mockResolvedValueOnce({
        data: { results: page2, next: null },
      });

    const result = await fetchTerritories('token');

    expect(mockedAxios.get).toHaveBeenCalledTimes(2);
    expect(result).toEqual([...page1, ...page2]);
  });

  it('should extract only the query string from the next URL for pagination', async () => {
    mockedAxios.get
      .mockResolvedValueOnce({
        data: {
          results: [{ id: 1 }],
          next: 'https://example.com/api/territory/?limit=1&offset=1',
        },
      })
      .mockResolvedValueOnce({
        data: { results: [{ id: 2 }], next: null },
      });

    await fetchTerritories('token');

    expect(mockedAxios.get).toHaveBeenNthCalledWith(2, '/api/territory/?limit=1&offset=1', {
      headers: { Authorization: 'Token token' },
    });
  });

  it('should concatenate results from multiple pages', async () => {
    const page1 = [{ id: 1 }, { id: 2 }];
    const page2 = [{ id: 3 }, { id: 4 }];
    const page3 = [{ id: 5 }];

    mockedAxios.get
      .mockResolvedValueOnce({
        data: { results: page1, next: 'https://example.com/api/territory/?offset=2' },
      })
      .mockResolvedValueOnce({
        data: { results: page2, next: 'https://example.com/api/territory/?offset=4' },
      })
      .mockResolvedValueOnce({
        data: { results: page3, next: null },
      });

    const result = await fetchTerritories('token');

    expect(result).toHaveLength(5);
    expect(result).toEqual([...page1, ...page2, ...page3]);
  });

  it('should return empty array when results is empty', async () => {
    mockedAxios.get.mockResolvedValueOnce({
      data: { results: [], next: null },
    });

    const result = await fetchTerritories('token');

    expect(result).toEqual([]);
  });

  it('should stop pagination when next is null', async () => {
    mockedAxios.get.mockResolvedValueOnce({
      data: { results: [{ id: 1 }], next: null },
    });

    await fetchTerritories('token');

    expect(mockedAxios.get).toHaveBeenCalledTimes(1);
  });

  it('should handle invalid next URL gracefully and stop pagination', async () => {
    mockedAxios.get.mockResolvedValueOnce({
      data: { results: [{ id: 1 }], next: 'not-a-valid-url' },
    });

    // Should not throw, should stop after first page since URL parsing fails
    const result = await fetchTerritories('token');

    expect(result).toEqual([{ id: 1 }]);
    expect(mockedAxios.get).toHaveBeenCalledTimes(1);
  });

  it('should throw on network error', async () => {
    mockedAxios.get.mockRejectedValueOnce(new Error('Network error'));

    await expect(fetchTerritories('token')).rejects.toThrow('Network error');
  });
});
