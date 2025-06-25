import { useState, useEffect } from "react";
import { fetchAllCapacities } from "@/services/capacityService";
import { Capacities } from "@/types/capacity";

export const useAllCapacities = (token: string | undefined) => {
  const [allCapacities, setAllCapacities] = useState<Capacities[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Reset the state when the token changes
    if (!token) {
      setAllCapacities([]);
      setLoading(false);
      setError(null);
      return;
    }

    const loadAllCapacities = async () => {
      setLoading(true);
      setError(null);

      try {
        const data = await fetchAllCapacities(token);
        setAllCapacities(data || []);
      } catch (err) {
        console.error("Error loading all capacities:", err);
        setError(
          err instanceof Error ? err.message : "Failed to load all capacities"
        );
        setAllCapacities([]);
      } finally {
        setLoading(false);
      }
    };

    loadAllCapacities();
  }, [token]);

  return {
    allCapacities,
    loading,
    error,
  };
};
