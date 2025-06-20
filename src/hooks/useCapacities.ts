import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { capacityService } from "@/services/capacityService";
import { Capacity, CapacityResponse } from "@/types/capacity";
import { useSession } from "next-auth/react";
import { getCapacityColor, getCapacityIcon } from "@/lib/utils/capacitiesUtils";
import { useState, useEffect, useCallback, useMemo } from "react";

// Cache keys for React Query
export const CAPACITY_CACHE_KEYS = {
  all: ["capacities"] as const,
  root: ["capacities", "root"] as const,
  byId: (id: number) => ["capacities", id.toString()] as const,
  byParent: (parentCode: string) =>
    [...CAPACITY_CACHE_KEYS.all, "byParent", parentCode] as const,
  search: (query: string) =>
    [...CAPACITY_CACHE_KEYS.all, "search", query] as const,
  description: (id: number) =>
    [...CAPACITY_CACHE_KEYS.byId(id), "description"] as const,
  children: (id: number | string) =>
    [...CAPACITY_CACHE_KEYS.all, "children", id.toString()] as const,
  allHierarchy: ["capacities", "hierarchy"] as const,
};

// Helper function to convert CapacityResponse to Capacity
const convertToCapacity = (
  response: CapacityResponse,
  parentCode?: string
): Capacity => {
  const code =
    typeof response.code === "string" ? Number(response.code) : response.code;
  const baseCode = code.toString();
  const color = baseCode.startsWith("10")
    ? "organizational"
    : baseCode.startsWith("36")
    ? "communication"
    : baseCode.startsWith("50")
    ? "learning"
    : baseCode.startsWith("56")
    ? "community"
    : baseCode.startsWith("65")
    ? "social"
    : baseCode.startsWith("74")
    ? "strategic"
    : baseCode.startsWith("106")
    ? "technology"
    : "gray-200";

  // Convert baseCode to number for getCapacityIcon
  // We use the numeric code for icon lookup
  const iconCode = parseInt(baseCode.split(".")[0], 10);

  return {
    code,
    wd_code: response.wd_code,
    name: response.name,
    color,
    icon: getCapacityIcon(iconCode),
    hasChildren: false, // Default, will be updated if needed
    skill_type: parentCode ? Number(parentCode) : code,
    skill_wikidata_item: "",
  };
};

/**
 * Prefetch and configure all capacity data when the app initializes
 * Called in the top-level provider to ensure data is available
 */
export function prefetchAllCapacityData(token?: string, queryClient?: any) {
  if (!token || !queryClient) return Promise.resolve();

  // 1. Prefetch root capacities
  return queryClient.prefetchQuery({
    queryKey: CAPACITY_CACHE_KEYS.root,
    queryFn: async () => {
      const rootCapacities = await capacityService.fetchCapacities({
        headers: { Authorization: `Token ${token}` },
      });

      // 2. For each root capacity, prefetch its children
      const childrenPromises = rootCapacities.map(async (rootCapacity) => {
        // Safely extract the rootId with proper type handling
        const rootCode = rootCapacity.code as string | number;
        const rootId =
          typeof rootCode === "string" ? rootCode : String(rootCode);

        // Prefetch children of this root
        return queryClient.prefetchQuery({
          queryKey: CAPACITY_CACHE_KEYS.children(rootId),
          queryFn: async () => {
            const children = await capacityService.fetchCapacitiesByType(
              rootId,
              {
                headers: { Authorization: `Token ${token}` },
              }
            );

            // Store individual capacities in the cache as well
            Object.entries(children).forEach(([childId, childName]) => {
              if (childId) {
                queryClient.setQueryData(
                  CAPACITY_CACHE_KEYS.byId(Number(childId)),
                  { code: childId, name: childName }
                );
              }
            });

            return children;
          },
          staleTime: 1000 * 60 * 60, // 1 hour
        });
      });

      await Promise.all(childrenPromises);
      return rootCapacities;
    },
    staleTime: 1000 * 60 * 60, // 1 hour
    gcTime: 1000 * 60 * 60 * 24, // 24 hours
  });
}

/**
 * Hook for capacity search functionality
 */
