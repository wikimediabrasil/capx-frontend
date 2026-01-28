import { useState, useEffect } from 'react';
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
    const fetchAggregatedData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Build headers with token if available
        const headers: Record<string, string> = {};
        if (token) {
          headers.Authorization = `Token ${token}`;
        }

        // Fetch pre-aggregated data from dedicated endpoints in parallel
        const [languagesResponse, capacitiesResponse] = await Promise.all([
          axios.get<AggregatedLanguageData>('/api/statistics/languages-by-territory/', {
            headers,
          }),
          axios.get<AggregatedCapacityData>('/api/statistics/capacities-by-territory/', {
            headers,
          }),
        ]);

        setLanguagesByTerritory(languagesResponse.data);
        setCapacitiesByTerritory(capacitiesResponse.data);
      } catch (err) {
        console.error('Error fetching aggregated territory data:', err);
        setError(err instanceof Error ? err : new Error('Failed to fetch data'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchAggregatedData();
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
