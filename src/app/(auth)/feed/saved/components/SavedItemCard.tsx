import React from 'react';
import Image from 'next/image';
import { useTheme } from '@/contexts/ThemeContext';
import { useApp } from '@/contexts/AppContext';
import NoAvatarIcon from '@/public/static/images/no_avatar.svg';
import NoAvatarIconWhite from '@/public/static/images/no_avatar_white.svg';
import AccountCircle from '@/public/static/images/account_circle.svg';
import AccountCircleWhite from '@/public/static/images/account_circle_white.svg';
import DeleteIcon from '@/public/static/images/delete.svg';
import { useRouter } from 'next/navigation';
import { useAvatars } from '@/hooks/useAvatars';
import { getProfileImage } from '@/lib/utils/getProfileImage';
import { formatWikiImageUrl } from '@/lib/utils/fetchWikimediaData';
import BaseButton from '@/components/BaseButton';

interface SavedItemCardProps {
  id: string;
  username: string;
  profile_image: string;
  avatar?: string;
  isOrganization?: boolean;
  onDelete: () => void;
}

export const SavedItemCard = ({
  id,
  username,
  profile_image,
  avatar,
  isOrganization = false,
  onDelete,
}: SavedItemCardProps) => {
  const { darkMode } = useTheme();
  const { pageContent } = useApp();
  const router = useRouter();
  const { avatars } = useAvatars();

  const defaultAvatar = darkMode ? NoAvatarIconWhite : NoAvatarIcon;

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
              {profile_image || avatar ? (
                <Image
                  src={
                    isOrganization
                      ? formatWikiImageUrl(profile_image || '')
                      : getProfileImage(profile_image, avatar ? Number(avatar) : null, avatars)
                  }
                  alt={username}
                  width={120}
                  height={120}
                  className="object-contain"
                  unoptimized
                />
              ) : (
                <Image
                  src={defaultAvatar}
                  alt="User profile"
                  width={120}
                  height={120}
                  className="object-contain"
                  unoptimized
                />
              )}
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
              {profile_image || avatar ? (
                <Image
                  src={
                    isOrganization
                      ? formatWikiImageUrl(profile_image || '')
                      : getProfileImage(profile_image, avatar ? Number(avatar) : null, avatars)
                  }
                  alt={username}
                  width={160}
                  height={160}
                  className="object-contain"
                  unoptimized
                />
              ) : (
                <Image
                  src={defaultAvatar}
                  alt="User profile"
                  width={160}
                  height={160}
                  className="object-contain"
                  unoptimized
                />
              )}
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
