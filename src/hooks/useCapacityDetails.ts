import { useState, useEffect, useCallback } from "react";
import { capacityService } from "@/services/capacityService";
import { useSession } from "next-auth/react";
import { Capacity, CapacityResponse } from "@/types/capacity";
import { useApp } from "@/contexts/AppContext";

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

  useEffect(() => {
    if (!session?.user?.token || !capacityIds?.length) return;

    const uniqueIds = Array.from(
      new Set(capacityIds.map((id) => (typeof id === "object" ? id.code : id)))
    ).filter((id): id is number => typeof id === "number");

    // Mark all capacities as loading
    const loadingState = uniqueIds.reduce((acc, id) => {
      acc[id.toString()] = true;
      return acc;
    }, {} as { [key: string]: boolean });

    setCapacityLoadingState(loadingState);

    const fetchCapacities = async () => {
      try {
        const queryData = {
          headers: { Authorization: `Token ${session.user.token}` },
        };

        const results = await Promise.all(
          uniqueIds.map((id) =>
            capacityService.fetchCapacityById(id.toString(), queryData)
          )
        );

        const newNames = results.reduce((acc, capacity) => {
          if (capacity && typeof capacity === "object" && "name" in capacity) {
            const idStr = capacity.code.toString();
            acc[idStr] = capacity.name;
            // Mark as not loading anymore
            setCapacityLoadingState((prev) => ({ ...prev, [idStr]: false }));
          }
          return acc;
        }, {} as { [key: string]: string });

        setCapacityNames(newNames);
      } catch (error) {
        console.error("Error fetching capacities:", error);
      }
    };

    fetchCapacities();
  }, [capacityIds, session?.user?.token]);

  return {
    capacityNames,
    capacityLoadingState,
    getCapacityName: useCallback(
      (capacity: Capacity | number | string) => {
        if (!capacity) return pageContent["loading"];

        const id =
          typeof capacity === "object"
            ? Number(capacity.code)
            : Number(capacity);

        const idStr = id.toString();

        // If the name is available, return it
        if (capacityNames[idStr]) {
          return capacityNames[idStr];
        }

        // If it is still loading, show loading text
        if (capacityLoadingState[idStr]) {
          return pageContent["loading"];
        }

        // If it is not loading and the name is not available, use a generic name
        return `Capacity ${id}`;
      },
      [capacityNames, capacityLoadingState, pageContent]
    ),
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
        const data = await capacityService.fetchCapacityById(capacityId, {
          params: { language },
          headers: { Authorization: `Token ${session.user.token}` },
        });
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
