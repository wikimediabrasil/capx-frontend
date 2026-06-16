import { renderHook, act } from '@testing-library/react';
import { useManagerStatus } from '@/hooks/useManagerStatus';

jest.mock('@/hooks/useUserProfile', () => ({
  useUserProfile: jest.fn(() => ({
    userProfile: null,
    isLoading: true,
    error: null,
  })),
}));

import { useUserProfile } from '@/hooks/useUserProfile';

const mockUseUserProfile = useUserProfile as jest.Mock;

describe('useManagerStatus', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns loading state while profile is loading', () => {
    mockUseUserProfile.mockReturnValue({
      userProfile: null,
      isLoading: true,
      error: null,
    });

    const { result } = renderHook(() => useManagerStatus());

    expect(result.current.isLoading).toBe(true);
    expect(result.current.managedOrganizations).toEqual([]);
  });

  it('returns empty managedOrganizations when profile has no is_manager field', () => {
    mockUseUserProfile.mockReturnValue({
      userProfile: { id: 1, username: 'testuser' },
      isLoading: false,
      error: null,
    });

    const { result } = renderHook(() => useManagerStatus());

    expect(result.current.managedOrganizations).toEqual([]);
    expect(result.current.isLoading).toBe(false);
  });

  it('returns managed organizations from userProfile.is_manager', () => {
    mockUseUserProfile.mockReturnValue({
      userProfile: { id: 1, username: 'testuser', is_manager: [10, 20, 30] },
      isLoading: false,
      error: null,
    });

    const { result } = renderHook(() => useManagerStatus());

    expect(result.current.managedOrganizations).toEqual([10, 20, 30]);
    expect(result.current.isLoading).toBe(false);
  });

  it('returns empty array when is_manager is an empty array', () => {
    mockUseUserProfile.mockReturnValue({
      userProfile: { id: 1, username: 'testuser', is_manager: [] },
      isLoading: false,
      error: null,
    });

    const { result } = renderHook(() => useManagerStatus());

    expect(result.current.managedOrganizations).toEqual([]);
    expect(result.current.isLoading).toBe(false);
  });

  it('stays in loading state while profileLoading is true even with a profile', () => {
    mockUseUserProfile.mockReturnValue({
      userProfile: { id: 1, is_manager: [5] },
      isLoading: true,
      error: null,
    });

    const { result } = renderHook(() => useManagerStatus());

    // isLoading should reflect the OR of hook's own loading and profileLoading
    expect(result.current.isLoading).toBe(true);
  });

  it('updates managed organizations when userProfile changes', () => {
    mockUseUserProfile.mockReturnValue({
      userProfile: null,
      isLoading: true,
      error: null,
    });

    const { result, rerender } = renderHook(() => useManagerStatus());

    expect(result.current.managedOrganizations).toEqual([]);

    mockUseUserProfile.mockReturnValue({
      userProfile: { id: 1, is_manager: [42, 99] },
      isLoading: false,
      error: null,
    });

    rerender();

    expect(result.current.managedOrganizations).toEqual([42, 99]);
    expect(result.current.isLoading).toBe(false);
  });

  it('handles null userProfile gracefully', () => {
    mockUseUserProfile.mockReturnValue({
      userProfile: null,
      isLoading: false,
      error: null,
    });

    const { result } = renderHook(() => useManagerStatus());

    // When profile is null and not loading, the useEffect won't run the setters
    // so managedOrganizations stays at its initial value
    expect(result.current.managedOrganizations).toEqual([]);
  });
});
