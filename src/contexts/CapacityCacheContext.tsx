'use client';
import { capacityService } from '@/services/capacityService';
import { Capacity } from '@/types/capacity';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { fetchMetabase, fetchWikidata } from '../lib/utils/capacitiesUtils';

// Query keys for the React Query
const QUERY_KEYS = {
  ROOT_CAPACITIES: 'root-capacities',
  CHILD_CAPACITIES: (parentCode: number) => `child-capacities-${parentCode}`,
  ALL_CAPACITIES: 'all-capacities-map',
  CHILDREN_MAP: 'children-map',
};

// Global flag to avoid multiple initializations
let hasInitializedCache = false;

// Variable to store the debounce timer
let saveCacheTimer: NodeJS.Timeout | null = null;

// Function to persist cache in localStorage
const saveCache = (
  capacities: Map<number, Capacity>,
  children: Map<number, number[]>,
  isFresh = false
) => {
  if (typeof window === 'undefined') return;

  try {
    // Convert Maps to plain objects for serialization
    const capacitiesObj = mapToObject(capacities);
    const childrenObj = mapToObject(children);

    // Don't save empty data
    if (
      !capacitiesObj ||
      !childrenObj ||
      Object.keys(capacitiesObj).length === 0 ||
      Object.keys(childrenObj).length === 0
    )
      return;

    const cacheData = {
      capacities: capacitiesObj,
      children: childrenObj,
      timestamp: Date.now(), // Add timestamp to track cache age
    };

    localStorage.setItem('capx-capacity-cache', JSON.stringify(cacheData));

    // Use type assertion to help TypeScript understand this is safe
    const capacityCount = Object.keys(capacitiesObj as Record<string, any>).length;
    localStorage.setItem('capx-capacity-cache-size', String(capacityCount));
  } catch (error) {
    console.error('Error saving capacity cache:', error);
  }
};

// Helper functions for serialization
const mapToObject = (map: Map<number, any> | any): Record<string, any> => {
  if (!(map instanceof Map)) return map;
  const obj: Record<string, any> = {};
  map.forEach((value, key) => {
    obj[key] = value;
  });
  return obj;
};

const objectToMap = (obj: Record<string, any> | any): Map<number, any> | any => {
  if (!obj || typeof obj !== 'object') return obj;
  const map = new Map<number, any>();
  Object.entries(obj).forEach(([key, value]) => {
    map.set(Number(key), value);
  });
  return map;
};

interface CapacityCacheContextType {
  isLoaded: boolean;
  hasChildren: (code: number) => boolean;
  getCapacity: (code: number) => Capacity | undefined;
  prefetchCapacityData: () => Promise<void>;
  preloadCapacities: () => Promise<void>;
  clearCache: () => void;
  clearCapacityCache: () => void;
  refreshTranslations: (targetLanguage: string) => Promise<void>;
}

const CapacityCacheContext = createContext<CapacityCacheContextType>({
  isLoaded: false,
  hasChildren: () => false,
  getCapacity: () => undefined,
  prefetchCapacityData: async () => {},
  preloadCapacities: async () => {},
  clearCache: () => {},
  clearCapacityCache: () => {},
  refreshTranslations: async () => {},
});

