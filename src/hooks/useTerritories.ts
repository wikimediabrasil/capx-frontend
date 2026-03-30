import { useState, useEffect, useMemo } from 'react';
import { Territory } from '@/types/territory';
import { fetchTerritories } from '@/services/territoryService';

export const useTerritories = (token: string | undefined) => {
  const [territories, setTerritories] = useState<Territory[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;

    const loadTerritories = async () => {
      setLoading(true);
      setError(null);

      try {
        const data = await fetchTerritories(token);
        setTerritories(data || []);
      } catch (err) {
        console.error('Error loading territories:', err);
        setError(err instanceof Error ? err.message : 'Failed to load territories');
        setTerritories([]);
      } finally {
        setLoading(false);
      }
    };

    loadTerritories();
  }, [token]);

  // Derived map of id (string) → territory_name for components that need lookup by id
  const territoriesMap = useMemo(
    () =>
      territories.reduce<Record<string, string>>((acc, t) => {
        acc[String(t.id)] = t.territory_name;
        return acc;
      }, {}),
    [territories]
  );

  return {
    territories,
    territoriesMap,
    loading,
    error,
  };
};
