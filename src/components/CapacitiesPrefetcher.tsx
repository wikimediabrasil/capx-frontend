'use client';

import { useEffect, useState, useRef } from 'react';
import { useCapacityCache } from '@/contexts/CapacityCacheContext';
import { useSession } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import { useApp } from '@/contexts/AppContext';

// Paths where we don't need to prefetch all capacity data
const EXCLUDED_PATHS = [
  '/organization_profile', // Any organization profile path
  '/profile', // User profile paths
];

// Component to load capacities in the background using unified cache
export const CapacitiesPrefetcher = () => {
  const [mounted, setMounted] = useState(false);

  // Wait for hydration before accessing contexts
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return <CapacitiesPrefetcherInternal />;
};

const CapacitiesPrefetcherInternal = () => {
  const { updateLanguage, isLoaded, language, isLoadingTranslations } = useCapacityCache();
  const { data: session } = useSession();
  const { language: appLanguage } = useApp();
  const pathname = usePathname();

  // Check if we should skip prefetching based on the current path
  const shouldSkipPrefetch = pathname && EXCLUDED_PATHS.some(path => pathname.includes(path));

  // Only prefetch when we have a session, no cache loaded, and not already loading
  useEffect(() => {
    if (!session?.user?.token || shouldSkipPrefetch || isLoaded || isLoadingTranslations) {
      return;
    }

    // Use the app language (from localStorage/context) instead of cache language
    const languageToLoad = appLanguage || 'en';

    const timer = setTimeout(() => {
      updateLanguage(languageToLoad);
    }, 100);

    return () => clearTimeout(timer);
  }, [
    session?.user?.token,
    shouldSkipPrefetch,
    isLoaded,
    isLoadingTranslations,
    updateLanguage,
    appLanguage,
  ]);

  return null;
};
