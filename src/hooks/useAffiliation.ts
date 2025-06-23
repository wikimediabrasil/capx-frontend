import { useState, useEffect } from 'react';
import { Affiliations } from '@/types/affiliation';
import { fetchAffiliations } from '@/services/affiliationService';

export const useAffiliation = (token: string | undefined) => {
  const [affiliations, setAffiliations] = useState<Affiliations>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadAffiliations = async () => {
      if (!token) return;

      try {
        const data = await fetchAffiliations({
          headers: {
            Authorization: `Token ${token}`,
          },
        });
        setAffiliations(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load affiliations');
      } finally {
        setLoading(false);
      }
    };

    loadAffiliations();
  }, [token]);

  return {
    affiliations,
    loading,
    error,
  };
};
