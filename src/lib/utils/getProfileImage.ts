import { getDefaultAvatar } from '@/constants/images';
import { formatWikiImageUrl } from '@/lib/utils/fetchWikimediaData';
import { Avatar } from '@/types/avatar';

export const getProfileImage = (
  profileImage: string | null | undefined,
  avatarId: number | null | undefined,
  avatars?: Avatar[],
  darkMode: boolean = false
): string => {
  // If there is a profile image, normalize Wikimedia URLs to a direct/thumbnail URL
  if (profileImage && profileImage.trim()) {
    return formatWikiImageUrl(profileImage.trim());
  }

  // If there is an avatar and a list of avatars, search for the avatar
  if (avatarId && avatars?.length) {
    const avatar = avatars.find(a => a.id === avatarId);
    if (avatar?.avatar_url) {
      return avatar.avatar_url;
    }
  }

  // Fallback to the default person icon
  return getDefaultAvatar();
};
