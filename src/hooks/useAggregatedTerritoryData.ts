import { useState, useEffect, useMemo } from 'react';
import axios from 'axios';

interface AggregatedLanguageData {
  // { territoryId: { languageId: count } }
  [territoryId: string]: { [languageId: string]: number };
}

interface AggregatedCapacityData {
  // { territoryId: { capacityId: { available: count, wanted: count } } }
  [territoryId: string]: {
    [capacityId: string]: { available: number; wanted: number };
  };
}

interface AggregatedTerritoryData {
  languagesByTerritory: AggregatedLanguageData;
  capacitiesByTerritory: AggregatedCapacityData;
  isLoading: boolean;
  error: Error | null;
}

interface UserProfile {
  territory: number[];
  language: { id: number; proficiency: string }[];
  skills_available: string[];
  skills_wanted: string[];
}

interface UsersResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: UserProfile[];
}

export const useAggregatedTerritoryData = (
  token: string | undefined
): AggregatedTerritoryData => {
  const [languagesByTerritory, setLanguagesByTerritory] =
    useState<AggregatedLanguageData>({});
  const [capacitiesByTerritory, setCapacitiesByTerritory] =
    useState<AggregatedCapacityData>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!token) {
      setIsLoading(false);
      return;
    }

    const fetchAndAggregateData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const langData: AggregatedLanguageData = {};
        const capData: AggregatedCapacityData = {};

        let offset = 0;
        const limit = 100;
        let hasMore = true;

        while (hasMore) {
          const response = await axios.get<UsersResponse>('/api/users', {
            headers: { Authorization: `Token ${token}` },
            params: { limit, offset },
          });

          const users = response.data.results;

          // Aggregate data for each user
          users.forEach((user) => {
            // Process territory data
            user.territory.forEach((territoryId) => {
              const terr = String(territoryId);

              // Initialize territory in language data if not exists
              if (!langData[terr]) {
                langData[terr] = {};
              }

              // Initialize territory in capacity data if not exists
              if (!capData[terr]) {
                capData[terr] = {};
              }

              // Aggregate languages
              user.language.forEach((lang) => {
                const langId = String(lang.id);
                langData[terr][langId] = (langData[terr][langId] || 0) + 1;
              });

              // Aggregate skills available
              user.skills_available.forEach((skillId) => {
                if (!capData[terr][skillId]) {
                  capData[terr][skillId] = { available: 0, wanted: 0 };
                }
                capData[terr][skillId].available += 1;
              });

              // Aggregate skills wanted
              user.skills_wanted.forEach((skillId) => {
                if (!capData[terr][skillId]) {
                  capData[terr][skillId] = { available: 0, wanted: 0 };
                }
                capData[terr][skillId].wanted += 1;
              });
            });
          });

          // Check if there are more pages
          hasMore = response.data.next !== null;
          offset += limit;

          // Safety limit to prevent infinite loops
          if (offset > 10000) {
            hasMore = false;
          }
        }

        setLanguagesByTerritory(langData);
        setCapacitiesByTerritory(capData);
      } catch (err) {
        console.error('Error fetching aggregated territory data:', err);
        setError(err instanceof Error ? err : new Error('Failed to fetch data'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchAndAggregateData();
  }, [token]);

  return {
    languagesByTerritory,
    capacitiesByTerritory,
    isLoading,
    error,
  };
};

// Helper function to get language counts for a specific territory (mapped to Wikimedia territory ID)
export const getLanguageCountsForWikimediaTerritory = (
  languagesByTerritory: AggregatedLanguageData,
  apiTerritoryToWikimediaMap: Record<string, string>,
  wikimediaTerritoryId: string
): Record<string, number> => {
  const counts: Record<string, number> = {};

  Object.entries(languagesByTerritory).forEach(([apiTerritoryId, langCounts]) => {
    const wikimediaId = apiTerritoryToWikimediaMap[apiTerritoryId];
    if (wikimediaId === wikimediaTerritoryId) {
      Object.entries(langCounts).forEach(([langId, count]) => {
        counts[langId] = (counts[langId] || 0) + count;
      });
    }
  });

  return counts;
};

// Helper function to get capacity counts for a specific territory (mapped to Wikimedia territory ID)
export const getCapacityCountsForWikimediaTerritory = (
  capacitiesByTerritory: AggregatedCapacityData,
  apiTerritoryToWikimediaMap: Record<string, string>,
  wikimediaTerritoryId: string
): Record<string, { available: number; wanted: number }> => {
  const counts: Record<string, { available: number; wanted: number }> = {};

  Object.entries(capacitiesByTerritory).forEach(([apiTerritoryId, capCounts]) => {
    const wikimediaId = apiTerritoryToWikimediaMap[apiTerritoryId];
    if (wikimediaId === wikimediaTerritoryId) {
      Object.entries(capCounts).forEach(([capId, { available, wanted }]) => {
        if (!counts[capId]) {
          counts[capId] = { available: 0, wanted: 0 };
        }
        counts[capId].available += available;
        counts[capId].wanted += wanted;
      });
    }
  });

  return counts;
};

// Helper function to get total language users per Wikimedia territory
export const getLanguageTotalsByWikimediaTerritory = (
  languagesByTerritory: AggregatedLanguageData,
  apiTerritoryToWikimediaMap: Record<string, string>,
  languageId: string
): Record<string, number> => {
  const totals: Record<string, number> = {};

  Object.entries(languagesByTerritory).forEach(([apiTerritoryId, langCounts]) => {
    const wikimediaId = apiTerritoryToWikimediaMap[apiTerritoryId];
    if (wikimediaId && langCounts[languageId]) {
      totals[wikimediaId] = (totals[wikimediaId] || 0) + langCounts[languageId];
    }
  });

  return totals;
};

// Helper function to get total capacity users per Wikimedia territory
export const getCapacityTotalsByWikimediaTerritory = (
  capacitiesByTerritory: AggregatedCapacityData,
  apiTerritoryToWikimediaMap: Record<string, string>,
  capacityId: string
): Record<string, { available: number; wanted: number; total: number }> => {
  const totals: Record<string, { available: number; wanted: number; total: number }> = {};

  Object.entries(capacitiesByTerritory).forEach(([apiTerritoryId, capCounts]) => {
    const wikimediaId = apiTerritoryToWikimediaMap[apiTerritoryId];
    if (wikimediaId && capCounts[capacityId]) {
      if (!totals[wikimediaId]) {
        totals[wikimediaId] = { available: 0, wanted: 0, total: 0 };
      }
      totals[wikimediaId].available += capCounts[capacityId].available;
      totals[wikimediaId].wanted += capCounts[capacityId].wanted;
      totals[wikimediaId].total +=
        capCounts[capacityId].available + capCounts[capacityId].wanted;
    }
  });

  return totals;
};
