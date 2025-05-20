"use client";
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
} from "react";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import { capacityService } from "@/services/capacityService";
import { useSession } from "next-auth/react";
import { Capacity } from "@/types/capacity";
import LoadingStateWithFallback, {
  CompactLoading,
} from "@/components/LoadingStateWithFallback";

// Query keys for the React Query
const QUERY_KEYS = {
  ROOT_CAPACITIES: "root-capacities",
  CHILD_CAPACITIES: (parentCode: number) => `child-capacities-${parentCode}`,
  ALL_CAPACITIES: "all-capacities-map",
  CHILDREN_MAP: "children-map",
};

// Global flag to avoid multiple initializations
let hasInitializedCache = false;

// Variable to store the debounce timer
let saveCacheTimer: NodeJS.Timeout | null = null;

// Function to persist cache in localStorage
const saveCache = (capacities, children) => {
  if (typeof window === "undefined") return;

  // Clear previous timer if it exists
  if (saveCacheTimer) {
    clearTimeout(saveCacheTimer);
  }

  // Set new timer for debounce
  saveCacheTimer = setTimeout(() => {
    try {
      const cacheToSave = {
        capacities: mapToObject(capacities),
        children: mapToObject(children),
        timestamp: Date.now(),
      };

      localStorage.setItem("capx-capacity-cache", JSON.stringify(cacheToSave));
      console.log("💾 Cache saved in localStorage");
    } catch (e) {
      console.error("Error saving cache:", e);
    }
    saveCacheTimer = null;
  }, 1000); // Wait 1 second to avoid multiple saves
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

const objectToMap = (
  obj: Record<string, any> | any
): Map<number, any> | any => {
  if (!obj || typeof obj !== "object") return obj;
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
}

const CapacityCacheContext = createContext<CapacityCacheContextType>({
  isLoaded: false,
  hasChildren: () => false,
  getCapacity: () => undefined,
  prefetchCapacityData: async () => {},
  preloadCapacities: async () => {},
  clearCache: () => {},
  clearCapacityCache: () => {},
});

export function CapacityCacheProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const [isManuallyLoaded, setIsManuallyLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const hasCalled = useRef(false);

  // Load cache from localStorage when starting (only once)
  useEffect(() => {
    if (
      typeof window === "undefined" ||
      hasCalled.current ||
      hasInitializedCache
    ) {
      return;
    }

    hasCalled.current = true;
    hasInitializedCache = true;

    try {
      const savedCache = localStorage.getItem("capx-capacity-cache");
      if (savedCache) {
        const parsedCache = JSON.parse(savedCache);
        console.log(
          "🔄 Loading cache from localStorage (CapacityCacheContext)"
        );

        // Convert back to Map before using
        if (parsedCache.capacities) {
          const capacitiesMap = objectToMap(parsedCache.capacities);
          queryClient.setQueryData([QUERY_KEYS.ALL_CAPACITIES], capacitiesMap);

          // Debug info - show only once
          const capacityCount = Object.keys(parsedCache.capacities).length;
          const childrenCount = parsedCache.children
            ? Object.keys(parsedCache.children).length
            : 0;

          console.log(
            `📊 Cache loaded: ${capacityCount} capacities, ${childrenCount} relations`
          );
        }

        if (parsedCache.children) {
          const childrenMap = objectToMap(parsedCache.children);
          queryClient.setQueryData([QUERY_KEYS.CHILDREN_MAP], childrenMap);
        }

        // Mark as loaded
        setIsManuallyLoaded(true);
      }
    } catch (e) {
      console.error("Error recovering cache:", e);
      // In case of error, clear the cache to ensure a clean state
      localStorage.removeItem("capx-capacity-cache");
    }
  }, [queryClient]);

  // Use React Query to maintain the persistent cache between navigations
  const {
    data: capacityCache = new Map<number, Capacity>(),
    isSuccess: isCacheLoaded,
  } = useQuery({
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

  const {
    data: childrenCache = new Map<number, number[]>(),
    isSuccess: isChildrenCacheLoaded,
  } = useQuery({
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
    if (typeof window !== "undefined") {
      localStorage.removeItem("capx-capacity-cache");
    }
    console.log("🧹 Capacity cache cleared");
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
      console.log(
        `✅ Cache already loaded with ${capacityCache.size} capacities, using existing data`
      );
      setIsManuallyLoaded(true);
      return;
    }

    try {
      console.log("🔄 Starting capacity loading...");
      setIsLoading(true);

      // 1. Load root capacities
      const rootCapacities = await capacityService.fetchCapacities({
        headers: { Authorization: `Token ${session.user.token}` },
      });

      // Store root capacities in persistent cache
      const newCapacityCache = new Map<number, Capacity>();
      const newChildrenCache = new Map<number, number[]>();

      // Initializecache wwith rott root ctici
      rootCapacities.forEach((rootCapacity) => {
        const code = Number(rootCapacity.code);
        newCapacityCache.set(code, {
          code,
          name: rootCapacity.name,
          color: "technology",
          icon: "",
          hasChildren: false,
          skill_type: code,
          skill_wikidata_item: "",
          description: "",
          wd_code: rootCapacity.wd_code || "",
        });
      });

      // 2. Load all children in a single request grouped
      const childPromises = rootCapacities.map(async (rootCapacity) => {
        const code = Number(rootCapacity.code);
        try {
          const children = await capacityService.fetchCapacitiesByType(
            code.toString(),
            {
              headers: { Authorization: `Token ${session.user.token}` },
            }
          );

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
          childCodes.forEach((childCode) => {
            newCapacityCache.set(childCode, {
              code: childCode,
              name:
                typeof children[childCode] === "string"
                  ? children[childCode]
                  : children[childCode]?.name || `Capacity ${childCode}`,
              color: "technology",
              icon: "",
              hasChildren: false,
              skill_type: code,
              skill_wikidata_item: "",
              description: "",
              wd_code: "",
              parentCapacity: newCapacityCache.get(code),
            });
          });

          return childCodes;
        } catch (error) {
          console.error(`Error fetching children for capacity ${code}:`, error);
          return [];
        }
      });

      // Wait for loading all children
      const allChildCodes = await Promise.all(childPromises);
      const flatChildCodes = allChildCodes.flat();

      // 3. Load all grandchildren in batches to reduce the number of requests
      const BATCH_SIZE = 5;
      for (let i = 0; i < flatChildCodes.length; i += BATCH_SIZE) {
        const batch = flatChildCodes.slice(i, i + BATCH_SIZE);
        const batchPromises = batch.map(async (childCode) => {
          try {
            const grandChildren = await capacityService.fetchCapacitiesByType(
              childCode.toString(),
              {
                headers: { Authorization: `Token ${session.user.token}` },
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
            grandChildCodes.forEach((grandChildCode) => {
              const parentCapacity = newCapacityCache.get(childCode);
              newCapacityCache.set(grandChildCode, {
                code: grandChildCode,
                name:
                  typeof grandChildren[grandChildCode] === "string"
                    ? grandChildren[grandChildCode]
                    : grandChildren[grandChildCode]?.name ||
                      `Capacity ${grandChildCode}`,
                color: "technology",
                icon: "",
                hasChildren: false,
                skill_type: childCode,
                skill_wikidata_item: "",
                description: "",
                wd_code: "",
                parentCapacity: parentCapacity,
              });
            });

            return { childCode, grandChildCodes };
          } catch (error) {
            console.error(
              `Error fetching grandchildren for capacity ${childCode}:`,
              error
            );
            return { childCode, grandChildCodes: [] };
          }
        });

        await Promise.all(batchPromises);
      }

      // Update cache in React Query
      queryClient.setQueryData([QUERY_KEYS.ALL_CAPACITIES], newCapacityCache);
      queryClient.setQueryData([QUERY_KEYS.CHILDREN_MAP], newChildrenCache);

      // Save cache in localStorage
      saveCache(newCapacityCache, newChildrenCache);

      // Mark as manually loaded
      setIsManuallyLoaded(true);
      setIsLoading(false);
      console.log(
        `✅ Cache updated: ${newCapacityCache.size} capacities loaded`
      );
    } catch (error) {
      console.error("Erro ao pré-carregar capacidades:", error);
      setIsLoading(false);
    }
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
    console.log("🧹 Capacity cache invalidated");
  }, [queryClient]);

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
  };

  return (
    <CapacityCacheContext.Provider value={contextValue}>
      {children}
    </CapacityCacheContext.Provider>
  );
}

// Custom hook to use the capacity cache context
export function useCapacityCache() {
  const context = useContext(CapacityCacheContext);
  if (!context) {
    throw new Error(
      "useCapacityCache must be used within a CapacityCacheProvider"
    );
  }
  return context;
}
