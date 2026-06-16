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

describe('badgesStore', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    act(() => {
      useBadgesStore.getState().reset();
    });
  });

  it('has correct initial state', () => {
    const state = useBadgesStore.getState();
    expect(state.allBadges).toEqual([]);
    expect(state.userBadges).toEqual([]);
    expect(state.userBadgesRelations).toEqual([]);
    expect(state.isLoading).toBe(true);
    expect(state.error).toBeNull();
  });

  it('fetchBadges loads badges and user badges', async () => {
    mockedBadgeService.getBadges.mockResolvedValueOnce({
      results: [{ id: 1, name: 'Badge 1', description: '', icon: '', criteria: '' }],
    } as any);
    mockedUserBadgeService.getUserBadges.mockResolvedValueOnce({
      results: [{ id: 10, badge: 1, progress: 50, is_displayed: true }],
    } as any);

    await act(async () => {
      await useBadgesStore.getState().fetchBadges('test-token');
    });

    const state = useBadgesStore.getState();
    expect(state.allBadges).toHaveLength(1);
    expect(state.isLoading).toBe(false);
  });

  it('fetchBadges does nothing without token', async () => {
    await act(async () => {
      await useBadgesStore.getState().fetchBadges('');
    });
    expect(mockedBadgeService.getBadges).not.toHaveBeenCalled();
  });

  it('fetchBadges sets error on failure', async () => {
    mockedBadgeService.getBadges.mockRejectedValueOnce(new Error('Failed'));

    await act(async () => {
      await useBadgesStore.getState().fetchBadges('test-token');
    });

    expect(useBadgesStore.getState().error).toBe('Failed to fetch badges');
    expect(useBadgesStore.getState().isLoading).toBe(false);
  });

  it('reset restores initial state', () => {
    act(() => {
      useBadgesStore.setState({ error: 'some error', isLoading: false });
    });

    act(() => {
      useBadgesStore.getState().reset();
    });

    const state = useBadgesStore.getState();
    expect(state.error).toBeNull();
    expect(state.isLoading).toBe(true);
    expect(state.allBadges).toEqual([]);
  });
});
