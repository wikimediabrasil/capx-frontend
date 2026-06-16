// Extended badges store tests covering fetchUserBadges and updateUserBadges

import { BadgeService } from '@/services/badgeService';
import { UserBadgeService } from '@/services/userBadgeService';

jest.mock('@/services/badgeService', () => ({
  BadgeService: { getBadges: jest.fn() },
}));
jest.mock('@/services/userBadgeService', () => ({
  UserBadgeService: { getUserBadges: jest.fn(), updateUserBadge: jest.fn() },
}));

import { useBadgesStore } from '@/stores/badgesStore';
import { act } from '@testing-library/react';

const mockedBadgeService = BadgeService as jest.Mocked<typeof BadgeService>;
const mockedUserBadgeService = UserBadgeService as jest.Mocked<typeof UserBadgeService>;

const sampleBadges = [
  { id: 1, name: 'First Edit', description: 'Made first edit', icon: '/badges/1.png', criteria: '' },
  { id: 2, name: 'Prolific', description: '100 edits', icon: '/badges/2.png', criteria: '' },
];

const sampleUserBadges = [
  { id: 10, badge: 1, progress: 100, is_displayed: true },
  { id: 11, badge: 2, progress: 50, is_displayed: false },
];

describe('badgesStore - extended', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    act(() => {
      useBadgesStore.getState().reset();
    });
  });

  // -------------------------------------------------------------------------
  // fetchUserBadges
  // -------------------------------------------------------------------------
  describe('fetchUserBadges', () => {
    it('does nothing without token', async () => {
      await act(async () => {
        await useBadgesStore.getState().fetchUserBadges('');
      });
      expect(mockedUserBadgeService.getUserBadges).not.toHaveBeenCalled();
    });

    it('maps user badges with progress and is_displayed', async () => {
      act(() => {
        useBadgesStore.setState({ allBadges: sampleBadges as any });
      });

      mockedUserBadgeService.getUserBadges.mockResolvedValueOnce({
        results: sampleUserBadges,
      } as any);

      await act(async () => {
        await useBadgesStore.getState().fetchUserBadges('token');
      });

      const state = useBadgesStore.getState();
      expect(state.userBadgesRelations).toEqual(sampleUserBadges);
      expect(state.userBadges).toHaveLength(2);
      expect(state.userBadges[0].progress).toBe(100);
      expect(state.userBadges[0].is_displayed).toBe(true);
      expect(state.userBadges[1].progress).toBe(50);
      expect(state.userBadges[1].is_displayed).toBe(false);
    });

    it('only includes badges that have user badge relations', async () => {
      act(() => {
        useBadgesStore.setState({ allBadges: sampleBadges as any });
      });

      // Only badge 1 is earned
      mockedUserBadgeService.getUserBadges.mockResolvedValueOnce({
        results: [{ id: 10, badge: 1, progress: 100, is_displayed: true }],
      } as any);

      await act(async () => {
        await useBadgesStore.getState().fetchUserBadges('token');
      });

      expect(useBadgesStore.getState().userBadges).toHaveLength(1);
      expect(useBadgesStore.getState().userBadges[0].id).toBe(1);
    });

    it('sets error on failure', async () => {
      mockedUserBadgeService.getUserBadges.mockRejectedValueOnce(new Error('Fetch failed'));

      await act(async () => {
        await useBadgesStore.getState().fetchUserBadges('token');
      });

      expect(useBadgesStore.getState().error).toBe('Failed to fetch user badges');
      expect(useBadgesStore.getState().isLoading).toBe(false);
    });

    it('sets isLoading to false after success', async () => {
      mockedUserBadgeService.getUserBadges.mockResolvedValueOnce({
        results: [],
      } as any);

      await act(async () => {
        await useBadgesStore.getState().fetchUserBadges('token');
      });

      expect(useBadgesStore.getState().isLoading).toBe(false);
    });
  });

  // -------------------------------------------------------------------------
  // updateUserBadges
  // -------------------------------------------------------------------------
  describe('updateUserBadges', () => {
    beforeEach(() => {
      act(() => {
        useBadgesStore.setState({
          allBadges: sampleBadges as any,
          userBadges: [
            { ...sampleBadges[0], progress: 100, is_displayed: true },
            { ...sampleBadges[1], progress: 50, is_displayed: false },
          ] as any,
          userBadgesRelations: sampleUserBadges as any,
        });
      });
    });

    it('does nothing without token', async () => {
      await act(async () => {
        await useBadgesStore.getState().updateUserBadges([1], '');
      });
      expect(mockedUserBadgeService.updateUserBadge).not.toHaveBeenCalled();
    });

    it('calls updateUserBadge for each user badge', async () => {
      mockedUserBadgeService.updateUserBadge.mockResolvedValue({} as any);
      mockedUserBadgeService.getUserBadges.mockResolvedValueOnce({
        results: sampleUserBadges,
      } as any);

      await act(async () => {
        await useBadgesStore.getState().updateUserBadges([1], 'token');
      });

      // Should be called twice (one per userBadge)
      expect(mockedUserBadgeService.updateUserBadge).toHaveBeenCalledTimes(2);

      // Badge 1 should be displayed (it's in selectedBadgeIds)
      expect(mockedUserBadgeService.updateUserBadge).toHaveBeenCalledWith(
        { id: 10, is_displayed: true },
        'token'
      );
      // Badge 2 should NOT be displayed
      expect(mockedUserBadgeService.updateUserBadge).toHaveBeenCalledWith(
        { id: 11, is_displayed: false },
        'token'
      );
    });

    it('re-fetches user badges after update', async () => {
      mockedUserBadgeService.updateUserBadge.mockResolvedValue({} as any);
      mockedUserBadgeService.getUserBadges.mockResolvedValueOnce({
        results: sampleUserBadges,
      } as any);

      await act(async () => {
        await useBadgesStore.getState().updateUserBadges([1, 2], 'token');
      });

      expect(mockedUserBadgeService.getUserBadges).toHaveBeenCalledWith('token');
    });

    it('sets error and rethrows on failure', async () => {
      mockedUserBadgeService.updateUserBadge.mockRejectedValueOnce(new Error('Update failed'));

      // Ensure state has userBadges so the map actually calls updateUserBadge
      act(() => {
        useBadgesStore.setState({
          userBadges: [{ id: 1, name: 'Badge1', icon: '', description: '', is_displayed: false }],
          userBadgesRelations: [{ id: 10, badge: 1, user: 1, is_displayed: false }],
        });
      });

      let thrownError: Error | undefined;
      try {
        await act(async () => {
          await useBadgesStore.getState().updateUserBadges([1], 'token');
        });
      } catch (e) {
        thrownError = e as Error;
      }

      expect(thrownError).toBeDefined();
      expect(thrownError!.message).toBe('Update failed');
      expect(useBadgesStore.getState().error).toBe('Failed to update badges display status');
      expect(useBadgesStore.getState().isLoading).toBe(false);
    });

    it('skips badges where userBadgeRelation is not found', async () => {
      // userBadgesRelations does not contain badge 99
      act(() => {
        useBadgesStore.setState({
          userBadges: [{ id: 99, name: 'Unknown', progress: 0, is_displayed: false }] as any,
          userBadgesRelations: [], // no relation for badge 99
        });
      });

      mockedUserBadgeService.updateUserBadge.mockResolvedValue({} as any);
      mockedUserBadgeService.getUserBadges.mockResolvedValueOnce({ results: [] } as any);

      await act(async () => {
        await useBadgesStore.getState().updateUserBadges([99], 'token');
      });

      // updateUserBadge should not be called since userBadgeId is not found
      expect(mockedUserBadgeService.updateUserBadge).not.toHaveBeenCalled();
    });

    it('sets isLoading to false after update', async () => {
      mockedUserBadgeService.updateUserBadge.mockResolvedValue({} as any);
      mockedUserBadgeService.getUserBadges.mockResolvedValueOnce({
        results: [],
      } as any);

      await act(async () => {
        await useBadgesStore.getState().updateUserBadges([1, 2], 'token');
      });

      expect(useBadgesStore.getState().isLoading).toBe(false);
    });
  });

  // -------------------------------------------------------------------------
  // Selector exports
  // -------------------------------------------------------------------------
  describe('selector exports', () => {
    it('useAllBadges reflects allBadges state', () => {
      act(() => {
        useBadgesStore.setState({ allBadges: sampleBadges as any });
      });
      expect(useBadgesStore.getState().allBadges).toEqual(sampleBadges);
    });

    it('useUserBadges reflects userBadges state', () => {
      const userBadgesWithMeta = [{ ...sampleBadges[0], progress: 100, is_displayed: true }];
      act(() => {
        useBadgesStore.setState({ userBadges: userBadgesWithMeta as any });
      });
      expect(useBadgesStore.getState().userBadges).toEqual(userBadgesWithMeta);
    });

    it('useUserBadgesRelations reflects userBadgesRelations state', () => {
      act(() => {
        useBadgesStore.setState({ userBadgesRelations: sampleUserBadges as any });
      });
      expect(useBadgesStore.getState().userBadgesRelations).toEqual(sampleUserBadges);
    });

    it('useBadgesLoading reflects isLoading', () => {
      act(() => {
        useBadgesStore.setState({ isLoading: false });
      });
      expect(useBadgesStore.getState().isLoading).toBe(false);
    });

    it('useBadgesError reflects error', () => {
      act(() => {
        useBadgesStore.setState({ error: 'Something went wrong' });
      });
      expect(useBadgesStore.getState().error).toBe('Something went wrong');
    });
  });
});
