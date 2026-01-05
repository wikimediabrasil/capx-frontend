import { useState, useEffect, useCallback } from 'react';
import { useAvatars } from '@/hooks/useAvatars';
import { getProfileImage } from '@/lib/utils/getProfileImage';
import { formatWikiImageUrl } from '@/lib/utils/fetchWikimediaData';
import { fetchWikidataImage, shouldUseWikidataImage } from '@/lib/utils/wikidataImage';

interface UseProfileImageParams {
  isOrganization?: boolean;
  profile_image?: string;
  avatar?: string | number;
  wikidataQid?: string;
}

interface UseProfileImageReturn {
  profileImageUrl: string | null;
  isLoading: boolean;
  error: Error | null;
  reload: () => Promise<void>;
}

/**
 * Custom hook to load and manage profile images
 * Handles organizations, Wikidata images, system avatars, and fallbacks
 *
 * @param params - Configuration for profile image loading
 * @returns Profile image URL, loading state, error state, and reload function
 */
export const useProfileImage = ({
  isOrganization = false,
  profile_image,
  avatar,
  wikidataQid,
}: UseProfileImageParams): UseProfileImageReturn => {
  const { avatars } = useAvatars();
  const [profileImageUrl, setProfileImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadProfileImage = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      if (isOrganization) {
        // Organizations use profile_image directly
        if (profile_image) {
          setProfileImageUrl(formatWikiImageUrl(profile_image));
        } else {
          setProfileImageUrl(null);
        }
        return;
      }

      // For users: check if they use Wikidata image (avatar = null or 0)
      if (shouldUseWikidataImage(avatar, wikidataQid)) {
        // Fetch Wikidata image
        const wikidataImage = await fetchWikidataImage(wikidataQid!);
        setProfileImageUrl(wikidataImage);
      } else if (avatar && Number(avatar) > 0) {
        // Use avatar from system
        const imageUrl = getProfileImage(undefined, Number(avatar), avatars);
        setProfileImageUrl(imageUrl);
      } else if (profile_image && !wikidataQid) {
        // Only use profile_image if no Wikidata is configured
        setProfileImageUrl(formatWikiImageUrl(profile_image));
      } else {
        // No avatar
        setProfileImageUrl(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load profile image'));
      setProfileImageUrl(null);
    } finally {
      setIsLoading(false);
    }
  }, [isOrganization, profile_image, avatar, wikidataQid, avatars]);

  useEffect(() => {
    loadProfileImage();
  }, [loadProfileImage]);

  return {
    profileImageUrl,
    isLoading,
    error,
    reload: loadProfileImage,
  };
};