export function useCapacitySearch() {
  const { data: session } = useSession();
  const token = session?.user?.token;
  const queryClient = useQueryClient();

  const searchCapacities = useCallback(
    async (query: string) => {
      if (!query || !token) return [];

      try {
        const results = await capacityService.searchCapacities(query, {
          headers: { Authorization: `Token ${token}` },
        });

        // Cache individual capacity results
        results.forEach((capacity) => {
          const id =
            typeof capacity.code === "string"
              ? parseInt(capacity.code)
              : capacity.code;

          queryClient.setQueryData(CAPACITY_CACHE_KEYS.byId(id), capacity);
        });

        return results;
      } catch (error) {
        console.error("Error searching capacities:", error);
        return [];
      }
    },
    [token, queryClient]
  );

  return { searchCapacities };
}

// Auxiliary functions for capacities
function fetchAndCacheCapacityById(
  id: number,
  token: string,
  queryClient: any
) {
  return async () => {
    if (!token) return null;
    try {
      const response = await capacityService.fetchCapacityById(id.toString());

      // Prefetch description if we have the capacity
      if (response) {
        queryClient.prefetchQuery({
          queryKey: CAPACITY_CACHE_KEYS.description(id),
          queryFn: async () => {
            return capacityService.fetchCapacityDescription(id);
          },
          staleTime: 1000 * 60 * 60 * 24, // 24 hours
        });
      }

      return response ? convertToCapacity(response) : null;
    } catch (error) {
      console.error(`Error fetching capacity ${id}:`, error);
      return null;
    }
  };
}

function fetchAndCacheCapacitiesByParent(
  parentCode: string,
  token: string,
  queryClient: any,
  rootCapacities: Capacity[]
) {
  return async () => {
    if (!token || !parentCode) return [];

    const childrenResponse = await capacityService.fetchCapacitiesByType(
      parentCode,
      { headers: { Authorization: `Token ${token}` } }
    );

    // Format and cache children
    const formattedCapacities = Object.entries(childrenResponse).map(
      ([code, name]) => {
        const capacity = {
          code: Number(code),
          name: name as unknown as string,
        };

        // Cache each child individually
        queryClient.setQueryData(
          CAPACITY_CACHE_KEYS.byId(Number(code)),
          capacity
        );

        // Find parent for color/icon
        const parentCapacity = rootCapacities.find(
          (cap) => cap.code.toString() === parentCode
        );

        return {
          code: Number(code),
          name: name as unknown as string,
          color: parentCapacity?.color || "gray-200",
          icon: parentCapacity?.icon,
          hasChildren: false, // Will be updated if needed
          skill_type: Number(parentCode),
          skill_wikidata_item: "",
        };
      }
    );

    return formattedCapacities;
  };
}

function fetchCapacityDescription(capacityId: number, token: string) {
  return async () => {
    if (!token) return { description: "", wdCode: "" };
    return capacityService.fetchCapacityDescription(capacityId);
  };
}

/**
 * Main hook to access capacities.
 * With full support for cache of all operations.
 */
