import { useQuery, useQueryClient } from "@tanstack/react-query";
import { capacityService } from "@/services/capacityService";
import { Capacity, CapacityResponse } from "@/types/capacity";
import { useSession } from "next-auth/react";
import { getCapacityColor, getCapacityIcon } from "@/lib/utils/capacitiesUtils";

// Cache keys for React Query
export const CAPACITY_CACHE_KEYS = {
  all: ["capacities"] as const,
  root: ["capacities", "root"] as const,
  byParent: (parentCode: string) =>
    ["capacities", "byParent", parentCode] as const,
  description: (code: number | string) =>
    ["capacities", "description", code.toString()] as const,
  search: (query: string) => ["capacities", "search", query] as const,
  byId: (code: number) => ["capacities", "byId", code.toString()] as const,
};

/**
 * Convert API capacity response to frontend Capacity model
 */
const formatCapacity = (
  item: CapacityResponse,
  parentCapacity?: Capacity
): Capacity => {
  const baseCode = item.code.toString();

  // Determine color based on code or parent
  let color;
  if (parentCapacity) {
    // If there's a parent, inherit its color
    color = parentCapacity.color;
  } else {
    // Otherwise determine color from code
    color = baseCode.startsWith("10")
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
  }

  // Extract numeric code for icon
  const iconCode = parseInt(baseCode, 10);

  // Certifique-se de que o ícone será definido se parent tiver um ícone
  const icon = parentCapacity?.icon || getCapacityIcon(iconCode);

  return {
    code: typeof item.code === "string" ? parseInt(item.code, 10) : item.code,
    name: item.name,
    color,
    icon,
    hasChildren: false, // Will be updated when children are fetched
    skill_type: parentCapacity ? parentCapacity.code : Number(baseCode),
    skill_wikidata_item: "", // We don't use this from the response
    description: "",
    wd_code: item.wd_code || "",
    parentCapacity,
  };
};

/**
 * Hook for root capacities
 */
export function useRootCapacities(language: string = "en") {
  const { data: session } = useSession();
  const token = session?.user?.token;
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: CAPACITY_CACHE_KEYS.root,
    queryFn: async () => {
      if (!token) return [];

      const response = await capacityService.fetchCapacities({
        params: { language },
        headers: { Authorization: `Token ${token}` },
      });

      // Format response to Capacity objects
      const formattedCapacities = response.map((item: CapacityResponse) =>
        formatCapacity(item)
      );

      // For each root capacity, prefetch children to determine hasChildren
      const checkedCapacities = await Promise.all(
        formattedCapacities.map(async (capacity) => {
          try {
            // Attempt to fetch children to determine if this has children
            const children = await capacityService.fetchCapacitiesByType(
              capacity.code.toString(),
              {
                headers: { Authorization: `Token ${token}` },
              }
            );

            // Cache the children data for later use
            queryClient.setQueryData(
              CAPACITY_CACHE_KEYS.byParent(capacity.code.toString()),
              Object.entries(children as Record<string, any>).map(
                ([code, nameOrResponse]) => {
                  const name =
                    typeof nameOrResponse === "string"
                      ? nameOrResponse
                      : (nameOrResponse as any)?.name || `Capacity ${code}`;

                  return {
                    code: Number(code),
                    name,
                  };
                }
              )
            );

            return {
              ...capacity,
              hasChildren: Object.keys(children).length > 0,
            };
          } catch (error) {
            console.error(
              `Error checking children for ${capacity.code}:`,
              error
            );
            return capacity;
          }
        })
      );

      return checkedCapacities;
    },
    enabled: !!token,
    staleTime: 1000 * 60 * 10, // 10 minutes
    gcTime: 1000 * 60 * 60, // 1 hour
  });
}

/**
 * Hook for capacities by parent
 */
