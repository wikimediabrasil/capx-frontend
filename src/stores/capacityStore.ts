'use client';

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { QueryClient } from '@tanstack/react-query';
import {
  applyWikidataNameFallback,
  getCapacityColor,
  getCapacityIcon,
  isInvalidCapacityLabel,
  sanitizeCapacityName,
} from '@/lib/utils/capacitiesUtils';

const resolveCapacityDisplayName = (
  translationName: string | undefined,
  currentName: string | undefined,
  code: number
): string => {
  for (const candidate of [translationName, currentName]) {
    if (candidate && !isInvalidCapacityLabel(candidate)) {
      return candidate;
    }
  }
  return sanitizeCapacityName(currentName ?? translationName, code);
};
import { capacityService } from '@/services/capacityService';
import { CapacityStore, CapacityData, UnifiedCache } from './types';

// Function to determine hierarchy info based on capacity code
const getHierarchyInfo = (code: number) => {
  const codeStr = code.toString();

  let category = '';
  if (codeStr.startsWith('106')) category = 'technology';
  else if (codeStr.startsWith('10')) category = 'organizational';
  else if (codeStr.startsWith('36')) category = 'communication';
  else if (codeStr.startsWith('50')) category = 'learning';
  else if (codeStr.startsWith('56')) category = 'community';
  else if (codeStr.startsWith('65')) category = 'social';
  else if (codeStr.startsWith('74')) category = 'strategic';
  else category = 'organizational';

  return {
    color: getCapacityColor(category),
    icon: getCapacityIcon(code),
    category,
  };
};

// Build a CapacityData entry for a child/grandchild from API response data
const buildCapacityData = (
  codeNum: number,
  data: any,
  level: number,
  hierarchyInfo: ReturnType<typeof getHierarchyInfo>,
  parentCapacity: any
): CapacityData => {
  const isObj = typeof data === 'object';
  return {
    code: codeNum,
    name: sanitizeCapacityName(typeof data === 'string' ? data : data?.name || '', codeNum),
    description: isObj ? data?.description || '' : '',
    wd_code: isObj ? data?.wd_code || '' : '',
    metabase_code: isObj ? data?.metabase_code || '' : '',
    color: hierarchyInfo.color,
    icon: hierarchyInfo.icon,
    hasChildren: false,
    level,
    skill_type: codeNum,
    skill_wikidata_item: '',
    parentCapacity,
    category: hierarchyInfo.category,
    isFallbackTranslation: false,
  };
};

