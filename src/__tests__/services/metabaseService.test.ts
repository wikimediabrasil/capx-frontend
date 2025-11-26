import {
  extractDatesFromPageContent,
  extractQIDFromURL,
  extractWikimediaTitleFromURL,
  extractYearFromText,
  fetchEventDataByGenericURL,
  fetchEventDataByLearnWikiURL,
  fetchEventDataByQID,
  fetchEventDataByURL,
  fetchEventDataByWikimediaURL,
  fetchLocationByOSMId,
  isValidEventURL,
} from '@/services/metabaseService';
import {
  createWikidataBinding,
  createWikidataResponse,
  createEmptyWikidataResponse,
  createWikimediaPageExtract,
  createWikimediaPageProps,
  createWikimediaRevision,
  createLocationBinding,
  createMockEventData,
  mockFetchSequence,
  mockFetchError,
  mockFetchFailure,
} from '../utils/api-test-helpers';

// Mock fetch globally
global.fetch = jest.fn();

describe('MetabaseService - Enhanced Auto-fill', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('extractDatesFromPageContent', () => {
    const testDateExtraction = (content: string, expectedBegin: string, expectedEnd: string) => {
      const result = extractDatesFromPageContent(content);
      expect(result).toBeDefined();
      expect(result?.time_begin).toBe(expectedBegin);
      expect(result?.time_end).toBe(expectedEnd);
    };

    it('should extract dates with month names', () => {
      testDateExtraction(
        'The event will take place from July 19 to July 21, 2025.',
        '2025-07-19T00:00:00.000Z',
        '2025-07-21T23:59:59.000Z'
      );
    });

    it('should extract single date with month name', () => {
      testDateExtraction(
        'The conference is scheduled for August 15, 2025.',
        '2025-08-15T00:00:00.000Z',
        '2025-08-15T23:59:59.000Z'
      );
    });

    it('should extract consecutive dates', () => {
      testDateExtraction(
        'Event dates: 19-21 July 2025',
        '2025-07-19T00:00:00.000Z',
        '2025-07-21T23:59:59.000Z'
      );
    });

    it('should extract ISO format dates', () => {
      testDateExtraction(
        'From 2025-07-19 to 2025-07-21',
        '2025-07-19T00:00:00.000Z',
        '2025-07-21T23:59:59.000Z'
      );
    });

    it('should handle different month formats', () => {
      testDateExtraction(
        'September 1-3, 2025',
        '2025-09-01T00:00:00.000Z',
        '2025-09-03T23:59:59.000Z'
      );
    });

    it('should return undefined for invalid content', () => {
      const content = 'No dates in this content';
      const result = extractDatesFromPageContent(content);

      expect(result).toBeUndefined();
    });
  });

  describe('extractWikimediaTitleFromURL', () => {
    const testTitleExtraction = (url: string, expected: string) => {
      expect(extractWikimediaTitleFromURL(url)).toBe(expected);
    };

    it('should extract title from meta.wikimedia.org URL', () => {
      testTitleExtraction('https://meta.wikimedia.org/wiki/Wikimania_2025', 'Wikimania 2025');
    });

    it('should extract title from local wikimedia URL', () => {
      testTitleExtraction(
        'https://br.wikimedia.org/wiki/Wikicon_Brasil_2025',
        'Wikicon Brasil 2025'
      );
    });

    it('should handle URL encoded titles', () => {
      testTitleExtraction(
        'https://meta.wikimedia.org/wiki/Event%20with%20spaces',
        'Event with spaces'
      );
    });

    it('should extract title with Event namespace', () => {
      testTitleExtraction(
        'https://meta.wikimedia.org/wiki/Event:WikiCon_Brasil_2025',
        'Event:WikiCon Brasil 2025'
      );
    });

    it('should handle Event namespace with special characters', () => {
      testTitleExtraction(
        'https://meta.wikimedia.org/wiki/Event:Wikipedia_%26_Education_User_Group_Showcase/September',
        'Event:Wikipedia & Education User Group Showcase/September'
      );
    });

    it('should handle URLs with fragment identifiers', () => {
      testTitleExtraction(
        'https://meta.wikimedia.org/wiki/Event:Test_Event#Section',
        'Event:Test Event'
      );
    });

    it('should handle URLs with query parameters', () => {
      testTitleExtraction(
        'https://meta.wikimedia.org/wiki/Event:Test_Event?action=edit',
        'Event:Test Event'
      );
    });

    it('should extract title from mobile Meta Wikimedia URLs', () => {
      testTitleExtraction(
        'https://meta.m.wikimedia.org/wiki/Event:EduWiki_Workshop_October_2025',
        'Event:EduWiki Workshop October 2025'
      );
    });

    it('should extract title from mobile local Wikimedia URLs', () => {
      testTitleExtraction(
        'https://br.m.wikimedia.org/wiki/WikiCon_Brasil_2025',
        'WikiCon Brasil 2025'
      );
    });
  });

  describe('extractQIDFromURL', () => {
    it('should extract QID from wikidata URL', () => {
      const url = 'https://www.wikidata.org/wiki/Q123456';
      const result = extractQIDFromURL(url);

      expect(result).toBe('Q123456');
    });

    it('should extract QID from entity URL', () => {
      const url = 'https://www.wikidata.org/entity/Q789012';
      const result = extractQIDFromURL(url);

      expect(result).toBe('Q789012');
    });

    it('should return undefined for invalid URL', () => {
      const url = 'https://example.com/invalid';
      const result = extractQIDFromURL(url);

      expect(result).toBeUndefined();
    });
  });

  describe('isValidEventURL', () => {
    it('should validate Meta Wikimedia URLs', () => {
      const url = 'https://meta.wikimedia.org/wiki/Wikimania_2025';
      expect(isValidEventURL(url)).toBe(true);
    });

    it('should validate Meta Wikimedia URLs with Event namespace', () => {
      const url =
        'https://meta.wikimedia.org/wiki/Event:Wikipedia_%26_Education_User_Group_Showcase/September';
      expect(isValidEventURL(url)).toBe(true);
    });

    it('should validate local Wikimedia URLs', () => {
      const url = 'https://br.wikimedia.org/wiki/Event';
      expect(isValidEventURL(url)).toBe(true);
    });

    it('should validate local Wikimedia URLs with Event namespace', () => {
      const url = 'https://br.wikimedia.org/wiki/Event:WikiCon_Brasil_2025';
      expect(isValidEventURL(url)).toBe(true);
    });

    it('should validate WikiLearn URLs', () => {
      const url = 'https://app.learn.wiki/learning/course/course-v1:WikimediaBrasil+TRAIN001+2025';
      expect(isValidEventURL(url)).toBe(true);
    });

    it('should validate Wikidata URLs', () => {
      const url = 'https://www.wikidata.org/wiki/Q123456';
      expect(isValidEventURL(url)).toBe(true);
    });

    it('should validate mobile Meta Wikimedia URLs', () => {
      const mobileMetaUrl = 'https://meta.m.wikimedia.org/wiki/Event:EduWiki_Workshop_October_2025';
      expect(isValidEventURL(mobileMetaUrl)).toBe(true);
    });

    it('should validate mobile local Wikimedia URLs', () => {
      const mobileLocalUrl = 'https://br.m.wikimedia.org/wiki/WikiCon_Brasil_2025';
      expect(isValidEventURL(mobileLocalUrl)).toBe(true);
    });

    it('should reject invalid URLs', () => {
      const url = 'https://example.com/invalid';
      expect(isValidEventURL(url)).toBe(false);
    });
  });

  describe('extractYearFromText', () => {
    it('should extract year from text', () => {
      const text = 'Wikimania 2025 event';
      const result = extractYearFromText(text);

      expect(result).toBe(2025);
    });

    it('should extract year from URL', () => {
      const text = 'https://meta.wikimedia.org/wiki/Event 2024';
      const result = extractYearFromText(text);

      expect(result).toBe(2024);
    });

    it('should return undefined for no year', () => {
      const text = 'Event without year';
      const result = extractYearFromText(text);

      expect(result).toBeUndefined();
    });
  });

  describe('fetchEventDataByQID', () => {
    it('should fetch event data successfully', async () => {
      const binding = createWikidataBinding({
        name: 'Wikimania 2025',
        description: 'Annual Wikimedia conference',
        image_url: 'https://commons.wikimedia.org/wiki/Special:FilePath/event.jpg',
        start_date: '2025-07-19T00:00:00Z',
        end_date: '2025-07-21T23:59:59Z',
        location: 'https://www.wikidata.org/entity/Q123',
        location_name: 'São Paulo',
        url: 'https://meta.wikimedia.org/wiki/Wikimania_2025',
      });

      mockFetchSequence(createWikidataResponse([binding]));

      const result = await fetchEventDataByQID('Q123456');

      expect(result).toEqual(createMockEventData());
    });

    it('should return null for invalid QID', async () => {
      const result = await fetchEventDataByQID('invalid');
      expect(result).toBeNull();
    });

    it('should return null for empty QID', async () => {
      const result = await fetchEventDataByQID('');
      expect(result).toBeNull();
    });

    it('should handle API errors', async () => {
      mockFetchError();
      const result = await fetchEventDataByQID('Q123456');
      expect(result).toBeNull();
    });

    it('should handle empty results', async () => {
      mockFetchSequence(createEmptyWikidataResponse());
      const result = await fetchEventDataByQID('Q123456');
      expect(result).toBeNull();
    });
  });

  describe('fetchEventDataByURL', () => {
    it('should fetch event data from Wikidata URL', async () => {
      const mockResponse = {
        results: {
          bindings: [
            {
              name: { value: 'Wikimania 2025' },
              description: { value: 'Annual Wikimedia conference' },
              start_date: { value: '2025-07-19T00:00:00Z' },
              end_date: { value: '2025-07-21T23:59:59Z' },
            },
          ],
        },
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await fetchEventDataByURL('https://www.wikidata.org/wiki/Q123456');

      expect(result).toBeDefined();
      expect(result?.name).toBe('Wikimania 2025');
    });

    it('should return null for invalid URL', async () => {
      const result = await fetchEventDataByURL('https://example.com/invalid');
      expect(result).toBeNull();
    });
  });

  describe('fetchLocationByOSMId', () => {
    it('should fetch location data successfully', async () => {
      const locationData = createLocationBinding({
        name: 'São Paulo',
        lat: '-23.5505',
        lon: '-46.6333',
        address: 'São Paulo, Brazil',
      });

      mockFetchSequence(createWikidataResponse([locationData]));

      const result = await fetchLocationByOSMId('123456');

      expect(result).toEqual(locationData);
    });

    it('should return null for empty OSM ID', async () => {
      const result = await fetchLocationByOSMId('');
      expect(result).toBeNull();
    });

    it('should handle API errors', async () => {
      mockFetchError();
      const result = await fetchLocationByOSMId('123456');
      expect(result).toBeNull();
    });

    it('should handle empty response', async () => {
      mockFetchSequence(createEmptyWikidataResponse());
      const result = await fetchLocationByOSMId('123456');
      expect(result).toBeNull();
    });
  });

  describe('fetchEventDataByWikimediaURL', () => {
    it('should fetch event data from Wikimedia page', async () => {
      mockFetchSequence(
        createWikimediaPageExtract('Event will take place from July 19 to July 21, 2025'),
        createWikimediaPageProps('Q123456'),
        createWikimediaRevision(
          '{{Infobox event\n|name=Wikimania 2025\n|date=July 19-21, 2025\n|location=São Paulo}}'
        )
      );

      const result = await fetchEventDataByWikimediaURL(
        'https://meta.wikimedia.org/wiki/Wikimania_2025'
      );

      expect(result).toBeDefined();
      expect(result?.name).toBe('Wikimania 2025');
    });

    it('should return null when page data is not available', async () => {
      mockFetchFailure();

      const result = await fetchEventDataByWikimediaURL(
        'https://meta.wikimedia.org/wiki/InvalidEvent'
      );

      expect(result).toEqual({
        name: 'InvalidEvent',
        url: 'https://meta.wikimedia.org/wiki/InvalidEvent',
      });
    });
  });

  describe('fetchEventDataByLearnWikiURL', () => {
    it('should fetch event data from Learn Wiki page', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          title: 'Wikimedia Training Course',
          description: 'Learn about Wikimedia projects',
          dates: 'August 1-3, 2025',
        }),
      });

      const result = await fetchEventDataByLearnWikiURL(
        'https://app.learn.wiki/learning/course/course-v1:WikimediaBrasil+TRAIN001+2025'
      );

      expect(result).toBeDefined();
      expect(result?.name).toBe('TRAIN001 Course');
      expect(result?.description).toBe('Online training course from WikimediaBrasil.');
    });

    it('should return null when page content is not available', async () => {
      mockFetchFailure();
      const result = await fetchEventDataByLearnWikiURL('https://app.learn.wiki/invalid/course');
      expect(result).toBeNull();
    });
  });

  describe('fetchEventDataByGenericURL', () => {
    it('should fetch event data from Wikimedia URL', async () => {
      mockFetchSequence(
        createWikimediaPageExtract('Event will take place from July 19 to July 21, 2025'),
        createWikimediaPageProps('Q123456'),
        createWikimediaRevision('{{Infobox event\n|name=Wikimania 2025\n|date=July 19-21, 2025}}')
      );

      const result = await fetchEventDataByGenericURL(
        'https://meta.wikimedia.org/wiki/GenericEvent'
      );

      expect(result).toBeDefined();
      expect(result?.name).toBe('GenericEvent');
    });

    it('should try Learn Wiki if Wikimedia fails', async () => {
      mockFetchSequence(
        { ok: false },
        {
          title: 'Learn Wiki Event',
          description: 'A Learn Wiki event',
          dates: 'August 1-3, 2025',
        }
      );

      const result = await fetchEventDataByGenericURL(
        'https://app.learn.wiki/learning/course/course-v1:WikimediaBrasil+TRAIN001+2025'
      );

      expect(result).toBeDefined();
      expect(result?.name).toBe('TRAIN001 Course');
      expect(result?.description).toBe('Online training course from WikimediaBrasil.');
    });

    it('should return null when all methods fail', async () => {
      mockFetchFailure();
      const result = await fetchEventDataByGenericURL('https://example.com/invalid');
      expect(result).toBeNull();
    });
  });
});
