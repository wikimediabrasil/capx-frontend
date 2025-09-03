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
 * Hook for root capacities - now uses unified cache directly
 */
export function useRootCapacities(language: string = 'en') {
  const { isLoaded, language: cacheLanguage, getRootCapacities } = useCapacityCache();

  return useQuery({
    queryKey: CAPACITY_CACHE_KEYS.root(language),
    queryFn: async () => {
      // If cache language doesn't match, return empty and let LanguageChangeHandler handle it
      if (language !== cacheLanguage) {
        return [];
      }

      // Get root capacities directly from unified cache
      const rootCapacities = getRootCapacities();
      return rootCapacities;
    },
    enabled: isLoaded && language === cacheLanguage, // Only run when cache is ready and language matches
    staleTime: Infinity, // Cache is the source of truth
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
      return children;
    },
    enabled: !!parentCode && isLoaded, // Only run when cache is loaded
    staleTime: Infinity, // Cache is the source of truth
  });
}