export function useCapacitiesByParent(
  parentCode: string,
  language: string = "en"
) {
  const { data: session } = useSession();
  const token = session?.user?.token;
  const queryClient = useQueryClient();

  // Get root capacities for parent lookup
  const { data: rootCapacities = [] } = useRootCapacities(language);

  return useQuery({
    queryKey: CAPACITY_CACHE_KEYS.byParent(parentCode),
    queryFn: async () => {
      if (!token || !parentCode) return [];

      const response = await capacityService.fetchCapacitiesByType(parentCode, {
        headers: { Authorization: `Token ${token}` },
      });

      // Find parent capacity from root capacities or from queryClient cache
      let parentCapacity = rootCapacities.find(
        (c) => c.code.toString() === parentCode
      );

      // If parent not found in root capacities, try to find it in other cached capacities
      // This helps with nested capacities (grandchildren)
      if (!parentCapacity) {
        console.warn(
          `Parent capacity with code ${parentCode} not found in root capacities. Searching in cache.`
        );

        // Check if we can find the parent capacity in the cache
        // Use o próprio parentCode como chave do cache
        const cacheKey = CAPACITY_CACHE_KEYS.byParent(parentCode);
        const cachedParents = queryClient.getQueryData(cacheKey);

        if (Array.isArray(cachedParents)) {
          const found = cachedParents.find(
            (c: any) => c.code.toString() === parentCode
          );
          if (found) {
            parentCapacity = found;
          }
        }

        // Se ainda não encontrou, pode ser uma capacidade de nível superior não carregada
        if (!parentCapacity) {
          // Tentar buscar todas as capacidades raiz e procurar nelas
          const rootCapacitiesData = queryClient.getQueryData(
            CAPACITY_CACHE_KEYS.root
          );
          if (Array.isArray(rootCapacitiesData)) {
            const found = rootCapacitiesData.find(
              (c: any) => c.code.toString() === parentCode
            );
            if (found) {
              parentCapacity = found;
            }
          }
        }
      }

      // Convert response object to array of Capacity objects
      const formattedCapacities = await Promise.all(
        Object.entries(response as Record<string, any>).map(
          async ([code, nameOrResponse]) => {
            // Extract name properly based on what the API returns
            const name =
              typeof nameOrResponse === "string"
                ? nameOrResponse
                : (nameOrResponse as any)?.name || `Capacity ${code}`;

            // Create a response-like object to pass to formatCapacity
            const capacityResponse: CapacityResponse = {
              code: code.toString(),
              name,
              wd_code: "",
            };

            // Use the formatCapacity function to ensure consistent formatting
            // Explicitly pass the parentCapacity to ensure proper inheritance
            const capacity = formatCapacity(capacityResponse, parentCapacity);

            // Ensure that the parentCapacity reference is correctly set
            // This is essential for proper color inheritance in nested children
            capacity.parentCapacity = parentCapacity;

            if (parentCapacity?.color) {
              capacity.color = parentCapacity.color;
            }

            // Check if this capacity has children by making an API call
            try {
              // First, check if we already have the children in the cache
              const cachedChildren = queryClient.getQueryData(
                CAPACITY_CACHE_KEYS.byParent(code)
              );

              let hasChildren = false;

              if (cachedChildren && Array.isArray(cachedChildren)) {
                // If we have the children in the cache, use it to determine hasChildren
                hasChildren = cachedChildren.length > 0;
              } else {
                // If we don't have it in the cache, make the API call
                const children = await capacityService.fetchCapacitiesByType(
                  code,
                  {
                    headers: { Authorization: `Token ${token}` },
                  }
                );

                // Format the children for the cache
                const formattedChildren = Object.entries(
                  children as Record<string, any>
                ).map(([childCode, childNameOrResponse]) => {
                  const childName =
                    typeof childNameOrResponse === "string"
                      ? childNameOrResponse
                      : (childNameOrResponse as any)?.name ||
                        `Capacity ${childCode}`;

                  return {
                    code: Number(childCode),
                    name: childName,
                  };
                });

                // Update the children cache
                queryClient.setQueryData(
                  CAPACITY_CACHE_KEYS.byParent(code),
                  formattedChildren
                );

                hasChildren = formattedChildren.length > 0;
              }

              // Create the updated capacity with hasChildren
              const updatedCapacity = {
                ...capacity,
                hasChildren,
              };

              // Update the individual capacity cache
              queryClient.setQueryData(
                CAPACITY_CACHE_KEYS.byId(Number(code)),
                updatedCapacity
              );

              // Return the updated capacity
              return updatedCapacity;
            } catch (error) {
              console.error(`Error checking children for ${code}:`, error);
              return {
                ...capacity,
                hasChildren: false,
              };
            }
          }
        )
      );

      // Ensure that all capacities have the correct value of hasChildren
      const finalCapacities = formattedCapacities.map((capacity) => {
        // Check if we have the children in the cache
        const cachedChildren = queryClient.getQueryData(
          CAPACITY_CACHE_KEYS.byParent(capacity.code.toString())
        );

        if (cachedChildren && Array.isArray(cachedChildren)) {
          const hasChildren = cachedChildren.length > 0;

          return {
            ...capacity,
            hasChildren,
          };
        }

        return capacity;
      });

      // Force an update of the cache to ensure the component reacts
      queryClient.invalidateQueries({
        queryKey: CAPACITY_CACHE_KEYS.byParent(parentCode),
      });

      return finalCapacities;
    },
    enabled: !!token && !!parentCode,
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
}

/**
 * Hook for capacity description
 */
export function useCapacityDescription(capacityCode: number | string) {
  const { data: session } = useSession();
  const token = session?.user?.token;

  return useQuery({
    queryKey: CAPACITY_CACHE_KEYS.description(capacityCode),
    queryFn: async () => {
      if (!token) return { description: "", wdCode: "" };

      const code =
        typeof capacityCode === "string"
          ? parseInt(capacityCode, 10)
          : capacityCode;

      return capacityService.fetchCapacityDescription(code, {
        headers: { Authorization: `Token ${token}` },
      });
    },
    enabled: !!token && !!capacityCode,
    staleTime: 1000 * 60 * 60, // 1 hour - descriptions rarely change
  });
}

/**
 * Hook for searching capacities
 */
export function useCapacitySearch(query: string) {
  const { data: session } = useSession();
  const token = session?.user?.token;

  return useQuery({
    queryKey: CAPACITY_CACHE_KEYS.search(query),
    queryFn: async () => {
      if (!token || !query || query.length < 2) return [];

      const results = await capacityService.searchCapacities(query, {
        headers: { Authorization: `Token ${token}` },
      });

      // Format the search results
      return results.map((result) => formatCapacity(result));
    },
    enabled: !!token && !!query && query.length >= 2,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Function to prefetch capacity data
 */
export function usePrefetchCapacityData() {
  const { data: session } = useSession();
  const token = session?.user?.token;
  const queryClient = useQueryClient();

  const prefetchData = async (language: string = "en") => {
    if (!token) return;

    // First prefetch root capacities
    await queryClient.prefetchQuery({
      queryKey: CAPACITY_CACHE_KEYS.root,
      queryFn: async () => {
        const response = await capacityService.fetchCapacities({
          params: { language },
          headers: { Authorization: `Token ${token}` },
        });

        return response.map((item: CapacityResponse) => formatCapacity(item));
      },
    });

    // Then get the prefetched data
    const rootData =
      queryClient.getQueryData<Capacity[]>(CAPACITY_CACHE_KEYS.root) || [];

    // Prefetch children for each root capacity
    await Promise.all(
      rootData.map(async (capacity) => {
        await queryClient.prefetchQuery({
          queryKey: CAPACITY_CACHE_KEYS.byParent(capacity.code.toString()),
          queryFn: async () => {
            const response = await capacityService.fetchCapacitiesByType(
              capacity.code.toString(),
              {
                headers: { Authorization: `Token ${token}` },
              }
            );

            return Object.entries(response as Record<string, any>).map(
              ([code, nameOrResponse]) => {
                const name =
                  typeof nameOrResponse === "string"
                    ? nameOrResponse
                    : (nameOrResponse as any)?.name || `Capacity ${code}`;

                return {
                  code: Number(code),
                  name,
                };
              }
            );
          },
        });
      })
    );

    console.log("✅ All capacity data prefetched and cached");
  };

  return { prefetchData };
}
