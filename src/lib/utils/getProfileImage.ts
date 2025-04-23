import { Avatar } from "@/types/avatar";
import NoAvatarIcon from "@/public/static/images/no_avatar.svg";

export const getProfileImage = (
  profileImage: string | null | undefined,
  avatarId: number | null | undefined,
  avatars?: Avatar[]
) => {
  if (profileImage) {
    return profileImage;
  }

  if (avatarId && avatars) {
    const avatar = avatars.find((a) => a.id === avatarId);
    if (avatar?.avatar_url) {
      return avatar.avatar_url;
    }
  }

  return NoAvatarIcon;
};
