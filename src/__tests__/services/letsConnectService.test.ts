import axios from 'axios';
import { LetsConnectService } from '@/services/letsConnectService';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('LetsConnectService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('submitLetsConnectForm', () => {
    const token = 'test-token';
    const baseLetsConnect = {
      full_name: 'Alice Smith',
      email: 'alice@example.com',
      role: 'mentor',
      gender: 'female',
      age: 30,
    };

    it('should POST to /api/lets_connect/profile with correct payload', async () => {
      const mockResponse = { data: { id: 1, ...baseLetsConnect } };
      mockedAxios.post.mockResolvedValueOnce(mockResponse);

      const result = await LetsConnectService.submitLetsConnectForm({
        letsConnect: { ...baseLetsConnect, area: 'education' },
        token,
      });

      expect(mockedAxios.post).toHaveBeenCalledWith(
        '/api/lets_connect/profile',
        {
          full_name: 'Alice Smith',
          email: 'alice@example.com',
          role: 'mentor',
          area: 'education',
          gender: 'female',
          age: 30,
        },
        {
          headers: {
            Authorization: 'Token test-token',
            'Content-Type': 'application/json',
          },
        }
      );
      expect(result).toEqual(mockResponse.data);
    });

    it('should join area array into a comma-separated string', async () => {
      mockedAxios.post.mockResolvedValueOnce({ data: {} });

      await LetsConnectService.submitLetsConnectForm({
        letsConnect: { ...baseLetsConnect, area: ['education', 'technology', 'health'] },
        token,
      });

      const sentBody = mockedAxios.post.mock.calls[0][1] as any;
      expect(sentBody.area).toBe('education, technology, health');
    });

    it('should pass area as-is when it is already a string', async () => {
      mockedAxios.post.mockResolvedValueOnce({ data: {} });

      await LetsConnectService.submitLetsConnectForm({
        letsConnect: { ...baseLetsConnect, area: 'science' },
        token,
      });

      const sentBody = mockedAxios.post.mock.calls[0][1] as any;
      expect(sentBody.area).toBe('science');
    });

    it('should handle missing optional fields gracefully', async () => {
      mockedAxios.post.mockResolvedValueOnce({ data: {} });

      await LetsConnectService.submitLetsConnectForm({
        letsConnect: {},
        token,
      });

      const sentBody = mockedAxios.post.mock.calls[0][1] as any;
      expect(sentBody.full_name).toBeUndefined();
      expect(sentBody.email).toBeUndefined();
    });

    it('should throw when the API call fails', async () => {
      mockedAxios.post.mockRejectedValueOnce(new Error('Server error'));

      await expect(
        LetsConnectService.submitLetsConnectForm({ letsConnect: baseLetsConnect, token })
      ).rejects.toThrow('Server error');
    });

    it('should throw on 400 validation error', async () => {
      const error = { response: { status: 400, data: { email: ['Enter a valid email address.'] } } };
      mockedAxios.post.mockRejectedValueOnce(error);

      await expect(
        LetsConnectService.submitLetsConnectForm({ letsConnect: baseLetsConnect, token })
      ).rejects.toEqual(error);
    });
  });

  describe('getLetsConnectProfile', () => {
    it('should return null immediately when no username is provided', async () => {
      const result = await LetsConnectService.getLetsConnectProfile();

      expect(result).toBeNull();
      expect(mockedAxios.get).not.toHaveBeenCalled();
    });

    it('should return null when username is empty string', async () => {
      const result = await LetsConnectService.getLetsConnectProfile('');

      expect(result).toBeNull();
      expect(mockedAxios.get).not.toHaveBeenCalled();
    });

    it('should GET /api/lets_connect/profile with username param', async () => {
      const mockProfile = { id: 1, full_name: 'Alice', username: 'alice' };
      mockedAxios.get.mockResolvedValueOnce({ data: mockProfile });

      const result = await LetsConnectService.getLetsConnectProfile('alice');

      expect(mockedAxios.get).toHaveBeenCalledWith('/api/lets_connect/profile', {
        params: { username: 'alice' },
        headers: { 'Content-Type': 'application/json' },
      });
      expect(result).toEqual(mockProfile);
    });

    it('should return profile data on success', async () => {
      const mockProfile = { id: 42, full_name: 'Bob', email: 'bob@example.com' };
      mockedAxios.get.mockResolvedValueOnce({ data: mockProfile });

      const result = await LetsConnectService.getLetsConnectProfile('bob');

      expect(result).toEqual(mockProfile);
    });

    it('should throw when the API call fails', async () => {
      mockedAxios.get.mockRejectedValueOnce(new Error('Not found'));

      await expect(LetsConnectService.getLetsConnectProfile('alice')).rejects.toThrow('Not found');
    });

    it('should throw on 404', async () => {
      const error = { response: { status: 404, data: { detail: 'Not found.' } } };
      mockedAxios.get.mockRejectedValueOnce(error);

      await expect(LetsConnectService.getLetsConnectProfile('nobody')).rejects.toEqual(error);
    });
  });
});
