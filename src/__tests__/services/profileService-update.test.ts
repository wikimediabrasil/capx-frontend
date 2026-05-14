import { profileService } from '@/services/profileService';
import axios from 'axios';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('profileService.updateProfile', () => {
  const mockUserId = 235;
  const mockToken = 'test-token-235';
  const queryData = { headers: { Authorization: `Token ${mockToken}` } };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should strip name field from language proficiency objects before sending', async () => {
    mockedAxios.put.mockResolvedValue({ data: { id: mockUserId } });

    const profileData = {
      about: 'Olá, sou editora brasileira',
      language: [
        { id: 25, proficiency: '3', name: 'Portuguese (Brazilian)' },
        { id: 1, proficiency: '5', name: 'English' },
      ],
      skills_known: [100, 200],
    };

    await profileService.updateProfile(mockUserId, profileData, queryData);

    expect(mockedAxios.put).toHaveBeenCalledWith(
      `/api/profile/${mockUserId}`,
      expect.objectContaining({
        language: [
          { id: 25, proficiency: '3' },
          { id: 1, proficiency: '5' },
        ],
      }),
      expect.any(Object)
    );
  });

  it('should not include name field for any language object in the payload', async () => {
    mockedAxios.put.mockResolvedValue({ data: { id: mockUserId } });

    const profileData = {
      language: [{ id: 25, proficiency: 'n', name: 'Portuguese (Brazilian)' }],
    };

    await profileService.updateProfile(mockUserId, profileData, queryData);

    const sentPayload = mockedAxios.put.mock.calls[0][1];
    (sentPayload as any).language.forEach((lang: any) => {
      expect(lang).not.toHaveProperty('name');
    });
  });

  it('should preserve language id and proficiency when stripping name', async () => {
    mockedAxios.put.mockResolvedValue({ data: {} });

    const profileData = {
      language: [{ id: 25, proficiency: '3', name: 'Portuguese (Brazilian)' }],
    };

    await profileService.updateProfile(mockUserId, profileData, queryData);

    const sentPayload = mockedAxios.put.mock.calls[0][1];
    expect((sentPayload as any).language[0]).toEqual({ id: 25, proficiency: '3' });
  });

  it('should handle language array without name field correctly', async () => {
    mockedAxios.put.mockResolvedValue({ data: {} });

    const profileData = {
      language: [{ id: 25, proficiency: '3' }],
    };

    await profileService.updateProfile(mockUserId, profileData, queryData);

    const sentPayload = mockedAxios.put.mock.calls[0][1];
    expect((sentPayload as any).language).toEqual([{ id: 25, proficiency: '3' }]);
  });

  it('should handle empty language array', async () => {
    mockedAxios.put.mockResolvedValue({ data: {} });

    await profileService.updateProfile(mockUserId, { language: [] }, queryData);

    const sentPayload = mockedAxios.put.mock.calls[0][1];
    expect((sentPayload as any).language).toEqual([]);
  });

  it('should override user field with {id: userId}', async () => {
    mockedAxios.put.mockResolvedValue({ data: {} });

    const profileData = {
      user: { id: 999, username: 'should-be-overridden', email: 'test@test.com' },
      language: [],
    };

    await profileService.updateProfile(mockUserId, profileData, queryData);

    const sentPayload = mockedAxios.put.mock.calls[0][1];
    expect((sentPayload as any).user).toEqual({ id: mockUserId });
  });

  it('should throw and log backend error details on 400', async () => {
    const backendError = {
      response: {
        status: 400,
        data: {
          error: 'Failed to update user profile',
          details: { language: ['Invalid value.'] },
        },
      },
      message: 'Request failed with status code 400',
    };
    mockedAxios.put.mockRejectedValue(backendError);

    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    await expect(
      profileService.updateProfile(mockUserId, { language: [] }, queryData)
    ).rejects.toEqual(backendError);

    expect(consoleSpy).toHaveBeenCalledWith(
      'Backend validation error details:',
      backendError.response.data.details
    );

    consoleSpy.mockRestore();
  });
});
