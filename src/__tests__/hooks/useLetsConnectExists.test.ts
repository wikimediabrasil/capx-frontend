import { renderHook } from '@testing-library/react';
import { useLetsConnectExists } from '@/hooks/useLetsConnectExists';

jest.mock('next-auth/react', () => ({
  useSession: jest.fn(() => ({
    data: { user: { token: 'test-token', name: 'testuser' } },
    status: 'authenticated',
  })),
}));

jest.mock('@tanstack/react-query', () => ({
  useQuery: jest.fn(() => ({
    data: undefined,
    isLoading: false,
    error: null,
    refetch: jest.fn(),
  })),
  useMutation: jest.fn(() => ({
    mutate: jest.fn(),
    mutateAsync: jest.fn(),
    isLoading: false,
  })),
  useQueryClient: jest.fn(() => ({
    invalidateQueries: jest.fn(),
    setQueryData: jest.fn(),
  })),
}));

jest.mock('@/services/letsConnectExistsService', () => ({
  LetsConnectExistsService: {
    checkUserExists: jest.fn(),
  },
}));

import { useSession } from 'next-auth/react';
import { useQuery } from '@tanstack/react-query';

const mockUseSession = useSession as jest.Mock;
const mockUseQuery = useQuery as jest.Mock;

describe('useLetsConnectExists', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    mockUseSession.mockReturnValue({
      data: { user: { token: 'test-token', name: 'testuser' } },
      status: 'authenticated',
    });

    mockUseQuery.mockReturnValue({
      data: undefined,
      isLoading: false,
      error: null,
      refetch: jest.fn(),
    });
  });

  it('returns hasLetsConnectAccount as false when data is undefined', () => {
    const { result } = renderHook(() => useLetsConnectExists());
    expect(result.current.hasLetsConnectAccount).toBe(false);
  });

  it('returns hasLetsConnectAccount as true when exists is true in data', () => {
    mockUseQuery.mockReturnValue({
      data: { exists: true },
      isLoading: false,
      error: null,
      refetch: jest.fn(),
    });

    const { result } = renderHook(() => useLetsConnectExists());
    expect(result.current.hasLetsConnectAccount).toBe(true);
  });

  it('returns hasLetsConnectAccount as false when exists is false in data', () => {
    mockUseQuery.mockReturnValue({
      data: { exists: false },
      isLoading: false,
      error: null,
      refetch: jest.fn(),
    });

    const { result } = renderHook(() => useLetsConnectExists());
    expect(result.current.hasLetsConnectAccount).toBe(false);
  });

  it('returns isLoading state from useQuery', () => {
    mockUseQuery.mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
      refetch: jest.fn(),
    });

    const { result } = renderHook(() => useLetsConnectExists());
    expect(result.current.isLoading).toBe(true);
  });

  it('returns error state from useQuery', () => {
    const testError = new Error('Network error');
    mockUseQuery.mockReturnValue({
      data: undefined,
      isLoading: false,
      error: testError,
      refetch: jest.fn(),
    });

    const { result } = renderHook(() => useLetsConnectExists());
    expect(result.current.error).toBe(testError);
  });

  it('exposes a refetch function', () => {
    const mockRefetch = jest.fn();
    mockUseQuery.mockReturnValue({
      data: undefined,
      isLoading: false,
      error: null,
      refetch: mockRefetch,
    });

    const { result } = renderHook(() => useLetsConnectExists());
    expect(result.current.refetch).toBe(mockRefetch);
  });

  it('calls useQuery with the correct query key using session username', () => {
    mockUseSession.mockReturnValue({
      data: { user: { token: 'my-token', name: 'myuser' } },
      status: 'authenticated',
    });

    renderHook(() => useLetsConnectExists());

    expect(mockUseQuery).toHaveBeenCalledWith(
      expect.objectContaining({
        queryKey: ['letsConnectExists', 'myuser'],
      })
    );
  });

  it('disables query when username is not available', () => {
    mockUseSession.mockReturnValue({
      data: null,
      status: 'unauthenticated',
    });

    renderHook(() => useLetsConnectExists());

    expect(mockUseQuery).toHaveBeenCalledWith(
      expect.objectContaining({
        enabled: false,
      })
    );
  });

  it('enables query when username is available', () => {
    mockUseSession.mockReturnValue({
      data: { user: { token: 'test-token', name: 'testuser' } },
      status: 'authenticated',
    });

    renderHook(() => useLetsConnectExists());

    expect(mockUseQuery).toHaveBeenCalledWith(
      expect.objectContaining({
        enabled: true,
      })
    );
  });
});
