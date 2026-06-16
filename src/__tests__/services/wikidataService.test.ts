import { fetchEventFromWikidata, findWikidataQIDByMetaWikiTitle } from '@/services/wikidataService';

describe('wikidataService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn();
  });

  describe('fetchEventFromWikidata', () => {
    it('returns null for non-Q IDs', async () => {
      expect(await fetchEventFromWikidata('')).toBeNull();
      expect(await fetchEventFromWikidata('P123')).toBeNull();
      expect(await fetchEventFromWikidata(null as any)).toBeNull();
    });

    it('fetches event data from SPARQL', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          results: {
            bindings: [
              {
                name: { value: 'Wikimania 2025' },
                description: { value: 'Annual conference' },
                start_date: { value: '+2025-08-01T00:00:00Z' },
                end_date: { value: '+2025-08-03T00:00:00Z' },
                url: { value: 'https://wikimania.wikimedia.org' },
              },
            ],
          },
        }),
      });

      const result = await fetchEventFromWikidata('Q12345');

      expect(result).not.toBeNull();
      expect(result!.name).toBe('Wikimania 2025');
      expect(result!.wikidata_qid).toBe('Q12345');
      expect(result!.description).toBe('Annual conference');
      expect(result!.time_begin).toBeDefined();
      expect(result!.time_end).toBeDefined();
    });

    it('returns null when no results', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ results: { bindings: [] } }),
      });

      expect(await fetchEventFromWikidata('Q99999')).toBeNull();
    });

    it('returns null on fetch error', async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network'));
      expect(await fetchEventFromWikidata('Q12345')).toBeNull();
    });

    it('sets location type when location exists', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          results: {
            bindings: [
              {
                name: { value: 'Event' },
                location: { value: 'http://www.wikidata.org/entity/Q60' },
              },
            ],
          },
        }),
      });

      const result = await fetchEventFromWikidata('Q1');
      expect(result!.type_of_location).toBe('in_person');
    });
  });

  describe('findWikidataQIDByMetaWikiTitle', () => {
    it('returns null for empty title', async () => {
      expect(await findWikidataQIDByMetaWikiTitle('')).toBeNull();
    });

    it('finds QID by meta wiki title', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ entities: { Q12345: { type: 'item' } } }),
      });

      const result = await findWikidataQIDByMetaWikiTitle('Wikimania 2025');
      expect(result).toBe('Q12345');
    });

    it('returns null when entity is -1', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ entities: { '-1': {} } }),
      });

      expect(await findWikidataQIDByMetaWikiTitle('Nonexistent')).toBeNull();
    });

    it('returns null on error', async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network'));
      expect(await findWikidataQIDByMetaWikiTitle('Test')).toBeNull();
    });
  });
});
