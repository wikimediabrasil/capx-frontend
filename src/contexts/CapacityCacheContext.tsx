'use client';
import { getCapacityColor, getCapacityIcon } from '@/lib/utils/capacitiesUtils';
import { capacityService } from '@/services/capacityService';
import { useQueryClient } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';

// Function to determine hierarchy info based on capacity code
const getHierarchyInfo = (code: number) => {
  const codeStr = code.toString();

  // Determine category and color based on code prefix
  let category = '';
  if (codeStr.startsWith('10')) category = 'organizational';
  else if (codeStr.startsWith('36')) category = 'communication';
  else if (codeStr.startsWith('50')) category = 'learning';
  else if (codeStr.startsWith('56')) category = 'community';
  else if (codeStr.startsWith('65')) category = 'social';
  else if (codeStr.startsWith('74')) category = 'strategic';
  else if (codeStr.startsWith('106')) category = 'technology';
  else category = 'organizational'; // Default fallback

  return {
    color: getCapacityColor(category),
    icon: getCapacityIcon(code),
    category,
  };
};

// Unified cache structure
interface UnifiedCache {
  capacities: Record<
    number,
    {
      code: number;
      name: string;
      description: string;
      wd_code: string;
      metabase_code: string;
      color: string;
      icon: string;
      hasChildren: boolean;
      level?: number;
      skill_type: number;
      skill_wikidata_item: string;
      parentCapacity?: any;
      category?: string;
    }
  >;
  children: Record<number, number[]>;
  language: string;
  timestamp: number;
}

interface CapacityCacheContextType {
  // Cache state
  isLoaded: boolean;
  isLoadingTranslations: boolean;
  isDescriptionsReady: boolean;
  language: string;

  // Getter functions
  getName: (code: number) => string;
  getDescription: (code: number) => string;
  getWdCode: (code: number) => string;
  getMetabaseCode: (code: number) => string;
  getColor: (code: number) => string;
  getIcon: (code: number) => string;

  // Hierarchy functions
  getChildren: (parentCode: number) => any[];
  getCapacity: (code: number) => any | null;
  getRootCapacities: () => any[];
  hasChildren: (code: number) => boolean;

  // Actions
  updateLanguage: (newLanguage: string) => Promise<void>;
  preloadCapacities: () => Promise<void>;
  clearCache: () => void;
}

const CapacityCacheContext = createContext<CapacityCacheContextType | undefined>(undefined);

export const useCapacityCache = () => {
  const context = useContext(CapacityCacheContext);
  if (!context) {
    throw new Error('useCapacityCache must be used within a CapacityCacheProvider');
  }
  return context;
};

