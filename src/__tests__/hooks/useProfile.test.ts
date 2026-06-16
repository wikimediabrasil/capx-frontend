jest.mock('@tanstack/react-query', () => ({
  useQuery: jest.fn(),
  useQueryClient: jest.fn(),
}));

jest.mock('@/services/profileService', () => ({
  profileService: {
    fetchUserProfile: jest.fn(),
    updateProfile: jest.fn(),
    deleteProfile: jest.fn(),
  },
}));

import { renderHook, act } from '@testing-library/react';
import { useProfile } from '@/hooks/useProfile';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { profileService } from '@/services/profileService';

const mockUseQuery = useQuery as jest.Mock;
const mockUseQueryClient = useQueryClient as jest.Mock;
const mockProfileService = profileService as jest.Mocked<typeof profileService>;

const mockInvalidateQueries = jest.fn();
const mockSetQueryData = jest.fn();
const mockRemoveQueries = jest.fn();
const mockQueryClient = {
  invalidateQueries: mockInvalidateQueries,
  setQueryData: mockSetQueryData,
  removeQueries: mockRemoveQueries,
};

const mockProfile = {
  user: { id: 42, username: 'testuser' },
  avatar: 1,
  skills_available: ['writing'],
  skills_wanted: ['coding'],
  language: [],
  territory: [1],
};

