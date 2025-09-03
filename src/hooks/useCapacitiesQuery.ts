import { useQuery } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import { capacityService } from '../services/capacityService';
import { Capacity } from '../types/capacity';
import { useCapacityCache } from '@/contexts/CapacityCacheContext';

// Simplified cache keys
export const CAPACITY_CACHE_KEYS = {
  root: (language: string) => ['capacities', 'root', language] as const,
  byParent: (parentCode: string, language: string) =>
    ['capacities', 'byParent', parentCode, language] as const,
};

/**
 * Hook for root capacities - now uses unified cache
 */
export function useRootCapacities(language: string = 'en') {
  const { data: session } = useSession();
  const { updateLanguage, language: cacheLanguage } = useCapacityCache();
  const token = (session as any)?.user?.token;

  return useQuery({
    queryKey: CAPACITY_CACHE_KEYS.root(language),
    queryFn: async () => {
      if (!token) return [];

      // Ensure we have data for this language in unified cache
      if (language !== cacheLanguage) {
        await updateLanguage(language);
      }

      // Fetch root capacities
      const response = await capacityService.fetchCapacities(
        {
          params: { language },
          headers: { Authorization: `Token ${token}` }
        },
        language
      );

      return response || [];
    },
    enabled: !!token,
    staleTime: 1000 * 60 * 10, // 10 minutes
    gcTime: 1000 * 60 * 60, // 1 hour
  });
}

/**
 * Hook for capacities by parent - simplified
 */
export function useCapacitiesByParent(parentCode: string, language: string = 'en') {
  const { getChildren, isLoaded } = useCapacityCache();

  return useQuery({
    queryKey: CAPACITY_CACHE_KEYS.byParent(parentCode, language),
    queryFn: async () => {
      if (!parentCode) return [];
      
      // Get children directly from unified cache
      const children = getChildren(parseInt(parentCode, 10));
      
      console.log(`📊 Retrieved ${children.length} children for parent ${parentCode} from cache`);
      
      return children;
    },
    enabled: !!parentCode && isLoaded, // Only run when cache is loaded
    staleTime: Infinity, // Cache is the source of truth
  });
}
