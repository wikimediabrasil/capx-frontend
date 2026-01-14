'use client';

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { QueryClient } from '@tanstack/react-query';
import { getCapacityColor, getCapacityIcon } from '@/lib/utils/capacitiesUtils';
import { capacityService } from '@/services/capacityService';
import { CapacityStore, CapacityData, UnifiedCache } from './types';

// Function to determine hierarchy info based on capacity code
const getHierarchyInfo = (code: number) => {
  const codeStr = code.toString();

  let category = '';
  if (codeStr.startsWith('10')) category = 'organizational';
  else if (codeStr.startsWith('36')) category = 'communication';
  else if (codeStr.startsWith('50')) category = 'learning';
  else if (codeStr.startsWith('56')) category = 'community';
  else if (codeStr.startsWith('65')) category = 'social';
  else if (codeStr.startsWith('74')) category = 'strategic';
  else if (codeStr.startsWith('106')) category = 'technology';
  else category = 'organizational';

  return {
    color: getCapacityColor(category),
    icon: getCapacityIcon(code),
    category,
  };
};

// Get initial language from localStorage
const getInitialLanguage = (): string => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('language') || 'en';
  }
  return 'en';
};

// Initial state
const initialState: UnifiedCache & { isLoadingTranslations: boolean } = {
  capacities: {},
  children: {},
  language: getInitialLanguage(),
  timestamp: 0,
  isLoadingTranslations: false,
};

