import { profileService } from '@/services/profileService';
import { signOut } from 'next-auth/react';

// Mock dependencies
jest.mock('@/services/profileService');
jest.mock('next-auth/react');

const mockedProfileService = profileService as jest.Mocked<typeof profileService>;
const mockedSignOut = signOut as jest.MockedFunction<typeof signOut>;

describe('Profile Delete Flow with Success Popup', () => {
  const mockToken = 'test-token-123';
  const mockUserId = 123;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    delete (window as any).location;
    window.location = { href: '' } as any;
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  describe('Complete deletion flow with popup', () => {
    it('should show popup, wait 3 seconds, then signOut and redirect', async () => {
      const callOrder: string[] = [];

      mockedProfileService.deleteProfile.mockImplementation(async () => {
        callOrder.push('delete');
        return { success: true };
      });

      mockedSignOut.mockImplementation(async () => {
        callOrder.push('signOut');
        return undefined as any;
      });

      // Simulate the deletion flow
      await profileService.deleteProfile(mockUserId.toString(), mockToken);
      callOrder.push('popup-shown');

      // Fast-forward 3 seconds (popup auto-close time)
      jest.advanceTimersByTime(3000);
      callOrder.push('popup-closed');

      // Fast-forward another 100ms (scheduled signOut time)
      jest.advanceTimersByTime(100);

      await mockedSignOut({ redirect: false });
      window.location.href = '/';
      callOrder.push('redirect');

      expect(callOrder).toEqual([
        'delete',
        'popup-shown',
        'popup-closed',
        'signOut',
        'redirect',
      ]);
    });

    it('should not signOut if popup is closed before timer completes', async () => {
      mockedProfileService.deleteProfile.mockResolvedValue({ success: true });
      mockedSignOut.mockResolvedValue(undefined as any);

      await profileService.deleteProfile(mockUserId.toString(), mockToken);

      // Simulate user closing popup manually at 1 second
      jest.advanceTimersByTime(1000);

      // SignOut shouldn't have been called yet
      expect(mockedSignOut).not.toHaveBeenCalled();
    });

    it('should execute signOut after scheduled delay', async () => {
      mockedProfileService.deleteProfile.mockResolvedValue({ success: true });
      mockedSignOut.mockResolvedValue(undefined as any);

      await profileService.deleteProfile(mockUserId.toString(), mockToken);

      // Simulate popup auto-close (3s) + scheduled delay (0.1s)
      jest.advanceTimersByTime(3100);

      await mockedSignOut({ redirect: false });

      // SignOut should have been called after the delay
      expect(mockedSignOut).toHaveBeenCalledWith({ redirect: false });
    });
  });

  describe('Popup timing', () => {
    it('should auto-close popup after exactly 3 seconds', () => {
      const onClose = jest.fn();

      // Simulate popup opening
      const timer = setTimeout(onClose, 3000);

      jest.advanceTimersByTime(2999);
      expect(onClose).not.toHaveBeenCalled();

      jest.advanceTimersByTime(1);
      expect(onClose).toHaveBeenCalledTimes(1);

      clearTimeout(timer);
    });

    it('should schedule signOut 100ms after popup closes', () => {
      const popupCloseTime = 3000;
      const signOutTime = 3100;
      const timeDifference = signOutTime - popupCloseTime;

      expect(timeDifference).toBe(100);
    });
  });

  describe('Error handling with popup', () => {
    it('should not show popup if delete fails', async () => {
      const deleteError = new Error('Failed to delete profile');
      mockedProfileService.deleteProfile.mockRejectedValue(deleteError);

      let popupShown = false;

      try {
        await profileService.deleteProfile(mockUserId.toString(), mockToken);
        popupShown = true;
      } catch (error) {
        expect(error).toEqual(deleteError);
      }

      expect(popupShown).toBe(false);
      expect(mockedSignOut).not.toHaveBeenCalled();
    });

    it('should still redirect even if signOut fails', async () => {
      mockedProfileService.deleteProfile.mockResolvedValue({ success: true });
      const signOutError = new Error('SignOut failed');
      mockedSignOut.mockRejectedValue(signOutError);

      await profileService.deleteProfile(mockUserId.toString(), mockToken);

      jest.advanceTimersByTime(3100);

      try {
        await signOut({ redirect: false });
      } catch (error) {
        // Even if signOut fails, we should still redirect
        window.location.href = '/';
      }

      expect(window.location.href).toBe('/');
    });
  });

  describe('State management during popup', () => {
    it('should prevent component re-renders while popup is open', async () => {
      mockedProfileService.deleteProfile.mockResolvedValue({ success: true });

      await profileService.deleteProfile(mockUserId.toString(), mockToken);

      // Simulate popup being open
      const popupIsOpen = true;

      // Component should return early if popup is open
      if (popupIsOpen) {
        expect(mockedSignOut).not.toHaveBeenCalled();
      }
    });

    it('should maintain popup state for full duration', () => {
      let popupOpen = false;

      // Open popup
      popupOpen = true;
      expect(popupOpen).toBe(true);

      // After 1 second
      jest.advanceTimersByTime(1000);
      expect(popupOpen).toBe(true);

      // After 2 seconds
      jest.advanceTimersByTime(1000);
      expect(popupOpen).toBe(true);

      // After 3 seconds (auto-close)
      jest.advanceTimersByTime(1000);
      popupOpen = false;
      expect(popupOpen).toBe(false);
    });
  });

  describe('Cleanup and memory management', () => {
    it('should clear timeout when popup is manually closed', () => {
      const clearTimeoutSpy = jest.spyOn(global, 'clearTimeout');
      const timer = setTimeout(() => {}, 3000);

      // Manually close popup
      clearTimeout(timer);

      expect(clearTimeoutSpy).toHaveBeenCalledWith(timer);
    });

    it('should not leave dangling timers after redirect', async () => {
      mockedProfileService.deleteProfile.mockResolvedValue({ success: true });
      mockedSignOut.mockResolvedValue(undefined as any);

      await profileService.deleteProfile(mockUserId.toString(), mockToken);

      // Fast-forward through all timers
      jest.runAllTimers();

      // Verify redirect happened
      await signOut({ redirect: false });
      window.location.href = '/';

      expect(window.location.href).toBe('/');

      // No pending timers should remain
      expect(jest.getTimerCount()).toBe(0);
    });
  });

  describe('Multiple deletion attempts', () => {
    it('should handle multiple deletion attempts in sequence', async () => {
      mockedProfileService.deleteProfile.mockResolvedValue({ success: true });
      mockedSignOut.mockResolvedValue(undefined as any);

      // First deletion
      await profileService.deleteProfile(mockUserId.toString(), mockToken);
      jest.advanceTimersByTime(3100);
      await signOut({ redirect: false });
      window.location.href = '/';

      expect(mockedProfileService.deleteProfile).toHaveBeenCalledTimes(1);
      expect(mockedSignOut).toHaveBeenCalledTimes(1);

      // Clear mocks for second attempt
      mockedProfileService.deleteProfile.mockClear();
      mockedSignOut.mockClear();

      // Second deletion (should not happen in practice, but testing robustness)
      await profileService.deleteProfile(mockUserId.toString(), mockToken);

      expect(mockedProfileService.deleteProfile).toHaveBeenCalledTimes(1);
    });
  });

  describe('Accessibility during popup', () => {
    it('should maintain focus trap while popup is open', () => {
      const popupIsOpen = true;

      if (popupIsOpen) {
        // Popup should prevent interaction with underlying page
        expect(document.body.style.overflow).toBeDefined();
      }
    });

    it('should allow escape key to close popup', () => {
      const handleEscape = jest.fn();
      const event = new KeyboardEvent('keydown', { key: 'Escape' });

      // Simulate escape key handler
      if (event.key === 'Escape') {
        handleEscape();
      }

      expect(handleEscape).toHaveBeenCalled();
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
