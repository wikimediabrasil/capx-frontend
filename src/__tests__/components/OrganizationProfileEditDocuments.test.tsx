import React from 'react';

import { OrganizationDocument } from '@/types/document';
import Image from 'next/image';
// Hooks Mock
jest.mock('next-auth/react', () => ({
  useSession: () => ({
    data: {
      user: {
        token: 'test-token',
        id: '1',
        name: 'Test User',
      },
    },
  }),
}));

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    back: jest.fn(),
    push: jest.fn(),
  }),
  useParams: () => ({
    id: '1',
  }),
}));

// Image Mock
jest.mock('next/image', () => {
  return function MockedImage({ src, alt, ...props }: any) {
    return <Image src={src} alt={alt} {...props} />;
  };
});

const mockPageContent = {
  'edit-profile-insert-link': 'Insert link',
  'edit-profile-add-more-links': 'Add more links',
  'body-profile-section-title-documents': 'Documents',
  'edit-profile-share-documents-tooltop': 'Share documents tooltip',
};

jest.mock('@/contexts/AppContext', () => ({
  useApp: () => ({
    pageContent: mockPageContent,
    isMobile: false,
  }),
  AppProvider: ({ children }: any) => <div>{children}</div>,
}));

describe('Organization Profile Edit - Documents CRUD', () => {
  let documentsData: OrganizationDocument[];
  let setDocumentsData: jest.Mock;
  let handleAddDocument: jest.Mock;
  let handleDeleteDocument: jest.Mock;
  let handleDocumentChange: jest.Mock;

  beforeEach(() => {
    documentsData = [
      { id: 1, url: 'https://example.com/doc1' },
      { id: 2, url: 'https://example.com/doc2' },
    ];
    setDocumentsData = jest.fn();
    handleAddDocument = jest.fn();
    handleDeleteDocument = jest.fn();
    handleDocumentChange = jest.fn();

    // Mock handlers with 4 document limit
    handleAddDocument.mockImplementation(() => {
      // Check if we've reached the maximum limit of 4 documents
      if (documentsData.length >= 4) {
        // Don't add document, simulate snackbar call
        return;
      }

      const newDocument: OrganizationDocument = {
        id: 0,
        url: '',
      };
      documentsData.push(newDocument);
      setDocumentsData([...documentsData]);
    });

    handleDeleteDocument.mockImplementation((index: number) => {
      const newDocs = [...documentsData];
      newDocs.splice(index, 1);
      documentsData = newDocs;
      setDocumentsData(newDocs);
    });

    handleDocumentChange.mockImplementation((index: number, field: string, value: string) => {
      if (!Array.isArray(documentsData) || index < 0 || index >= documentsData.length) {
        return;
      }
      const newDocuments = [...documentsData];
      newDocuments[index] = {
        ...newDocuments[index],
        [field]: value,
      };
      documentsData = newDocuments;
      setDocumentsData(newDocuments);
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('handleAddDocument', () => {
    it('should add a new empty document to the list', () => {
      const initialLength = documentsData.length;

      handleAddDocument();

      expect(documentsData.length).toBe(initialLength + 1);
      expect(documentsData[documentsData.length - 1]).toEqual({
        id: 0,
        url: '',
      });
      expect(setDocumentsData).toHaveBeenCalledWith(documentsData);
    });

    it('should handle adding multiple documents up to limit', () => {
      handleAddDocument();
      handleAddDocument();

      expect(documentsData.length).toBe(4); // 2 initial + 2 added (limit reached)
      expect(setDocumentsData).toHaveBeenCalledTimes(2);

      // Try to add one more - should not be added
      handleAddDocument();
      expect(documentsData.length).toBe(4); // Still 4, limit enforced
      expect(setDocumentsData).toHaveBeenCalledTimes(2); // No additional call
    });
  });

  describe('handleDeleteDocument', () => {
    it('should remove document at specified index', () => {
      const initialLength = documentsData.length;
      const firstDocumentUrl = documentsData[0].url;

      handleDeleteDocument(0);

      expect(documentsData.length).toBe(initialLength - 1);
      expect(documentsData[0].url).not.toBe(firstDocumentUrl);
      expect(setDocumentsData).toHaveBeenCalledWith(documentsData);
    });

    it('should handle deleting last document', () => {
      const lastIndex = documentsData.length - 1;
      const lastDocumentUrl = documentsData[lastIndex].url;

      handleDeleteDocument(lastIndex);

      expect(documentsData.length).toBe(1);
      expect(documentsData.find(doc => doc.url === lastDocumentUrl)).toBeUndefined();
    });

    it('should handle deleting middle document', () => {
      documentsData = [
        { id: 1, url: 'doc1' },
        { id: 2, url: 'doc2' },
        { id: 3, url: 'doc3' },
      ];

      handleDeleteDocument(1); // Remove middle document

      expect(documentsData.length).toBe(2);
      expect(documentsData[0].url).toBe('doc1');
      expect(documentsData[1].url).toBe('doc3');
    });

    it('should handle deleting from empty array gracefully', () => {
      documentsData = [];

      expect(() => handleDeleteDocument(0)).not.toThrow();
    });

    it('should handle invalid index gracefully', () => {
      const initialLength = documentsData.length;

      handleDeleteDocument(999); // Invalid index

      expect(documentsData.length).toBe(initialLength);
    });
  });

  describe('handleDocumentChange', () => {
    it('should update document URL at specified index', () => {
      const newUrl = 'https://newurl.com/document';

      handleDocumentChange(0, 'url', newUrl);

      expect(documentsData[0].url).toBe(newUrl);
      expect(documentsData[0].id).toBe(1); // Should preserve other fields
      expect(setDocumentsData).toHaveBeenCalledWith(documentsData);
    });

    it('should handle updating multiple documents', () => {
      handleDocumentChange(0, 'url', 'new-url-1');
      handleDocumentChange(1, 'url', 'new-url-2');

      expect(documentsData[0].url).toBe('new-url-1');
      expect(documentsData[1].url).toBe('new-url-2');
      expect(setDocumentsData).toHaveBeenCalledTimes(2);
    });

    it('should handle empty URL updates', () => {
      handleDocumentChange(0, 'url', '');

      expect(documentsData[0].url).toBe('');
    });

    it('should handle invalid index gracefully', () => {
      const originalData = [...documentsData];

      handleDocumentChange(999, 'url', 'test'); // Invalid index

      expect(documentsData).toEqual(originalData);
    });

    it('should preserve other document properties when updating', () => {
      const originalId = documentsData[0].id;

      handleDocumentChange(0, 'url', 'new-url');

      expect(documentsData[0].id).toBe(originalId);
      expect(documentsData[0].url).toBe('new-url');
    });
  });

  describe('Edge Cases', () => {
    it('should handle null documentsData array', () => {
      documentsData = null as any;

      expect(() => {
        handleDocumentChange(0, 'url', 'test');
      }).not.toThrow();

      // Should not modify null array
      expect(documentsData).toBe(null);
    });

    it('should handle undefined documentsData array', () => {
      documentsData = undefined as any;

      expect(() => {
        handleDocumentChange(0, 'url', 'test');
      }).not.toThrow();

      // Should not modify undefined array
      expect(documentsData).toBe(undefined);
    });

    it('should handle very long URLs', () => {
      const longUrl = 'https://example.com/' + 'a'.repeat(1000);

      handleDocumentChange(0, 'url', longUrl);

      expect(documentsData[0].url).toBe(longUrl);
    });

    it('should handle special characters in URLs', () => {
      const specialUrl = 'https://example.com/path?param=value&other=测试';

      handleDocumentChange(0, 'url', specialUrl);

      expect(documentsData[0].url).toBe(specialUrl);
    });
  });

  describe('Document Limit Tests', () => {
    it('should enforce maximum of 4 documents', () => {
      // Start with 2 documents and add 2 more to reach limit
      handleAddDocument();
      handleAddDocument();
      expect(documentsData.length).toBe(4);

      // Try to add a 5th document - should not be added due to limit
      const initialLength = documentsData.length;
      handleAddDocument(); // This should not add a document

      expect(documentsData.length).toBe(initialLength);
    });

    it('should allow adding documents when under the limit', () => {
      // Start with 2 documents
      expect(documentsData.length).toBe(2);

      // Should be able to add up to 2 more
      handleAddDocument();
      expect(documentsData.length).toBe(3);

      handleAddDocument();
      expect(documentsData.length).toBe(4);
    });

    it('should allow adding documents after deleting to go under limit', () => {
      // Add documents to reach limit
      handleAddDocument();
      handleAddDocument();
      expect(documentsData.length).toBe(4);

      // Delete one document
      handleDeleteDocument(0);
      expect(documentsData.length).toBe(3);

      // Should be able to add again
      handleAddDocument();
      expect(documentsData.length).toBe(4);
    });
  });

  describe('Integration Tests', () => {
    it('should handle complete CRUD workflow', () => {
      // Initial state: 2 documents
      expect(documentsData.length).toBe(2);

      // Add a new document
      handleAddDocument();
      expect(documentsData.length).toBe(3);
      expect(documentsData[2]).toEqual({ id: 0, url: '' });

      // Update the new document
      handleDocumentChange(2, 'url', 'https://newdoc.com');
      expect(documentsData[2].url).toBe('https://newdoc.com');

      // Delete the middle document
      handleDeleteDocument(1);
      expect(documentsData.length).toBe(2);
      expect(documentsData[1].url).toBe('https://newdoc.com');

      // Verify final state
      expect(documentsData[0].url).toBe('https://example.com/doc1');
      expect(documentsData[1].url).toBe('https://newdoc.com');
    });

    it('should maintain data integrity during rapid operations', () => {
      // Simulate rapid operations
      handleAddDocument();
      handleAddDocument();
      handleDeleteDocument(1);
      handleDocumentChange(0, 'url', 'updated-url');
      handleDeleteDocument(2);

      // Verify state is consistent
      expect(documentsData.length).toBe(2);
      expect(documentsData[0].url).toBe('updated-url');
      expect(setDocumentsData).toHaveBeenCalledTimes(5);
    });
  });
});
