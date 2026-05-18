import { isValidEventURL } from '@/services/metabaseService';

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
      const eventNamespaceUrl =
        'https://meta.wikimedia.org/wiki/Event:Wikipedia_%26_Education_User_Group_Showcase/September';
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
});
