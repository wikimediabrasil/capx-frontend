jest.mock('next-auth/react', () => ({
  useSession: jest.fn(),
}));

jest.mock('@tanstack/react-query', () => ({
  useQuery: jest.fn(),
  useQueryClient: jest.fn(),
}));

jest.mock('@/services/avatarService', () => ({
  avatarService: {
    fetchAvatars: jest.fn(),
    fetchAvatarById: jest.fn(),
  },
}));

import { renderHook, act } from '@testing-library/react';
import { useAvatars } from '@/hooks/useAvatars';
import { useSession } from 'next-auth/react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { avatarService } from '@/services/avatarService';

const mockUseSession = useSession as jest.Mock;
const mockUseQuery = useQuery as jest.Mock;
const mockUseQueryClient = useQueryClient as jest.Mock;
const mockAvatarService = avatarService as jest.Mocked<typeof avatarService>;

const mockSetQueryData = jest.fn();
const mockQueryClient = { setQueryData: mockSetQueryData };

describe('useAvatars', () => {
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
      refetch: jest.fn(),
    });
    mockUseQueryClient.mockReturnValue(mockQueryClient);
  });

  it('returns initial empty state when no data', () => {
    const { result } = renderHook(() => useAvatars());

    expect(result.current.avatars).toEqual([]);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(typeof result.current.getAvatarById).toBe('function');
    expect(typeof result.current.refetch).toBe('function');
  });

  it('calls useQuery with correct parameters including token', () => {
    renderHook(() => useAvatars(10, 0));

    expect(mockUseQuery).toHaveBeenCalledWith(
      expect.objectContaining({
        queryKey: ['avatars', 'test-token', 10, 0],
        enabled: true,
        staleTime: 5 * 60 * 1000,
        retry: 2,
      })
    );
  });

  it('disables query when no token is available', () => {
    mockUseSession.mockReturnValue({ data: null, status: 'unauthenticated' });

    renderHook(() => useAvatars());

    expect(mockUseQuery).toHaveBeenCalledWith(
      expect.objectContaining({
        enabled: false,
      })
    );
  });

  it('returns avatars when data is available', () => {
    const mockAvatars = [
      { id: 1, image: 'avatar1.png' },
      { id: 2, image: 'avatar2.png' },
    ];
    mockUseQuery.mockReturnValue({
      data: mockAvatars,
      isLoading: false,
      error: null,
      refetch: jest.fn(),
    });

    const { result } = renderHook(() => useAvatars());

    expect(result.current.avatars).toEqual(mockAvatars);
  });

  it('returns loading state', () => {
    mockUseQuery.mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
      refetch: jest.fn(),
    });

    const { result } = renderHook(() => useAvatars());

    expect(result.current.isLoading).toBe(true);
  });

  it('returns error state', () => {
    const mockError = new Error('Failed to fetch avatars');
    mockUseQuery.mockReturnValue({
      data: undefined,
      isLoading: false,
      error: mockError,
      refetch: jest.fn(),
    });

    const { result } = renderHook(() => useAvatars());

    expect(result.current.error).toEqual(mockError);
  });

  it('getAvatarById returns null when no token', async () => {
    mockUseSession.mockReturnValue({ data: null, status: 'unauthenticated' });

    const { result } = renderHook(() => useAvatars());

    const avatar = await act(() => result.current.getAvatarById(1));
    expect(avatar).toBeNull();
  });

  it('getAvatarById returns null when id is null', async () => {
    const { result } = renderHook(() => useAvatars());

    const avatar = await act(() => result.current.getAvatarById(null));
    expect(avatar).toBeNull();
  });

  it('getAvatarById returns cached avatar if found in avatars list', async () => {
    const mockAvatars = [{ id: 1, image: 'avatar1.png' }];
    mockUseQuery.mockReturnValue({
      data: mockAvatars,
      isLoading: false,
      error: null,
      refetch: jest.fn(),
    });

    const { result } = renderHook(() => useAvatars());

    const avatar = await act(() => result.current.getAvatarById(1));
    expect(avatar).toEqual({ id: 1, image: 'avatar1.png' });
    expect(mockAvatarService.fetchAvatarById).not.toHaveBeenCalled();
  });

  it('getAvatarById fetches from service when not in cache', async () => {
    const fetchedAvatar = { id: 5, image: 'avatar5.png' };
    mockAvatarService.fetchAvatarById.mockResolvedValue(fetchedAvatar as any);

    const { result } = renderHook(() => useAvatars());

    const avatar = await act(() => result.current.getAvatarById(5));
    expect(avatar).toEqual(fetchedAvatar);
    expect(mockAvatarService.fetchAvatarById).toHaveBeenCalledWith(
      5,
      expect.objectContaining({
        headers: { Authorization: 'Token test-token' },
      })
    );
    expect(mockSetQueryData).toHaveBeenCalled();
  });

  it('getAvatarById returns null on service error', async () => {
    mockAvatarService.fetchAvatarById.mockRejectedValue(new Error('Not found'));

    const { result } = renderHook(() => useAvatars());

    const avatar = await act(() => result.current.getAvatarById(99));
    expect(avatar).toBeNull();
  });
});
