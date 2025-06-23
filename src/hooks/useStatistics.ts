import { useState, useEffect } from 'react';
import { Statistics } from '@/types/statistics';
import { statisticsService } from '@/services/statisticsService';
import { useSession } from 'next-auth/react';

export const useStatistics = () => {
  const [data, setData] = useState<Statistics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { data: session } = useSession();

  useEffect(() => {
    const fetchStatistics = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const config = session?.user?.token
          ? { headers: { Authorization: `Token ${session.user.token}` } }
          : undefined;

        const statisticsData = await statisticsService.fetchStatistics(config);
        setData(statisticsData);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch statistics'));
        console.error('Error fetching statistics:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStatistics();
  }, [session]);

  return { data, isLoading, error };
};
