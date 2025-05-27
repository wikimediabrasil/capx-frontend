import { useState, useEffect, useCallback, useRef } from "react";
import { capacityService } from "@/services/capacityService";
import { useSession } from "next-auth/react";
import { Capacity, CapacityResponse } from "@/types/capacity";
import { useApp } from "@/contexts/AppContext";
import { useCapacityCache } from "@/contexts/CapacityCacheContext";

// Hard-coded fallback names to ensure we always have something to display
const FALLBACK_NAMES = {
  "69": "Strategic Thinking",
  "71": "Team Leadership",
  "97": "Project Management",
  "10": "Organizational Skills",
  "36": "Communication",
  "50": "Learning",
  "56": "Community Building",
  "65": "Social Skills",
  "74": "Strategic Planning",
  "106": "Technology",
};

export function useCapacityDetails(
  capacityIds: (string | number | Capacity)[]
) {
  const [capacityNames, setCapacityNames] = useState<{ [key: string]: string }>(
    {}
  );
  const [capacityLoadingState, setCapacityLoadingState] = useState<{
    [key: string]: boolean;
  }>({});
  const { data: session } = useSession();
  const { pageContent } = useApp();
  const mountedRef = useRef(true);
  const { getCapacity, setCapacity } = useCapacityCache();
  const requestRef = useRef<Map<string, Promise<any>>>(new Map());
  const processedIdsRef = useRef<Set<string>>(new Set());

  // Immediately populate with fallback names to prevent "loading" state
  useEffect(() => {
    if (!capacityIds?.length) return;

    // Extract unique numeric IDs
    const uniqueIds = Array.from(
      new Set(capacityIds.map((id) => (typeof id === "object" ? id.code : id)))
    ).filter((id): id is number => typeof id === "number");

    // Initialize with fallback names if available
    const initialNames = { ...capacityNames };
    let hasNew = false;

    uniqueIds.forEach((id) => {
      const idStr = id.toString();
      if (FALLBACK_NAMES[idStr] && !initialNames[idStr]) {
        initialNames[idStr] = FALLBACK_NAMES[idStr];
        hasNew = true;
      }
    });

    if (hasNew) {
      setCapacityNames(initialNames);
    }
  }, [capacityIds]);

  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // Main effect to fetch capacity data
  useEffect(() => {
    const uniqueIds = Array.from(
      new Set(capacityIds.map((id) => (typeof id === "object" ? id.code : id)))
    ).filter((id): id is number => typeof id === "number");

    // Skip if we've already processed these exact IDs
    const idsKey = uniqueIds.sort().join(",");
    if (processedIdsRef.current.has(idsKey)) {
      return;
    }

    processedIdsRef.current.add(idsKey);

    // Mark all capacities as loading
    const loadingState = uniqueIds.reduce((acc, id) => {
      acc[id.toString()] = true;
      return acc;
    }, {} as { [key: string]: boolean });

    setCapacityLoadingState(loadingState);

    const fetchCapacities = async () => {
      try {
        const queryData = {
          headers: { Authorization: `Token ${session?.user?.token}` },
        };

        // Initialize with a copy of current names
        const newNames = { ...capacityNames };

        // First check the cache
        let needsFetch = false;
        uniqueIds.forEach((id) => {
          const idStr = id.toString();
          const cached = getCapacity(idStr);
          if (cached) {
            newNames[idStr] = cached.name;
            loadingState[idStr] = false;
          } else {
            needsFetch = true;
          }
        });

        // Update UI with cached values first
        if (mountedRef.current) {
          setCapacityNames(newNames);
          setCapacityLoadingState({ ...loadingState });
        }

        // Only fetch what we need
        if (needsFetch) {
          const fetchPromises = uniqueIds
            .filter((id) => !getCapacity(id.toString()))
            .map(async (id) => {
              const idStr = id.toString();

              // Skip if already being requested
              if (requestRef.current.has(idStr)) {
                return requestRef.current.get(idStr)!;
              }

              // Create a new request
              const request = capacityService
                .fetchCapacityById(idStr)
                .then((response) => {
                  return response;
                })
                .catch((error) => {
                  console.error(`❌ Error fetching capacity ${idStr}:`, error);

                  // Use fallback name
                  const fallbackName =
                    FALLBACK_NAMES[idStr] || `Capacity ${id}`;

                  // Update state on error
                  if (mountedRef.current) {
                    setCapacityLoadingState((prev) => ({
                      ...prev,
                      [idStr]: false,
                    }));

                    // Use fallback name in state
                    setCapacityNames((prev) => ({
                      ...prev,
                      [idStr]: fallbackName,
                    }));
                  }

                  // Add to cache
                  setCapacity(idStr, fallbackName);

                  // Return a valid object with fallback name
                  return {
                    code: idStr,
                    name: fallbackName,
                    description: "",
                  };
                });

              requestRef.current.set(idStr, request);

              try {
                return await request;
              } finally {
                requestRef.current.delete(idStr);
              }
            });

          // Only run Promise.all if we have promises
          if (fetchPromises.length > 0) {
            const results = await Promise.all(fetchPromises);

            results.forEach((capacity) => {
              if (
                capacity &&
                typeof capacity === "object" &&
                "name" in capacity
              ) {
                const idStr = capacity.code?.toString();
                if (!idStr) return;

                const name = capacity.name;

                // Update cache
                setCapacity(idStr, name);

                // Update state
                if (mountedRef.current) {
                  newNames[idStr] = name;
                  loadingState[idStr] = false;
                }
              }
            });

            if (mountedRef.current) {
              setCapacityNames({ ...newNames });
              setCapacityLoadingState({ ...loadingState });
            }
          }
        }
      } catch (error) {
        console.error("Error fetching capacities:", error);

        // Mark all as not loading in case of general error
        if (mountedRef.current) {
          const updatedLoadingState = { ...loadingState };
          Object.keys(updatedLoadingState).forEach((key) => {
            updatedLoadingState[key] = false;
          });
          setCapacityLoadingState(updatedLoadingState);
        }
      }
    };

    // Force immediate fetch
    fetchCapacities();
  }, [
    capacityIds,
    session?.user?.token,
    getCapacity,
    setCapacity,
    capacityNames,
  ]);

  const getCapacityName = useCallback(
    (capacity: Capacity | number | string) => {
      if (!capacity) return pageContent["loading"];

      const id =
        typeof capacity === "object" ? Number(capacity.code) : Number(capacity);

      const idStr = id.toString();

      // If the name is available in state, return it
      if (capacityNames[idStr]) {
        return capacityNames[idStr];
      }

      // Check fallback names
      if (FALLBACK_NAMES[idStr]) {
        return FALLBACK_NAMES[idStr];
      }

      // Only show loading if explicitly in loading state
      if (capacityLoadingState[idStr]) {
        return pageContent["loading"];
      }

      // Default fallback
      return `Capacity ${id}`;
    },
    [capacityNames, capacityLoadingState, pageContent]
  );
  return {
    capacityNames,
    capacityLoadingState,
    getCapacityName,
  };
}

export function useCapacity(capacityId?: string | null) {
  const { data: session } = useSession();
  const { language } = useApp();
  const [capacity, setCapacity] = useState<CapacityResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchCapacity = async () => {
      if (!capacityId || !session?.user?.token) return;

      setIsLoading(true);
      setError(null);

      try {
        const data = await capacityService.fetchCapacityById(capacityId);
        setCapacity(data);
      } catch (err) {
        console.error("Error fetching capacity:", err);
        setError(
          err instanceof Error ? err : new Error("Failed to fetch capacity")
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchCapacity();
  }, [capacityId, session?.user?.token, language]);

  return {
    capacity,
    isLoading,
    error,
  };
}
