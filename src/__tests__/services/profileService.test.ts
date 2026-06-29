import axios from 'axios';
import { profileService } from '@/services/profileService';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('profileService', () => {
  const token = 'test-token';
  const queryData = { headers: { Authorization: `Token ${token}` } };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('fetchUserProfile', () => {
    it('should GET /api/profile with params and headers', async () => {
      const mockData = [{ id: 1, username: 'alice' }];
      mockedAxios.get.mockResolvedValueOnce({ data: mockData });

      const result = await profileService.fetchUserProfile({
        params: { userId: 1 },
        headers: { Authorization: `Token ${token}` },
      });

      expect(mockedAxios.get).toHaveBeenCalledWith('/api/profile', {
        params: { userId: 1 },
        headers: { Authorization: `Token ${token}` },
      });
      expect(result).toEqual(mockData);
    });

    it('should call GET /api/profile with no params when omitted', async () => {
      mockedAxios.get.mockResolvedValueOnce({ data: [] });

      await profileService.fetchUserProfile({ headers: { Authorization: `Token ${token}` } });

      expect(mockedAxios.get).toHaveBeenCalledWith('/api/profile', {
        params: undefined,
        headers: { Authorization: `Token ${token}` },
      });
    });

    it('should throw on error', async () => {
      mockedAxios.get.mockRejectedValueOnce(new Error('Unauthorized'));

      await expect(profileService.fetchUserProfile(queryData)).rejects.toThrow('Unauthorized');
    });
  });

  describe('fetchProfileData', () => {
    it('should call all 6 endpoints in parallel', async () => {
      mockedAxios.get
        .mockResolvedValueOnce({ data: { id: 1 } }) // /api/profile
        .mockResolvedValueOnce({ data: ['territory1'] }) // /api/list/territory
        .mockResolvedValueOnce({ data: ['lang1'] }) // /api/list/language
        .mockResolvedValueOnce({ data: ['affil1'] }) // /api/list/affiliation
        .mockResolvedValueOnce({ data: ['proj1'] }) // /api/list/wikimedia_project
        .mockResolvedValueOnce({ data: ['skill1'] }); // /api/capacity

      const result = await profileService.fetchProfileData(queryData);

      expect(mockedAxios.get).toHaveBeenCalledTimes(6);
      expect(mockedAxios.get).toHaveBeenCalledWith('/api/profile', expect.any(Object));
      expect(mockedAxios.get).toHaveBeenCalledWith('/api/list/territory', expect.any(Object));
      expect(mockedAxios.get).toHaveBeenCalledWith('/api/list/language', expect.any(Object));
      expect(mockedAxios.get).toHaveBeenCalledWith('/api/list/affiliation', expect.any(Object));
      expect(mockedAxios.get).toHaveBeenCalledWith(
        '/api/list/wikimedia_project',
        expect.any(Object)
      );
      expect(mockedAxios.get).toHaveBeenCalledWith('/api/capacity', expect.any(Object));

      expect(result).toEqual({
        userData: { id: 1 },
        territoryData: ['territory1'],
        languageData: ['lang1'],
        affiliationData: ['affil1'],
        wikiProjectData: ['proj1'],
        skillData: ['skill1'],
      });
    });

    it('should throw if any of the parallel requests fail', async () => {
      mockedAxios.get
        .mockResolvedValueOnce({ data: {} })
        .mockRejectedValueOnce(new Error('Territory fetch failed'));

      await expect(profileService.fetchProfileData(queryData)).rejects.toThrow(
        'Territory fetch failed'
      );
    });
  });

  describe('updateProfile', () => {
    const userId = 42;

    it('should PUT /api/profile/{userId} with language stripped of name field', async () => {
      mockedAxios.put.mockResolvedValueOnce({ data: { id: userId } });

      await profileService.updateProfile(
        userId,
        {
          language: [
            { id: 1, proficiency: '5', name: 'English' },
            { id: 25, proficiency: '3', name: 'Portuguese' },
          ],
        },
        queryData
      );

      const sentPayload = mockedAxios.put.mock.calls[0][1] as any;
      expect(sentPayload.language).toEqual([
        { id: 1, proficiency: '5' },
        { id: 25, proficiency: '3' },
      ]);
      for (const lang of sentPayload.language) {
        expect(lang).not.toHaveProperty('name');
      }
    });

    it('should set user.id to userId in the payload', async () => {
      mockedAxios.put.mockResolvedValueOnce({ data: {} });

      await profileService.updateProfile(userId, { language: [] }, queryData);

      const sentPayload = mockedAxios.put.mock.calls[0][1] as any;
      expect(sentPayload.user).toEqual({ id: userId });
    });

    it('should call PUT /api/profile/{userId}', async () => {
      mockedAxios.put.mockResolvedValueOnce({ data: { id: userId } });

      await profileService.updateProfile(userId, { language: [] }, queryData);

      expect(mockedAxios.put).toHaveBeenCalledWith(`/api/profile/${userId}`, expect.any(Object), {
        headers: queryData.headers,
      });
    });

    it('should handle non-array language field gracefully', async () => {
      mockedAxios.put.mockResolvedValueOnce({ data: {} });

      await profileService.updateProfile(userId, { language: null }, queryData);

      const sentPayload = mockedAxios.put.mock.calls[0][1] as any;
      expect(sentPayload.language).toBeNull();
    });

    it('should return response data on success', async () => {
      const mockResult = { id: userId, username: 'alice' };
      mockedAxios.put.mockResolvedValueOnce({ data: mockResult });

      const result = await profileService.updateProfile(userId, { language: [] }, queryData);

      expect(result).toEqual(mockResult);
    });

    it('should throw on error', async () => {
      mockedAxios.put.mockRejectedValueOnce(new Error('Update failed'));

      await expect(
        profileService.updateProfile(userId, { language: [] }, queryData)
      ).rejects.toThrow('Update failed');
    });
  });

  describe('deleteProfile', () => {
    it('should DELETE /api/profile with auth header and user id in body', async () => {
      mockedAxios.delete.mockResolvedValueOnce({ data: { success: true } });

      const result = await profileService.deleteProfile('42', token);

      expect(mockedAxios.delete).toHaveBeenCalledWith('/api/profile', {
        headers: { Authorization: `Token ${token}` },
        data: { user: { id: '42' } },
      });
      expect(result).toEqual({ success: true });
    });

    it('should throw on error', async () => {
      mockedAxios.delete.mockRejectedValueOnce(new Error('Delete failed'));

      await expect(profileService.deleteProfile('1', token)).rejects.toThrow('Delete failed');
    });

    it('should throw on 401 unauthorized', async () => {
      const error = { response: { status: 401, data: { detail: 'Unauthorized' } } };
      mockedAxios.delete.mockRejectedValueOnce(error);

      await expect(profileService.deleteProfile('1', 'bad-token')).rejects.toEqual(error);
    });
  });
});
