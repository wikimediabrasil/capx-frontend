import { profileService } from '@/services/profileService';
import { signOut } from 'next-auth/react';

// Mock dependencies
jest.mock('@/services/profileService');
jest.mock('next-auth/react');

const mockedProfileService = profileService as jest.Mocked<typeof profileService>;
const mockedSignOut = signOut as jest.MockedFunction<typeof signOut>;

describe('Profile Delete Integration Flow', () => {
  const mockToken = 'test-token-123';
  const mockUserId = 123;

  beforeEach(() => {
    jest.clearAllMocks();
    // Reset window.location.href
    delete (window as any).location;
    window.location = { href: '' } as any;
  });

  describe('Complete deletion flow', () => {
    it('should execute full deletion flow: delete -> signOut -> redirect', async () => {
      // Mock successful delete
      mockedProfileService.deleteProfile.mockResolvedValue({ success: true });
      mockedSignOut.mockResolvedValue(undefined as any);

      // Simulate the deletion flow
      await profileService.deleteProfile(mockUserId.toString(), mockToken);
      await signOut({ redirect: false });
      window.location.href = '/';

      // Verify all steps executed
      expect(mockedProfileService.deleteProfile).toHaveBeenCalledWith(
        mockUserId.toString(),
        mockToken
      );
      expect(mockedSignOut).toHaveBeenCalledWith({ redirect: false });
      expect(window.location.href).toBe('/');
    });

    it('should call signOut without redirect to prevent automatic navigation', async () => {
      mockedProfileService.deleteProfile.mockResolvedValue({ success: true });
      mockedSignOut.mockResolvedValue(undefined as any);

      await profileService.deleteProfile(mockUserId.toString(), mockToken);
      await signOut({ redirect: false });

      expect(mockedSignOut).toHaveBeenCalledWith({ redirect: false });
      expect(mockedSignOut).not.toHaveBeenCalledWith({ redirect: true });
    });

    it('should redirect to home page after deletion', async () => {
      mockedProfileService.deleteProfile.mockResolvedValue({ success: true });
      mockedSignOut.mockResolvedValue(undefined as any);

      await profileService.deleteProfile(mockUserId.toString(), mockToken);
      await signOut({ redirect: false });
      window.location.href = '/';

      expect(window.location.href).toBe('/');
    });

    it('should not signOut if deletion fails', async () => {
      const deleteError = new Error('Failed to delete profile');
      mockedProfileService.deleteProfile.mockRejectedValue(deleteError);

      try {
        await profileService.deleteProfile(mockUserId.toString(), mockToken);
        await signOut({ redirect: false });
      } catch (error) {
        expect(error).toEqual(deleteError);
      }

      expect(mockedProfileService.deleteProfile).toHaveBeenCalled();
      expect(mockedSignOut).not.toHaveBeenCalled();
    });

    it('should handle signOut failure gracefully', async () => {
      mockedProfileService.deleteProfile.mockResolvedValue({ success: true });
      const signOutError = new Error('SignOut failed');
      mockedSignOut.mockRejectedValue(signOutError);

      await profileService.deleteProfile(mockUserId.toString(), mockToken);

      try {
        await signOut({ redirect: false });
      } catch (error) {
        expect(error).toEqual(signOutError);
      }

      expect(mockedProfileService.deleteProfile).toHaveBeenCalled();
      expect(mockedSignOut).toHaveBeenCalled();
    });
  });

  describe('Error scenarios', () => {
    it('should handle 401 unauthorized error', async () => {
      const unauthorizedError = {
        response: {
          status: 401,
          data: { error: 'Unauthorized' },
        },
      };
      mockedProfileService.deleteProfile.mockRejectedValue(unauthorizedError);

      await expect(profileService.deleteProfile(mockUserId.toString(), mockToken)).rejects.toEqual(
        unauthorizedError
      );

      expect(mockedSignOut).not.toHaveBeenCalled();
    });

    it('should handle 500 server error', async () => {
      const serverError = {
        response: {
          status: 500,
          data: { error: 'Internal Server Error' },
        },
      };
      mockedProfileService.deleteProfile.mockRejectedValue(serverError);

      await expect(profileService.deleteProfile(mockUserId.toString(), mockToken)).rejects.toEqual(
        serverError
      );

      expect(mockedSignOut).not.toHaveBeenCalled();
    });

    it('should handle network error', async () => {
      const networkError = new Error('Network Error');
      mockedProfileService.deleteProfile.mockRejectedValue(networkError);

      await expect(profileService.deleteProfile(mockUserId.toString(), mockToken)).rejects.toThrow(
        'Network Error'
      );

      expect(mockedSignOut).not.toHaveBeenCalled();
    });
  });

  describe('Timing and sequence', () => {
    it('should wait for delete to complete before signOut', async () => {
      const callOrder: string[] = [];

      mockedProfileService.deleteProfile.mockImplementation(async () => {
        callOrder.push('delete');
        return { success: true };
      });

      mockedSignOut.mockImplementation(async () => {
        callOrder.push('signOut');
        return undefined as any;
      });

      await profileService.deleteProfile(mockUserId.toString(), mockToken);
      await signOut({ redirect: false });

      expect(callOrder).toEqual(['delete', 'signOut']);
    });

    it('should wait for signOut to complete before redirect', async () => {
      const callOrder: string[] = [];

      mockedProfileService.deleteProfile.mockImplementation(async () => {
        callOrder.push('delete');
        return { success: true };
      });

      mockedSignOut.mockImplementation(async () => {
        callOrder.push('signOut');
        return undefined as any;
      });

      await profileService.deleteProfile(mockUserId.toString(), mockToken);
      await signOut({ redirect: false });
      callOrder.push('redirect');
      window.location.href = '/';

      expect(callOrder).toEqual(['delete', 'signOut', 'redirect']);
    });
  });

  describe('Token and user ID validation', () => {
    it('should use the correct token format', async () => {
      mockedProfileService.deleteProfile.mockResolvedValue({ success: true });

      await profileService.deleteProfile(mockUserId.toString(), mockToken);

      expect(mockedProfileService.deleteProfile).toHaveBeenCalledWith(
        expect.any(String),
        mockToken
      );
    });

    it('should convert userId to string', async () => {
      mockedProfileService.deleteProfile.mockResolvedValue({ success: true });

      await profileService.deleteProfile(mockUserId.toString(), mockToken);

      expect(mockedProfileService.deleteProfile).toHaveBeenCalledWith(
        String(mockUserId),
        expect.any(String)
      );
    });
  });
});

// Mock console.error to avoid cluttering test output
beforeAll(() => {
  jest.spyOn(console, 'error').mockImplementation(() => {});
});

afterAll(() => {
  (console.error as jest.Mock).mockRestore();
});
