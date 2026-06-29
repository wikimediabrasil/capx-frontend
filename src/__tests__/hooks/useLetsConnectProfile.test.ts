jest.mock('next-auth/react', () => ({
  useSession: jest.fn(() => ({
    data: { user: { token: 'test-token', name: 'testuser' } },
    status: 'authenticated',
  })),
}));

jest.mock('@/services/letsConnectService', () => ({
  LetsConnectService: {
    submitLetsConnectForm: jest.fn(),
    getLetsConnectProfile: jest.fn(),
  },
}));

import { renderHook, act, waitFor } from '@testing-library/react';
import { useLetsConnect } from '@/hooks/useLetsConnectProfile';
import { LetsConnectService } from '@/services/letsConnectService';

const mockSubmit = LetsConnectService.submitLetsConnectForm as jest.Mock;
const mockGetProfile = LetsConnectService.getLetsConnectProfile as jest.Mock;

describe('useLetsConnect', () => {
  beforeEach(() => jest.clearAllMocks());

  it('fetches profile data on mount', async () => {
    const mockProfile = { id: 1, username: 'testuser' };
    mockGetProfile.mockResolvedValue(mockProfile);

    const { result } = renderHook(() => useLetsConnect());

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.letsConnectData).toEqual(mockProfile);
  });

  it('handles fetch profile error', async () => {
    mockGetProfile.mockRejectedValue(new Error('Network error'));

    const { result } = renderHook(() => useLetsConnect());

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.error).toContain('Failed to fetch LetsConnect data');
  });

  it('submitLetsConnectForm calls service', async () => {
    mockGetProfile.mockResolvedValue(null);
    const mockResponse = { id: 1 };
    mockSubmit.mockResolvedValue(mockResponse);

    const { result } = renderHook(() => useLetsConnect());

    let response;
    await act(async () => {
      response = await result.current.submitLetsConnectForm({ type: 'mentor' });
    });

    expect(response).toEqual(mockResponse);
    expect(result.current.isSubmitting).toBe(false);
  });

  it('submitLetsConnectForm handles error', async () => {
    mockGetProfile.mockResolvedValue(null);
    mockSubmit.mockRejectedValue(new Error('Submit failed'));

    const { result } = renderHook(() => useLetsConnect());

    await expect(
      act(async () => {
        await result.current.submitLetsConnectForm({ type: 'mentor' });
      })
    ).rejects.toThrow('Submit failed');
  });

  it('manages showTypeSelector state', () => {
    mockGetProfile.mockResolvedValue(null);
    const { result } = renderHook(() => useLetsConnect());

    expect(result.current.showTypeSelector).toBe(false);
    act(() => result.current.setShowTypeSelector(true));
    expect(result.current.showTypeSelector).toBe(true);
  });
});
