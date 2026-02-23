'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import { useLanguage, useCapacityStore } from '@/stores';

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
  const store = useCapacityStore();
  const { data: session } = useSession();
  const token = session?.user?.token;
  const appLanguage = useLanguage();
  const pathname = usePathname();

  const isLoaded = store.getIsLoaded();
  const isLoadingTranslations = store.isLoadingTranslations;

  // Check if we should skip prefetching based on the current path
  const shouldSkipPrefetch = pathname && EXCLUDED_PATHS.some(path => pathname.includes(path));

  // Only prefetch when we have a session, no cache loaded, and not already loading
  useEffect(() => {
    if (!token || shouldSkipPrefetch || isLoaded || isLoadingTranslations) {
      return;
    }

    // Use the app language (from localStorage/context) instead of cache language
    const languageToLoad = appLanguage || 'en';

    const timer = setTimeout(() => {
      store.updateLanguage(languageToLoad, token);
    }, 100);

    return () => clearTimeout(timer);
  }, [token, shouldSkipPrefetch, isLoaded, isLoadingTranslations, store, appLanguage]);

  return null;
};
