import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

interface AggregatedLanguageData {
  [territoryId: string]: { [languageId: string]: number };
}

interface AggregatedCapacityData {
  // { territoryId: { capacityId: { known: count, available: count, wanted: count } } }
  [territoryId: string]: {
    [capacityId: string]: { known: number; available: number; wanted: number };
  };
}

interface AggregatedTerritoryData {
  languagesByTerritory: AggregatedLanguageData;
  capacitiesByTerritory: AggregatedCapacityData;
  isLoading: boolean;
  error: Error | null;
}

export const useAggregatedTerritoryData = (token: string | undefined): AggregatedTerritoryData => {
  const headers: Record<string, string> = token ? { Authorization: `Token ${token}` } : {};

  const { data: languagesByTerritory = {}, isLoading: isLanguagesLoading } = useQuery({
    queryKey: ['statistics', 'languages-by-territory', token ?? null],
    queryFn: async () => {
      const response = await axios.get<AggregatedLanguageData>(
        '/api/statistics/languages-by-territory/',
        { headers }
      );
      return response.data;
    },
    staleTime: 5 * 60 * 1000,
  });

  const { data: capacitiesByTerritory = {}, isLoading: isCapacitiesLoading } = useQuery({
    queryKey: ['statistics', 'capacities-by-territory', token ?? null],
    queryFn: async () => {
      const response = await axios.get<AggregatedCapacityData>(
        '/api/statistics/capacities-by-territory/',
        { headers }
      );
      return response.data;
    },
    staleTime: 5 * 60 * 1000,
  });

  return {
    languagesByTerritory,
    capacitiesByTerritory,
    isLoading: isLanguagesLoading || isCapacitiesLoading,
    error: null,
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
): Record<string, { known: number; available: number; wanted: number }> => {
  const counts: Record<string, { known: number; available: number; wanted: number }> = {};

  Object.entries(capacitiesByTerritory).forEach(([apiTerritoryId, capCounts]) => {
    const wikimediaId = apiTerritoryToWikimediaMap[apiTerritoryId];
    if (wikimediaId === wikimediaTerritoryId) {
      Object.entries(capCounts).forEach(([capId, { known, available, wanted }]) => {
        if (!counts[capId]) {
          counts[capId] = { known: 0, available: 0, wanted: 0 };
        }
        counts[capId].known += known;
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
): Record<string, { known: number; available: number; wanted: number; total: number }> => {
  const totals: Record<string, { known: number; available: number; wanted: number; total: number }> = {};

  Object.entries(capacitiesByTerritory).forEach(([apiTerritoryId, capCounts]) => {
    const wikimediaId = apiTerritoryToWikimediaMap[apiTerritoryId];
    if (wikimediaId && capCounts[capacityId]) {
      if (!totals[wikimediaId]) {
        totals[wikimediaId] = { known: 0, available: 0, wanted: 0, total: 0 };
      }
      totals[wikimediaId].known += capCounts[capacityId].known;
      totals[wikimediaId].available += capCounts[capacityId].available;
      totals[wikimediaId].wanted += capCounts[capacityId].wanted;
      totals[wikimediaId].total +=
        capCounts[capacityId].known + capCounts[capacityId].available + capCounts[capacityId].wanted;
    }
  });

  return totals;
};
