import { DEFAULT_AVATAR, DEFAULT_AVATAR_WHITE } from '@/constants/images';
import { getProfileImage } from '@/lib/utils/getProfileImage';

describe('getProfileImage', () => {
  const mockAvatars = [
    { id: 1, avatar_url: 'avatar1.jpg' },
    { id: 2, avatar_url: 'avatar2.jpg' },
  ];

  it('should return profile image when available', () => {
    const result = getProfileImage('profile.jpg', 1, mockAvatars);
    expect(result).toBe('profile.jpg');
  });

  it('should return avatar url when profile image is not available', () => {
    const result = getProfileImage(null, 1, mockAvatars);
    expect(result).toBe('avatar1.jpg');
  });

  it('should return default avatar when no image or avatar is available', () => {
    const result = getProfileImage(null, null, mockAvatars);
    expect(result).toBe(DEFAULT_AVATAR);
  });

  it('should return white avatar in dark mode when no image or avatar is available', () => {
    const result = getProfileImage(null, null, mockAvatars, true);
    expect(result).toBe(DEFAULT_AVATAR_WHITE);
  });

  it('should handle empty strings in profile image', () => {
    const result = getProfileImage('', 1, mockAvatars);
    expect(result).toBe('avatar1.jpg');
  });

  it('should handle invalid avatar id', () => {
    const result = getProfileImage(null, 999, mockAvatars);
    expect(result).toBe(DEFAULT_AVATAR);
  });

  it('should handle invalid avatar id in dark mode', () => {
    const result = getProfileImage(null, 999, mockAvatars, true);
    expect(result).toBe(DEFAULT_AVATAR_WHITE);
  });
});
