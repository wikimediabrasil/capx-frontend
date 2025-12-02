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
  mockWikimediaPageSequence,
  createStandardEventBinding,
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

    it.each([
      [
        'should extract dates with month names',
        'The event will take place from July 19 to July 21, 2025.',
        '2025-07-19T00:00:00.000Z',
        '2025-07-21T23:59:59.000Z',
      ],
      [
        'should extract single date with month name',
        'The conference is scheduled for August 15, 2025.',
        '2025-08-15T00:00:00.000Z',
        '2025-08-15T23:59:59.000Z',
      ],
      [
        'should extract consecutive dates',
        'Event dates: 19-21 July 2025',
        '2025-07-19T00:00:00.000Z',
        '2025-07-21T23:59:59.000Z',
      ],
      [
        'should extract ISO format dates',
        'From 2025-07-19 to 2025-07-21',
        '2025-07-19T00:00:00.000Z',
        '2025-07-21T23:59:59.000Z',
      ],
      [
        'should handle different month formats',
        'September 1-3, 2025',
        '2025-09-01T00:00:00.000Z',
        '2025-09-03T23:59:59.000Z',
      ],
    ])('%s', (_description, content, expectedBegin, expectedEnd) => {
      testDateExtraction(content, expectedBegin, expectedEnd);
    });

    it('should return undefined for invalid content', () => {
      const result = extractDatesFromPageContent('No dates in this content');
      expect(result).toBeUndefined();
    });
  });

  describe('extractWikimediaTitleFromURL', () => {
    it.each([
      [
        'should extract title from meta.wikimedia.org URL',
        'https://meta.wikimedia.org/wiki/Wikimania_2025',
        'Wikimania 2025',
      ],
      [
        'should extract title from local wikimedia URL',
        'https://br.wikimedia.org/wiki/Wikicon_Brasil_2025',
        'Wikicon Brasil 2025',
      ],
      [
        'should handle URL encoded titles',
        'https://meta.wikimedia.org/wiki/Event%20with%20spaces',
        'Event with spaces',
      ],
      [
        'should extract title with Event namespace',
        'https://meta.wikimedia.org/wiki/Event:WikiCon_Brasil_2025',
        'Event:WikiCon Brasil 2025',
      ],
      [
        'should handle Event namespace with special characters',
        'https://meta.wikimedia.org/wiki/Event:Wikipedia_%26_Education_User_Group_Showcase/September',
        'Event:Wikipedia & Education User Group Showcase/September',
      ],
      [
        'should handle URLs with fragment identifiers',
        'https://meta.wikimedia.org/wiki/Event:Test_Event#Section',
        'Event:Test Event',
      ],
      [
        'should handle URLs with query parameters',
        'https://meta.wikimedia.org/wiki/Event:Test_Event?action=edit',
        'Event:Test Event',
      ],
      [
        'should extract title from mobile Meta Wikimedia URLs',
        'https://meta.m.wikimedia.org/wiki/Event:EduWiki_Workshop_October_2025',
        'Event:EduWiki Workshop October 2025',
      ],
      [
        'should extract title from mobile local Wikimedia URLs',
        'https://br.m.wikimedia.org/wiki/WikiCon_Brasil_2025',
        'WikiCon Brasil 2025',
      ],
    ])('%s', (_description, url, expected) => {
      expect(extractWikimediaTitleFromURL(url)).toBe(expected);
    });
  });

  describe('extractQIDFromURL', () => {
    it.each([
      ['should extract QID from wikidata URL', 'https://www.wikidata.org/wiki/Q123456', 'Q123456'],
      ['should extract QID from entity URL', 'https://www.wikidata.org/entity/Q789012', 'Q789012'],
      ['should return undefined for invalid URL', 'https://example.com/invalid', undefined],
    ])('%s', (_description, url, expected) => {
      expect(extractQIDFromURL(url)).toBe(expected);
    });
  });

  describe('isValidEventURL', () => {
    it.each([
      [
        'should validate Meta Wikimedia URLs',
        'https://meta.wikimedia.org/wiki/Wikimania_2025',
        true,
      ],
      [
        'should validate Meta Wikimedia URLs with Event namespace',
        'https://meta.wikimedia.org/wiki/Event:Wikipedia_%26_Education_User_Group_Showcase/September',
        true,
      ],
      ['should validate local Wikimedia URLs', 'https://br.wikimedia.org/wiki/Event', true],
      [
        'should validate local Wikimedia URLs with Event namespace',
        'https://br.wikimedia.org/wiki/Event:WikiCon_Brasil_2025',
        true,
      ],
      [
        'should validate WikiLearn URLs',
        'https://app.learn.wiki/learning/course/course-v1:WikimediaBrasil+TRAIN001+2025',
        true,
      ],
      ['should validate Wikidata URLs', 'https://www.wikidata.org/wiki/Q123456', true],
      [
        'should validate mobile Meta Wikimedia URLs',
        'https://meta.m.wikimedia.org/wiki/Event:EduWiki_Workshop_October_2025',
        true,
      ],
      [
        'should validate mobile local Wikimedia URLs',
        'https://br.m.wikimedia.org/wiki/WikiCon_Brasil_2025',
        true,
      ],
      ['should reject invalid URLs', 'https://example.com/invalid', false],
    ])('%s', (_description, url, expected) => {
      expect(isValidEventURL(url)).toBe(expected);
    });
  });

  describe('extractYearFromText', () => {
    it.each([
      ['should extract year from text', 'Wikimania 2025 event', 2025],
      ['should extract year from URL', 'https://meta.wikimedia.org/wiki/Event 2024', 2024],
      ['should return undefined for no year', 'Event without year', undefined],
    ])('%s', (_description, text, expected) => {
      expect(extractYearFromText(text)).toBe(expected);
    });
  });

  describe('fetchEventDataByQID', () => {
    it('should fetch event data successfully', async () => {
      mockFetchSequence(createWikidataResponse([createStandardEventBinding()]));

      const result = await fetchEventDataByQID('Q123456');

      expect(result).toEqual(createMockEventData());
    });

    it.each([
      ['should return null for invalid QID', 'invalid', null],
      ['should return null for empty QID', '', null],
    ])('%s', async (_description, qid, expected) => {
      const result = await fetchEventDataByQID(qid);
      expect(result).toBe(expected);
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
      mockFetchSequence(createWikidataResponse([createStandardEventBinding()]));

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

    it.each([
      ['should handle API errors', mockFetchError],
      ['should handle empty response', () => mockFetchSequence(createEmptyWikidataResponse())],
    ])('%s', async (_description, setupMock) => {
      setupMock();
      const result = await fetchLocationByOSMId('123456');
      expect(result).toBeNull();
    });
  });

  describe('fetchEventDataByWikimediaURL', () => {
    it('should fetch event data from Wikimedia page', async () => {
      mockWikimediaPageSequence(
        'Event will take place from July 19 to July 21, 2025',
        'Q123456',
        '{{Infobox event\n|name=Wikimania 2025\n|date=July 19-21, 2025\n|location=São Paulo}}'
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
      mockWikimediaPageSequence(
        'Event will take place from July 19 to July 21, 2025',
        'Q123456',
        '{{Infobox event\n|name=Wikimania 2025\n|date=July 19-21, 2025}}'
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
