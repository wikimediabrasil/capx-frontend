import { getDefaultAvatar } from '@/constants/images';
import { useAvatars } from '@/hooks/useAvatars';
import { useEffect, useState } from 'react';

import { useDarkMode } from '@/stores';
/**
 * Custom hook to manage avatar state and loading
 * Extracts avatar-related logic to reduce complexity in ProfileEditView
 */
export function useAvatarManagement(profile: any) {
  const darkMode = useDarkMode();
  const getAvatarById = useAvatars();
  const [avatarUrl, setAvatarUrl] = useState<string>(getDefaultAvatar());

  // Load avatar when profile changes
  useEffect(() => {
    if (typeof profile?.avatar === 'number' && profile.avatar > 0) {
      (async () => {
        try {
          const avatarId = profile.avatar as number;
          const avatarData = await getAvatarById.getAvatarById(avatarId);
          if (avatarData?.avatar_url) {
            setAvatarUrl(avatarData.avatar_url);
          }
        } catch (error) {
          console.error('Error fetching avatar:', error);
        }
      })();
    }
  }, [profile?.avatar, getAvatarById]);

  // Update default avatar when dark mode changes
  useEffect(() => {
    if (!profile?.avatar || profile.avatar === 0) {
      setAvatarUrl(getDefaultAvatar());
    }
  }, [darkMode, profile?.avatar]);

  return avatarUrl;
}
