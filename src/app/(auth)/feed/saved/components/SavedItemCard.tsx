import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { useTheme } from '@/contexts/ThemeContext';
import { useApp } from '@/contexts/AppContext';
const DEFAULT_AVATAR = '/static/images/person.svg';
import AccountCircle from '@/public/static/images/account_circle.svg';
import AccountCircleWhite from '@/public/static/images/account_circle_white.svg';
import DeleteIcon from '@/public/static/images/delete.svg';
import { useRouter } from 'next/navigation';
import { useAvatars } from '@/hooks/useAvatars';
import { getProfileImage } from '@/lib/utils/getProfileImage';
import { formatWikiImageUrl } from '@/lib/utils/fetchWikimediaData';
import BaseButton from '@/components/BaseButton';

// Helper to fetch Wikidata image URL
const fetchWikidataImage = async (qid: string): Promise<string | null> => {
  try {
    const sparqlQuery = `
      SELECT ?image WHERE {
        wd:${qid} wdt:P18 ?image.
      }
    `;
    const encodedQuery = encodeURIComponent(sparqlQuery);
    const response = await fetch(
      `https://query.wikidata.org/sparql?query=${encodedQuery}&format=json`
    );
    const data = await response.json();

    if (data?.results?.bindings?.length > 0) {
      return data.results.bindings[0].image.value;
    }
    return null;
  } catch (error) {
    console.error('Error fetching Wikidata image:', error);
    return null;
  }
};

interface SavedItemCardProps {
  id: string;
  username: string;
  profile_image?: string; // Only for organizations
  avatar?: string;
  wikidataQid?: string; // For people with Wikidata images
  isOrganization?: boolean;
  onDelete: () => void;
}