export function CapacityCacheProvider({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const [isManuallyLoaded, setIsManuallyLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const hasCalled = useRef(false);

  // Load cache from localStorage when starting (only once)
  useEffect(() => {
    if (typeof window === 'undefined' || hasCalled.current || hasInitializedCache) {
      return;
    }

    hasCalled.current = true;
    hasInitializedCache = true;

    try {
      const savedCache = localStorage.getItem('capx-capacity-cache');
      if (savedCache) {
        const parsedCache = JSON.parse(savedCache);

        // Convert back to Map before using
        if (parsedCache.capacities) {
          const capacitiesMap = objectToMap(parsedCache.capacities);
          queryClient.setQueryData([QUERY_KEYS.ALL_CAPACITIES], capacitiesMap);

          // Debug info - show only once
          const capacityCount = Object.keys(parsedCache.capacities).length;
          const childrenCount = parsedCache.children ? Object.keys(parsedCache.children).length : 0;
        }

        if (parsedCache.children) {
          const childrenMap = objectToMap(parsedCache.children);
          queryClient.setQueryData([QUERY_KEYS.CHILDREN_MAP], childrenMap);
        }

        // Mark as loaded
        setIsManuallyLoaded(true);
      }
    } catch (e) {
      console.error('Error recovering cache:', e);
      // In case of error, clear the cache to ensure a clean state
      localStorage.removeItem('capx-capacity-cache');
    }
  }, [queryClient]);

  // Use React Query to maintain the persistent cache between navigations
  const { data: capacityCache = new Map<number, Capacity>(), isSuccess: isCacheLoaded } = useQuery({
    queryKey: [QUERY_KEYS.ALL_CAPACITIES],
    queryFn: () => {
      // Return the existing cache or a new Map
      const existingCache = queryClient.getQueryData<Map<number, Capacity>>([
        QUERY_KEYS.ALL_CAPACITIES,
      ]);
      return existingCache || new Map<number, Capacity>();
    },
    staleTime: Infinity, // Never consider obsolete
    gcTime: 24 * 60 * 60 * 1000, // Keep in cache for 24 hours
  });

  const { data: childrenCache = new Map<number, number[]>(), isSuccess: isChildrenCacheLoaded } =
    useQuery({
      queryKey: [QUERY_KEYS.CHILDREN_MAP],
      queryFn: () => {
        const existingCache = queryClient.getQueryData<Map<number, number[]>>([
          QUERY_KEYS.CHILDREN_MAP,
        ]);
        return existingCache || new Map<number, number[]>();
      },
      staleTime: Infinity,
      gcTime: 24 * 60 * 60 * 1000,
    });

  const isLoaded = isCacheLoaded && isChildrenCacheLoaded && isManuallyLoaded;

  // Function to clear the entire cache
  const clearCache = useCallback(() => {
    queryClient.removeQueries({ queryKey: [QUERY_KEYS.ALL_CAPACITIES] });
    queryClient.removeQueries({ queryKey: [QUERY_KEYS.CHILDREN_MAP] });
    setIsManuallyLoaded(false);
    hasInitializedCache = false;
    // Also clear from localStorage if being used
    if (typeof window !== 'undefined') {
      localStorage.removeItem('capx-capacity-cache');
    }
  }, [queryClient]);

  // Persist cache in localStorage when changing (only if there are data)
  useEffect(() => {
    if (isCacheLoaded && isChildrenCacheLoaded && capacityCache.size > 0) {
      // Use debounce to avoid multiple saves
      const timer = setTimeout(() => {
        saveCache(capacityCache, childrenCache);
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [isCacheLoaded, isChildrenCacheLoaded, capacityCache, childrenCache]);

  // Function to preload all capacity data in the background
  const prefetchCapacityData = async () => {
    if (!session?.user?.token) return;

    // Check if we already have data in cache before loading
    if (capacityCache.size > 0 && childrenCache.size > 0) {
      setIsManuallyLoaded(true);
      return;
    }

    // Try to load from localStorage first before making API requests
    try {
      const savedCache = localStorage.getItem('capx-capacity-cache');
      if (savedCache) {
        const parsedCache = JSON.parse(savedCache);
        const hasCapacities =
          parsedCache.capacities && Object.keys(parsedCache.capacities).length > 0;
        const hasChildren = parsedCache.children && Object.keys(parsedCache.children).length > 0;

        if (hasCapacities && hasChildren) {
          // Convert back to Map before using
          const capacitiesMap = objectToMap(parsedCache.capacities);
          queryClient.setQueryData([QUERY_KEYS.ALL_CAPACITIES], capacitiesMap);

          const childrenMap = objectToMap(parsedCache.children);
          queryClient.setQueryData([QUERY_KEYS.CHILDREN_MAP], childrenMap);

          setIsManuallyLoaded(true);

          // Check age of cached data - if older than a day, trigger a background refresh
          const cacheTimestamp = parsedCache.timestamp || 0;
          const oneDayMs = 24 * 60 * 60 * 1000;
          const isCacheStale = Date.now() - cacheTimestamp > oneDayMs;

          if (isCacheStale) {
            // Continue with API requests for fresh data, but don't await them
            fetchFreshData(session.user.token, capacitiesMap, childrenMap);
          }

          return;
        }
      }
    } catch (error) {
      console.error('Error recovering cache:', error);
      // Continue with normal loading in case of error
    }

    // Regular API fetching if no localStorage cache exists
    try {
      setIsLoading(true);
      await fetchFreshData(session.user.token);
      setIsLoading(false);
    } catch (error) {
      console.error('Error prefetching capacity data:', error);
      setIsLoading(false);
    }
  };

  // Helper function to fetch fresh data from API
  const fetchFreshData = async (
    token: string,
    existingCapacityCache?: Map<number, Capacity>,
    existingChildrenCache?: Map<number, number[]>
  ) => {
    // 1. Load root capacities
    const rootCapacities = await capacityService.fetchCapacities({
      headers: { Authorization: `Token ${token}` },
    });

    // Store root capacities in persistent cache
    const newCapacityCache = existingCapacityCache || new Map<number, Capacity>();
    const newChildrenCache = existingChildrenCache || new Map<number, number[]>();

    // Initialize cache with root capacities
    rootCapacities.forEach(rootCapacity => {
      const code = Number(rootCapacity.code);
      newCapacityCache.set(code, {
        code,
        name: rootCapacity.name,
        color: 'technology',
        icon: '',
        hasChildren: false,
        skill_type: code,
        skill_wikidata_item: '',
        description: '',
        wd_code: rootCapacity.wd_code || '',
      });
    });

    // 2. Load all children in a single request grouped
    const childPromises = rootCapacities.map(async rootCapacity => {
      const code = Number(rootCapacity.code);
      try {
        // Skip if we already have this capacity's children in cache
        if (newChildrenCache.has(code) && (newChildrenCache.get(code)?.length ?? 0) > 0) {
          const cachedChildren = newChildrenCache.get(code);
          return Array.isArray(cachedChildren) ? cachedChildren : [];
        }

        const children = await capacityService.fetchCapacitiesByType(code.toString(), {
          headers: { Authorization: `Token ${token}` },
        });

        // Process children
        const childCodes = Object.keys(children).map(Number);
        newChildrenCache.set(code, childCodes);

        // Update hasChildren of the root capacity
        const rootCapacity = newCapacityCache.get(code);
        if (rootCapacity) {
          newCapacityCache.set(code, {
            ...rootCapacity,
            hasChildren: childCodes.length > 0,
          });
        }

        // Add children to cache
        childCodes.forEach(childCode => {
          if (!newCapacityCache.has(childCode)) {
            newCapacityCache.set(childCode, {
              code: childCode,
              name:
                typeof children[childCode] === 'string'
                  ? children[childCode]
                  : children[childCode]?.name || `Capacity ${childCode}`,
              color: 'technology',
              icon: '',
              hasChildren: false,
              skill_type: code,
              skill_wikidata_item: '',
              description: '',
              wd_code: '',
              metabase_code: '',
              parentCapacity: newCapacityCache.get(code),
            });
          }
        });

        return childCodes;
      } catch (error) {
        console.error(`Error fetching children for capacity ${code}:`, error);
        return [];
      }
    });

    // Process the child promises in parallel
    const allChildCodes = await Promise.all(childPromises);
    const flatChildCodes = allChildCodes.flat();

    // Only fetch grandchildren for capacities we don't already have
    const missingGrandchildren = flatChildCodes.filter(
      code => !newChildrenCache.has(code) || newChildrenCache.get(code)?.length === 0
    );

    if (missingGrandchildren.length > 0) {
      // 3. Load grandchildren in batches to reduce the number of requests
      const BATCH_SIZE = 5;
      for (let i = 0; i < missingGrandchildren.length; i += BATCH_SIZE) {
        const batch = missingGrandchildren.slice(i, i + BATCH_SIZE);
        const batchPromises = batch.map(async childCode => {
          try {
            const grandChildren = await capacityService.fetchCapacitiesByType(
              childCode.toString(),
              {
                headers: { Authorization: `Token ${token}` },
              }
            );

            const grandChildCodes = Object.keys(grandChildren).map(Number);
            newChildrenCache.set(childCode, grandChildCodes);

            // Update hasChildren of the child
            const childCapacity = newCapacityCache.get(childCode);
            if (childCapacity) {
              newCapacityCache.set(childCode, {
                ...childCapacity,
                hasChildren: grandChildCodes.length > 0,
              });
            }

            // Add grandchildren to cache
            grandChildCodes.forEach(grandChildCode => {
              if (!newCapacityCache.has(grandChildCode)) {
                const parentCapacity = newCapacityCache.get(childCode);
                newCapacityCache.set(grandChildCode, {
                  code: grandChildCode,
                  name:
                    typeof grandChildren[grandChildCode] === 'string'
                      ? grandChildren[grandChildCode]
                      : grandChildren[grandChildCode]?.name || `Capacity ${grandChildCode}`,
                  color: 'technology',
                  icon: '',
                  hasChildren: false,
                  skill_type: childCode,
                  skill_wikidata_item: '',
                  description: '',
                  wd_code: '',
                  metabase_code: '',
                  parentCapacity: parentCapacity,
                });
              }
            });

            return { childCode, grandChildCodes };
          } catch (error) {
            console.error(`Error fetching grandchildren for capacity ${childCode}:`, error);
            return { childCode, grandChildCodes: [] };
          }
        });

        await Promise.all(batchPromises);
      }
    }

    // Update cache in React Query
    queryClient.setQueryData([QUERY_KEYS.ALL_CAPACITIES], newCapacityCache);
    queryClient.setQueryData([QUERY_KEYS.CHILDREN_MAP], newChildrenCache);

    // Save cache in localStorage with a timestamp
    saveCache(newCapacityCache, newChildrenCache, true);

    // Mark as manually loaded
    setIsManuallyLoaded(true);
  };

  // Helper function to preload capacities
  const preloadCapacities = async () => {
    if (isLoaded) {
      return;
    }
    return await prefetchCapacityData();
  };

  // Helper function to clear only the capacity cache
  const clearCapacityCache = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.ALL_CAPACITIES] });
  }, [queryClient]);

  // Function to refresh translations for a specific language
  const refreshTranslations = useCallback(
    async (targetLanguage: string) => {
      if (!session?.user?.token) return;

      try {
        setIsLoading(true);

        // Get all capacity codes that have wd_code
        const allCapacities = Array.from(capacityCache.values()).filter(cap => cap.wd_code);

        if (allCapacities.length === 0) {
          console.warn('No capacities with wd_code found for translation refresh');
          return;
        }

        // Fetch translations from Metabase first, then Wikidata as fallback
        const codesWithWdCode = allCapacities.map(cap => ({
          code: cap.code,
          wd_code: cap.wd_code!,
        }));

        // Try Metabase first
        let translatedCapacities = await fetchMetabase(codesWithWdCode, targetLanguage);

        // If no results from Metabase, try Wikidata
        if (!translatedCapacities || translatedCapacities.length === 0) {
          console.log('No results from Metabase, falling back to Wikidata for translations');
          translatedCapacities = await fetchWikidata(codesWithWdCode, targetLanguage);
        }

        if (translatedCapacities && translatedCapacities.length > 0) {
          // Update the cache with translated names and descriptions
          const updatedCapacityCache = new Map(capacityCache);

          translatedCapacities.forEach((translatedCap: any) => {
            const existingCapacity = updatedCapacityCache.get(
              Number(translatedCap.wd_code.replace('Q', ''))
            );
            if (existingCapacity) {
              updatedCapacityCache.set(existingCapacity.code, {
                ...existingCapacity,
                name: translatedCap.name || existingCapacity.name,
                description: translatedCap.description || existingCapacity.description,
                metabase_code: translatedCap.metabase_code || existingCapacity.metabase_code,
              });
            }
          });

          // Update cache in React Query
          queryClient.setQueryData([QUERY_KEYS.ALL_CAPACITIES], updatedCapacityCache);

          // Save to localStorage
          saveCache(updatedCapacityCache, childrenCache, true);

          console.log(
            `Updated ${translatedCapacities.length} capacity translations for language: ${targetLanguage}`
          );
        }
      } catch (error) {
        console.error('Error refreshing translations:', error);
      } finally {
        setIsLoading(false);
      }
    },
    [session?.user?.token, capacityCache, childrenCache, queryClient]
  );

  // Check if a capacity has children
  const hasChildren = (code: number): boolean => {
    const children = childrenCache.get(code);
    return Array.isArray(children) && children.length > 0;
  };

  // Get a capacity from the cache
  const getCapacity = (code: number): Capacity | undefined => {
    return capacityCache.get(code);
  };

  // Prepare context value
  const contextValue = {
    isLoaded,
    hasChildren,
    getCapacity,
    prefetchCapacityData,
    preloadCapacities,
    clearCache,
    clearCapacityCache,
    refreshTranslations,
  };

  return (
    <CapacityCacheContext.Provider value={contextValue}>{children}</CapacityCacheContext.Provider>
  );
}

// Custom hook to use the capacity cache context
export function useCapacityCache() {
  const context = useContext(CapacityCacheContext);
  if (!context) {
    throw new Error('useCapacityCache must be used within a CapacityCacheProvider');
  }
  return context;
}
