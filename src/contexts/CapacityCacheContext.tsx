'use client';
import { capacityService } from '@/services/capacityService';
import { Capacity } from '@/types/capacity';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';

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

// Enhanced cache structure to include metadata
interface EnhancedCapacity extends Capacity {
  wd_code?: string;
  metabase_code?: string;
  names?: Record<string, string>;
  descriptions?: Record<string, string>;
}

// Function to persist cache in localStorage
const saveCache = (
  capacities: Map<number, EnhancedCapacity>,
  children: Map<number, number[]>,
  currentLanguage: string,
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
      currentLanguage,
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
  isLoadingTranslations: boolean;
  isDescriptionsReady: boolean;
  hasChildren: (code: number) => boolean;
  getCapacity: (code: number) => EnhancedCapacity | undefined;
  getName: (code: number, language?: string) => string;
  getDescription: (code: number, language?: string) => string;
  getMetabaseCode: (code: number) => string;
  getWdCode: (code: number) => string;
  prefetchCapacityData: () => Promise<void>;
  preloadCapacities: () => Promise<void>;
  clearCache: () => void;
  clearCapacityCache: () => void;
  refreshTranslations: (targetLanguage: string) => Promise<void>;
  applyTranslationsToMainFields: (targetLanguage: string) => number;
}

const CapacityCacheContext = createContext<CapacityCacheContextType>({
  isLoaded: false,
  isLoadingTranslations: false,
  isDescriptionsReady: false,
  hasChildren: () => false,
  getCapacity: () => undefined,
  getName: () => '',
  getDescription: () => '',
  getMetabaseCode: () => '',
  getWdCode: () => '',
  prefetchCapacityData: async () => {},
  preloadCapacities: async () => {},
  clearCache: () => {},
  clearCapacityCache: () => {},
  refreshTranslations: async () => {},
  applyTranslationsToMainFields: () => 0,
});

