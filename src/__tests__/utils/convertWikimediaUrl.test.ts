import { convertToCommonsPageUrl, ensureCommonsPageUrl } from '@/lib/utils/convertWikimediaUrl';

import { validateCapXDocumentUrl } from '@/lib/utils/validateDocumentUrl';

describe('convertWikimediaUrl', () => {
  describe('convertToCommonsPageUrl', () => {
    it('should convert direct file URL to Commons page URL', () => {
      const directUrl =
        'https://upload.wikimedia.org/wikipedia/commons/e/e1/Wikipedia_de_A_a_Z.pdf';
      const result = convertToCommonsPageUrl(directUrl);

      expect(result.isWikimediaUrl).toBe(true);
      expect(result.commonsPageUrl).toBe(
        'https://commons.wikimedia.org/wiki/File:Wikipedia_de_A_a_Z.pdf'
      );
      expect(result.filename).toBe('Wikipedia_de_A_a_Z.pdf');
      expect(result.directFileUrl).toBe(directUrl);
    });

    it('should handle already converted Commons page URL', () => {
      const commonsUrl = 'https://commons.wikimedia.org/wiki/File:Wikipedia_de_A_a_Z.pdf';
      const result = convertToCommonsPageUrl(commonsUrl);

      expect(result.isWikimediaUrl).toBe(true);
      expect(result.commonsPageUrl).toBe(commonsUrl);
      expect(result.filename).toBe('Wikipedia_de_A_a_Z.pdf');
    });

    it('should handle non-Wikimedia URLs', () => {
      const nonWikimediaUrl = 'https://example.com/document.pdf';
      const result = convertToCommonsPageUrl(nonWikimediaUrl);

      expect(result.isWikimediaUrl).toBe(false);
      expect(result.originalUrl).toBe(nonWikimediaUrl);
    });

    it('should handle different file extensions', () => {
      const testCases = [
        {
          input: 'https://upload.wikimedia.org/wikipedia/commons/a/ab/Test.jpg',
          expected: 'https://commons.wikimedia.org/wiki/File:Test.jpg',
        },
        {
          input: 'https://upload.wikimedia.org/wikipedia/commons/1/12/Document.ogg',
          expected: 'https://commons.wikimedia.org/wiki/File:Document.ogg',
        },
        {
          input: 'https://upload.wikimedia.org/wikipedia/commons/9/9a/Video.webm',
          expected: 'https://commons.wikimedia.org/wiki/File:Video.webm',
        },
      ];

      testCases.forEach(({ input, expected }) => {
        const result = convertToCommonsPageUrl(input);
        expect(result.commonsPageUrl).toBe(expected);
      });
    });

    it('should handle URLs with special characters', () => {
      const urlWithSpaces =
        'https://upload.wikimedia.org/wikipedia/commons/a/ab/File_with_spaces.pdf';
      const result = convertToCommonsPageUrl(urlWithSpaces);

      expect(result.commonsPageUrl).toBe(
        'https://commons.wikimedia.org/wiki/File:File_with_spaces.pdf'
      );
    });
  });

  describe('ensureCommonsPageUrl', () => {
    it('should convert direct URL to Commons page URL', () => {
      const directUrl =
        'https://upload.wikimedia.org/wikipedia/commons/e/e1/Wikipedia_de_A_a_Z.pdf';
      const result = ensureCommonsPageUrl(directUrl);

      expect(result).toBe('https://commons.wikimedia.org/wiki/File:Wikipedia_de_A_a_Z.pdf');
    });

    it('should return Commons page URL unchanged', () => {
      const commonsUrl = 'https://commons.wikimedia.org/wiki/File:Wikipedia_de_A_a_Z.pdf';
      const result = ensureCommonsPageUrl(commonsUrl);

      expect(result).toBe(commonsUrl);
    });

    it('should return non-Wikimedia URLs unchanged', () => {
      const nonWikimediaUrl = 'https://example.com/document.pdf';
      const result = ensureCommonsPageUrl(nonWikimediaUrl);

      expect(result).toBe(nonWikimediaUrl);
    });

    it('should handle empty or invalid URLs', () => {
      expect(ensureCommonsPageUrl('')).toBe('');
      expect(ensureCommonsPageUrl('   ')).toBe('');
    });
  });

  describe('Edge Cases', () => {
    it('should handle malformed Wikimedia URLs', () => {
      const malformedUrl = 'https://upload.wikimedia.org/invalid/path/file.pdf';
      const result = convertToCommonsPageUrl(malformedUrl);

      expect(result.isWikimediaUrl).toBe(true);
      expect(result.error).toBeDefined();
    });

    it('should handle URLs with query parameters', () => {
      const urlWithParams =
        'https://upload.wikimedia.org/wikipedia/commons/e/e1/Wikipedia_de_A_a_Z.pdf?version=1';
      const result = convertToCommonsPageUrl(urlWithParams);

      expect(result.commonsPageUrl).toBe(
        'https://commons.wikimedia.org/wiki/File:Wikipedia_de_A_a_Z.pdf?version=1'
      );
    });
  });

  describe('validateCapXDocumentUrl', () => {
    it('should accept valid Commons URLs', () => {
      const validUrl = 'https://commons.wikimedia.org/wiki/File:Wikipedia_de_A_a_Z.pdf';
      const result = validateCapXDocumentUrl(validUrl);

      expect(result.isValid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should accept valid upload URLs', () => {
      const validUrl = 'https://upload.wikimedia.org/wikipedia/commons/e/e1/Wikipedia_de_A_a_Z.pdf';
      const result = validateCapXDocumentUrl(validUrl);

      expect(result.isValid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should reject non-Wikimedia URLs', () => {
      const invalidUrl = 'https://example.com/document.pdf';
      const result = validateCapXDocumentUrl(invalidUrl);

      expect(result.isValid).toBe(false);
      expect(result.error).toBe('snackbar-edit-profile-organization-invalid-document-url');
    });

    it('should reject URLs longer than 200 characters', () => {
      const longUrl = 'https://commons.wikimedia.org/wiki/File:' + 'A'.repeat(200) + '.pdf';
      const result = validateCapXDocumentUrl(longUrl);

      expect(result.isValid).toBe(false);
      expect(result.error).toBe('snackbar-edit-profile-organization-document-url-too-long');
    });

    it('should reject URLs without protocol', () => {
      const invalidUrl = 'commons.wikimedia.org/wiki/File:Test.pdf';
      const result = validateCapXDocumentUrl(invalidUrl);

      expect(result.isValid).toBe(false);
      expect(result.error).toBe('snackbar-edit-profile-organization-document-url-invalid-format');
    });

    it('should reject empty URLs', () => {
      const result1 = validateCapXDocumentUrl('');
      const result2 = validateCapXDocumentUrl('   ');

      expect(result1.isValid).toBe(false);
      expect(result1.error).toBe('snackbar-edit-profile-organization-document-url-invalid-format');
      expect(result2.isValid).toBe(false);
      expect(result2.error).toBe('snackbar-edit-profile-organization-document-url-invalid-format');
    });

    it('should handle valid URLs of exactly 200 characters', () => {
      // Create a URL of exactly 200 characters
      const baseUrl = 'https://commons.wikimedia.org/wiki/File:';
      const filename = 'A'.repeat(200 - baseUrl.length - 4) + '.pdf'; // -4 for .pdf extension
      const exactUrl = baseUrl + filename;

      expect(exactUrl.length).toBe(200);

      const result = validateCapXDocumentUrl(exactUrl);
      expect(result.isValid).toBe(true);
    });
  });
});
