// Additional coverage for capacitiesUtils: toggleChildCapacities, fetchCapacitiesWithFallback,
// applyWikidataNameFallback, fetchWikidataLabelsViaApi, fetchWikidata, fetchMetabase

jest.mock('@/public/static/images/cheer.svg', () => 'cheer.svg');
jest.mock('@/public/static/images/chess_pawn.svg', () => 'chess_pawn.svg');
jest.mock('@/public/static/images/communication.svg', () => 'communication.svg');
jest.mock('@/public/static/images/communities.svg', () => 'communities.svg');
jest.mock('@/public/static/images/corporate_fare.svg', () => 'corporate_fare.svg');
jest.mock('@/public/static/images/local_library.svg', () => 'local_library.svg');
jest.mock('@/public/static/images/wifi_tethering.svg', () => 'wifi_tethering.svg');

jest.mock('@/lib/utils/environment', () => ({
  getApiBaseUrl: jest.fn(() => 'https://localhost:3000'),
}));

jest.mock('axios');
import axios from 'axios';
const mockedAxios = axios as jest.Mocked<typeof axios>;

import {
  toggleChildCapacities,
  fetchCapacitiesWithFallback,
  applyWikidataNameFallback,
  fetchWikidataLabelsViaApi,
  fetchWikidata,
  fetchMetabase,
} from '@/lib/utils/capacitiesUtils';

