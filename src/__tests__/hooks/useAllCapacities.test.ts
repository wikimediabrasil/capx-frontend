jest.mock('@/services/capacityService', () => ({
  fetchAllCapacities: jest.fn(),
}));

import { renderHook, waitFor } from '@testing-library/react';
import { useAllCapacities } from '@/hooks/useAllCapacities';
import { fetchAllCapacities } from '@/services/capacityService';

const mockFetchAll = fetchAllCapacities as jest.Mock;

describe('useAllCapacities', () => {
  beforeEach(() => jest.clearAllMocks());

  it('returns empty array and loading false when no token', () => {
    const { result } = renderHook(() => useAllCapacities(undefined));
    expect(result.current.allCapacities).toEqual([]);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('fetches capacities when token is provided', async () => {
    const mockData = [{ code: 1, name: 'Test' }];
    mockFetchAll.mockResolvedValue(mockData);

    const { result } = renderHook(() => useAllCapacities('test-token'));

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.allCapacities).toEqual(mockData);
    expect(mockFetchAll).toHaveBeenCalledWith('test-token');
  });

  it('handles fetch error', async () => {
    mockFetchAll.mockRejectedValue(new Error('Network error'));

    const { result } = renderHook(() => useAllCapacities('test-token'));

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).toBe('Network error');
    expect(result.current.allCapacities).toEqual([]);
  });

  it('handles null response data', async () => {
    mockFetchAll.mockResolvedValue(null);

    const { result } = renderHook(() => useAllCapacities('test-token'));

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.allCapacities).toEqual([]);
  });
});
