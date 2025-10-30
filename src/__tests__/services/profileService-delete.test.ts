import { profileService } from '@/services/profileService';
import axios from 'axios';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('profileService.deleteProfile', () => {
  const mockUserId = '123';
  const mockToken = 'test-token-123';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should successfully delete profile', async () => {
    // Mock successful delete response
    mockedAxios.delete.mockResolvedValue({
      status: 200,
      data: { success: true },
    });

    const result = await profileService.deleteProfile(mockUserId, mockToken);

    expect(mockedAxios.delete).toHaveBeenCalledWith('/api/profile', {
      headers: {
        Authorization: `Token ${mockToken}`,
      },
      data: {
        user: {
          id: mockUserId,
        },
      },
    });
    expect(result).toEqual({ success: true });
  });

  it('should send correct request format', async () => {
    mockedAxios.delete.mockResolvedValue({
      status: 204,
      data: null,
    });

    await profileService.deleteProfile(mockUserId, mockToken);

    // Verify request format matches what backend expects
    expect(mockedAxios.delete).toHaveBeenCalledWith(
      '/api/profile',
      expect.objectContaining({
        data: {
          user: {
            id: mockUserId,
          },
        },
      })
    );
  });

  it('should include authorization header with Token prefix', async () => {
    mockedAxios.delete.mockResolvedValue({
      status: 200,
      data: {},
    });

    await profileService.deleteProfile(mockUserId, mockToken);

    expect(mockedAxios.delete).toHaveBeenCalledWith(
      '/api/profile',
      expect.objectContaining({
        headers: {
          Authorization: `Token ${mockToken}`,
        },
      })
    );
  });

  it('should handle delete error and throw', async () => {
    const mockError = {
      response: {
        status: 401,
        data: { error: 'Unauthorized' },
      },
      message: 'Request failed with status code 401',
    };

    mockedAxios.delete.mockRejectedValue(mockError);

    await expect(profileService.deleteProfile(mockUserId, mockToken)).rejects.toEqual(mockError);

    // Verify error was logged
    expect(console.error).toHaveBeenCalled();
  });

  it('should handle network error', async () => {
    const networkError = new Error('Network Error');
    mockedAxios.delete.mockRejectedValue(networkError);

    await expect(profileService.deleteProfile(mockUserId, mockToken)).rejects.toThrow(
      'Network Error'
    );
  });

  it('should handle 500 internal server error', async () => {
    const serverError = {
      response: {
        status: 500,
        data: { error: 'Internal Server Error' },
      },
    };

    mockedAxios.delete.mockRejectedValue(serverError);

    await expect(profileService.deleteProfile(mockUserId, mockToken)).rejects.toEqual(serverError);
  });

  it('should work with different user IDs', async () => {
    mockedAxios.delete.mockResolvedValue({
      status: 200,
      data: {},
    });

    const differentUserId = '999';
    await profileService.deleteProfile(differentUserId, mockToken);

    expect(mockedAxios.delete).toHaveBeenCalledWith(
      '/api/profile',
      expect.objectContaining({
        data: {
          user: {
            id: differentUserId,
          },
        },
      })
    );
  });

  it('should work with different tokens', async () => {
    mockedAxios.delete.mockResolvedValue({
      status: 200,
      data: {},
    });

    const differentToken = 'different-token-456';
    await profileService.deleteProfile(mockUserId, differentToken);

    expect(mockedAxios.delete).toHaveBeenCalledWith(
      '/api/profile',
      expect.objectContaining({
        headers: {
          Authorization: `Token ${differentToken}`,
        },
      })
    );
  });

  it('should handle 204 No Content response', async () => {
    mockedAxios.delete.mockResolvedValue({
      status: 204,
      data: null,
    });

    const result = await profileService.deleteProfile(mockUserId, mockToken);

    expect(result).toBeNull();
  });
});

// Mock console.error to avoid cluttering test output
beforeAll(() => {
  jest.spyOn(console, 'error').mockImplementation(() => {});
});

afterAll(() => {
  (console.error as jest.Mock).mockRestore();
});
