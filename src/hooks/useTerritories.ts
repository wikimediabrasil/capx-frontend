import { useState, useEffect } from 'react';
import { Territories } from '@/types/territory';
import { fetchTerritories } from '@/services/territoryService';

export const useTerritories = (token: string | undefined) => {
  const [territories, setTerritories] = useState<Territories>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Reset the state when the token changes
    if (!token) {
      setTerritories({});
      setLoading(false);
      setError(null);
      return;
    }

    const loadTerritories = async () => {
      setLoading(true);
      setError(null);

      try {
        const data = await fetchTerritories(token);
        setTerritories(data || {});
      } catch (err) {
        console.error('Error loading territories:', err);
        setError(err instanceof Error ? err.message : 'Failed to load territories');
        setTerritories({});
      } finally {
        setLoading(false);
      }
    };

    loadTerritories();
  }, [token]);

  return {
    territories,
    loading,
    error,
  };
};
