'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { recommendationService } from '@/services/recommendationService';
import { RecommendationsResponse } from '@/types/recommendation';

export const useRecommendations = () => {
  const [data, setData] = useState<RecommendationsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { data: session } = useSession();

  useEffect(() => {
    const fetchRecommendations = async () => {
      if (!session?.user?.token) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        const recommendationsData = await recommendationService.getRecommendations(
          session.user.token
        );
        setData(recommendationsData);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch recommendations'));
        console.error('Error fetching recommendations:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecommendations();
  }, [session]);

  return { data, isLoading, error };
};

