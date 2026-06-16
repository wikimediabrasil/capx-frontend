import { renderHook, act, waitFor } from '@testing-library/react';
import { useDocument } from '@/hooks/useDocument';

jest.mock('@/services/documentService', () => ({
  documentService: {
    fetchAllDocuments: jest.fn(),
    fetchSingleDocument: jest.fn(),
    createDocument: jest.fn(),
    deleteDocument: jest.fn(),
  },
}));

jest.mock('@/lib/utils/fetchWikimediaData', () => ({
  fetchWikimediaData: jest.fn(),
}));

jest.mock('@/lib/utils/validateDocumentUrl', () => ({
  validateCapXDocumentUrl: jest.fn(() => ({ isValid: true })),
  normalizeDocumentUrl: jest.fn((url: string) => url),
}));

jest.mock('@/lib/utils/convertWikimediaUrl', () => ({
  ensureCommonsPageUrl: jest.fn((url: string) => url),
}));

import { documentService } from '@/services/documentService';
import { fetchWikimediaData } from '@/lib/utils/fetchWikimediaData';
import { validateCapXDocumentUrl, normalizeDocumentUrl } from '@/lib/utils/validateDocumentUrl';
import { ensureCommonsPageUrl } from '@/lib/utils/convertWikimediaUrl';

const mockDocumentService = documentService as jest.Mocked<typeof documentService>;
const mockFetchWikimediaData = fetchWikimediaData as jest.MockedFunction<typeof fetchWikimediaData>;
const mockValidateCapXDocumentUrl = validateCapXDocumentUrl as jest.MockedFunction<
  typeof validateCapXDocumentUrl
>;

describe('useDocument', () => {
  const token = 'test-token';

  const mockDoc = {
    id: 1,
    url: 'https://commons.wikimedia.org/wiki/File:Test.jpg',
  };

  const mockWikimediaData = {
    id: 1,
    url: 'https://commons.wikimedia.org/wiki/File:Test.jpg',
    fullUrl: 'https://commons.wikimedia.org/wiki/File:Test.jpg',
    title: 'Test File',
    description: 'A test file',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockDocumentService.fetchAllDocuments.mockResolvedValue([]);
    mockDocumentService.fetchSingleDocument.mockResolvedValue(null);
    mockDocumentService.createDocument.mockResolvedValue({
      id: 1,
      url: 'https://commons.wikimedia.org/wiki/File:Test.jpg',
    });
    mockDocumentService.deleteDocument.mockResolvedValue(undefined);
    mockFetchWikimediaData.mockResolvedValue(mockWikimediaData as any);
    mockValidateCapXDocumentUrl.mockReturnValue({ isValid: true });
  });

  it('has correct initial state', () => {
    const { result } = renderHook(() => useDocument());

    expect(result.current.documents).toEqual([]);
    expect(result.current.document).toBeNull();
    expect(result.current.error).toBeNull();
  });

  it('fetches all documents on mount when token is provided and no id', async () => {
    mockDocumentService.fetchAllDocuments.mockResolvedValue([mockDoc] as any);

    const { result } = renderHook(() => useDocument(token));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(mockDocumentService.fetchAllDocuments).toHaveBeenCalledWith(token, undefined, undefined);
    expect(result.current.documents).toEqual([mockDoc]);
  });

  it('does not fetch when no token provided', async () => {
    renderHook(() => useDocument());

    await waitFor(() => {
      expect(mockDocumentService.fetchAllDocuments).not.toHaveBeenCalled();
    });
  });

  it('fetches single document when id is provided', async () => {
    mockDocumentService.fetchSingleDocument.mockResolvedValue(mockDoc as any);

    const { result } = renderHook(() => useDocument(token, 1));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(mockDocumentService.fetchSingleDocument).toHaveBeenCalledWith(token, 1);
  });

  it('sets error state when fetchAllDocuments fails', async () => {
    const mockError = new Error('Network error');
    mockDocumentService.fetchAllDocuments.mockRejectedValue(mockError);

    const { result } = renderHook(() => useDocument(token));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe(mockError);
  });

  it('sets error when fetchSingleDocument fails', async () => {
    mockDocumentService.fetchSingleDocument.mockRejectedValue(new Error('Not found'));

    const { result } = renderHook(() => useDocument(token, 1));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe('Failed to fetch document');
  });

  it('createDocument throws when no token', async () => {
    const { result } = renderHook(() => useDocument());

    await act(async () => {
      await result.current.createDocument({
        url: 'https://commons.wikimedia.org/wiki/File:Test.jpg',
      });
    });

    expect(mockDocumentService.createDocument).not.toHaveBeenCalled();
  });

  it('createDocument throws when URL is empty', async () => {
    const { result } = renderHook(() => useDocument(token));

    await expect(
      act(async () => {
        await result.current.createDocument({ url: '' });
      })
    ).rejects.toThrow('URL is required to create a document');
  });

  it('createDocument throws when URL validation fails', async () => {
    mockValidateCapXDocumentUrl.mockReturnValue({ isValid: false, error: 'Invalid URL' });

    const { result } = renderHook(() => useDocument(token));

    await expect(
      act(async () => {
        await result.current.createDocument({ url: 'not-a-valid-url' });
      })
    ).rejects.toThrow('Invalid URL');
  });

  it('createDocument creates a document successfully', async () => {
    const { result } = renderHook(() => useDocument(token));

    await act(async () => {
      await result.current.createDocument({
        url: 'https://commons.wikimedia.org/wiki/File:Test.jpg',
      });
    });

    expect(mockDocumentService.createDocument).toHaveBeenCalled();
  });

  it('deleteDocument removes document and sets document to null', async () => {
    const { result } = renderHook(() => useDocument(token));

    await act(async () => {
      await result.current.deleteDocument(1);
    });

    expect(mockDocumentService.deleteDocument).toHaveBeenCalledWith(token, 1);
    expect(result.current.document).toBeNull();
  });

  it('deleteDocument does nothing when no token', async () => {
    const { result } = renderHook(() => useDocument());

    await act(async () => {
      await result.current.deleteDocument(1);
    });

    expect(mockDocumentService.deleteDocument).not.toHaveBeenCalled();
  });

  it('fetchAllDocuments can be called manually', async () => {
    mockDocumentService.fetchAllDocuments.mockResolvedValue([mockDoc] as any);

    const { result } = renderHook(() => useDocument(token));

    await act(async () => {
      await result.current.fetchAllDocuments();
    });

    expect(mockDocumentService.fetchAllDocuments).toHaveBeenCalled();
  });
});
