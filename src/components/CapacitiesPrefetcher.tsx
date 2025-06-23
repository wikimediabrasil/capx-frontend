'use client';

import { useEffect, useState, useRef } from 'react';
import { useCapacityCache } from '@/contexts/CapacityCacheContext';
import { useSession } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';

// Paths where we don't need to prefetch all capacity data
const EXCLUDED_PATHS = [
  '/organization_profile', // Any organization profile path
  '/profile', // User profile paths
];

// Component to load capacities in the background
export const CapacitiesPrefetcher = () => {
  const { prefetchCapacityData, isLoaded, clearCache } = useCapacityCache();
  const pathname = usePathname();
  const { data: session } = useSession();
  const [hasPrefetched, setHasPrefetched] = useState(false);
  const prefetchTimerRef = useRef<NodeJS.Timeout | null>(null);
  const queryClient = useQueryClient();

  // Check if we should skip prefetching based on the current path
  const shouldSkipPrefetch = pathname && EXCLUDED_PATHS.some(path => pathname.includes(path));

  // Clean up any pending prefetch timer when component unmounts
  useEffect(() => {
    return () => {
      if (prefetchTimerRef.current) {
        clearTimeout(prefetchTimerRef.current);
      }
    };
  }, []);

  // Start loading when the user navigates
  useEffect(() => {
    // Skip prefetching if:
    // 1. User is not logged in
    // 2. Capacities are already loaded
    // 3. We've already prefetched in this session
    // 4. We're on an excluded path
    if (!session?.user || isLoaded || hasPrefetched || shouldSkipPrefetch) {
      return;
    }

    // Use setTimeout to avoid blocking initial rendering
    prefetchTimerRef.current = setTimeout(() => {
      prefetchCapacityData().then(() => {
        setHasPrefetched(true);
      });
    }, 5000); // Longer delay to prioritize page rendering and core functionality

    return () => {
      if (prefetchTimerRef.current) {
        clearTimeout(prefetchTimerRef.current);
      }
    };
  }, [session, isLoaded, hasPrefetched, prefetchCapacityData, pathname, shouldSkipPrefetch]);

  return null;
};
