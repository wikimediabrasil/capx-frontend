"use client";

import { createContext, useContext, useState, useEffect, useMemo } from "react";
import { BadgeService } from "@/services/badgeService";
import { UserBadgeService } from "@/services/userBadgeService";
import { Badge, UserBadge } from "@/types/badge";
import { useSession } from "next-auth/react";
import { useApp } from "./AppContext";

interface BadgesContextType {
  allBadges: Badge[]; // all available badges
  userBadgesRelations: UserBadge[]; // badges relations that the user has
  userBadges: Badge[]; // badges that the user has earned
  isLoading: boolean;
  error: string | null;
  refetchBadges: () => Promise<void>;
  refetchUserBadges: () => Promise<void>;
  updateUserBadges: (selectedBadgeIds: number[]) => Promise<void>;
}

const BadgesContext = createContext<BadgesContextType | undefined>(undefined);

export function BadgesProvider({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const token = session?.user?.token;
  const { language } = useApp();
  const [allBadges, setAllBadges] = useState<Badge[]>([]);
  const [userBadgesRelations, setUserBadgesRelations] = useState<UserBadge[]>([]);
  const [userBadges, setUserBadges] = useState<Badge[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBadges = async () => {
    if (!token) return;
    try {
      setIsLoading(true);
      const response = await BadgeService.getBadges(token);
      setAllBadges(response.results);
    } catch (err) {
      setError("Failed to fetch badges");
      console.error("Error fetching badges:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUserBadges = async () => {
    if (!token) return;
    try {
      setIsLoading(true);
    const response = await UserBadgeService.getUserBadges(token);
    const userBadgesData = response.results;

    setUserBadgesRelations(userBadgesData);

      // Map user badges with progress and is_displayed
      const badgesWithProgress = allBadges
        .filter(badge => userBadgesData.find(userBadge => userBadge.badge === badge.id))
        .map(badge => {
          const userBadgeRelation = userBadgesData.find(userBadge => userBadge.badge === badge.id);
          return {
            ...badge,
            progress: userBadgeRelation?.progress || 0,
            is_displayed: userBadgeRelation?.is_displayed || false
          };
        });

      setUserBadges(badgesWithProgress);
    } catch (err) {
      setError("Failed to fetch user badges");
      console.error("Error fetching user badges:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const updateUserBadges = async (selectedBadgeIds: number[]) => {
    if (!token) return;
    try {
      setIsLoading(true);

      // Update the is_displayed status of all the user's badges
      const updatePromises = userBadges.map(async (userBadge) => {
        const shouldDisplay = selectedBadgeIds.includes(userBadge.id);
        const userBadgeId = userBadgesRelations.find(userBadgeRelation => userBadgeRelation.badge === userBadge.id)?.id;

        if (!userBadgeId) {
          console.error("User badge ID not found for badge:", userBadge.id);
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
      await fetchUserBadges(); // Reload badges to update the display
      
    } catch (err) {
      setError("Failed to update badges display status");
      console.error("Error updating badges display status:", err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch badges when language changes or on initial load
  useEffect(() => {
    if (!token) return;
    fetchBadges();
  }, [language, token]);

  // New useEffect that observes changes in allBadges
  useEffect(() => {
    if (allBadges.length > 0) {
      fetchUserBadges();
    }
  }, [allBadges]);

  // Memoize the value object to prevent unnecessary re-renders
  const value = useMemo(
    () => ({
      allBadges,
      userBadgesRelations,
      userBadges,
      isLoading,
      error,
      refetchBadges: fetchBadges,
      refetchUserBadges: fetchUserBadges,
      updateUserBadges,
    }),
    [allBadges, userBadgesRelations, userBadges, isLoading, error]
  );

  return (
    <BadgesContext.Provider value={value}>{children}</BadgesContext.Provider>
  );
}

export function useBadges() {
  const context = useContext(BadgesContext);
  if (context === undefined) {
    throw new Error("useBadges must be used within a BadgesProvider");
  }
  return context;
}
