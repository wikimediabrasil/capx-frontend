import { isValidEventURL, extractDatesFromPageContent } from '@/services/metabaseService';

describe('EventsForm Service Tests', () => {
  describe('URL Validation', () => {
    test('should validate WikiLearn URLs correctly', () => {
      const validWikiLearnURL =
        'https://app.learn.wiki/learning/course/course-v1:Wikimedia-Foundation+DIS001+2023/home';
      expect(isValidEventURL(validWikiLearnURL)).toBe(true);
    });

    test('should validate Meta Wikimedia URLs correctly', () => {
      const validMetaURL = 'https://meta.wikimedia.org/wiki/WikiCon_Brasil_2025';
      expect(isValidEventURL(validMetaURL)).toBe(true);
    });

    test('should reject invalid URLs', () => {
      const invalidURL = 'https://google.com/event';
      expect(isValidEventURL(invalidURL)).toBe(false);
    });

    test('should validate br.wikimedia.org URLs', () => {
      const validBrURL = 'https://br.wikimedia.org/wiki/WikiCon_Brasil_2025';
      expect(isValidEventURL(validBrURL)).toBe(true);
    });

    test('should validate Wikidata URLs', () => {
      const validWikidataURL = 'https://www.wikidata.org/wiki/Q12345';
      expect(isValidEventURL(validWikidataURL)).toBe(true);
    });

    test('should validate Event namespace URLs with special characters', () => {
      const eventNamespaceUrl = 'https://meta.wikimedia.org/wiki/Event:Wikipedia_%26_Education_User_Group_Showcase/September';
      expect(isValidEventURL(eventNamespaceUrl)).toBe(true);
    });

    test('should validate Event namespace URLs on local Wikimedia sites', () => {
      const eventNamespaceLocalUrl = 'https://br.wikimedia.org/wiki/Event:WikiCon_Brasil_2025';
      expect(isValidEventURL(eventNamespaceLocalUrl)).toBe(true);
    });

    test('should validate complex Event namespace URLs', () => {
      const complexEventUrl = 'https://meta.wikimedia.org/wiki/Event:Test_Event_2025/Participants';
      expect(isValidEventURL(complexEventUrl)).toBe(true);
    });

    test('should reject empty or invalid inputs', () => {
      expect(isValidEventURL('')).toBe(false);
      expect(isValidEventURL(null as any)).toBe(false);
      expect(isValidEventURL(undefined as any)).toBe(false);
    });
  });

  describe('Date Extraction from Universal Formats', () => {
    test('should extract dates from ISO format', () => {
      const isoText = 'Event will happen from 2025-07-19 to 2025-07-20';
      const result = extractDatesFromPageContent(isoText);

      expect(result).toBeDefined();
      expect(result?.time_begin).toBe('2025-07-19T00:00:00.000Z');
      expect(result?.time_end).toBe('2025-07-20T23:59:59.000Z');
    });

    test('should extract dates from European format', () => {
      const europeanText = 'The event is scheduled for 19/07/2025 to 20/07/2025';
      const result = extractDatesFromPageContent(europeanText);

      expect(result).toBeDefined();
      expect(result?.time_begin).toBe('2025-07-19T00:00:00.000Z');
      expect(result?.time_end).toBe('2025-07-20T23:59:59.000Z');
    });

    test('should extract dates from consecutive days format', () => {
      const consecutiveText = 'Event happening on 19-20/07/2025';
      const result = extractDatesFromPageContent(consecutiveText);

      expect(result).toBeDefined();
      expect(result?.time_begin).toBe('2025-07-19T00:00:00.000Z');
      expect(result?.time_end).toBe('2025-07-20T23:59:59.000Z');
    });

    test('should extract single date and use it for both start and end', () => {
      const singleDateText = 'Event on 2025-07-19';
      const result = extractDatesFromPageContent(singleDateText);

      expect(result).toBeDefined();
      expect(result?.time_begin).toBe('2025-07-19T00:00:00.000Z');
      expect(result?.time_end).toBe('2025-07-19T23:59:59.000Z');
    });

    test('should extract year-only fallback dates', () => {
      const textWithYearOnly = 'This is an event happening in 2025';
      const result = extractDatesFromPageContent(textWithYearOnly);

      expect(result).toBeDefined();
      expect(result?.time_begin).toBe('2025-01-01T00:00:00.000Z');
      expect(result?.time_end).toBe('2025-12-31T23:59:59.000Z');
    });

    test('should return undefined for text without dates', () => {
      const textWithoutDates = 'This is just some random text without any date information';
      const result = extractDatesFromPageContent(textWithoutDates);

      expect(result).toBeUndefined();
    });
  });
});
