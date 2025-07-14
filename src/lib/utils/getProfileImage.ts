import { Avatar } from '@/types/avatar';
import NoAvatarIcon from '@/public/static/images/no_avatar.svg';

export const getProfileImage = (
  profileImage: string | null | undefined,
  avatarId: number | null | undefined,
  avatars?: Avatar[]
): string => {
  // If there is a profile image, use it
  if (profileImage && profileImage.trim()) {
    return profileImage;
  }

  // If there is an avatar and a list of avatars, search for the avatar
  if (avatarId && avatars?.length) {
    const avatar = avatars.find(a => a.id === avatarId);
    if (avatar?.avatar_url) {
      return avatar.avatar_url;
    }
  }

  // Fallback to the default icon
  return NoAvatarIcon;
};
