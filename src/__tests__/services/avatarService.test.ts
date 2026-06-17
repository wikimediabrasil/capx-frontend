import { avatarService } from '@/services/avatarService';
import axios from 'axios';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('avatarService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('fetchAvatars', () => {
    it('should GET /api/avatar and return filtered avatars', async () => {
      const mockAvatars = [
        { id: 0, url: 'avatar0.png' },
        { id: 1, url: 'avatar1.png' },
        { id: 2, url: 'avatar2.png' },
      ];
      mockedAxios.get.mockResolvedValueOnce({ data: mockAvatars });

      const result = await avatarService.fetchAvatars();

      expect(mockedAxios.get).toHaveBeenCalledWith('/api/avatar', {
        headers: { 'Content-Type': 'application/json' },
        withCredentials: true,
        params: { limit: undefined, offset: undefined },
      });
      expect(result).toEqual([
        { id: 1, url: 'avatar1.png' },
        { id: 2, url: 'avatar2.png' },
      ]);
    });

    it('should filter out avatar with id=0', async () => {
      const mockAvatars = [
        { id: 0, url: 'reserved.png' },
        { id: 5, url: 'avatar5.png' },
      ];
      mockedAxios.get.mockResolvedValueOnce({ data: mockAvatars });

      const result = await avatarService.fetchAvatars();

      expect(result.some((a: any) => a.id === 0)).toBe(false);
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe(5);
    });

    it('should forward limit and offset params from config', async () => {
      mockedAxios.get.mockResolvedValueOnce({ data: [] });

      await avatarService.fetchAvatars({ params: { limit: 10, offset: 20 } });

      expect(mockedAxios.get).toHaveBeenCalledWith(
        '/api/avatar',
        expect.objectContaining({
          params: { limit: 10, offset: 20 },
        })
      );
    });

    it('should merge extra headers from config', async () => {
      mockedAxios.get.mockResolvedValueOnce({ data: [] });

      await avatarService.fetchAvatars({
        headers: { Authorization: 'Token abc' },
      });

      expect(mockedAxios.get).toHaveBeenCalledWith(
        '/api/avatar',
        expect.objectContaining({
          headers: {
            Authorization: 'Token abc',
            'Content-Type': 'application/json',
          },
        })
      );
    });

    it('should return empty array when all avatars have id=0', async () => {
      mockedAxios.get.mockResolvedValueOnce({ data: [{ id: 0, url: 'reserved.png' }] });

      const result = await avatarService.fetchAvatars();

      expect(result).toEqual([]);
    });

    it('should return empty array when response data is empty', async () => {
      mockedAxios.get.mockResolvedValueOnce({ data: [] });

      const result = await avatarService.fetchAvatars();

      expect(result).toEqual([]);
    });

    it('should propagate axios errors', async () => {
      mockedAxios.get.mockRejectedValueOnce(new Error('Network error'));

      await expect(avatarService.fetchAvatars()).rejects.toThrow('Network error');
    });
  });

  describe('fetchAvatarById', () => {
    it('should GET /api/avatar/{id} and return the avatar', async () => {
      const mockAvatar = { id: 3, url: 'avatar3.png' };
      mockedAxios.get.mockResolvedValueOnce({ data: mockAvatar });

      const result = await avatarService.fetchAvatarById(3);

      expect(mockedAxios.get).toHaveBeenCalledWith('/api/avatar/3', {
        headers: { 'Content-Type': 'application/json' },
        withCredentials: true,
      });
      expect(result).toEqual(mockAvatar);
    });

    it('should merge config headers', async () => {
      const mockAvatar = { id: 7, url: 'avatar7.png' };
      mockedAxios.get.mockResolvedValueOnce({ data: mockAvatar });

      await avatarService.fetchAvatarById(7, {
        headers: { Authorization: 'Token xyz' },
      });

      expect(mockedAxios.get).toHaveBeenCalledWith(
        '/api/avatar/7',
        expect.objectContaining({
          headers: {
            Authorization: 'Token xyz',
            'Content-Type': 'application/json',
          },
        })
      );
    });

    it('should propagate axios errors', async () => {
      mockedAxios.get.mockRejectedValueOnce(new Error('Not found'));

      await expect(avatarService.fetchAvatarById(999)).rejects.toThrow('Not found');
    });

    it('should not filter avatar with id=0 when fetching by id', async () => {
      const mockAvatar = { id: 0, url: 'reserved.png' };
      mockedAxios.get.mockResolvedValueOnce({ data: mockAvatar });

      const result = await avatarService.fetchAvatarById(0);

      expect(result).toEqual(mockAvatar);
    });
  });
});
