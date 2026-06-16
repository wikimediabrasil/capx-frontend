import axios from 'axios';
import { documentService } from '@/services/documentService';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('documentService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('fetchAllDocuments', () => {
    it('should fetch documents with token', async () => {
      const mockData = [{ id: 1, name: 'Doc' }];
      mockedAxios.get.mockResolvedValueOnce({ data: mockData });

      const result = await documentService.fetchAllDocuments('test-token', 10, 0);
      expect(mockedAxios.get).toHaveBeenCalledWith('/api/documents', {
        headers: { Authorization: 'Token test-token' },
        params: { limit: 10, offset: 0 },
      });
      expect(result).toEqual(mockData);
    });
  });

  describe('fetchSingleDocument', () => {
    it('should fetch a single document', async () => {
      const mockData = { id: 1, name: 'Doc' };
      mockedAxios.get.mockResolvedValueOnce({ data: mockData });

      const result = await documentService.fetchSingleDocument('test-token', 1);
      expect(mockedAxios.get).toHaveBeenCalledWith('/api/documents/1', expect.any(Object));
      expect(result).toEqual(mockData);
    });
  });

  describe('createDocument', () => {
    it('should create a document', async () => {
      const mockData = { id: 1, name: 'New Doc' };
      mockedAxios.post.mockResolvedValueOnce({ data: mockData });

      const result = await documentService.createDocument('test-token', { name: 'New Doc' } as any);
      expect(mockedAxios.post).toHaveBeenCalledWith('/api/documents', { name: 'New Doc' }, expect.any(Object));
      expect(result).toEqual(mockData);
    });

    it('should throw on error', async () => {
      mockedAxios.post.mockRejectedValueOnce({ response: { data: 'error' } });
      await expect(documentService.createDocument('token', {} as any)).rejects.toBeTruthy();
    });
  });

  describe('deleteDocument', () => {
    it('should delete a document', async () => {
      mockedAxios.delete.mockResolvedValueOnce({});

      await documentService.deleteDocument('test-token', 1);
      expect(mockedAxios.delete).toHaveBeenCalledWith('/api/documents/1', expect.any(Object));
    });
  });
});