export function CapacityCacheProvider({
  children,
  language = 'en',
}: {
  children: React.ReactNode;
  language?: string;
}) {
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const [isManuallyLoaded, setIsManuallyLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingTranslations, setIsLoadingTranslations] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState('en');
  const [descriptionsLoadedFor, setDescriptionsLoadedFor] = useState<string>('');
  const [isDescriptionsReady, setIsDescriptionsReady] = useState(false);
  const hasCalled = useRef(false);
  const descriptionsInitialized = useRef(false);

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
          let capacitiesMap = objectToMap(parsedCache.capacities);

          // Keep the translation cache separate - no migration needed

          queryClient.setQueryData([QUERY_KEYS.ALL_CAPACITIES], capacitiesMap);

          // Debug info - show only once
          const capacityCount = Object.keys(parsedCache.capacities).length;
          const childrenCount = parsedCache.children ? Object.keys(parsedCache.children).length : 0;
          console.log(
            `🔄 Restored cache: ${capacityCount} capacities, ${childrenCount} parent-child relationships`
          );
        }

        if (parsedCache.children) {
          const childrenMap = objectToMap(parsedCache.children);
          queryClient.setQueryData([QUERY_KEYS.CHILDREN_MAP], childrenMap);
        }

        // Restore language state
        if (parsedCache.currentLanguage) {
          setCurrentLanguage(parsedCache.currentLanguage);
          setDescriptionsLoadedFor(parsedCache.currentLanguage);
          setIsDescriptionsReady(true);
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
  const { data: capacityCache = new Map<number, EnhancedCapacity>(), isSuccess: isCacheLoaded } =
    useQuery({
      queryKey: [QUERY_KEYS.ALL_CAPACITIES],
      queryFn: () => {
        // Return the existing cache or a new Map
        const existingCache = queryClient.getQueryData<Map<number, EnhancedCapacity>>([
          QUERY_KEYS.ALL_CAPACITIES,
        ]);
        return existingCache || new Map<number, EnhancedCapacity>();
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

  // Function to apply existing translations to main fields
  const applyTranslationsToMainFields = useCallback(
    (targetLanguage: string) => {
      if (capacityCache.size === 0) return 0;

      const updatedCache = new Map(capacityCache);
      let appliedCount = 0;

      // First try to get translations from the separate translation cache
      try {
        const translationCache = localStorage.getItem('capx-translations-cache');
        if (translationCache) {
          const parsedTranslations = JSON.parse(translationCache);
          const translationNames = parsedTranslations.names || {};
          const translationDescriptions = parsedTranslations.descriptions || {};

          Array.from(capacityCache.values()).forEach(capacity => {
            const code = capacity.code;
            if (translationNames[code] || translationDescriptions[code]) {
              const updatedCapacity = {
                ...capacity,
                name: translationNames[code] || capacity.name,
                description: translationDescriptions[code] || capacity.description,
              };
              updatedCache.set(code, updatedCapacity);
              appliedCount++;
            }
          });

          if (appliedCount > 0) {
            queryClient.setQueryData([QUERY_KEYS.ALL_CAPACITIES], updatedCache);
            // Also save to localStorage to persist the main field updates
            saveCache(updatedCache, childrenCache, targetLanguage, true);
            console.log(
              `🔄 Applied ${appliedCount} translations from translation cache for ${targetLanguage}`
            );
            return appliedCount;
          }
        }
      } catch (error) {
        console.warn('Error reading translation cache:', error);
      }

      // Fallback to internal cache structure
      Array.from(capacityCache.values()).forEach(capacity => {
        if (capacity.names && capacity.names[targetLanguage]) {
          const updatedCapacity = {
            ...capacity,
            name: capacity.names[targetLanguage],
            description:
              capacity.descriptions && capacity.descriptions[targetLanguage]
                ? capacity.descriptions[targetLanguage]
                : capacity.description,
          };
          updatedCache.set(capacity.code, updatedCapacity);
          appliedCount++;
        }
      });

      if (appliedCount > 0) {
        queryClient.setQueryData([QUERY_KEYS.ALL_CAPACITIES], updatedCache);
        // Also save to localStorage to persist the main field updates
        saveCache(updatedCache, childrenCache, targetLanguage, true);
        console.log(
          `🔄 Applied ${appliedCount} cached translations to main fields for ${targetLanguage}`
        );
      }

      return appliedCount;
    },
    [capacityCache, childrenCache, queryClient]
  );

  // Function to clear cache if language mismatch is detected
  const clearCacheIfLanguageMismatch = useCallback((targetLanguage: string) => {
    if (typeof window === 'undefined') return false;
    
    try {
      // Check main cache language
      const savedCache = localStorage.getItem('capx-capacity-cache');
      if (savedCache) {
        const parsedCache = JSON.parse(savedCache);
        if (parsedCache.currentLanguage && parsedCache.currentLanguage !== targetLanguage) {
          console.log(`🔄 Language mismatch detected: cached=${parsedCache.currentLanguage}, target=${targetLanguage}`);
          // We need to defer this to avoid circular dependency
          setTimeout(() => clearCache(), 0);
          return true;
        }
      }

      // Check translation cache for stale data
      const translationCache = localStorage.getItem('capx-translations-cache');
      if (translationCache) {
        const parsedTranslations = JSON.parse(translationCache);
        if (parsedTranslations.language && parsedTranslations.language !== targetLanguage) {
          console.log(`🔄 Translation cache language mismatch: cached=${parsedTranslations.language}, target=${targetLanguage}`);
          // We need to defer this to avoid circular dependency
          setTimeout(() => clearCache(), 0);
          return true;
        }
      }
    } catch (error) {
      console.error('Error checking cache language mismatch:', error);
      // We need to defer this to avoid circular dependency
      setTimeout(() => clearCache(), 0);
      return true;
    }
    
    return false;
  }, []); // Remove clearCache from dependencies to avoid circular dependency

  // Function to integrate translations directly into main cache structure (define early to use in useEffects)
  const integrateTranslationsIntoCache = useCallback(
    async (targetLanguage: string) => {
      if (!session?.user?.token || capacityCache.size === 0) return;

      try {
        setIsLoadingTranslations(true);
        console.log(
          `🌍 Integrating translations for ${targetLanguage} into main cache structure...`
        );

        // First, try to apply existing cached translations
        const appliedCount = applyTranslationsToMainFields(targetLanguage);
        if (appliedCount > 0) {
          console.log(
            `✅ Applied ${appliedCount} existing translations, checking if more needed...`
          );
        }

        // Get all capacity codes that have wd_code but don't have translations for target language
        const capacitiesNeedingTranslation = Array.from(capacityCache.values()).filter(cap => {
          return cap.wd_code && (!cap.names || !cap.names[targetLanguage]);
        });

        if (capacitiesNeedingTranslation.length === 0) {
          console.log(`✅ All capacities already have translations for ${targetLanguage}`);
          return;
        }

        // Fetch translations from Metabase first, then Wikidata as fallback
        const codesWithWdCode = capacitiesNeedingTranslation.map(cap => ({
          code: cap.code,
          wd_code: cap.wd_code!,
        }));

        console.log(`📡 Fetching translations for ${codesWithWdCode.length} capacities...`);

        // Try Metabase first
        let translatedCapacities = await capacityService.fetchMetabaseTranslations(
          codesWithWdCode,
          targetLanguage
        );

        // If no results from Metabase, try Wikidata as fallback
        if (!translatedCapacities || translatedCapacities.length === 0) {
          console.log('📡 No results from Metabase, falling back to Wikidata for translations');
          translatedCapacities = await capacityService.fetchWikidataTranslations(
            codesWithWdCode,
            targetLanguage
          );
        }

        if (translatedCapacities && translatedCapacities.length > 0) {
          // Update the cache with translated names and descriptions integrated into main structure
          const updatedCapacityCache = new Map(capacityCache);

          translatedCapacities.forEach((translatedCap: any) => {
            // Find the capacity by matching wd_code or code
            let matchingCapacity: EnhancedCapacity | undefined;
            let matchingCode: number | undefined;

            // Try to find by exact code match first
            if (translatedCap.code) {
              matchingCapacity = updatedCapacityCache.get(Number(translatedCap.code));
              matchingCode = Number(translatedCap.code);
            }

            // If not found and we have wd_code, try to find by wd_code
            if (!matchingCapacity && translatedCap.wd_code) {
              for (const [code, capacity] of updatedCapacityCache) {
                if (capacity.wd_code === translatedCap.wd_code) {
                  matchingCapacity = capacity;
                  matchingCode = code;
                  break;
                }
              }
            }

            if (matchingCapacity && matchingCode !== undefined) {
              // Preserve existing translations structure while integrating new ones
              const names = matchingCapacity.names || {};
              const descriptions = matchingCapacity.descriptions || {};

              // Add the new translation
              names[targetLanguage] = translatedCap.name || matchingCapacity.name;
              descriptions[targetLanguage] =
                translatedCap.description || matchingCapacity.description;

              // Update capacity with integrated translations, always update main fields for target language
              const updatedCapacity = {
                ...matchingCapacity,
                names,
                descriptions,
                // Always update main fields to the target language
                name: translatedCap.name || matchingCapacity.name,
                description: translatedCap.description || matchingCapacity.description,
                metabase_code: translatedCap.metabase_code || matchingCapacity.metabase_code,
              };

              updatedCapacityCache.set(matchingCode, updatedCapacity);
            }
          });

          // Update cache in React Query
          queryClient.setQueryData([QUERY_KEYS.ALL_CAPACITIES], updatedCapacityCache);

          // Save to localStorage with integrated translations
          saveCache(updatedCapacityCache, childrenCache, targetLanguage, true);

          console.log(
            `✅ Integrated ${translatedCapacities.length} new translations for language: ${targetLanguage} into main cache structure`
          );
        } else {
          console.log(`⚠️ No new translations found for language: ${targetLanguage}`);
        }
      } catch (error) {
        console.error('Error integrating translations into cache:', error);
      } finally {
        setIsLoadingTranslations(false);
      }
    },
    [
      session?.user?.token,
      capacityCache,
      childrenCache,
      queryClient,
      currentLanguage,
      applyTranslationsToMainFields,
    ]
  );

  // Load all descriptions for a specific language (define early to use in useEffects)
  const loadAllDescriptions = useCallback(
    async (targetLanguage: string) => {
      if (!session?.user?.token) return;

      setIsDescriptionsReady(false);
      setCurrentLanguage(targetLanguage);

      try {
        console.log(
          `🔄 Loading descriptions for all ${capacityCache.size} capacities in ${targetLanguage}...`
        );

        // Get all capacity codes that need translations
        const capacityCodes = Array.from(capacityCache.keys());
        const codesNeedingTranslations = capacityCodes.filter(code => {
          const capacity = capacityCache.get(code);
          return !capacity?.names?.[targetLanguage] || !capacity?.descriptions?.[targetLanguage];
        });

        console.log(
          `📝 Found ${codesNeedingTranslations.length} capacities needing translations in ${targetLanguage}`
        );

        // Load translations in batches to avoid overwhelming the API
        const batchSize = 10;
        const updatedCache = new Map(capacityCache);

        for (let i = 0; i < codesNeedingTranslations.length; i += batchSize) {
          const batch = codesNeedingTranslations.slice(i, i + batchSize);

          await Promise.all(
            batch.map(async code => {
              try {
                const response = await capacityService.fetchCapacityDescription(
                  code,
                  {
                    headers: { Authorization: `Token ${session.user.token}` },
                  },
                  targetLanguage
                );

                const capacity = updatedCache.get(code);
                if (capacity) {
                  const updatedCapacity = {
                    ...capacity,
                    names: {
                      ...capacity.names,
                      [targetLanguage]: response.name || '',
                    },
                    descriptions: {
                      ...capacity.descriptions,
                      [targetLanguage]: response.description || '',
                    },
                    // Update main fields to target language
                    name: response.name || capacity.name,
                    description: response.description || capacity.description,
                    wd_code: response.wdCode || capacity.wd_code || '',
                    metabase_code: response.metabaseCode || capacity.metabase_code || '',
                  };
                  updatedCache.set(code, updatedCapacity);
                }
              } catch (error) {
                console.error(`Error loading description for capacity ${code}:`, error);
              }
            })
          );

          // Update progress
          console.log(
            `✅ Loaded descriptions for batch ${Math.ceil((i + batchSize) / batchSize)} of ${Math.ceil(codesNeedingTranslations.length / batchSize)}`
          );
        }

        // Update the cache
        queryClient.setQueryData([QUERY_KEYS.ALL_CAPACITIES], updatedCache);

        // Save cache with integrated translations
        saveCache(updatedCache, childrenCache, targetLanguage, true);

        // Mark descriptions as ready for this language
        setDescriptionsLoadedFor(targetLanguage);
        setIsDescriptionsReady(true);

        console.log(`🎉 Finished loading all descriptions in ${targetLanguage}`);
      } catch (error) {
        console.error('Error loading all descriptions:', error);
        setIsDescriptionsReady(false);
      }
    },
    [capacityCache, session?.user?.token, queryClient]
  );

  // Sync with app language and integrate translations when cache is ready
  useEffect(() => {
    if (language !== currentLanguage && isLoaded && capacityCache.size > 0) {
      console.log(
        `🌍 Language changed from ${currentLanguage} to ${language}, checking for cached translations...`
      );

      // First check if there's a language mismatch in localStorage and clear if needed
      const hadMismatch = clearCacheIfLanguageMismatch(language);
      if (hadMismatch) {
        console.log(`🔄 Cache was cleared due to language mismatch, will reload translations for ${language}`);
        setCurrentLanguage(language);
        setIsDescriptionsReady(false);
        setDescriptionsLoadedFor('');
        descriptionsInitialized.current = false;
        return; // Let the auto-initialization useEffect handle the reload
      }

      // First check if we already have cached translations for this language
      const hasTranslationsInCache = Array.from(capacityCache.values()).some(capacity => {
        return (
          capacity.names &&
          capacity.names[language] &&
          capacity.descriptions &&
          capacity.descriptions[language]
        );
      });

      if (hasTranslationsInCache) {
        // Apply existing translations immediately
        console.log(`✅ Found cached translations for ${language}, applying to main fields...`);
        const appliedCount = applyTranslationsToMainFields(language);

        setCurrentLanguage(language);
        setIsDescriptionsReady(true);
        setDescriptionsLoadedFor(language);

        console.log(
          `✅ Successfully switched to ${language} with ${appliedCount} translations applied`
        );
      } else {
        // Need to fetch translations
        console.log(`🔄 No cached translations found, integrating translations for ${language}...`);
        setCurrentLanguage(language);
        setIsDescriptionsReady(false);
        setDescriptionsLoadedFor('');
        descriptionsInitialized.current = false;

        // Integrate translations for the new language
        integrateTranslationsIntoCache(language)
          .then(() => {
            setIsDescriptionsReady(true);
            setDescriptionsLoadedFor(language);
            console.log(`✅ Translations integrated for ${language}`);
          })
          .catch(error => {
            console.error(`❌ Failed to integrate translations for ${language}:`, error);
            setIsDescriptionsReady(false);
          });
      }
    } else if (language !== currentLanguage) {
      // Just update the language if cache is not ready yet
      setCurrentLanguage(language);
    }
  }, [
    language,
    currentLanguage,
    isLoaded,
    capacityCache.size,
    applyTranslationsToMainFields,
    integrateTranslationsIntoCache,
    clearCacheIfLanguageMismatch,
  ]);

  // Auto-initialize translations when cache is loaded and we have a session
  useEffect(() => {
    if (
      isLoaded &&
      session?.user?.token &&
      capacityCache.size > 0 &&
      !descriptionsInitialized.current &&
      currentLanguage === language // Only initialize if current language matches app language
    ) {
      descriptionsInitialized.current = true;
      console.log(`🚀 Auto-initializing translations for language: ${currentLanguage}`);

      // First check if we already have cached translations for this language
      const hasExistingTranslations = Array.from(capacityCache.values()).some(capacity => {
        return (
          capacity.names &&
          capacity.names[currentLanguage] &&
          capacity.descriptions &&
          capacity.descriptions[currentLanguage]
        );
      });

      if (hasExistingTranslations) {
        console.log(
          `✅ Found existing translations for ${currentLanguage}, applying to main fields`
        );

        // Apply existing translations to main fields immediately
        const updatedCache = new Map(capacityCache);
        let appliedCount = 0;

        Array.from(capacityCache.values()).forEach(capacity => {
          if (capacity.names && capacity.names[currentLanguage]) {
            const updatedCapacity = {
              ...capacity,
              name: capacity.names[currentLanguage],
              description:
                capacity.descriptions && capacity.descriptions[currentLanguage]
                  ? capacity.descriptions[currentLanguage]
                  : capacity.description,
            };
            updatedCache.set(capacity.code, updatedCapacity);
            appliedCount++;
          }
        });

        if (appliedCount > 0) {
          queryClient.setQueryData([QUERY_KEYS.ALL_CAPACITIES], updatedCache);
          console.log(
            `🔄 Applied ${appliedCount} existing translations to main fields for ${currentLanguage}`
          );
        }

        setIsDescriptionsReady(true);
        setDescriptionsLoadedFor(currentLanguage);
      } else {
        // Use the new integration method to fetch translations
        integrateTranslationsIntoCache(currentLanguage)
          .then(() => {
            setIsDescriptionsReady(true);
            setDescriptionsLoadedFor(currentLanguage);
            console.log(`✅ Initial translations integrated for ${currentLanguage}`);
          })
          .catch(error => {
            console.error(
              `❌ Failed to integrate initial translations for ${currentLanguage}:`,
              error
            );
            setIsDescriptionsReady(false);
          });
      }
    }
  }, [isLoaded, session?.user?.token, capacityCache.size, currentLanguage, language, queryClient]);

  // Function to clear the entire cache
  const clearCache = useCallback(() => {
    queryClient.removeQueries({ queryKey: [QUERY_KEYS.ALL_CAPACITIES] });
    queryClient.removeQueries({ queryKey: [QUERY_KEYS.CHILDREN_MAP] });
    setIsManuallyLoaded(false);
    hasInitializedCache = false;
    // Also clear from localStorage if being used
    if (typeof window !== 'undefined') {
      localStorage.removeItem('capx-capacity-cache');
      localStorage.removeItem('capx-translations-cache');
      console.log('🗑️ Cleared localStorage caches: capx-capacity-cache, capx-translations-cache');
    }
  }, [queryClient]);


  // Persist cache in localStorage when changing (only if there are data)
  useEffect(() => {
    if (isCacheLoaded && isChildrenCacheLoaded && capacityCache.size > 0) {
      // Use debounce to avoid multiple saves
      const timer = setTimeout(() => {
        saveCache(capacityCache, childrenCache, currentLanguage);
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [isCacheLoaded, isChildrenCacheLoaded, capacityCache, childrenCache]);

  // This useEffect was removed to prevent conflicts with the main language change handler above

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
        metabase_code: rootCapacity.metabase_code || '',
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
            const childData = children[childCode];
            newCapacityCache.set(childCode, {
              code: childCode,
              name:
                typeof childData === 'string'
                  ? childData
                  : childData?.name || `Capacity ${childCode}`,
              color: 'technology',
              icon: '',
              hasChildren: false,
              skill_type: code,
              skill_wikidata_item: '',
              description: '',
              wd_code: typeof childData === 'object' ? childData?.wd_code || '' : '',
              metabase_code: typeof childData === 'object' ? childData?.metabase_code || '' : '',
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
                const grandChildData = grandChildren[grandChildCode];
                newCapacityCache.set(grandChildCode, {
                  code: grandChildCode,
                  name:
                    typeof grandChildData === 'string'
                      ? grandChildData
                      : grandChildData?.name || `Capacity ${grandChildCode}`,
                  color: 'technology',
                  icon: '',
                  hasChildren: false,
                  skill_type: childCode,
                  skill_wikidata_item: '',
                  description: '',
                  wd_code: typeof grandChildData === 'object' ? grandChildData?.wd_code || '' : '',
                  metabase_code:
                    typeof grandChildData === 'object' ? grandChildData?.metabase_code || '' : '',
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
    saveCache(newCapacityCache, newChildrenCache, 'en', true);

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

  // Function to refresh translations for a specific language (now uses integration)
  const refreshTranslations = useCallback(
    async (targetLanguage: string) => {
      if (!session?.user?.token) return;

      try {
        setIsLoading(true);
        setCurrentLanguage(targetLanguage);

        await integrateTranslationsIntoCache(targetLanguage);
      } catch (error) {
        console.error('Error refreshing translations:', error);
      } finally {
        setIsLoading(false);
      }
    },
    [session?.user?.token, integrateTranslationsIntoCache]
  );

  // Check if a capacity has children
  const hasChildren = (code: number): boolean => {
    const children = childrenCache.get(code);
    return Array.isArray(children) && children.length > 0;
  };

  // Get a capacity from the cache
  const getCapacity = (code: number): EnhancedCapacity | undefined => {
    return capacityCache.get(code);
  };

  // Get name for a capacity in specific language
  const getName = (code: number, language: string = currentLanguage): string => {
    const capacity = capacityCache.get(code);
    if (!capacity) return '';

    // Try to get name in the requested language
    if (capacity.names && capacity.names[language]) {
      return capacity.names[language];
    }

    // Fallback to default name
    return capacity.name || '';
  };

  // Get description for a capacity in specific language
  const getDescription = (code: number, language: string = currentLanguage): string => {
    const capacity = capacityCache.get(code);
    if (!capacity) return '';

    // Try to get description in the requested language
    if (capacity.descriptions && capacity.descriptions[language]) {
      return capacity.descriptions[language];
    }

    // Fallback to default description
    return capacity.description || '';
  };

  // Get metabase code for a capacity
  const getMetabaseCode = (code: number): string => {
    const capacity = capacityCache.get(code);
    return capacity?.metabase_code || '';
  };

  // Get wd code for a capacity
  const getWdCode = (code: number): string => {
    const capacity = capacityCache.get(code);
    return capacity?.wd_code || '';
  };

  // Check if descriptions are ready for current language
  const descriptionsReady = isDescriptionsReady && descriptionsLoadedFor === currentLanguage;

  // Prepare context value
  const contextValue = {
    isLoaded,
    isLoadingTranslations,
    isDescriptionsReady,
    hasChildren,
    getCapacity,
    getName,
    getDescription,
    getMetabaseCode,
    getWdCode,
    prefetchCapacityData,
    preloadCapacities,
    clearCache,
    clearCapacityCache,
    refreshTranslations,
    applyTranslationsToMainFields,
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
