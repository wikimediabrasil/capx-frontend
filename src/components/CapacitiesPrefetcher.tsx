'use client';

import { useEffect, useState, useRef } from 'react';
import { useCapacityCache } from '@/contexts/CapacityCacheContext';
import { useSession } from 'next-auth/react';
import { usePathname } from 'next/navigation';

// Paths where we don't need to prefetch all capacity data
const EXCLUDED_PATHS = [
  '/organization_profile', // Any organization profile path
  '/profile', // User profile paths
];

// Component to load capacities in the background using unified cache
export const CapacitiesPrefetcher = () => {
  const { updateLanguage, isLoaded, language } = useCapacityCache();
  const pathname = usePathname();
  const { data: session } = useSession();
  const [hasPrefetched, setHasPrefetched] = useState(false);
  const prefetchTimerRef = useRef<NodeJS.Timeout | null>(null);

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
    prefetchTimerRef.current = setTimeout(async () => {
      try {
        await updateLanguage(language || 'en');
        setHasPrefetched(true);
        console.log('✅ Capacities prefetched successfully');
      } catch (error) {
        console.error('❌ Error prefetching capacities:', error);
      }
    }, 5000); // Longer delay to prioritize page rendering and core functionality

    return () => {
      if (prefetchTimerRef.current) {
        clearTimeout(prefetchTimerRef.current);
      }
    };
  }, [session, isLoaded, hasPrefetched, updateLanguage, language, pathname, shouldSkipPrefetch]);

  return null;
};