describe('useProfile', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseQueryClient.mockReturnValue(mockQueryClient);
    mockUseQuery.mockReturnValue({
      data: undefined,
      isLoading: false,
      error: null,
      refetch: jest.fn(),
    });
  });

  it('returns initial state correctly', () => {
    const { result } = renderHook(() => useProfile('test-token', 42));

    expect(result.current.profile).toBeUndefined();
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(typeof result.current.refetch).toBe('function');
    expect(typeof result.current.updateProfile).toBe('function');
    expect(typeof result.current.deleteProfile).toBe('function');
  });

  it('calls useQuery with correct parameters', () => {
    renderHook(() => useProfile('test-token', 42));

    expect(mockUseQuery).toHaveBeenCalledWith(
      expect.objectContaining({
        queryKey: ['profile', 'test-token', 42],
        enabled: true,
      })
    );
  });

  it('disables query when no token', () => {
    renderHook(() => useProfile(undefined, 42));

    expect(mockUseQuery).toHaveBeenCalledWith(
      expect.objectContaining({
        enabled: false,
      })
    );
  });

  it('disables query when no userId', () => {
    renderHook(() => useProfile('test-token', undefined));

    expect(mockUseQuery).toHaveBeenCalledWith(
      expect.objectContaining({
        enabled: false,
      })
    );
  });

  it('returns profile data when query succeeds', () => {
    mockUseQuery.mockReturnValue({
      data: mockProfile,
      isLoading: false,
      error: null,
      refetch: jest.fn(),
    });

    const { result } = renderHook(() => useProfile('test-token', 42));

    expect(result.current.profile).toEqual(mockProfile);
  });

  it('returns loading state', () => {
    mockUseQuery.mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
      refetch: jest.fn(),
    });

    const { result } = renderHook(() => useProfile('test-token', 42));

    expect(result.current.isLoading).toBe(true);
  });

  it('returns error state', () => {
    const mockError = new Error('Fetch failed');
    mockUseQuery.mockReturnValue({
      data: undefined,
      isLoading: false,
      error: mockError,
      refetch: jest.fn(),
    });

    const { result } = renderHook(() => useProfile('test-token', 42));

    expect(result.current.error).toEqual(mockError);
  });

  it('queryFn throws when no token', async () => {
    let capturedQueryFn: (() => Promise<any>) | undefined;
    mockUseQuery.mockImplementation(options => {
      capturedQueryFn = options.queryFn;
      return { data: undefined, isLoading: false, error: null, refetch: jest.fn() };
    });

    renderHook(() => useProfile(undefined, 42));

    await expect(capturedQueryFn!()).rejects.toThrow('Token or userId is missing');
  });

  it('queryFn finds profile matching userId with avatar', async () => {
    let capturedQueryFn: (() => Promise<any>) | undefined;
    mockUseQuery.mockImplementation(options => {
      capturedQueryFn = options.queryFn;
      return { data: undefined, isLoading: false, error: null, refetch: jest.fn() };
    });

    const profiles = [
      { user: { id: 1 }, avatar: null },
      { user: { id: 42 }, avatar: null },
      { user: { id: 42 }, avatar: 5 },
    ];
    mockProfileService.fetchUserProfile.mockResolvedValue(profiles as any);

    renderHook(() => useProfile('test-token', 42));

    const result = await capturedQueryFn!();
    // Should prefer the one with avatar
    expect(result).toEqual({ user: { id: 42 }, avatar: 5 });
  });

  it('queryFn falls back to profile without avatar when none has avatar', async () => {
    let capturedQueryFn: (() => Promise<any>) | undefined;
    mockUseQuery.mockImplementation(options => {
      capturedQueryFn = options.queryFn;
      return { data: undefined, isLoading: false, error: null, refetch: jest.fn() };
    });

    const profiles = [
      { user: { id: 1 }, avatar: null },
      { user: { id: 42 }, avatar: null },
    ];
    mockProfileService.fetchUserProfile.mockResolvedValue(profiles as any);

    renderHook(() => useProfile('test-token', 42));

    const result = await capturedQueryFn!();
    expect(result).toEqual({ user: { id: 42 }, avatar: null });
  });

  it('queryFn returns non-array response directly', async () => {
    let capturedQueryFn: (() => Promise<any>) | undefined;
    mockUseQuery.mockImplementation(options => {
      capturedQueryFn = options.queryFn;
      return { data: undefined, isLoading: false, error: null, refetch: jest.fn() };
    });

    mockProfileService.fetchUserProfile.mockResolvedValue(mockProfile as any);

    renderHook(() => useProfile('test-token', 42));

    const result = await capturedQueryFn!();
    expect(result).toEqual(mockProfile);
  });

  it('updateProfile throws when no token', async () => {
    const { result } = renderHook(() => useProfile(undefined, 42));

    await act(async () => {
      await expect(result.current.updateProfile({ skills_available: ['coding'] })).rejects.toThrow(
        'No token or userId available'
      );
    });
  });

  it('updateProfile calls service and invalidates queries', async () => {
    const updatedProfile = { ...mockProfile, skills_available: ['coding'] };
    mockProfileService.updateProfile.mockResolvedValue(updatedProfile as any);

    const { result } = renderHook(() => useProfile('test-token', 42));

    await act(async () => {
      await result.current.updateProfile({ skills_available: ['coding'] });
    });

    expect(mockProfileService.updateProfile).toHaveBeenCalledWith(
      42,
      { skills_available: ['coding'] },
      expect.objectContaining({
        headers: { Authorization: 'Token test-token' },
      })
    );
    expect(mockInvalidateQueries).toHaveBeenCalledWith({ queryKey: ['profile', 'test-token', 42] });
    expect(mockInvalidateQueries).toHaveBeenCalledWith({ queryKey: ['users'] });
    expect(mockInvalidateQueries).toHaveBeenCalledWith({ queryKey: ['userProfile'] });
    expect(mockInvalidateQueries).toHaveBeenCalledWith({
      queryKey: ['userProfile', 42, 'test-token'],
    });
    expect(mockSetQueryData).toHaveBeenCalledWith(['profile', 'test-token', 42], updatedProfile);
  });

  it('updateProfile uses last element when response is array', async () => {
    const profiles = [{ user: { id: 42 } }, { user: { id: 42 }, avatar: 7 }];
    mockProfileService.updateProfile.mockResolvedValue(profiles as any);

    const { result } = renderHook(() => useProfile('test-token', 42));

    await act(async () => {
      await result.current.updateProfile({});
    });

    expect(mockSetQueryData).toHaveBeenCalledWith(['profile', 'test-token', 42], {
      user: { id: 42 },
      avatar: 7,
    });
  });

  it('deleteProfile throws when no token', async () => {
    const { result } = renderHook(() => useProfile(undefined, 42));

    await act(async () => {
      await expect(result.current.deleteProfile()).rejects.toThrow('No token or userId available');
    });
  });

  it('deleteProfile calls service and removes queries', async () => {
    mockProfileService.deleteProfile.mockResolvedValue(undefined as any);

    const { result } = renderHook(() => useProfile('test-token', 42));

    await act(async () => {
      await result.current.deleteProfile();
    });

    expect(mockProfileService.deleteProfile).toHaveBeenCalledWith('42', 'test-token');
    expect(mockRemoveQueries).toHaveBeenCalledWith({ queryKey: ['profile', 'test-token', 42] });
    expect(mockRemoveQueries).toHaveBeenCalledWith({ queryKey: ['users'] });
    expect(mockRemoveQueries).toHaveBeenCalledWith({ queryKey: ['userProfile'] });
    expect(mockRemoveQueries).toHaveBeenCalledWith({
      queryKey: ['userProfile', 42, 'test-token'],
    });
  });
});