export const SavedItemCard = ({
  id,
  username,
  profile_image,
  avatar,
  wikidataQid,
  isOrganization = false,
  onDelete,
}: SavedItemCardProps) => {
  const { darkMode } = useTheme();
  const { pageContent } = useApp();
  const router = useRouter();
  const { avatars } = useAvatars();
  const [profileImageUrl, setProfileImageUrl] = useState<string | null>(null);

  const defaultAvatar = DEFAULT_AVATAR;

  // Load profile image (Wikidata or regular avatar)
  const loadProfileImage = useCallback(async () => {
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
    const avatarNum = avatar != null ? Number(avatar) : null;

    // Special case: if avatar = 1 (Wikidata logo) but wikidataQid is set, use Wikidata image instead
    // This handles legacy data where users were set to avatar 1 instead of 0/null
    if (
      (avatarNum === null || avatarNum === 0 || (avatarNum === 1 && wikidataQid)) &&
      wikidataQid
    ) {
      // Fetch Wikidata image
      const wikidataImage = await fetchWikidataImage(wikidataQid);
      setProfileImageUrl(wikidataImage);
    } else if (avatarNum && avatarNum > 0) {
      // Use avatar from system
      const imageUrl = getProfileImage(undefined, avatarNum, avatars);
      setProfileImageUrl(imageUrl);
    } else if (profile_image && !wikidataQid) {
      // Only use profile_image if no Wikidata is configured
      setProfileImageUrl(formatWikiImageUrl(profile_image));
    } else {
      // No avatar
      setProfileImageUrl(null);
    }
  }, [isOrganization, profile_image, avatar, wikidataQid, avatars]);

  useEffect(() => {
    loadProfileImage();
  }, [loadProfileImage]);

  return (
    <div
      className={`w-full rounded-lg border ${
        darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      }`}
    >
      <div className="p-4 md:p-5">
        {/* Mobile layout: stacked */}
        <div className="md:hidden">
          {/* Username name with icon */}
          <div className="flex items-center mb-3">
            <Image
              src={darkMode ? AccountCircleWhite : AccountCircle}
              alt="Username"
              width={20}
              height={20}
              className="mr-2"
            />
            <h5
              className={`md:text-[32px] text-xl font-bold font-[Montserrat] ${
                darkMode ? 'text-capx-light-bg' : 'text-capx-dark-box-bg'
              }`}
            >
              {username}
            </h5>
          </div>

          {/* Profile image */}
          <div className="rounded-lg p-4 mb-3">
            <div className="relative w-full h-[120px] flex justify-center">
              <Image
                src={profileImageUrl || defaultAvatar}
                alt={username}
                width={120}
                height={120}
                className="object-contain"
                unoptimized
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="space-y-2">
            <BaseButton
              onClick={() => {
                const routePath = isOrganization
                  ? `/organization_profile/${id}`
                  : `/profile/${encodeURIComponent(username)}`;
                router.push(routePath);
              }}
              label={pageContent['saved-profiles-view-profile']}
              customClass={`w-full flex items-center px-[13px] py-[6px] pb-[6px] text-[14px] border border-[#053749] text-[#053749] rounded-md py-3 font-bold mb-0 ${
                darkMode
                  ? 'bg-transparent text-[#F6F6F6] border-[#F6F6F6] border-[2px]'
                  : 'bg-[#F6F6F6] border-[#053749] text-[#053749]'
              }`}
              imageUrl={darkMode ? AccountCircleWhite : AccountCircle}
              imageAlt="View profile"
              imageWidth={20}
              imageHeight={20}
            />

            <BaseButton
              onClick={onDelete}
              label={pageContent['saved-profiles-delete-item']}
              customClass={`w-full flex items-center px-[13px] py-[6px] pb-[6px] text-[14px]  text-[#053749] rounded-md py-3 font-bold bg-[#E53935] mb-0 text-white`}
              imageUrl={DeleteIcon}
              imageAlt="Delete"
              imageWidth={20}
              imageHeight={20}
            />
          </div>
        </div>

        {/* Desktop layout: side by side with better spacing */}
        <div className="hidden md:grid md:grid-cols-2 md:gap-4">
          {/* Left side - Profile Image */}
          <div className="rounded-lg p-4 flex justify-center items-center">
            <div className="relative w-full h-[160px] flex justify-center">
              <Image
                src={profileImageUrl || defaultAvatar}
                alt={username}
                width={160}
                height={160}
                className="object-contain"
                unoptimized
              />
            </div>
          </div>

          {/* Right side - Info and buttons */}
          <div className="flex flex-col justify-center">
            {/* Username */}
            <div className="flex items-center mb-6">
              <Image
                src={darkMode ? AccountCircleWhite : AccountCircle}
                alt="Username"
                width={24}
                height={24}
                className="mr-2"
              />
              <h5
                className={`text-xl md:text-2xl font-bold font-[Montserrat] ${
                  darkMode ? 'text-capx-light-bg' : 'text-capx-dark-box-bg'
                }`}
              >
                {username}
              </h5>
            </div>

            {/* Buttons */}
            <div className="space-y-3 max-w-[300px]">
              <BaseButton
                onClick={() => {
                  const routePath = isOrganization
                    ? `/organization_profile/${id}`
                    : `/profile/${encodeURIComponent(username)}`;
                  router.push(routePath);
                }}
                label={pageContent['saved-profiles-view-profile']}
                customClass={`w-full flex items-center text-[24px] px-8 py-4 border ${
                  darkMode ? 'border-white text-white' : 'border-[#053749] text-[#053749]'
                } rounded-md py-3 font-bold mb-0`}
                imageUrl={darkMode ? AccountCircleWhite : AccountCircle}
                imageAlt="View profile"
                imageWidth={30}
                imageHeight={30}
              />

              <BaseButton
                onClick={onDelete}
                label={pageContent['saved-profiles-delete-item']}
                customClass={`w-full flex items-center text-[24px] px-8 py-4  bg-[#E53935] text-white rounded-md py-3 font-bold mb-0`}
                imageUrl={DeleteIcon}
                imageAlt="Delete"
                imageWidth={30}
                imageHeight={30}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SavedItemCard;