export const useCapacityStore = create<CapacityStore>()(
  devtools(
    persist(
      (set, get) => ({
        // State
        ...initialState,

        // Computed state getters
        getIsLoaded: () => Object.keys(get().capacities).length > 0,
        getIsDescriptionsReady: () =>
          Object.keys(get().capacities).length > 0 && !get().isLoadingTranslations,

        // Getter methods
        getName: (code: number): string => {
          const capacity = get().capacities[code];
          if (capacity?.name) {
            return capacity.name.charAt(0).toUpperCase() + capacity.name.slice(1).toLowerCase();
          }
          return `Capacity ${code}`;
        },

        getDescription: (code: number): string => {
          return get().capacities[code]?.description || '';
        },

        getWdCode: (code: number): string => {
          return get().capacities[code]?.wd_code || '';
        },

        getMetabaseCode: (code: number): string => {
          return get().capacities[code]?.metabase_code || '';
        },

        getColor: (code: number): string => {
          const capacity = get().capacities[code];
          if (capacity?.color) return capacity.color;
          return getHierarchyInfo(code).color;
        },

        getIcon: (code: number): string => {
          const capacity = get().capacities[code];
          if (capacity?.icon) return capacity.icon;
          return getHierarchyInfo(code).icon;
        },

        getChildren: (parentCode: number): CapacityData[] => {
          const state = get();
          const childCodes = state.children[parentCode] || [];
          return childCodes.map(code => state.capacities[code]).filter(Boolean);
        },

        getCapacity: (code: number): CapacityData | null => {
          return get().capacities[code] || null;
        },

        getRootCapacities: (): CapacityData[] => {
          return Object.values(get().capacities).filter(capacity => capacity.level === 1);
        },

        hasChildren: (code: number): boolean => {
          return get().capacities[code]?.hasChildren || false;
        },

        isFallbackTranslation: (code: number): boolean => {
          return get().capacities[code]?.isFallbackTranslation || false;
        },

        // Actions
        updateLanguage: async (newLanguage: string, token: string) => {
          if (!token) return;

          const state = get();

          // Check if already loaded for this language
          if (state.language === newLanguage && Object.keys(state.capacities).length > 0) {
            return;
          }

          // Prevent concurrent requests
          if (state.isLoadingTranslations) {
            return;
          }

          set({ isLoadingTranslations: true });

          try {
            // Try to load from localStorage first
            if (typeof window !== 'undefined') {
              try {
                const cached = localStorage.getItem('capx-unified-cache');
                if (cached) {
                  const parsed = JSON.parse(cached);
                  if (
                    parsed.language === newLanguage &&
                    Object.keys(parsed.capacities).length > 0
                  ) {
                    set({
                      capacities: parsed.capacities,
                      children: parsed.children,
                      language: parsed.language,
                      timestamp: parsed.timestamp,
                      isLoadingTranslations: false,
                    });
                    return;
                  }
                }
              } catch {
                // Silently handle cache loading errors
              }
            }

            // Fetch root capacities
            const rootCapacities = await capacityService.fetchCapacities(
              {
                params: { language: newLanguage },
                headers: { Authorization: `Token ${token}` },
              },
              newLanguage
            );

            if (!rootCapacities || rootCapacities.length === 0) {
              set({ isLoadingTranslations: false });
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
                hasChildren: capacity.hasChildren !== false,
                level: capacity.level || 1,
                skill_type: capacity.skill_type,
                skill_wikidata_item: capacity.skill_wikidata_item,
                parentCapacity: capacity.parentCapacity,
                category: hierarchyInfo.category,
                isFallbackTranslation: false,
              };
            });

            // Fetch all children and grandchildren for each root capacity
            for (const rootCapacity of rootCapacities) {
              try {
                const childrenResponse = await capacityService.fetchCapacitiesByType(
                  rootCapacity.code.toString(),
                  { headers: { Authorization: `Token ${token}` } },
                  newLanguage
                );

                if (childrenResponse && typeof childrenResponse === 'object') {
                  const childrenEntries = Object.entries(childrenResponse as Record<string, any>);

                  newCache.children[rootCapacity.code] = childrenEntries.map(([code]) =>
                    parseInt(code, 10)
                  );

                  for (const [childCode, childData] of childrenEntries) {
                    const childCodeNum = parseInt(childCode, 10);
                    const hierarchyInfo = getHierarchyInfo(Number(rootCapacity.code));

                    const childName =
                      typeof childData === 'string'
                        ? childData
                        : (childData as any)?.name || `Capacity ${childCode}`;

                    newCache.capacities[childCodeNum] = {
                      code: childCodeNum,
                      name: childName,
                      description:
                        typeof childData === 'object' ? (childData as any)?.description || '' : '',
                      wd_code:
                        typeof childData === 'object' ? (childData as any)?.wd_code || '' : '',
                      metabase_code:
                        typeof childData === 'object'
                          ? (childData as any)?.metabase_code || ''
                          : '',
                      color: hierarchyInfo.color,
                      icon: hierarchyInfo.icon,
                      hasChildren: false,
                      level: 2,
                      skill_type: childCodeNum,
                      skill_wikidata_item: '',
                      parentCapacity: rootCapacity,
                      category: hierarchyInfo.category,
                      isFallbackTranslation: false,
                    };

                    // Try to fetch grandchildren
                    try {
                      const grandchildrenResponse = await capacityService.fetchCapacitiesByType(
                        childCode,
                        { headers: { Authorization: `Token ${token}` } },
                        newLanguage
                      );

                      if (grandchildrenResponse && typeof grandchildrenResponse === 'object') {
                        const grandchildrenEntries = Object.entries(
                          grandchildrenResponse as Record<string, any>
                        );

                        if (grandchildrenEntries.length > 0) {
                          newCache.capacities[childCodeNum].hasChildren = true;
                          newCache.children[childCodeNum] = grandchildrenEntries.map(([code]) =>
                            parseInt(code, 10)
                          );

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
                              color: hierarchyInfo.color,
                              icon: hierarchyInfo.icon,
                              hasChildren: false,
                              level: 3,
                              skill_type: grandchildCodeNum,
                              skill_wikidata_item: '',
                              parentCapacity: newCache.capacities[childCodeNum],
                              category: hierarchyInfo.category,
                              isFallbackTranslation: false,
                            };
                          }
                        }
                      }
                    } catch {
                      // Silently continue if grandchildren fetch fails
                    }
                  }
                }
              } catch {
                // Silently continue if children fetch fails
              }
            }

            // Get all capacity codes that need translations
            const allCodesNeedingTranslations = Object.values(newCache.capacities)
              .filter(
                cap => cap.wd_code && cap.level && cap.level <= 3 && cap.wd_code.trim() !== ''
              )
              .map(cap => ({ code: cap.code, wd_code: cap.wd_code! }));

            if (allCodesNeedingTranslations.length > 0) {
              const { fetchCapacitiesWithFallback } = await import('@/lib/utils/capacitiesUtils');
              const translations = await fetchCapacitiesWithFallback(
                allCodesNeedingTranslations,
                newLanguage
              );

              translations.forEach((translation: any) => {
                const matchingCapacity = Object.values(newCache.capacities).find(
                  cap => cap.wd_code === translation.wd_code
                );
                if (matchingCapacity && newCache.capacities[matchingCapacity.code]) {
                  const currentCapacity = newCache.capacities[matchingCapacity.code];
                  newCache.capacities[matchingCapacity.code] = {
                    ...currentCapacity,
                    name:
                      currentCapacity.level === 1
                        ? translation.name || currentCapacity.name
                        : translation.name && translation.name !== currentCapacity.name
                          ? translation.name
                          : currentCapacity.name,
                    isFallbackTranslation: translation.isFallbackTranslation || false,
                    description: translation.description || currentCapacity.description,
                    metabase_code: translation.metabase_code || currentCapacity.metabase_code,
                  };
                }
              });
            }

            // Mark capacities without wd_code as fallback for non-English
            if (newLanguage !== 'en') {
              Object.values(newCache.capacities).forEach(capacity => {
                if (
                  (capacity.isFallbackTranslation === undefined ||
                    capacity.isFallbackTranslation === false) &&
                  (!capacity.wd_code || capacity.wd_code.trim() === '')
                ) {
                  newCache.capacities[capacity.code].isFallbackTranslation = true;
                }
              });
            }

            // Update state
            set({
              capacities: newCache.capacities,
              children: newCache.children,
              language: newCache.language,
              timestamp: newCache.timestamp,
              isLoadingTranslations: false,
            });
          } catch (error) {
            console.error(`Error updating language to ${newLanguage}:`, error);
            set({ isLoadingTranslations: false });
          }
        },

        preloadCapacities: async (token: string) => {
          const { language, updateLanguage } = get();
          await updateLanguage(language, token);
        },

        clearCache: () => {
          if (typeof window !== 'undefined') {
            localStorage.removeItem('capx-unified-cache');
            localStorage.removeItem('capx-capacity-cache');
            localStorage.removeItem('capx-translations-cache');
          }
          set({
            capacities: {},
            children: {},
            language: 'en',
            timestamp: 0,
            isLoadingTranslations: false,
          });
        },

        setCache: (cache: UnifiedCache) => {
          set({
            capacities: cache.capacities,
            children: cache.children,
            language: cache.language,
            timestamp: cache.timestamp,
          });
        },

        invalidateQueryCache: (queryClient: QueryClient, language: string) => {
          queryClient.removeQueries({
            predicate: query => {
              const key = query.queryKey[0] as string;
              return key?.includes('capacities') && !key.includes(language);
            },
          });
          queryClient.invalidateQueries({
            predicate: query => {
              const key = query.queryKey as string[];
              return key[0] === 'capacities' && key.includes(language);
            },
          });
        },
      }),
      {
        name: 'capx-unified-cache',
        // Only persist cache data, not loading states
        partialize: state => ({
          capacities: state.capacities,
          children: state.children,
          language: state.language,
          timestamp: state.timestamp,
        }),
        // Skip hydration on server
        skipHydration: typeof window === 'undefined',
      }
    ),
    { name: 'CapacityStore', enabled: process.env.NODE_ENV === 'development' }
  )
);

// Selector hooks for optimal re-renders
export const useCapacityLanguage = () => useCapacityStore(state => state.language);
export const useCapacityIsLoading = () => useCapacityStore(state => state.isLoadingTranslations);
export const useCapacities = () => useCapacityStore(state => state.capacities);
export const useCapacityChildren = () => useCapacityStore(state => state.children);