export function useCapacities() {
  const { data: session } = useSession();
  const token = session?.user?.token;
  const queryClient = useQueryClient();

  // Fetch root capacities
  const {
    data: rootCapacitiesData = [],
    isLoading: isLoadingRoots,
    isSuccess: rootsSuccess,
  } = useQuery({
    queryKey: CAPACITY_CACHE_KEYS.root,
    queryFn: async () => {
      if (!token) return [];
      return capacityService.fetchCapacities({
        headers: { Authorization: `Token ${token}` },
      });
    },
    enabled: !!token,
    staleTime: 1000 * 60 * 60, // 1 hour
  });

  // Process root capacities
  const rootCapacities = useMemo(() => {
    return rootCapacitiesData.map((item) => convertToCapacity(item));
  }, [rootCapacitiesData]);

  // Define query functions outside useCallback
  const fetchCapacityById = useCallback(
    async (id: number) => {
      return fetchAndCacheCapacityById(id, token as string, queryClient)();
    },
    [token, queryClient]
  );

  const fetchCapacitiesByParent = useCallback(
    async (parentCode: string) => {
      return fetchAndCacheCapacitiesByParent(
        parentCode,
        token as string,
        queryClient,
        rootCapacities
      )();
    },
    [token, queryClient, rootCapacities]
  );

  const fetchCapacityDescriptionById = useCallback(
    async (capacityId: number) => {
      return fetchCapacityDescription(capacityId, token as string)();
    },
    [token]
  );

  // Return query configurations that can be used directly with useQuery
  // Instead of returning hooks, return query configs
  const getCapacityByIdQueryConfig = useCallback(
    (id: number) => ({
      queryKey: CAPACITY_CACHE_KEYS.byId(id),
      queryFn: () => fetchCapacityById(id),
      enabled: !!id && !!token,
      staleTime: 1000 * 60 * 60, // 1 hour
    }),
    [fetchCapacityById, token]
  );

  const getCapacitiesByParentQueryConfig = useCallback(
    (parentCode: string) => ({
      queryKey: CAPACITY_CACHE_KEYS.children(parentCode),
      queryFn: () => fetchCapacitiesByParent(parentCode),
      enabled: !!token && !!parentCode,
      staleTime: 1000 * 60 * 60, // 1 hour
    }),
    [fetchCapacitiesByParent, token]
  );

  const getCapacityDescriptionQueryConfig = useCallback(
    (capacityId: number) => ({
      queryKey: CAPACITY_CACHE_KEYS.description(capacityId),
      queryFn: () => fetchCapacityDescriptionById(capacityId),
      enabled: !!capacityId && !!token,
      staleTime: 1000 * 60 * 60 * 24, // 24 hours - descriptions rarely change
    }),
    [fetchCapacityDescriptionById, token]
  );

  // Utility function to get capacity by ID from cache
  const getCapacityById = useCallback(
    (id: number): Capacity | undefined => {
      const cached = queryClient.getQueryData<CapacityResponse>(
        CAPACITY_CACHE_KEYS.byId(id)
      );

      if (cached) {
        return convertToCapacity(cached);
      }

      // Fallback to root capacities if not in byId cache
      const rootResult = rootCapacities.find((cap) => cap.code === id);
      if (rootResult) return rootResult;

      return undefined;
    },
    [queryClient, rootCapacities]
  );

  // Prefetch all capacity data when this hook is used
  useEffect(() => {
    if (token && rootsSuccess && rootCapacities.length > 0) {
      // Only trigger prefetch once root capacities are loaded
      prefetchAllCapacityData(token, queryClient);
    }
  }, [token, rootsSuccess, rootCapacities.length, queryClient]);

  // Custom hooks for usage in components
  const useCapacityById = (id: number) =>
    useQuery(getCapacityByIdQueryConfig(id));
  const useCapacitiesByParent = (parentCode: string) =>
    useQuery(getCapacitiesByParentQueryConfig(parentCode));
  const useCapacityDescription = (capacityId: number) =>
    useQuery(getCapacityDescriptionQueryConfig(capacityId));

  return {
    rootCapacities,
    isLoadingRootCapacities: isLoadingRoots,
    useCapacityById,
    useCapacitiesByParent,
    useCapacityDescription,
    getCapacityById,
  };
}

// Custom hook para obter capacidades com mais informações (incluindo descrição)
export function useCapacityWithDetails(capacityId?: number) {
  const { data: session } = useSession();
  const token = session?.user?.token;

  // Fetch capacity data directly
  const { data: capacity, isLoading: isLoadingCapacity } = useQuery({
    queryKey: CAPACITY_CACHE_KEYS.byId(capacityId || 0),
    queryFn: async () => {
      if (!token || !capacityId) return null;
      try {
        const response = await capacityService.fetchCapacityById(
          capacityId.toString()
        );
        return response ? convertToCapacity(response) : null;
      } catch (error) {
        console.error(`Error fetching capacity ${capacityId}:`, error);
        return null;
      }
    },
    enabled: !!capacityId && !!token,
    staleTime: 1000 * 60 * 60, // 1 hour
  });

  // Fetch description data directly
  const { data: descriptionData, isLoading: isLoadingDescription } = useQuery({
    queryKey: CAPACITY_CACHE_KEYS.description(capacityId || 0),
    queryFn: async () => {
      if (!token || !capacityId) return { description: "", wdCode: "" };
      return capacityService.fetchCapacityDescription(capacityId);
    },
    enabled: !!capacityId && !!token,
    staleTime: 1000 * 60 * 60 * 24, // 24 hours
  });

  const isLoading = isLoadingCapacity || isLoadingDescription;

  const capacityWithDetails = useMemo(() => {
    if (!capacity) return null;

    return {
      ...capacity,
      description: descriptionData?.description || "",
      wdCode: descriptionData?.wdCode || "",
    };
  }, [capacity, descriptionData]);

  return {
    capacity: capacityWithDetails,
    isLoading,
  };
}