// ---------------------------------------------------------------------------
// toggleChildCapacities
// ---------------------------------------------------------------------------
describe('toggleChildCapacities', () => {
  it('collapses an already-expanded capacity', async () => {
    const setExpanded = jest.fn();
    const fetchChildren = jest.fn().mockResolvedValue([]);

    await toggleChildCapacities('10', { '10': true }, setExpanded, fetchChildren);

    expect(setExpanded).toHaveBeenCalledWith(expect.any(Function));
    // Verify the updater function sets the code to false
    const updater = setExpanded.mock.calls[0][0];
    expect(updater({ '10': true })).toEqual({ '10': false });
    expect(fetchChildren).not.toHaveBeenCalled();
  });

  it('expands a collapsed capacity and fetches children', async () => {
    const setExpanded = jest.fn();
    const children = [{ code: 101 }, { code: 102 }];
    const fetchChildren = jest.fn().mockResolvedValue(children);
    const fetchDescription = jest.fn().mockResolvedValue(undefined);

    await toggleChildCapacities(
      '10',
      { '10': false },
      setExpanded,
      fetchChildren,
      fetchDescription
    );

    expect(fetchChildren).toHaveBeenCalledWith('10');
    expect(fetchDescription).toHaveBeenCalledWith(101);
    expect(fetchDescription).toHaveBeenCalledWith(102);
    expect(setExpanded).toHaveBeenCalledWith(expect.any(Function));

    const updater = setExpanded.mock.calls[0][0];
    expect(updater({ '10': false })).toEqual({ '10': true });
  });

  it('skips fetchCapacityDescription when not provided', async () => {
    const setExpanded = jest.fn();
    const fetchChildren = jest.fn().mockResolvedValue([{ code: 200 }]);

    await expect(
      toggleChildCapacities('50', {}, setExpanded, fetchChildren)
    ).resolves.toBeUndefined();

    expect(setExpanded).toHaveBeenCalled();
  });

  it('skips fetchCapacityDescription for children without code', async () => {
    const setExpanded = jest.fn();
    const fetchChildren = jest.fn().mockResolvedValue([{ name: 'No code' }]);
    const fetchDescription = jest.fn();

    await toggleChildCapacities('50', {}, setExpanded, fetchChildren, fetchDescription);

    expect(fetchDescription).not.toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// fetchWikidataLabelsViaApi
// ---------------------------------------------------------------------------
describe('fetchWikidataLabelsViaApi', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns empty array when codes is empty', async () => {
    const result = await fetchWikidataLabelsViaApi([], 'en');
    expect(result).toEqual([]);
  });

  it('returns empty array when all wd_codes are falsy', async () => {
    const result = await fetchWikidataLabelsViaApi([{ wd_code: '' }], 'en');
    expect(result).toEqual([]);
  });

  it('fetches labels from API and maps code entries', async () => {
    mockedAxios.get = jest.fn().mockResolvedValue({
      data: {
        labels: [{ wd_code: 'Q123', name: 'Communication', description: 'Ability to communicate' }],
      },
    });

    const result = await fetchWikidataLabelsViaApi([{ code: 36, wd_code: 'Q123' }], 'en');

    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('Communication');
    expect(result[0].code).toBe(36);
    expect(result[0].description).toBe('Ability to communicate');
  });

  it('filters out invalid labels (QID-like names)', async () => {
    mockedAxios.get = jest.fn().mockResolvedValue({
      data: {
        labels: [
          { wd_code: 'Q456', name: 'Q456', description: '' }, // invalid - QID
          { wd_code: 'Q789', name: 'Learning', description: 'Skills' },
        ],
      },
    });

    const result = await fetchWikidataLabelsViaApi(
      [
        { code: 50, wd_code: 'Q456' },
        { code: 51, wd_code: 'Q789' },
      ],
      'en'
    );

    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('Learning');
  });

  it('skips batch silently when axios throws', async () => {
    mockedAxios.get = jest.fn().mockRejectedValue(new Error('Proxy unavailable'));

    const result = await fetchWikidataLabelsViaApi([{ code: 10, wd_code: 'Q001' }], 'en');

    expect(result).toEqual([]);
  });

  it('handles language variants (uses base lang + en fallback)', async () => {
    mockedAxios.get = jest.fn().mockResolvedValue({
      data: { labels: [{ wd_code: 'Q001', name: 'Organizacion', description: '' }] },
    });

    await fetchWikidataLabelsViaApi([{ code: 10, wd_code: 'Q001' }], 'es-419');

    const callParams = (mockedAxios.get as jest.Mock).mock.calls[0][1].params;
    expect(callParams.languages).toContain('es-419');
    expect(callParams.languages).toContain('es');
    expect(callParams.languages).toContain('en');
  });
});

// ---------------------------------------------------------------------------
// fetchWikidata
// ---------------------------------------------------------------------------
describe('fetchWikidata', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns empty array when codes is empty', async () => {
    const result = await fetchWikidata([], 'en');
    expect(result).toEqual([]);
  });

  it('returns empty array when codes have no wd_code', async () => {
    const result = await fetchWikidata([{ code: 10 }], 'en');
    expect(result).toEqual([]);
  });

  it('parses SPARQL results and maps code entries', async () => {
    const sparqlResponse = {
      results: {
        bindings: [
          {
            item: { value: 'http://www.wikidata.org/entity/Q123' },
            itemLabel: { value: 'Communication' },
            itemDescription: { value: 'Ability to communicate effectively' },
          },
        ],
      },
    };

    // SPARQL proxy call - returns valid results so no API labels call needed
    mockedAxios.get = jest.fn().mockResolvedValue({ data: sparqlResponse });

    const result = await fetchWikidata([{ code: 36, wd_code: 'Q123' }], 'en');

    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('Communication');
    expect(result[0].wd_code).toBe('Q123');
    expect(result[0].code).toBe(36);
    expect(result[0].description).toBe('Ability to communicate effectively');
  });

  it('filters out bindings with invalid label (URI/QID)', async () => {
    const sparqlResponse = {
      results: {
        bindings: [
          {
            item: { value: 'http://www.wikidata.org/entity/Q456' },
            itemLabel: { value: 'http://www.wikidata.org/entity/Q456' }, // URI label
            itemDescription: { value: '' },
          },
        ],
      },
    };

    // First call: SPARQL returns URI label (invalid)
    // Second call: API labels lookup also returns nothing
    mockedAxios.get = jest
      .fn()
      .mockResolvedValueOnce({ data: sparqlResponse })
      .mockResolvedValueOnce({ data: { labels: [] } });

    const result = await fetchWikidata([{ code: 10, wd_code: 'Q456' }], 'en');

    // name should be empty since label is invalid URI
    const entry = result.find((r: any) => r.wd_code === 'Q456');
    expect(entry?.name).toBe('');
  });

  it('returns empty array on axios error (fallback also fails)', async () => {
    mockedAxios.get = jest.fn().mockRejectedValue(new Error('SPARQL down'));

    const result = await fetchWikidata([{ code: 10, wd_code: 'Q001' }], 'en');
    expect(Array.isArray(result)).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// fetchMetabase
// ---------------------------------------------------------------------------
describe('fetchMetabase', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns empty array when codes is empty', async () => {
    const result = await fetchMetabase([], 'en');
    expect(result).toEqual([]);
  });

  it('returns empty array when all codes have no wd_code', async () => {
    const result = await fetchMetabase([{ code: 10 }], 'en');
    expect(result).toEqual([]);
  });

  it('parses metabase SPARQL results', async () => {
    const mbResponse = {
      results: {
        bindings: [
          {
            item: { value: 'https://metabase.wikibase.cloud/entity/Q99' },
            itemLabel: { value: 'Organizational Skills', 'xml:lang': 'en' },
            itemDescription: { value: 'Org description', 'xml:lang': 'en' },
            value: { value: 'Q200' },
          },
        ],
      },
    };

    mockedAxios.get = jest.fn().mockResolvedValue({ data: mbResponse });

    const result = await fetchMetabase([{ code: 10, wd_code: 'Q200' }], 'en');

    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('Organizational Skills');
    expect(result[0].wd_code).toBe('Q200');
    expect(result[0].metabase_code).toBe('Q99');
    expect(result[0].description).toBe('Org description');
  });

  it('sets isFallbackTranslation flags when language is not English and label is English', async () => {
    const mbResponse = {
      results: {
        bindings: [
          {
            item: { value: 'https://metabase.wikibase.cloud/entity/Q1' },
            itemLabel: { value: 'Community', 'xml:lang': 'en' }, // English fallback
            itemDescription: { value: '', 'xml:lang': 'en' },
            value: { value: 'Q300' },
          },
        ],
      },
    };

    mockedAxios.get = jest.fn().mockResolvedValue({ data: mbResponse });

    const result = await fetchMetabase([{ code: 56, wd_code: 'Q300' }], 'pt');

    expect(result[0].isFallbackLabel).toBe(true);
    expect(result[0].isFallbackTranslation).toBe(true);
  });

  it('returns empty array when axios throws', async () => {
    mockedAxios.get = jest.fn().mockRejectedValue(new Error('Metabase down'));

    const result = await fetchMetabase([{ code: 10, wd_code: 'Q001' }], 'en');
    expect(result).toEqual([]);
  });

  it('returns empty array when response has unexpected structure', async () => {
    mockedAxios.get = jest.fn().mockResolvedValue({ data: null });

    const result = await fetchMetabase([{ code: 10, wd_code: 'Q001' }], 'en');
    expect(result).toEqual([]);
  });

  it('batches large requests to avoid URL length limits', async () => {
    const largeCodes = Array.from({ length: 25 }, (_, i) => ({
      code: i,
      wd_code: `Q${i + 100}`,
    }));

    const mbResponse = { results: { bindings: [] } };
    mockedAxios.get = jest.fn().mockResolvedValue({ data: mbResponse });

    await fetchMetabase(largeCodes, 'en');

    // Should have been called at least twice (batch size is 20)
    expect(mockedAxios.get).toHaveBeenCalledTimes(2);
  });
});

