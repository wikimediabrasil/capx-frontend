'use client';

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { BadgeService } from '@/services/badgeService';
import { UserBadgeService } from '@/services/userBadgeService';
import { Badge, UserBadge } from '@/types/badge';
import { BadgesStore } from './types';

const initialState = {
  allBadges: [] as Badge[],
  userBadgesRelations: [] as UserBadge[],
  userBadges: [] as Badge[],
  isLoading: true,
  error: null as string | null,
};

export const useBadgesStore = create<BadgesStore>()(
  devtools(
    (set, get) => ({
      ...initialState,

      fetchBadges: async (token: string) => {
        if (!token) return;
        try {
          set({ isLoading: true });
          const response = await BadgeService.getBadges(token);
          set({ allBadges: response.results });
          // Auto-fetch user badges after loading all badges
          await get().fetchUserBadges(token);
        } catch (err) {
          set({ error: 'Failed to fetch badges' });
          console.error('Error fetching badges:', err);
        } finally {
          set({ isLoading: false });
        }
      },

      fetchUserBadges: async (token: string) => {
        if (!token) return;
        try {
          set({ isLoading: true });
          const response = await UserBadgeService.getUserBadges(token);
          const userBadgesData = response.results;

          set({ userBadgesRelations: userBadgesData });

          const { allBadges } = get();

          // Map user badges with progress and is_displayed
          const badgesWithProgress = allBadges
            .filter(badge => userBadgesData.find(userBadge => userBadge.badge === badge.id))
            .map(badge => {
              const userBadgeRelation = userBadgesData.find(
                userBadge => userBadge.badge === badge.id
              );
              return {
                ...badge,
                progress: userBadgeRelation?.progress || 0,
                is_displayed: userBadgeRelation?.is_displayed || false,
              };
            });

          set({ userBadges: badgesWithProgress });
        } catch (err) {
          set({ error: 'Failed to fetch user badges' });
          console.error('Error fetching user badges:', err);
        } finally {
          set({ isLoading: false });
        }
      },

      updateUserBadges: async (selectedBadgeIds: number[], token: string) => {
        if (!token) return;
        try {
          set({ isLoading: true });

          const { userBadges, userBadgesRelations } = get();

          const updatePromises = userBadges.map(async userBadge => {
            const shouldDisplay = selectedBadgeIds.includes(userBadge.id);
            const userBadgeId = userBadgesRelations.find(
              userBadgeRelation => userBadgeRelation.badge === userBadge.id
            )?.id;

            if (!userBadgeId) {
              console.error('User badge ID not found for badge:', userBadge.id);
              return;
            }

            return UserBadgeService.updateUserBadge(
              {
                id: userBadgeId,
                is_displayed: shouldDisplay,
              },
              token
            );
          });

          await Promise.all(updatePromises);
          await get().fetchUserBadges(token);
        } catch (err) {
          set({ error: 'Failed to update badges display status' });
          console.error('Error updating badges display status:', err);
          throw err;
        } finally {
          set({ isLoading: false });
        }
      },

      reset: () => {
        set(initialState);
      },
    }),
    { name: 'BadgesStore', enabled: process.env.NODE_ENV === 'development' }
  )
);

// Selector hooks
export const useAllBadges = () => useBadgesStore(state => state.allBadges);
export const useUserBadges = () => useBadgesStore(state => state.userBadges);
export const useUserBadgesRelations = () => useBadgesStore(state => state.userBadgesRelations);
export const useBadgesLoading = () => useBadgesStore(state => state.isLoading);
export const useBadgesError = () => useBadgesStore(state => state.error);
