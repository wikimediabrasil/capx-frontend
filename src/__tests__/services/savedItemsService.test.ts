import axios from 'axios';
import { savedItemService } from '@/services/savedItemsService';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('savedItemService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getSavedItems', () => {
    it('should return {count: 0, results: []} when token is empty', async () => {
      const result = await savedItemService.getSavedItems('', {});

      expect(result).toEqual({ count: 0, results: [] });
      expect(mockedAxios.get).not.toHaveBeenCalled();
    });

    it('should GET /api/saved_item/ with auth header on valid token', async () => {
      const mockData = { count: 2, results: [{ id: 1 }, { id: 2 }] };
      mockedAxios.get.mockResolvedValueOnce({ data: mockData });

      const result = await savedItemService.getSavedItems('test-token', {});

      expect(mockedAxios.get).toHaveBeenCalledWith(
        '/api/saved_item/',
        expect.objectContaining({
          headers: { Authorization: 'Token test-token' },
        })
      );
      expect(result).toEqual(mockData);
    });

    it('should append limit param when provided', async () => {
      mockedAxios.get.mockResolvedValueOnce({ data: { count: 0, results: [] } });

      await savedItemService.getSavedItems('token', { limit: 10 });

      const params = mockedAxios.get.mock.calls[0][1]?.params as URLSearchParams;
      expect(params.get('limit')).toBe('10');
    });

    it('should append offset param when provided', async () => {
      mockedAxios.get.mockResolvedValueOnce({ data: { count: 0, results: [] } });

      await savedItemService.getSavedItems('token', { offset: 5 });

      const params = mockedAxios.get.mock.calls[0][1]?.params as URLSearchParams;
      expect(params.get('offset')).toBe('5');
    });

    it('should not append limit or offset when not provided', async () => {
      mockedAxios.get.mockResolvedValueOnce({ data: { count: 0, results: [] } });

      await savedItemService.getSavedItems('token', {});

      const params = mockedAxios.get.mock.calls[0][1]?.params as URLSearchParams;
      expect(params.get('limit')).toBeNull();
      expect(params.get('offset')).toBeNull();
    });

    it('should return {count: 0, results: []} on error', async () => {
      mockedAxios.get.mockRejectedValueOnce(new Error('Server error'));

      const result = await savedItemService.getSavedItems('test-token', {});

      expect(result).toEqual({ count: 0, results: [] });
    });

    it('should return {count: 0, results: []} on 401 error', async () => {
      mockedAxios.get.mockRejectedValueOnce({ response: { status: 401 } });

      const result = await savedItemService.getSavedItems('bad-token', {});

      expect(result).toEqual({ count: 0, results: [] });
    });
  });

  describe('deleteSavedItem', () => {
    it('should return false when token is empty', async () => {
      const result = await savedItemService.deleteSavedItem('', 1);

      expect(result).toBe(false);
      expect(mockedAxios.delete).not.toHaveBeenCalled();
    });

    it('should return false when itemId is 0 (falsy)', async () => {
      const result = await savedItemService.deleteSavedItem('test-token', 0);

      expect(result).toBe(false);
      expect(mockedAxios.delete).not.toHaveBeenCalled();
    });

    it('should DELETE /api/saved_item/{id}/ with auth header', async () => {
      mockedAxios.delete.mockResolvedValueOnce({ data: null });

      const result = await savedItemService.deleteSavedItem('test-token', 42);

      expect(mockedAxios.delete).toHaveBeenCalledWith('/api/saved_item/42/', {
        headers: { Authorization: 'Token test-token' },
      });
      expect(result).toBe(true);
    });

    it('should return true on successful deletion', async () => {
      mockedAxios.delete.mockResolvedValueOnce({ data: null });

      const result = await savedItemService.deleteSavedItem('test-token', 10);

      expect(result).toBe(true);
    });

    it('should return false on error', async () => {
      mockedAxios.delete.mockRejectedValueOnce(new Error('Server error'));

      const result = await savedItemService.deleteSavedItem('test-token', 5);

      expect(result).toBe(false);
    });

    it('should return false on 404 error', async () => {
      mockedAxios.delete.mockRejectedValueOnce({ response: { status: 404 } });

      const result = await savedItemService.deleteSavedItem('test-token', 999);

      expect(result).toBe(false);
    });
  });

  describe('createSavedItem', () => {
    const item = { relation: 'user', entity: 'user', entity_id: 7 };

    it('should return null when token is empty', async () => {
      const result = await savedItemService.createSavedItem('', item);

      expect(result).toBeNull();
      expect(mockedAxios.post).not.toHaveBeenCalled();
    });

    it('should return null when entity_id is 0 (falsy)', async () => {
      const result = await savedItemService.createSavedItem('test-token', {
        ...item,
        entity_id: 0,
      });

      expect(result).toBeNull();
      expect(mockedAxios.post).not.toHaveBeenCalled();
    });

    it('should POST /api/saved_item/ with item data and auth header', async () => {
      const mockCreated = { id: 100, ...item };
      mockedAxios.post.mockResolvedValueOnce({ data: mockCreated });

      const result = await savedItemService.createSavedItem('test-token', item);

      expect(mockedAxios.post).toHaveBeenCalledWith('/api/saved_item/', item, {
        headers: { Authorization: 'Token test-token' },
      });
      expect(result).toEqual(mockCreated);
    });

    it('should return the created saved item on success', async () => {
      const mockCreated = { id: 55, relation: 'user', entity: 'user', entity_id: 7 };
      mockedAxios.post.mockResolvedValueOnce({ data: mockCreated });

      const result = await savedItemService.createSavedItem('test-token', item);

      expect(result).toEqual(mockCreated);
    });

    it('should return null on error', async () => {
      mockedAxios.post.mockRejectedValueOnce(new Error('Server error'));

      const result = await savedItemService.createSavedItem('test-token', item);

      expect(result).toBeNull();
    });

    it('should return null on 400 error', async () => {
      mockedAxios.post.mockRejectedValueOnce({ response: { status: 400 } });

      const result = await savedItemService.createSavedItem('test-token', item);

      expect(result).toBeNull();
    });
  });
});