// Add root (level 1) capacities to the cache
const addRootCapacitiesToCache = (newCache: UnifiedCache, rootCapacities: any[]): void => {
  rootCapacities.forEach((capacity: any) => {
    const hierarchyInfo = getHierarchyInfo(capacity.code);

    newCache.capacities[capacity.code] = {
      code: capacity.code,
      name: sanitizeCapacityName(capacity.name, capacity.code),
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
};

// Fetch grandchildren (level 3) for a single child and add them to the cache
const fetchAndAddGrandchildren = async (
  newCache: UnifiedCache,
  childCodeNum: number,
  childCode: string,
  hierarchyInfo: ReturnType<typeof getHierarchyInfo>,
  token: string,
  newLanguage: string
): Promise<void> => {
  try {
    const grandchildrenResponse = await capacityService.fetchCapacitiesByType(
      childCode,
      { headers: { Authorization: `Token ${token}` } },
      newLanguage
    );

    if (!grandchildrenResponse || typeof grandchildrenResponse !== 'object') return;

    const grandchildrenEntries = Object.entries(grandchildrenResponse as Record<string, any>);
    if (grandchildrenEntries.length === 0) return;

    newCache.capacities[childCodeNum].hasChildren = true;
    newCache.children[childCodeNum] = grandchildrenEntries.map(([code]) => parseInt(code, 10));

    for (const [grandchildCode, grandchildData] of grandchildrenEntries) {
      const grandchildCodeNum = parseInt(grandchildCode, 10);
      newCache.capacities[grandchildCodeNum] = buildCapacityData(
        grandchildCodeNum,
        grandchildData,
        3,
        hierarchyInfo,
        newCache.capacities[childCodeNum]
      );
    }
  } catch {
    // Silently continue if grandchildren fetch fails
  }
};

// Fetch children (level 2) and their grandchildren for a single root capacity
const fetchAndAddChildren = async (
  newCache: UnifiedCache,
  rootCapacity: any,
  token: string,
  newLanguage: string
): Promise<void> => {
  try {
    const childrenResponse = await capacityService.fetchCapacitiesByType(
      rootCapacity.code.toString(),
      { headers: { Authorization: `Token ${token}` } },
      newLanguage
    );

    if (!childrenResponse || typeof childrenResponse !== 'object') return;

    const childrenEntries = Object.entries(childrenResponse as Record<string, any>);
    newCache.children[rootCapacity.code] = childrenEntries.map(([code]) => parseInt(code, 10));

    const hierarchyInfo = getHierarchyInfo(Number(rootCapacity.code));
    for (const [childCode, childData] of childrenEntries) {
      const childCodeNum = parseInt(childCode, 10);
      newCache.capacities[childCodeNum] = buildCapacityData(
        childCodeNum,
        childData,
        2,
        hierarchyInfo,
        rootCapacity
      );

      await fetchAndAddGrandchildren(
        newCache,
        childCodeNum,
        childCode,
        hierarchyInfo,
        token,
        newLanguage
      );
    }
  } catch {
    // Silently continue if children fetch fails
  }
};

// Fetch SPARQL translations and merge them into the cached capacities
const applyTranslations = async (newCache: UnifiedCache, newLanguage: string): Promise<void> => {
  const allCodesNeedingTranslations = Object.values(newCache.capacities)
    .filter(cap => cap.wd_code && cap.level && cap.level <= 3 && cap.wd_code.trim() !== '')
    .map(cap => ({ code: cap.code, wd_code: cap.wd_code! }));

  if (allCodesNeedingTranslations.length === 0) return;

  const { fetchCapacitiesWithFallback } = await import('@/lib/utils/capacitiesUtils');
  const translations = await fetchCapacitiesWithFallback(allCodesNeedingTranslations, newLanguage);

  translations.forEach((translation: any) => {
    const matchingCapacity = Object.values(newCache.capacities).find(
      cap => cap.wd_code === translation.wd_code
    );
    if (matchingCapacity && newCache.capacities[matchingCapacity.code]) {
      const currentCapacity = newCache.capacities[matchingCapacity.code];
      const mergedName = resolveCapacityDisplayName(
        translation.name,
        currentCapacity.name,
        matchingCapacity.code
      );
      newCache.capacities[matchingCapacity.code] = {
        ...currentCapacity,
        name: mergedName,
        isFallbackLabel: translation.isFallbackLabel || false,
        isFallbackDescription: translation.isFallbackDescription || false,
        isFallbackTranslation: translation.isFallbackTranslation || false,
        description: translation.description || currentCapacity.description,
        metabase_code: translation.metabase_code || currentCapacity.metabase_code,
      };
    }
  });
};

// Final pass: resolve any remaining URI/QID labels via Wikidata
const resolveRemainingInvalidLabels = async (
  newCache: UnifiedCache,
  newLanguage: string
): Promise<void> => {
  const stillInvalid = Object.values(newCache.capacities).filter(
    cap => isInvalidCapacityLabel(cap.name) && cap.wd_code?.trim()
  );
  if (stillInvalid.length === 0) return;

  const resolved = await applyWikidataNameFallback(
    stillInvalid.map(cap => ({ code: cap.code, wd_code: cap.wd_code!, name: cap.name })),
    newLanguage
  );
  resolved.forEach(item => {
    if (newCache.capacities[item.code as number]) {
      newCache.capacities[item.code as number].name = item.name;
    }
  });
};

// Mark capacities as fallback for non-English when translation data is missing
const markFallbackForNonEnglish = (newCache: UnifiedCache, newLanguage: string): void => {
  if (newLanguage === 'en') return;

  Object.values(newCache.capacities).forEach(capacity => {
    // Capacities without wd_code can't be translated via SPARQL
    if (
      (capacity.isFallbackTranslation === undefined || capacity.isFallbackTranslation === false) &&
      (!capacity.wd_code || capacity.wd_code.trim() === '')
    ) {
      newCache.capacities[capacity.code].isFallbackTranslation = true;
    }
    // Capacities with wd_code that were never processed by SPARQL translations
    // (isFallbackLabel is still undefined) — their labels may come from the backend
    // API already translated, but the description may be untranslated
    if (
      capacity.wd_code &&
      capacity.wd_code.trim() !== '' &&
      capacity.isFallbackLabel === undefined &&
      capacity.isFallbackDescription === undefined
    ) {
      newCache.capacities[capacity.code].isFallbackTranslation = true;
      newCache.capacities[capacity.code].isFallbackLabel = true;
      newCache.capacities[capacity.code].isFallbackDescription = true;
    }
  });
};

// Try to load a matching, valid unified cache from localStorage
const loadCacheFromLocalStorage = (newLanguage: string): UnifiedCache | null => {
  if (typeof window === 'undefined') return null;

  try {
    const cached = localStorage.getItem('capx-unified-cache');
    if (!cached) return null;

    const parsed = JSON.parse(cached);
    const parsedHasInvalidNames = Object.values(parsed.capacities || {}).some(
      (cap: { name?: string }) => isInvalidCapacityLabel(cap.name)
    );
    if (
      parsed.language === newLanguage &&
      Object.keys(parsed.capacities).length > 0 &&
      !parsedHasInvalidNames
    ) {
      return parsed as UnifiedCache;
    }
  } catch {
    // Silently handle cache loading errors
  }
  return null;
};

// Get initial language from localStorage
const getInitialLanguage = (): string => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('language') || 'en';
  }
  return 'en';
};

// Initial state
const initialState: UnifiedCache & { isLoadingTranslations: boolean; isLoaded: boolean } = {
  capacities: {},
  children: {},
  language: getInitialLanguage(),
  timestamp: 0,
  isLoadingTranslations: false,
  isLoaded: false,
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
          if (!capacity?.name) {
            return `Capacity ${code}`;
          }
          if (isInvalidCapacityLabel(capacity.name)) {
            return sanitizeCapacityName(capacity.name, code);
          }
          return capacity.name.charAt(0).toUpperCase() + capacity.name.slice(1).toLowerCase();
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

          // Check if already loaded for this language (re-fetch if cache has URI/QID labels)
          const hasInvalidCachedNames = Object.values(state.capacities).some(cap =>
            isInvalidCapacityLabel(cap.name)
          );
          if (
            state.language === newLanguage &&
            Object.keys(state.capacities).length > 0 &&
            !hasInvalidCachedNames
          ) {
            if (!state.isLoaded) {
              set({ isLoaded: true });
            }
            return;
          }

          // Prevent concurrent requests
          if (state.isLoadingTranslations) {
            return;
          }

          set({ isLoadingTranslations: true });

          try {
            // Try to load from localStorage first
            const cachedCache = loadCacheFromLocalStorage(newLanguage);
            if (cachedCache) {
              set({
                capacities: cachedCache.capacities,
                children: cachedCache.children,
                language: cachedCache.language,
                timestamp: cachedCache.timestamp,
                isLoadingTranslations: false,
                isLoaded: true,
              });
              return;
            }

            // Fetch root capacities
            const rootCapacities = await capacityService.fetchCapacities({
              params: { language: newLanguage },
              headers: { Authorization: `Token ${token}` },
            });

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

            addRootCapacitiesToCache(newCache, rootCapacities);

            // Fetch all children and grandchildren for each root capacity
            for (const rootCapacity of rootCapacities) {
              await fetchAndAddChildren(newCache, rootCapacity, token, newLanguage);
            }

            await applyTranslations(newCache, newLanguage);
            await resolveRemainingInvalidLabels(newCache, newLanguage);
            markFallbackForNonEnglish(newCache, newLanguage);

            // Update state
            set({
              capacities: newCache.capacities,
              children: newCache.children,
              language: newCache.language,
              timestamp: newCache.timestamp,
              isLoadingTranslations: false,
              isLoaded: Object.keys(newCache.capacities).length > 0,
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

        updateCapacityTranslation: (
          code: number,
          name: string,
          description: string,
          labelChanged: boolean,
          descriptionChanged: boolean
        ) => {
          const state = get();
          if (!state.capacities[code]) return;
          const current = state.capacities[code];
          // When per-field flags are absent (old cache), treat both as fallback
          // if the overall isFallbackTranslation was true
          const overallFallback = current.isFallbackTranslation ?? false;
          const wasLabelFallback = current.isFallbackLabel ?? overallFallback;
          const wasDescriptionFallback = current.isFallbackDescription ?? overallFallback;
          const newIsFallbackLabel = labelChanged ? false : wasLabelFallback;
          const newIsFallbackDescription = descriptionChanged ? false : wasDescriptionFallback;
          set({
            capacities: {
              ...state.capacities,
              [code]: {
                ...current,
                name: name || current.name,
                description: description || current.description,
                isFallbackLabel: newIsFallbackLabel,
                isFallbackDescription: newIsFallbackDescription,
                isFallbackTranslation: newIsFallbackLabel || newIsFallbackDescription,
              },
            },
          });
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
            isLoaded: false,
          });
        },

        setCache: (cache: UnifiedCache) => {
          set({
            capacities: cache.capacities,
            children: cache.children,
            language: cache.language,
            timestamp: cache.timestamp,
            isLoaded: Object.keys(cache.capacities).length > 0,
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
        version: 1,
        // Only persist cache data, not loading states
        partialize: state => ({
          capacities: state.capacities,
          children: state.children,
          language: state.language,
          timestamp: state.timestamp,
        }),
        // Skip hydration on server
        skipHydration: typeof window === 'undefined',
        onRehydrateStorage: () => state => {
          if (state && Object.keys(state.capacities).length > 0) {
            state.isLoaded = true;
          }
        },
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
