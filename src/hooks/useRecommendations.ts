'use client';

import { useQuery } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import { recommendationService } from '@/services/recommendationService';
import { RecommendationsResponse } from '@/types/recommendation';

export const useRecommendations = () => {
  const { data: session } = useSession();
  const token = session?.user?.token;

  const { data, isLoading, error } = useQuery<RecommendationsResponse, Error>({
    queryKey: ['recommendations', token],
    queryFn: async () => {
      if (!token) {
        throw new Error('No token available');
      }
      return recommendationService.getRecommendations(token);
    },
    enabled: !!token,
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
    gcTime: 1000 * 60 * 30, // Keep in cache for 30 minutes
    refetchOnWindowFocus: false, // Don't refetch when window regains focus
    refetchOnMount: false, // Don't refetch on mount if data is fresh
    retry: 1,
  });

  return {
    data: data || null,
    isLoading,
    error: error || null,
  };
};
