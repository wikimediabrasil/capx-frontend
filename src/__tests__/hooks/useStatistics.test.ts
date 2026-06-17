jest.mock('next-auth/react', () => ({
  useSession: jest.fn(),
}));

jest.mock('@/services/statisticsService', () => ({
  statisticsService: {
    fetchStatistics: jest.fn(),
  },
}));

import { renderHook, waitFor } from '@testing-library/react';
import { useStatistics } from '@/hooks/useStatistics';
import { useSession } from 'next-auth/react';
import { statisticsService } from '@/services/statisticsService';

const mockUseSession = useSession as jest.Mock;
const mockStatisticsService = statisticsService as jest.Mocked<typeof statisticsService>;

const mockStatisticsData = {
  total_users: 1500,
  total_capacities: 300,
  total_languages: 50,
  total_territories: 8,
};

describe('useStatistics', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseSession.mockReturnValue({
      data: { user: { token: 'test-token' } },
      status: 'authenticated',
    });
  });

  it('starts in loading state', () => {
    mockStatisticsService.fetchStatistics.mockResolvedValue(mockStatisticsData as any);

    const { result } = renderHook(() => useStatistics());

    expect(result.current.isLoading).toBe(true);
    expect(result.current.data).toBeNull();
    expect(result.current.error).toBeNull();
  });

  it('fetches statistics and returns data when authenticated', async () => {
    mockStatisticsService.fetchStatistics.mockResolvedValue(mockStatisticsData as any);

    const { result } = renderHook(() => useStatistics());

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.data).toEqual(mockStatisticsData);
    expect(result.current.error).toBeNull();
    expect(mockStatisticsService.fetchStatistics).toHaveBeenCalledWith(
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: 'Token test-token',
        }),
      })
    );
  });

  it('fetches statistics without auth config when no token', async () => {
    mockUseSession.mockReturnValue({ data: null, status: 'unauthenticated' });
    mockStatisticsService.fetchStatistics.mockResolvedValue(mockStatisticsData as any);

    const { result } = renderHook(() => useStatistics());

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(mockStatisticsService.fetchStatistics).toHaveBeenCalledWith(undefined);
    expect(result.current.data).toEqual(mockStatisticsData);
  });

  it('handles fetch error correctly', async () => {
    const mockError = new Error('Statistics fetch failed');
    mockStatisticsService.fetchStatistics.mockRejectedValue(mockError);

    const { result } = renderHook(() => useStatistics());

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.error).toEqual(mockError);
    expect(result.current.data).toBeNull();
  });

  it('wraps non-Error thrown values in an Error', async () => {
    mockStatisticsService.fetchStatistics.mockRejectedValue('something went wrong');

    const { result } = renderHook(() => useStatistics());

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.error).toBeInstanceOf(Error);
    expect(result.current.error?.message).toBe('Failed to fetch statistics');
  });

  it('refetches when session token changes', async () => {
    mockStatisticsService.fetchStatistics.mockResolvedValue(mockStatisticsData as any);

    const { result, rerender } = renderHook(() => useStatistics());

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(mockStatisticsService.fetchStatistics).toHaveBeenCalledTimes(1);

    // Simulate token change
    mockUseSession.mockReturnValue({
      data: { user: { token: 'new-token' } },
      status: 'authenticated',
    });
    rerender();

    await waitFor(() => expect(mockStatisticsService.fetchStatistics).toHaveBeenCalledTimes(2));
  });

  it('passes Cache-Control and Pragma headers when token is available', async () => {
    mockStatisticsService.fetchStatistics.mockResolvedValue(mockStatisticsData as any);

    const { result } = renderHook(() => useStatistics());

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(mockStatisticsService.fetchStatistics).toHaveBeenCalledWith(
      expect.objectContaining({
        headers: expect.objectContaining({
          'Cache-Control': 'no-cache',
          Pragma: 'no-cache',
        }),
      })
    );
  });
});
