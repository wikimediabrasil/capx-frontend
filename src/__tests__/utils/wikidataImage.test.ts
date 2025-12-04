import { shouldUseWikidataImage } from '@/lib/utils/wikidataImage';

describe('wikidataImage utilities', () => {
  describe('shouldUseWikidataImage', () => {
    it('should return true when avatar is null and wikidataQid exists', () => {
      expect(shouldUseWikidataImage(null, 'Q12345')).toBe(true);
    });

    it('should return true when avatar is undefined and wikidataQid exists', () => {
      expect(shouldUseWikidataImage(undefined, 'Q12345')).toBe(true);
    });

    it('should return true when avatar is 0 and wikidataQid exists', () => {
      expect(shouldUseWikidataImage(0, 'Q12345')).toBe(true);
      expect(shouldUseWikidataImage('0', 'Q12345')).toBe(true);
    });

    it('should return true when avatar is 1 and wikidataQid exists (legacy data)', () => {
      expect(shouldUseWikidataImage(1, 'Q12345')).toBe(true);
      expect(shouldUseWikidataImage('1', 'Q12345')).toBe(true);
    });

    it('should return false when wikidataQid is missing', () => {
      expect(shouldUseWikidataImage(null, null)).toBe(false);
      expect(shouldUseWikidataImage(0, undefined)).toBe(false);
      expect(shouldUseWikidataImage(1, '')).toBe(false);
    });

    it('should return false when avatar is greater than 1', () => {
      expect(shouldUseWikidataImage(2, 'Q12345')).toBe(false);
      expect(shouldUseWikidataImage('5', 'Q12345')).toBe(false);
      expect(shouldUseWikidataImage(10, 'Q12345')).toBe(false);
    });

    it('should handle string avatar values correctly', () => {
      expect(shouldUseWikidataImage('0', 'Q12345')).toBe(true);
      expect(shouldUseWikidataImage('1', 'Q12345')).toBe(true);
      expect(shouldUseWikidataImage('2', 'Q12345')).toBe(false);
    });
  });
});