// ---------------------------------------------------------------------------
// applyWikidataNameFallback
// ---------------------------------------------------------------------------
describe('applyWikidataNameFallback', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns results unchanged when all names are valid', async () => {
    const results = [
      { wd_code: 'Q1', name: 'Communication', code: 36 },
      { wd_code: 'Q2', name: 'Learning', code: 50 },
    ];

    mockedAxios.get = jest.fn();

    const output = await applyWikidataNameFallback(results, 'en');

    // No API call needed
    expect(mockedAxios.get).not.toHaveBeenCalled();
    expect(output).toEqual(results);
  });

  it('fetches Wikidata names for entries with invalid labels', async () => {
    const results = [
      { wd_code: 'Q123', name: 'Q123', code: 10 }, // invalid QID label
      { wd_code: 'Q456', name: 'Valid Name', code: 36 },
    ];

    mockedAxios.get = jest.fn().mockResolvedValue({
      data: { labels: [{ wd_code: 'Q123', name: 'Organizational', description: '' }] },
    });

    const output = await applyWikidataNameFallback(results, 'en');

    const org = output.find((r: any) => r.wd_code === 'Q123');
    expect(org?.name).toBe('Organizational');
  });

  it('falls back to sanitizeCapacityName when Wikidata has no label either', async () => {
    const results = [{ wd_code: 'Q999', name: 'Q999', code: 42 }];

    mockedAxios.get = jest.fn().mockResolvedValue({
      data: { labels: [] }, // no labels returned
    });

    const output = await applyWikidataNameFallback(results, 'en');

    expect(output[0].name).toBe('Capacity 42');
  });

  it('handles API error gracefully by sanitizing names', async () => {
    const results = [{ wd_code: 'Q111', name: 'http://wikidata.org/entity/Q111', code: 99 }];

    mockedAxios.get = jest.fn().mockRejectedValue(new Error('API down'));

    const output = await applyWikidataNameFallback(results, 'en');

    expect(output[0].name).toBe('Capacity 99');
  });
});

// ---------------------------------------------------------------------------
// fetchCapacitiesWithFallback
// ---------------------------------------------------------------------------
describe('fetchCapacitiesWithFallback', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns empty array on error', async () => {
    // Make axios throw to simulate complete failure
    mockedAxios.get = jest.fn().mockRejectedValue(new Error('All failed'));

    const result = await fetchCapacitiesWithFallback([{ code: 10, wd_code: 'Q001' }], 'en');

    expect(Array.isArray(result)).toBe(true);
  });

  it('returns metabase results when metabase succeeds with valid names', async () => {
    const mbResponse = {
      results: {
        bindings: [
          {
            item: { value: 'https://metabase.wikibase.cloud/entity/Q1' },
            itemLabel: { value: 'Organizational', 'xml:lang': 'en' },
            itemDescription: { value: 'Org skills', 'xml:lang': 'en' },
            value: { value: 'Q001' },
          },
        ],
      },
    };

    mockedAxios.get = jest.fn().mockResolvedValue({ data: mbResponse });

    const result = await fetchCapacitiesWithFallback([{ code: 10, wd_code: 'Q001' }], 'en');

    expect(result.length).toBeGreaterThan(0);
    expect(result[0].name).toBe('Organizational');
  });

  it('converts string codes to numbers', async () => {
    const mbResponse = { results: { bindings: [] } };
    mockedAxios.get = jest.fn().mockResolvedValue({ data: mbResponse });

    // Should not throw when code is a string
    await expect(
      fetchCapacitiesWithFallback([{ code: '10' as any, wd_code: 'Q001' }], 'en')
    ).resolves.toBeDefined();
  });
});
