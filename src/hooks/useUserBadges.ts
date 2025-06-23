import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { UserBadgeService } from '@/services/userBadgeService';
import { UserBadge } from '@/types/badge';

export function useUserBadges() {
  const { data: session } = useSession();
  const token = session?.user?.token;

  const [userBadges, setUserBadges] = useState<UserBadge[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    count: 0,
    next: null as string | null,
    previous: null as string | null,
  });

  useEffect(() => {
    const fetchUserBadges = async () => {
      try {
        setIsLoading(true);
        const response = await UserBadgeService.getUserBadges(token);
        setUserBadges(response.results);
        setPagination({
          count: response.count,
          next: response.next,
          previous: response.previous,
        });
      } catch (err) {
        setError('Failed to fetch user badges');
        console.error('Error fetching user badges:', err);
      } finally {
        setIsLoading(false);
      }
    };

    if (token) {
      fetchUserBadges();
    }
  }, [token]);

  const updateUserBadge = async (badgeId: number, isDisplayed: boolean = true) => {
    try {
      const response = await UserBadgeService.updateUserBadge(
        {
          id: badgeId,
          is_displayed: isDisplayed,
        },
        token
      );

      setUserBadges(prev => [...prev, response]);
      return response;
    } catch (err) {
      setError('Failed to add badge to user');
      console.error('Error adding badge to user:', err);
      throw err;
    }
  };

  return {
    userBadges,
    isLoading,
    error,
    pagination,
    updateUserBadge,
  };
}
