import { profileService } from '@/services/profileService';

/**
 * Creates a standard mock profile for testing
 */
export function createMockProfile(userId: number = 123) {
  return {
    user: { id: userId, username: 'testuser' },
    avatar: 'test.jpg',
  };
}

/**
 * Sets up common profileService mocks
 */
export function setupProfileServiceMocks(
  mockedProfileService: jest.Mocked<typeof profileService>,
  userId: number = 123
) {
  mockedProfileService.deleteProfile.mockResolvedValue({ success: true });
  mockedProfileService.fetchUserProfile.mockResolvedValue(createMockProfile(userId));
}
