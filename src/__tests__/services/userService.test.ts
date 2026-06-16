import axios from 'axios';
import { userService } from '@/services/userService';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('userService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('fetchUserProfile', () => {
    it('should return null when token is empty', async () => {
      const result = await userService.fetchUserProfile(1, '');

      expect(result).toBeNull();
      expect(mockedAxios.get).not.toHaveBeenCalled();
    });

    it('should return null when userId is 0 (falsy)', async () => {
      const result = await userService.fetchUserProfile(0, 'test-token');

      expect(result).toBeNull();
      expect(mockedAxios.get).not.toHaveBeenCalled();
    });

    it('should GET /api/users/{userId} with auth header', async () => {
      const mockProfile = { id: 1, username: 'alice' };
      mockedAxios.get.mockResolvedValueOnce({ data: mockProfile });

      const result = await userService.fetchUserProfile(1, 'test-token');

      expect(mockedAxios.get).toHaveBeenCalledWith('/api/users/1', {
        headers: { Authorization: 'Token test-token' },
      });
      expect(result).toEqual(mockProfile);
    });

    it('should return user profile data on success', async () => {
      const mockProfile = { id: 42, username: 'bob', email: 'bob@example.com' };
      mockedAxios.get.mockResolvedValueOnce({ data: mockProfile });

      const result = await userService.fetchUserProfile(42, 'token');

      expect(result).toEqual(mockProfile);
    });

    it('should return null on network error', async () => {
      mockedAxios.get.mockRejectedValueOnce(new Error('Network error'));

      const result = await userService.fetchUserProfile(1, 'token');

      expect(result).toBeNull();
    });

    it('should return null on 404 not found', async () => {
      const error = Object.assign(new Error('Not Found'), {
        response: { status: 404 },
        isAxiosError: true,
      });
      mockedAxios.isAxiosError.mockReturnValue(true);
      mockedAxios.get.mockRejectedValueOnce(error);

      const result = await userService.fetchUserProfile(999, 'token');

      expect(result).toBeNull();
    });

    it('should return null on 401 unauthorized', async () => {
      mockedAxios.get.mockRejectedValueOnce({ response: { status: 401 } });

      const result = await userService.fetchUserProfile(1, 'bad-token');

      expect(result).toBeNull();
    });
  });

  describe('checkUserExists', () => {
    it('should return false when token is empty', async () => {
      const result = await userService.checkUserExists('alice', '');

      expect(result).toBe(false);
      expect(mockedAxios.get).not.toHaveBeenCalled();
    });

    it('should return false when username is empty', async () => {
      const result = await userService.checkUserExists('', 'test-token');

      expect(result).toBe(false);
      expect(mockedAxios.get).not.toHaveBeenCalled();
    });

    it('should return false when username is whitespace only', async () => {
      const result = await userService.checkUserExists('   ', 'test-token');

      expect(result).toBe(false);
      expect(mockedAxios.get).not.toHaveBeenCalled();
    });

    it('should GET /api/users/ with username param and return true when count > 0', async () => {
      mockedAxios.get.mockResolvedValueOnce({ data: { count: 1, results: [{ id: 1 }] } });

      const result = await userService.checkUserExists('alice', 'test-token');

      expect(mockedAxios.get).toHaveBeenCalledWith('/api/users/', {
        params: { username: 'alice' },
        headers: { Authorization: 'Token test-token' },
      });
      expect(result).toBe(true);
    });

    it('should return false when count is 0', async () => {
      mockedAxios.get.mockResolvedValueOnce({ data: { count: 0, results: [] } });

      const result = await userService.checkUserExists('nonexistent', 'token');

      expect(result).toBe(false);
    });

    it('should return false on error', async () => {
      mockedAxios.get.mockRejectedValueOnce(new Error('Network error'));

      const result = await userService.checkUserExists('alice', 'token');

      expect(result).toBe(false);
    });
  });

  describe('fetchAllUsers', () => {
    it('should return {count: 0, results: []} when token is empty', async () => {
      const result = await userService.fetchAllUsers({ token: '' });

      expect(result).toEqual({ count: 0, results: [] });
      expect(mockedAxios.get).not.toHaveBeenCalled();
    });

    it('should GET /api/users/ with auth header when no filters', async () => {
      const mockData = { count: 3, results: [{ id: 1 }, { id: 2 }, { id: 3 }] };
      mockedAxios.get.mockResolvedValueOnce({ data: mockData });

      const result = await userService.fetchAllUsers({ token: 'test-token' });

      expect(mockedAxios.get).toHaveBeenCalledWith(
        '/api/users/',
        expect.objectContaining({
          headers: { Authorization: 'Token test-token' },
        })
      );
      expect(result).toEqual(mockData);
    });

    it('should append territory filter params', async () => {
      mockedAxios.get.mockResolvedValueOnce({ data: { count: 0, results: [] } });

      await userService.fetchAllUsers({
        token: 'token',
        filters: { territory: ['NWE', 'LAC'] },
      });

      const params = mockedAxios.get.mock.calls[0][1]?.params as URLSearchParams;
      expect(params.getAll('territory')).toEqual(['NWE', 'LAC']);
    });

    it('should append language filter params', async () => {
      mockedAxios.get.mockResolvedValueOnce({ data: { count: 0, results: [] } });

      await userService.fetchAllUsers({
        token: 'token',
        filters: { language: ['en', 'pt'] },
      });

      const params = mockedAxios.get.mock.calls[0][1]?.params as URLSearchParams;
      expect(params.getAll('language')).toEqual(['en', 'pt']);
    });

    it('should append affiliations filter as affiliation param', async () => {
      mockedAxios.get.mockResolvedValueOnce({ data: { count: 0, results: [] } });

      await userService.fetchAllUsers({
        token: 'token',
        filters: { affiliations: ['WikimediaFoundation'] },
      });

      const params = mockedAxios.get.mock.calls[0][1]?.params as URLSearchParams;
      expect(params.getAll('affiliation')).toEqual(['WikimediaFoundation']);
    });

    it('should append skills_available filter params', async () => {
      mockedAxios.get.mockResolvedValueOnce({ data: { count: 0, results: [] } });

      await userService.fetchAllUsers({
        token: 'token',
        filters: { skills_available: [1, 2, 3] },
      });

      const params = mockedAxios.get.mock.calls[0][1]?.params as URLSearchParams;
      expect(params.getAll('skills_available')).toEqual(['1', '2', '3']);
    });

    it('should append skills_wanted filter params', async () => {
      mockedAxios.get.mockResolvedValueOnce({ data: { count: 0, results: [] } });

      await userService.fetchAllUsers({
        token: 'token',
        filters: { skills_wanted: [4, 5] },
      });

      const params = mockedAxios.get.mock.calls[0][1]?.params as URLSearchParams;
      expect(params.getAll('skills_wanted')).toEqual(['4', '5']);
    });

    it('should append skills_known filter params', async () => {
      mockedAxios.get.mockResolvedValueOnce({ data: { count: 0, results: [] } });

      await userService.fetchAllUsers({
        token: 'token',
        filters: { skills_known: [6] },
      });

      const params = mockedAxios.get.mock.calls[0][1]?.params as URLSearchParams;
      expect(params.getAll('skills_known')).toEqual(['6']);
    });

    it('should append has_skills_available=true when flag is set', async () => {
      mockedAxios.get.mockResolvedValueOnce({ data: { count: 0, results: [] } });

      await userService.fetchAllUsers({
        token: 'token',
        filters: { has_skills_available: true },
      });

      const params = mockedAxios.get.mock.calls[0][1]?.params as URLSearchParams;
      expect(params.get('has_skills_available')).toBe('true');
    });

    it('should NOT append has_skills_available when flag is false', async () => {
      mockedAxios.get.mockResolvedValueOnce({ data: { count: 0, results: [] } });

      await userService.fetchAllUsers({
        token: 'token',
        filters: { has_skills_available: false },
      });

      const params = mockedAxios.get.mock.calls[0][1]?.params as URLSearchParams;
      expect(params.get('has_skills_available')).toBeNull();
    });

    it('should append has_skills_wanted=true when flag is set', async () => {
      mockedAxios.get.mockResolvedValueOnce({ data: { count: 0, results: [] } });

      await userService.fetchAllUsers({
        token: 'token',
        filters: { has_skills_wanted: true },
      });

      const params = mockedAxios.get.mock.calls[0][1]?.params as URLSearchParams;
      expect(params.get('has_skills_wanted')).toBe('true');
    });

    it('should append has_skills_known=true when flag is set', async () => {
      mockedAxios.get.mockResolvedValueOnce({ data: { count: 0, results: [] } });

      await userService.fetchAllUsers({
        token: 'token',
        filters: { has_skills_known: true },
      });

      const params = mockedAxios.get.mock.calls[0][1]?.params as URLSearchParams;
      expect(params.get('has_skills_known')).toBe('true');
    });

    it('should append has_any_skills=true when flag is set', async () => {
      mockedAxios.get.mockResolvedValueOnce({ data: { count: 0, results: [] } });

      await userService.fetchAllUsers({
        token: 'token',
        filters: { has_any_skills: true },
      });

      const params = mockedAxios.get.mock.calls[0][1]?.params as URLSearchParams;
      expect(params.get('has_any_skills')).toBe('true');
    });

    it('should append limit and offset params', async () => {
      mockedAxios.get.mockResolvedValueOnce({ data: { count: 0, results: [] } });

      await userService.fetchAllUsers({ token: 'token', limit: 10, offset: 20 });

      const params = mockedAxios.get.mock.calls[0][1]?.params as URLSearchParams;
      expect(params.get('limit')).toBe('10');
      expect(params.get('offset')).toBe('20');
    });

    it('should append name and username filters', async () => {
      mockedAxios.get.mockResolvedValueOnce({ data: { count: 0, results: [] } });

      await userService.fetchAllUsers({
        token: 'token',
        filters: { name: 'Alice', username: 'alice123' },
      });

      const params = mockedAxios.get.mock.calls[0][1]?.params as URLSearchParams;
      expect(params.get('name')).toBe('Alice');
      expect(params.get('username')).toBe('alice123');
    });

    it('should append ordering param when provided', async () => {
      mockedAxios.get.mockResolvedValueOnce({ data: { count: 0, results: [] } });

      await userService.fetchAllUsers({ token: 'token', ordering: '-created_at' });

      const params = mockedAxios.get.mock.calls[0][1]?.params as URLSearchParams;
      expect(params.get('ordering')).toBe('-created_at');
    });

    it('should return {count: 0, results: []} on error', async () => {
      mockedAxios.get.mockRejectedValueOnce(new Error('Network error'));

      const result = await userService.fetchAllUsers({ token: 'token' });

      expect(result).toEqual({ count: 0, results: [] });
    });

    it('should return {count: 0, results: []} on 500 server error', async () => {
      mockedAxios.get.mockRejectedValueOnce({ response: { status: 500 } });

      const result = await userService.fetchAllUsers({ token: 'token' });

      expect(result).toEqual({ count: 0, results: [] });
    });
  });
});
