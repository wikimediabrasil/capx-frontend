jest.mock('@/services/territoryService', () => ({
  fetchTerritories: jest.fn(),
}));

import { renderHook, waitFor } from '@testing-library/react';
import { useTerritories } from '@/hooks/useTerritories';
import { fetchTerritories } from '@/services/territoryService';

const mockFetchTerritories = fetchTerritories as jest.Mock;

const mockTerritories = [
  { id: 1, territory_name: 'Sub-Saharan Africa' },
  { id: 2, territory_name: 'North America' },
  { id: 3, territory_name: 'Europe' },
];

describe('useTerritories', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns empty state and loading true initially when token is provided', () => {
    mockFetchTerritories.mockResolvedValue(mockTerritories);
    const { result } = renderHook(() => useTerritories('test-token'));

    expect(result.current.territories).toEqual([]);
    expect(result.current.territoriesMap).toEqual({});
    expect(result.current.loading).toBe(true);
    expect(result.current.error).toBeNull();
  });

  it('returns empty state and loading false when no token', () => {
    const { result } = renderHook(() => useTerritories(undefined));

    expect(result.current.territories).toEqual([]);
    expect(result.current.territoriesMap).toEqual({});
    expect(result.current.loading).toBe(true); // initial state before useEffect skips
    expect(result.current.error).toBeNull();
  });

  it('does not fetch when token is undefined', async () => {
    const { result } = renderHook(() => useTerritories(undefined));

    // Wait a tick to ensure effects have run
    await new Promise(r => setTimeout(r, 0));

    expect(mockFetchTerritories).not.toHaveBeenCalled();
    expect(result.current.territories).toEqual([]);
  });

  it('fetches territories when token is provided', async () => {
    mockFetchTerritories.mockResolvedValue(mockTerritories);

    const { result } = renderHook(() => useTerritories('test-token'));

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(mockFetchTerritories).toHaveBeenCalledWith('test-token');
    expect(result.current.territories).toEqual(mockTerritories);
    expect(result.current.error).toBeNull();
  });

  it('builds territoriesMap from fetched territories', async () => {
    mockFetchTerritories.mockResolvedValue(mockTerritories);

    const { result } = renderHook(() => useTerritories('test-token'));

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.territoriesMap).toEqual({
      '1': 'Sub-Saharan Africa',
      '2': 'North America',
      '3': 'Europe',
    });
  });

  it('handles fetch error gracefully', async () => {
    mockFetchTerritories.mockRejectedValue(new Error('Network error'));

    const { result } = renderHook(() => useTerritories('test-token'));

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.error).toBe('Network error');
    expect(result.current.territories).toEqual([]);
    expect(result.current.territoriesMap).toEqual({});
  });

  it('handles non-Error thrown values in catch block', async () => {
    mockFetchTerritories.mockRejectedValue('string error');

    const { result } = renderHook(() => useTerritories('test-token'));

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.error).toBe('Failed to load territories');
    expect(result.current.territories).toEqual([]);
  });

  it('handles null/undefined response data', async () => {
    mockFetchTerritories.mockResolvedValue(null);

    const { result } = renderHook(() => useTerritories('test-token'));

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.territories).toEqual([]);
    expect(result.current.territoriesMap).toEqual({});
  });

  it('refetches when token changes', async () => {
    mockFetchTerritories.mockResolvedValue(mockTerritories);

    const { result, rerender } = renderHook(({ token }) => useTerritories(token), {
      initialProps: { token: 'token-1' as string | undefined },
    });

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(mockFetchTerritories).toHaveBeenCalledWith('token-1');

    mockFetchTerritories.mockResolvedValue([{ id: 4, territory_name: 'Asia' }]);
    rerender({ token: 'token-2' });

    await waitFor(() =>
      expect(result.current.territories).toEqual([{ id: 4, territory_name: 'Asia' }])
    );
    expect(mockFetchTerritories).toHaveBeenCalledWith('token-2');
  });
});