export const CapacityCacheProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const [isLoadingTranslations, setIsLoadingTranslations] = useState(false);

  // Get initial language from localStorage or default to 'en'
  const getInitialLanguage = () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('language') || 'en';
    }
    return 'en';
  };

  const [unifiedCache, setUnifiedCache] = useState<UnifiedCache>({
    capacities: {},
    children: {},
    language: getInitialLanguage(),
    timestamp: 0,
  });

  // Load unified cache from localStorage
  const loadUnifiedCache = useCallback((language: string): UnifiedCache => {
    if (typeof window === 'undefined') {
      return { capacities: {}, children: {}, language, timestamp: 0 };
    }

    try {
      const cached = localStorage.getItem('capx-unified-cache');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed.language === language) {
          return parsed;
        }
      }
    } catch (error) {
      // Silently handle cache loading errors
    }

    return { capacities: {}, children: {}, language, timestamp: 0 };
  }, []);

  // Save unified cache to localStorage
  const saveUnifiedCache = useCallback((cache: UnifiedCache) => {
    if (typeof window === 'undefined') return;

    try {
      localStorage.setItem('capx-unified-cache', JSON.stringify(cache));
    } catch (error) {
      // Silently handle cache saving errors
    }
  }, []);

  // Fetch and update translations for a language
  const updateLanguage = useCallback(
    async (newLanguage: string) => {
      if (!session?.user?.token) {
        return;
      }

      // Use the cache language from unifiedCache instead of currentLanguage state
      if (
        unifiedCache.language === newLanguage &&
        Object.keys(unifiedCache.capacities).length > 0
      ) {
        return;
      }

      // Prevent concurrent requests for different languages
      if (isLoadingTranslations) {
        return;
      }

      setIsLoadingTranslations(true);

      try {
        // Try to load from cache first
        const cachedData = loadUnifiedCache(newLanguage);
        if (Object.keys(cachedData.capacities).length > 0) {
          setUnifiedCache(cachedData);
          setIsLoadingTranslations(false);
          return;
        }

        // Fetch root capacities
        const rootCapacities = await capacityService.fetchCapacities(
          {
            params: { language: newLanguage },
            headers: { Authorization: `Token ${session.user.token}` },
          },
          newLanguage
        );

        if (!rootCapacities || rootCapacities.length === 0) {
          setIsLoadingTranslations(false);
          return;
        }

        // Build unified cache
        const newCache: UnifiedCache = {
          capacities: {},
          children: {},
          language: newLanguage,
          timestamp: Date.now(),
        };

        // Add root capacities to cache
        rootCapacities.forEach((capacity: any) => {
          const hierarchyInfo = getHierarchyInfo(capacity.code);

          newCache.capacities[capacity.code] = {
            code: capacity.code,
            name: capacity.name,
            description: capacity.description || '',
            wd_code: capacity.wd_code || '',
            metabase_code: capacity.metabase_code || '',
            color: hierarchyInfo.color,
            icon: hierarchyInfo.icon,
            hasChildren: capacity.hasChildren !== false, // Assume true unless explicitly false
            level: capacity.level || 1,
            skill_type: capacity.skill_type,
            skill_wikidata_item: capacity.skill_wikidata_item,
            parentCapacity: capacity.parentCapacity,
            category: hierarchyInfo.category,
          };
        });

        // Now fetch all children and grandchildren for each root capacity

        for (const rootCapacity of rootCapacities) {
          try {
            // Fetch children for this root capacity
            const childrenResponse = await capacityService.fetchCapacitiesByType(
              rootCapacity.code.toString(),
              { headers: { Authorization: `Token ${session.user.token}` } },
              newLanguage
            );

            if (childrenResponse && typeof childrenResponse === 'object') {
              // Process children
              const childrenEntries = Object.entries(childrenResponse as Record<string, any>);

              // Store children codes in the cache structure
              newCache.children[rootCapacity.code] = childrenEntries.map(([code]) =>
                parseInt(code, 10)
              );

              for (const [childCode, childData] of childrenEntries) {
                const childCodeNum = parseInt(childCode, 10);
                const hierarchyInfo = getHierarchyInfo(Number(rootCapacity.code)); // Use parent's hierarchy info

                // Store child in cache
                const childName =
                  typeof childData === 'string'
                    ? childData
                    : (childData as any)?.name || `Capacity ${childCode}`;
                newCache.capacities[childCodeNum] = {
                  code: childCodeNum,
                  name: childName,
                  description:
                    typeof childData === 'object' ? (childData as any)?.description || '' : '',
                  wd_code: typeof childData === 'object' ? (childData as any)?.wd_code || '' : '',
                  metabase_code:
                    typeof childData === 'object' ? (childData as any)?.metabase_code || '' : '',
                  color: hierarchyInfo.color, // Inherit from parent
                  icon: hierarchyInfo.icon, // Inherit from parent
                  hasChildren: false, // Will be updated if we find grandchildren
                  level: 2,
                  skill_type: childCodeNum,
                  skill_wikidata_item: '',
                  parentCapacity: rootCapacity,
                  category: hierarchyInfo.category,
                };

                // Try to fetch grandchildren for each child
                try {
                  const grandchildrenResponse = await capacityService.fetchCapacitiesByType(
                    childCode,
                    { headers: { Authorization: `Token ${session.user.token}` } },
                    newLanguage
                  );

                  if (grandchildrenResponse && typeof grandchildrenResponse === 'object') {
                    const grandchildrenEntries = Object.entries(
                      grandchildrenResponse as Record<string, any>
                    );

                    if (grandchildrenEntries.length > 0) {
                      // Update parent to indicate it has children
                      newCache.capacities[childCodeNum].hasChildren = true;

                      // Store grandchildren codes
                      newCache.children[childCodeNum] = grandchildrenEntries.map(([code]) =>
                        parseInt(code, 10)
                      );

                      // Store each grandchild
                      for (const [grandchildCode, grandchildData] of grandchildrenEntries) {
                        const grandchildCodeNum = parseInt(grandchildCode, 10);
                        const grandchildName =
                          typeof grandchildData === 'string'
                            ? grandchildData
                            : (grandchildData as any)?.name || `Capacity ${grandchildCode}`;

                        newCache.capacities[grandchildCodeNum] = {
                          code: grandchildCodeNum,
                          name: grandchildName,
                          description:
                            typeof grandchildData === 'object'
                              ? (grandchildData as any)?.description || ''
                              : '',
                          wd_code:
                            typeof grandchildData === 'object'
                              ? (grandchildData as any)?.wd_code || ''
                              : '',
                          metabase_code:
                            typeof grandchildData === 'object'
                              ? (grandchildData as any)?.metabase_code || ''
                              : '',
                          color: hierarchyInfo.color, // Inherit root family color for level 3
                          icon: hierarchyInfo.icon, // Inherit from root
                          hasChildren: false,
                          level: 3,
                          skill_type: grandchildCodeNum,
                          skill_wikidata_item: '',
                          parentCapacity: newCache.capacities[childCodeNum],
                          category: hierarchyInfo.category,
                        };
                      }
                    }
                  }
                } catch (error) {
                  // Silently continue if grandchildren fetch fails
                }
              }
            }
          } catch (error) {
            // Silently continue if children fetch fails
          }
        }

        // Get all capacity codes that need translations
        const allCodesNeedingTranslations = Object.values(newCache.capacities)
          .filter(cap => cap.wd_code && cap.level && cap.level <= 2) // Only translate root and level 2
          .map(cap => ({ code: cap.code, wd_code: cap.wd_code! }));

        if (allCodesNeedingTranslations.length > 0) {
          // Try fetchCapacitiesWithFallback from capacitiesUtils
          const { fetchCapacitiesWithFallback } = await import('@/lib/utils/capacitiesUtils');
          const translations = await fetchCapacitiesWithFallback(
            allCodesNeedingTranslations,
            newLanguage
          );

          // Apply translations to cache
          translations.forEach((translation: any) => {
            const matchingCapacity = Object.values(newCache.capacities).find(
              cap => cap.wd_code === translation.wd_code
            );
            if (matchingCapacity && newCache.capacities[matchingCapacity.code]) {
              newCache.capacities[matchingCapacity.code] = {
                ...newCache.capacities[matchingCapacity.code],
                name: translation.name || newCache.capacities[matchingCapacity.code].name,
                description:
                  translation.description || newCache.capacities[matchingCapacity.code].description,
                metabase_code:
                  translation.metabase_code ||
                  newCache.capacities[matchingCapacity.code].metabase_code,
              };
            }
          });
        }

        // Update state and save cache
        setUnifiedCache(newCache);
        saveUnifiedCache(newCache);

        // Clear React Query cache for other languages and invalidate current language queries
        queryClient.removeQueries({
          predicate: query => {
            const key = query.queryKey[0] as string;
            return key?.includes('capacities') && !key.includes(newLanguage);
          },
        });

        // Invalidate queries for the new language to trigger re-fetch
        queryClient.invalidateQueries({
          predicate: query => {
            const key = query.queryKey as string[];
            return key[0] === 'capacities' && key.includes(newLanguage);
          },
        });
      } catch (error) {
        console.error(`Error updating language to ${newLanguage}:`, error);
      } finally {
        setIsLoadingTranslations(false);
      }
    },
    [
      session?.user?.token,
      unifiedCache.language,
      unifiedCache.capacities,
      isLoadingTranslations,
      loadUnifiedCache,
      saveUnifiedCache,
      queryClient,
    ]
  );

  // Getter functions
  const getName = useCallback(
    (code: number): string => {
      const capacity = unifiedCache.capacities[code];
      return capacity?.name || `Capacity ${code}`;
    },
    [unifiedCache.capacities]
  );

  const getDescription = useCallback(
    (code: number): string => {
      const capacity = unifiedCache.capacities[code];
      return capacity?.description || '';
    },
    [unifiedCache.capacities]
  );

  const getWdCode = useCallback(
    (code: number): string => {
      const capacity = unifiedCache.capacities[code];
      return capacity?.wd_code || '';
    },
    [unifiedCache.capacities]
  );

  const getMetabaseCode = useCallback(
    (code: number): string => {
      const capacity = unifiedCache.capacities[code];
      return capacity?.metabase_code || '';
    },
    [unifiedCache.capacities]
  );

  const getColor = useCallback(
    (code: number): string => {
      const capacity = unifiedCache.capacities[code];
      if (capacity?.color) {
        return capacity.color;
      }
      // Fallback to determining color from code if not cached
      const hierarchyInfo = getHierarchyInfo(code);
      return hierarchyInfo.color;
    },
    [unifiedCache.capacities]
  );

  const getIcon = useCallback(
    (code: number): string => {
      const capacity = unifiedCache.capacities[code];
      if (capacity?.icon) {
        return capacity.icon;
      }
      // Fallback to determining icon from code if not cached
      const hierarchyInfo = getHierarchyInfo(code);
      return hierarchyInfo.icon;
    },
    [unifiedCache.capacities]
  );

  // Get children from cache
  const getChildren = useCallback(
    (parentCode: number): any[] => {
      const childCodes = unifiedCache.children[parentCode] || [];
      return childCodes.map(code => unifiedCache.capacities[code]).filter(Boolean);
    },
    [unifiedCache.capacities, unifiedCache.children]
  );

  // Get single capacity from cache
  const getCapacity = useCallback(
    (code: number): any | null => {
      return unifiedCache.capacities[code] || null;
    },
    [unifiedCache.capacities]
  );

  // Get root capacities from cache
  const getRootCapacities = useCallback((): any[] => {
    return Object.values(unifiedCache.capacities).filter(capacity => capacity.level === 1);
  }, [unifiedCache.capacities]);

  // Check if a capacity has children
  const hasChildren = useCallback(
    (code: number): boolean => {
      const capacity = unifiedCache.capacities[code];
      return capacity?.hasChildren || false;
    },
    [unifiedCache.capacities]
  );

  // Preload capacities for the current language
  const preloadCapacities = useCallback(async () => {
    const currentLanguage = unifiedCache.language;
    await updateLanguage(currentLanguage);
  }, [unifiedCache.language, updateLanguage]);

  // Clear all caches
  const clearCache = useCallback(() => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('capx-unified-cache');
      localStorage.removeItem('capx-capacity-cache');
      localStorage.removeItem('capx-translations-cache');
    }

    queryClient.clear();
    setUnifiedCache({ capacities: {}, children: {}, language: 'en', timestamp: 0 });
  }, [queryClient]);

  // Initialize cache on mount
  useEffect(() => {
    const initialLanguage = getInitialLanguage();
    const initialCache = loadUnifiedCache(initialLanguage);
    setUnifiedCache(initialCache);
  }, [loadUnifiedCache]);

  const contextValue: CapacityCacheContextType = {
    isLoaded: Object.keys(unifiedCache.capacities).length > 0,
    isLoadingTranslations,
    isDescriptionsReady: Object.keys(unifiedCache.capacities).length > 0 && !isLoadingTranslations,
    language: unifiedCache.language,
    getName,
    getDescription,
    getWdCode,
    getMetabaseCode,
    getColor,
    getIcon,
    getChildren,
    getCapacity,
    getRootCapacities,
    hasChildren,
    updateLanguage,
    preloadCapacities,
    clearCache,
  };

  return (
    <CapacityCacheContext.Provider value={contextValue}>{children}</CapacityCacheContext.Provider>
  );
};
