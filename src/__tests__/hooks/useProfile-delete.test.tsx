import { renderHook, waitFor } from '@testing-library/react';
import { useProfile } from '@/hooks/useProfile';
import { profileService } from '@/services/profileService';
import { QueryClient } from '@tanstack/react-query';
import {
  createTestQueryClient,
  createQueryWrapper,
  mockConsoleError,
  setupProfileServiceMocks,
  createMockProfile,
} from '../test-utils';

// Mock profileService
jest.mock('@/services/profileService');
const mockedProfileService = profileService as jest.Mocked<typeof profileService>;

describe('useProfile.deleteProfile', () => {
  const mockToken = 'test-token-123';
  const mockUserId = 123;
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = createTestQueryClient();
    jest.clearAllMocks();
  });

  afterEach(() => {
    queryClient.clear();
  });

  it('should successfully delete profile', async () => {
    setupProfileServiceMocks(mockedProfileService, mockUserId);

    const { result } = renderHook(() => useProfile(mockToken, mockUserId), {
      wrapper: createQueryWrapper(queryClient),
    });

    // Wait for initial profile fetch
    await waitFor(() => {
      expect(result.current.profile).toBeDefined();
    });

    // Call deleteProfile
    await result.current.deleteProfile();

    expect(mockedProfileService.deleteProfile).toHaveBeenCalledWith(
      mockUserId.toString(),
      mockToken
    );
  });

  it('should remove queries from cache after deletion', async () => {
    setupProfileServiceMocks(mockedProfileService, mockUserId);

    const { result } = renderHook(() => useProfile(mockToken, mockUserId), {
      wrapper: createQueryWrapper(queryClient),
    });

    await waitFor(() => {
      expect(result.current.profile).toBeDefined();
    });

    // Verify cache has data before deletion
    const cachedDataBefore = queryClient.getQueryData(['profile', mockToken, mockUserId]);
    expect(cachedDataBefore).toBeDefined();

    // Delete profile
    await result.current.deleteProfile();

    // Verify cache is cleared after deletion
    await waitFor(() => {
      const cachedDataAfter = queryClient.getQueryData(['profile', mockToken, mockUserId]);
      expect(cachedDataAfter).toBeUndefined();
    });
  });

  it('should throw error when token is missing', async () => {
    const { result } = renderHook(() => useProfile(undefined, mockUserId), {
      wrapper: createQueryWrapper(queryClient),
    });

    await expect(result.current.deleteProfile()).rejects.toThrow('No token or userId available');
  });

  it('should throw error when userId is missing', async () => {
    const { result } = renderHook(() => useProfile(mockToken, undefined), {
      wrapper: createQueryWrapper(queryClient),
    });

    await expect(result.current.deleteProfile()).rejects.toThrow('No token or userId available');
  });

  it('should handle deletion error', async () => {
    const deleteError = new Error('Failed to delete profile');
    mockedProfileService.deleteProfile.mockRejectedValue(deleteError);
    mockedProfileService.fetchUserProfile.mockResolvedValue(createMockProfile(mockUserId));

    const { result } = renderHook(() => useProfile(mockToken, mockUserId), {
      wrapper: createQueryWrapper(queryClient),
    });

    await waitFor(() => {
      expect(result.current.profile).toBeDefined();
    });

    await expect(result.current.deleteProfile()).rejects.toThrow('Failed to delete profile');
  });

  it('should not refetch profile after deletion', async () => {
    setupProfileServiceMocks(mockedProfileService, mockUserId);

    const { result } = renderHook(() => useProfile(mockToken, mockUserId), {
      wrapper: createQueryWrapper(queryClient),
    });

    await waitFor(() => {
      expect(result.current.profile).toBeDefined();
    });

    // Reset mock call count
    mockedProfileService.fetchUserProfile.mockClear();

    // Delete profile
    await result.current.deleteProfile();

    // Wait a bit to ensure no refetch happens
    await new Promise(resolve => setTimeout(resolve, 100));

    // Verify fetchUserProfile was not called again
    expect(mockedProfileService.fetchUserProfile).not.toHaveBeenCalled();
  });

  it('should clear all related queries', async () => {
    setupProfileServiceMocks(mockedProfileService, mockUserId);

    // Set some related queries in cache
    queryClient.setQueryData(['users'], [{ id: mockUserId }]);
    queryClient.setQueryData(['userProfile'], { id: mockUserId });
    queryClient.setQueryData(['userProfile', mockUserId, mockToken], { id: mockUserId });

    const { result } = renderHook(() => useProfile(mockToken, mockUserId), {
      wrapper: createQueryWrapper(queryClient),
    });

    await waitFor(() => {
      expect(result.current.profile).toBeDefined();
    });

    // Delete profile
    await result.current.deleteProfile();

    // Verify all related queries are cleared
    await waitFor(() => {
      expect(queryClient.getQueryData(['profile', mockToken, mockUserId])).toBeUndefined();
      expect(queryClient.getQueryData(['users'])).toBeUndefined();
      expect(queryClient.getQueryData(['userProfile'])).toBeUndefined();
      expect(queryClient.getQueryData(['userProfile', mockUserId, mockToken])).toBeUndefined();
    });
  });

  it('should call profileService.deleteProfile with correct parameters', async () => {
    setupProfileServiceMocks(mockedProfileService, mockUserId);

    const { result } = renderHook(() => useProfile(mockToken, mockUserId), {
      wrapper: createQueryWrapper(queryClient),
    });

    await waitFor(() => {
      expect(result.current.profile).toBeDefined();
    });

    await result.current.deleteProfile();

    expect(mockedProfileService.deleteProfile).toHaveBeenCalledTimes(1);
    expect(mockedProfileService.deleteProfile).toHaveBeenCalledWith(
      mockUserId.toString(),
      mockToken
    );
  });
});

mockConsoleError();
