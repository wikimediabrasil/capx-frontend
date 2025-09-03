'use client';
import { capacityService } from '@/services/capacityService';
import { Capacity } from '@/types/capacity';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { getCapacityIcon, getCapacityColor } from '@/lib/utils/capacitiesUtils';

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

// Query keys - simplified, only use language for root capacities
const QUERY_KEYS = {
  ROOT_CAPACITIES: (language: string) => `root-capacities-${language}`,
  CHILD_CAPACITIES: (parentCode: number, language: string) =>
    `child-capacities-${parentCode}-${language}`,
};

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

  // Actions
  updateLanguage: (newLanguage: string) => Promise<void>;
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
  const [currentLanguage, setCurrentLanguage] = useState<string>('en');
  const [isLoadingTranslations, setIsLoadingTranslations] = useState(false);
  const [unifiedCache, setUnifiedCache] = useState<UnifiedCache>({
    capacities: {},
    children: {},
    language: 'en',
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
          console.log(
            `✅ Loaded unified cache for ${language} with ${Object.keys(parsed.capacities || {}).length} capacities`
          );
          return parsed;
        } else {
          console.log(
            `🔄 Cache language mismatch: cache=${parsed.language}, requested=${language}`
          );
        }
      }
    } catch (error) {
      console.error('Error loading unified cache:', error);
    }

    return { capacities: {}, children: {}, language, timestamp: 0 };
  }, []);

  // Save unified cache to localStorage
  const saveUnifiedCache = useCallback((cache: UnifiedCache) => {
    if (typeof window === 'undefined') return;

    try {
      localStorage.setItem('capx-unified-cache', JSON.stringify(cache));
      console.log(
        `💾 Saved unified cache for ${cache.language} with ${Object.keys(cache.capacities).length} capacities`
      );
    } catch (error) {
      console.error('Error saving unified cache:', error);
    }
  }, []);

  // Fetch and update translations for a language
  const updateLanguage = useCallback(
    async (newLanguage: string) => {
      if (!session?.user?.token) return;
      if (currentLanguage === newLanguage && Object.keys(unifiedCache.capacities).length > 0) {
        console.log(`✅ Already have data for ${newLanguage}`);
        return;
      }

      setIsLoadingTranslations(true);
      console.log(`🌍 Updating language to ${newLanguage}...`);

      try {
        // Try to load from cache first
        const cachedData = loadUnifiedCache(newLanguage);
        if (Object.keys(cachedData.capacities).length > 0) {
          setUnifiedCache(cachedData);
          setCurrentLanguage(newLanguage);
          setIsLoadingTranslations(false);
          console.log(`✅ Loaded ${newLanguage} from cache`);
          return;
        }

        // Fetch root capacities
        console.log(`📡 Fetching root capacities for ${newLanguage}...`);
        const rootCapacities = await capacityService.fetchCapacities(
          {
            params: { language: newLanguage },
            headers: { Authorization: `Token ${session.user.token}` }
          },
          newLanguage
        );

        if (!rootCapacities || rootCapacities.length === 0) {
          console.error(`❌ No root capacities found for ${newLanguage}`);
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
        rootCapacities.forEach((capacity: Capacity) => {
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
        console.log(`📡 Fetching complete hierarchy for ${rootCapacities.length} root capacities...`);
        
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
              newCache.children[rootCapacity.code] = childrenEntries.map(([code]) => parseInt(code, 10));
              
              for (const [childCode, childData] of childrenEntries) {
                const childCodeNum = parseInt(childCode, 10);
                const hierarchyInfo = getHierarchyInfo(rootCapacity.code); // Use parent's hierarchy info
                
                // Store child in cache
                const childName = typeof childData === 'string' ? childData : (childData as any)?.name || `Capacity ${childCode}`;
                newCache.capacities[childCodeNum] = {
                  code: childCodeNum,
                  name: childName,
                  description: typeof childData === 'object' ? (childData as any)?.description || '' : '',
                  wd_code: typeof childData === 'object' ? (childData as any)?.wd_code || '' : '',
                  metabase_code: typeof childData === 'object' ? (childData as any)?.metabase_code || '' : '',
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
                    const grandchildrenEntries = Object.entries(grandchildrenResponse as Record<string, any>);
                    
                    if (grandchildrenEntries.length > 0) {
                      // Update parent to indicate it has children
                      newCache.capacities[childCodeNum].hasChildren = true;
                      
                      // Store grandchildren codes
                      newCache.children[childCodeNum] = grandchildrenEntries.map(([code]) => parseInt(code, 10));
                      
                      // Store each grandchild
                      for (const [grandchildCode, grandchildData] of grandchildrenEntries) {
                        const grandchildCodeNum = parseInt(grandchildCode, 10);
                        const grandchildName = typeof grandchildData === 'string' ? grandchildData : (grandchildData as any)?.name || `Capacity ${grandchildCode}`;
                        
                        newCache.capacities[grandchildCodeNum] = {
                          code: grandchildCodeNum,
                          name: grandchildName,
                          description: typeof grandchildData === 'object' ? (grandchildData as any)?.description || '' : '',
                          wd_code: typeof grandchildData === 'object' ? (grandchildData as any)?.wd_code || '' : '',
                          metabase_code: typeof grandchildData === 'object' ? (grandchildData as any)?.metabase_code || '' : '',
                          color: '#507380', // Dark color for level 3
                          icon: hierarchyInfo.icon, // Inherit from root
                          hasChildren: false,
                          level: 3,
                          skill_type: grandchildCodeNum,
                          skill_wikidata_item: '',
                          parentCapacity: newCache.capacities[childCodeNum],
                          category: 'level3',
                        };
                      }
                    }
                  }
                } catch (error) {
                  console.warn(`⚠️ Could not fetch grandchildren for ${childCode}:`, error);
                }
              }
            }
          } catch (error) {
            console.warn(`⚠️ Could not fetch children for root capacity ${rootCapacity.code}:`, error);
          }
        }
        
        // Get all capacity codes that need translations
        const allCodesNeedingTranslations = Object.values(newCache.capacities)
          .filter(cap => cap.wd_code && cap.level <= 2) // Only translate root and level 2
          .map(cap => ({ code: cap.code, wd_code: cap.wd_code! }));

        if (allCodesNeedingTranslations.length > 0) {
          console.log(
            `📡 Fetching translations for ${allCodesNeedingTranslations.length} capacities...`
          );
          console.log(`🗓️ Codes needing translations:`, allCodesNeedingTranslations.slice(0, 3));

          // Try fetchCapacitiesWithFallback from capacitiesUtils
          const { fetchCapacitiesWithFallback } = await import('@/lib/utils/capacitiesUtils');
          const translations = await fetchCapacitiesWithFallback(
            allCodesNeedingTranslations,
            newLanguage
          );
          
          console.log(`📢 Received ${translations.length} translations:`);
          translations.slice(0, 3).forEach(t => {
            console.log(`  - ${t.wd_code}: metabase_code=${t.metabase_code || 'EMPTY'}`);
          });

          // Apply translations to cache
          translations.forEach((translation: any) => {
            const matchingCapacity = Object.values(newCache.capacities).find(
              cap => cap.wd_code === translation.wd_code
            );
            if (matchingCapacity && newCache.capacities[matchingCapacity.code]) {
              // Debug log for metabase_code
              console.log(`🔍 Translation for ${matchingCapacity.code}:`, {
                wd_code: translation.wd_code,
                name: translation.name,
                metabase_code: translation.metabase_code,
                hasMetabaseCode: !!translation.metabase_code
              });
              
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

          console.log(`✅ Applied ${translations.length} translations`);
        }
        
        console.log(`✅ Cached complete hierarchy: ${Object.keys(newCache.capacities).length} capacities across all levels`);
        console.log(`📊 Cache breakdown:`, {
          level1: Object.values(newCache.capacities).filter(c => c.level === 1).length,
          level2: Object.values(newCache.capacities).filter(c => c.level === 2).length,
          level3: Object.values(newCache.capacities).filter(c => c.level === 3).length,
        });

        // Update state and save cache
        setUnifiedCache(newCache);
        setCurrentLanguage(newLanguage);
        saveUnifiedCache(newCache);

        // Clear React Query cache for other languages
        queryClient.removeQueries({
          predicate: query => {
            const key = query.queryKey[0] as string;
            return key?.includes('root-capacities') && !key.includes(newLanguage);
          },
        });

        console.log(`✅ Successfully updated to ${newLanguage}`);
      } catch (error) {
        console.error(`❌ Error updating language to ${newLanguage}:`, error);
      } finally {
        setIsLoadingTranslations(false);
      }
    },
    [
      session?.user?.token,
      currentLanguage,
      unifiedCache,
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
      const result = capacity?.color ? capacity.color : (() => {
        const hierarchyInfo = getHierarchyInfo(code);
        return hierarchyInfo.color;
      })();
      
      // Debug log
      console.log(`🎨 getColor(${code}):`, {
        code,
        cachedColor: capacity?.color,
        fallbackColor: result,
        capacityExists: !!capacity
      });
      
      return result;
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

  // Clear all caches
  const clearCache = useCallback(() => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('capx-unified-cache');
      localStorage.removeItem('capx-capacity-cache');
      localStorage.removeItem('capx-translations-cache');
    }

    queryClient.clear();
    setUnifiedCache({ capacities: {}, children: {}, language: currentLanguage, timestamp: 0 });
    console.log('🗑️ Cleared all caches including old cache formats');
  }, [queryClient, currentLanguage]);

  // Initialize cache on mount
  useEffect(() => {
    const initialCache = loadUnifiedCache(currentLanguage);
    setUnifiedCache(initialCache);
  }, [loadUnifiedCache, currentLanguage]);

  const contextValue: CapacityCacheContextType = {
    isLoaded: Object.keys(unifiedCache.capacities).length > 0,
    isLoadingTranslations,
    isDescriptionsReady: Object.keys(unifiedCache.capacities).length > 0 && !isLoadingTranslations,
    language: currentLanguage,
    getName,
    getDescription,
    getWdCode,
    getMetabaseCode,
    getColor,
    getIcon,
    getChildren,
    getCapacity,
    updateLanguage,
    clearCache,
  };

  return (
    <CapacityCacheContext.Provider value={contextValue}>{children}</CapacityCacheContext.Provider>
  );
};
