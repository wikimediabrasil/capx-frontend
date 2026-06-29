jest.mock('@tanstack/react-query', () => ({
  useQuery: jest.fn(() => ({
    data: {},
    isLoading: false,
  })),
}));

import {
  getLanguageCountsForWikimediaTerritory,
  getCapacityCountsForWikimediaTerritory,
  getLanguageTotalsByWikimediaTerritory,
  getCapacityTotalsByWikimediaTerritory,
} from '@/hooks/useAggregatedTerritoryData';

const apiToWikimediaMap: Record<string, string> = {
  '18': 'SSA',
  '19': 'NWE',
  '20': 'ESEAP',
};

describe('getLanguageCountsForWikimediaTerritory', () => {
  it('aggregates language counts for a given territory', () => {
    const data = {
      '18': { en: 5, fr: 3 },
      '19': { en: 10 },
    };
    const result = getLanguageCountsForWikimediaTerritory(data, apiToWikimediaMap, 'SSA');
    expect(result).toEqual({ en: 5, fr: 3 });
  });

  it('returns empty for non-matching territory', () => {
    const data = { '18': { en: 5 } };
    const result = getLanguageCountsForWikimediaTerritory(data, apiToWikimediaMap, 'MENA');
    expect(result).toEqual({});
  });

  it('merges multiple API territories to same Wikimedia territory', () => {
    const map = { '18': 'SSA', '21': 'SSA' };
    const data = {
      '18': { en: 5 },
      '21': { en: 3, fr: 2 },
    };
    const result = getLanguageCountsForWikimediaTerritory(data, map, 'SSA');
    expect(result).toEqual({ en: 8, fr: 2 });
  });
});

describe('getCapacityCountsForWikimediaTerritory', () => {
  it('aggregates capacity counts for a given territory', () => {
    const data = {
      '18': { '10': { known: 5, available: 3, wanted: 1 } },
    };
    const result = getCapacityCountsForWikimediaTerritory(data, apiToWikimediaMap, 'SSA');
    expect(result).toEqual({ '10': { known: 5, available: 3, wanted: 1 } });
  });

  it('merges counts from multiple API territories', () => {
    const map = { '18': 'SSA', '21': 'SSA' };
    const data = {
      '18': { '10': { known: 5, available: 3, wanted: 1 } },
      '21': { '10': { known: 2, available: 1, wanted: 0 } },
    };
    const result = getCapacityCountsForWikimediaTerritory(data, map, 'SSA');
    expect(result).toEqual({ '10': { known: 7, available: 4, wanted: 1 } });
  });

  it('returns empty for non-matching territory', () => {
    const data = { '18': { '10': { known: 5, available: 3, wanted: 1 } } };
    const result = getCapacityCountsForWikimediaTerritory(data, apiToWikimediaMap, 'MENA');
    expect(result).toEqual({});
  });
});

describe('getLanguageTotalsByWikimediaTerritory', () => {
  it('returns totals per Wikimedia territory for a language', () => {
    const data = {
      '18': { en: 5, fr: 3 },
      '19': { en: 10 },
    };
    const result = getLanguageTotalsByWikimediaTerritory(data, apiToWikimediaMap, 'en');
    expect(result).toEqual({ SSA: 5, NWE: 10 });
  });

  it('returns empty when language not present', () => {
    const data = { '18': { en: 5 } };
    const result = getLanguageTotalsByWikimediaTerritory(data, apiToWikimediaMap, 'de');
    expect(result).toEqual({});
  });
});

describe('getCapacityTotalsByWikimediaTerritory', () => {
  it('returns totals per Wikimedia territory for a capacity', () => {
    const data = {
      '18': { '10': { known: 5, available: 3, wanted: 1 } },
      '19': { '10': { known: 2, available: 1, wanted: 0 } },
    };
    const result = getCapacityTotalsByWikimediaTerritory(data, apiToWikimediaMap, '10');
    expect(result).toEqual({
      SSA: { known: 5, available: 3, wanted: 1, total: 9 },
      NWE: { known: 2, available: 1, wanted: 0, total: 3 },
    });
  });

  it('returns empty when capacity not present', () => {
    const data = { '18': { '10': { known: 5, available: 3, wanted: 1 } } };
    const result = getCapacityTotalsByWikimediaTerritory(data, apiToWikimediaMap, '99');
    expect(result).toEqual({});
  });
});
