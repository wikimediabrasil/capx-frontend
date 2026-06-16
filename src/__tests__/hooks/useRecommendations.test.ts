jest.mock('next-auth/react', () => ({
  useSession: jest.fn(),
}));

jest.mock('@tanstack/react-query', () => ({
  useQuery: jest.fn(),
}));

jest.mock('@/services/recommendationService', () => ({
  recommendationService: {
    getRecommendations: jest.fn(),
  },
}));

import { renderHook } from '@testing-library/react';
import { useRecommendations } from '@/hooks/useRecommendations';
import { useSession } from 'next-auth/react';
import { useQuery } from '@tanstack/react-query';

const mockUseSession = useSession as jest.Mock;
const mockUseQuery = useQuery as jest.Mock;

const mockRecommendationsData = {
  users: [
    { id: 1, username: 'user1' },
    { id: 2, username: 'user2' },
  ],
  organizations: [{ id: 10, display_name: 'Org 1' }],
};

describe('useRecommendations', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseSession.mockReturnValue({
      data: { user: { token: 'test-token' } },
      status: 'authenticated',
    });
    mockUseQuery.mockReturnValue({
      data: undefined,
      isLoading: false,
      error: null,
    });
  });

  it('returns initial state with null data', () => {
    const { result } = renderHook(() => useRecommendations());

    expect(result.current.data).toBeNull();
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('calls useQuery with correct parameters when token is present', () => {
    renderHook(() => useRecommendations());

    expect(mockUseQuery).toHaveBeenCalledWith(
      expect.objectContaining({
        queryKey: ['recommendations', 'test-token'],
        enabled: true,
        staleTime: 1000 * 60 * 5,
        gcTime: 1000 * 60 * 30,
        refetchOnWindowFocus: false,
        refetchOnMount: false,
        retry: 1,
      })
    );
  });

  it('disables query when no token', () => {
    mockUseSession.mockReturnValue({ data: null, status: 'unauthenticated' });

    renderHook(() => useRecommendations());

    expect(mockUseQuery).toHaveBeenCalledWith(
      expect.objectContaining({
        enabled: false,
      })
    );
  });

  it('returns data when query succeeds', () => {
    mockUseQuery.mockReturnValue({
      data: mockRecommendationsData,
      isLoading: false,
      error: null,
    });

    const { result } = renderHook(() => useRecommendations());

    expect(result.current.data).toEqual(mockRecommendationsData);
  });

  it('returns loading state correctly', () => {
    mockUseQuery.mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
    });

    const { result } = renderHook(() => useRecommendations());

    expect(result.current.isLoading).toBe(true);
    expect(result.current.data).toBeNull();
  });

  it('returns error state correctly', () => {
    const mockError = new Error('Failed to fetch recommendations');
    mockUseQuery.mockReturnValue({
      data: undefined,
      isLoading: false,
      error: mockError,
    });

    const { result } = renderHook(() => useRecommendations());

    expect(result.current.error).toEqual(mockError);
    expect(result.current.data).toBeNull();
  });

  it('returns null error when no error from query', () => {
    mockUseQuery.mockReturnValue({
      data: mockRecommendationsData,
      isLoading: false,
      error: null,
    });

    const { result } = renderHook(() => useRecommendations());

    expect(result.current.error).toBeNull();
  });

  it('queryFn throws when no token', async () => {
    mockUseSession.mockReturnValue({ data: null, status: 'unauthenticated' });

    let capturedQueryFn: (() => Promise<any>) | undefined;
    mockUseQuery.mockImplementation(options => {
      capturedQueryFn = options.queryFn;
      return { data: undefined, isLoading: false, error: null };
    });

    renderHook(() => useRecommendations());

    await expect(capturedQueryFn!()).rejects.toThrow('No token available');
  });
});
