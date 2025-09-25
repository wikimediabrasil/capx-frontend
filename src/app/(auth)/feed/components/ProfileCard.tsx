import React, { useEffect } from 'react';
import Image from 'next/image';
import { useTheme } from '@/contexts/ThemeContext';
import { useApp } from '@/contexts/AppContext';
import { ProfileCapacityType } from '../types';
import LanguageIcon from '@/public/static/images/language.svg';
import LanguageIconWhite from '@/public/static/images/language_white.svg';
import EmojiIcon from '@/public/static/images/emoji_objects.svg';
import EmojiIconWhite from '@/public/static/images/emoji_objects_white.svg';
import TargetIcon from '@/public/static/images/target.svg';
import TargetIconWhite from '@/public/static/images/target_white.svg';
import NoAvatarIcon from '@/public/static/images/no_avatar.svg';
import NoAvatarIconWhite from '@/public/static/images/no_avatar_white.svg';
import TerritoryIcon from '@/public/static/images/territory.svg';
import TerritoryIconWhite from '@/public/static/images/territory_white.svg';
import AccountCircle from '@/public/static/images/account_circle.svg';
import AccountCircleWhite from '@/public/static/images/account_circle_white.svg';
import UserCircleIcon from '@/public/static/images/supervised_user_circle.svg';
import UserCircleIconWhite from '@/public/static/images/supervised_user_circle_white.svg';
import Bookmark from '@/public/static/images/bookmark.svg';
import BookmarkWhite from '@/public/static/images/bookmark_white.svg';
import BookmarkFilled from '@/public/static/images/bookmark_filled.svg';
import BookmarkFilledWhite from '@/public/static/images/bookmark_filled_white.svg';
import { ProfileItem } from '@/components/ProfileItem';
import { useRouter } from 'next/navigation';
import { useCapacityCache } from '@/contexts/CapacityCacheContext';
import { useTerritories } from '@/hooks/useTerritories';
import { useLanguage } from '@/hooks/useLanguage';
import { useSession } from 'next-auth/react';
import { useAvatars } from '@/hooks/useAvatars';
import { getProfileImage } from '@/lib/utils/getProfileImage';
import { formatWikiImageUrl } from '@/lib/utils/fetchWikimediaData';
import { LanguageProficiency } from '@/types/language';
import BaseButton from '@/components/BaseButton';

interface ProfileCardProps {
  id: string;
  username: string;
  profile_image: string;
  type: ProfileCapacityType | ProfileCapacityType[];
  capacities: (number | string)[];
  wantedCapacities?: (number | string)[];
  availableCapacities?: (number | string)[];
  languages?: LanguageProficiency[];
  territory?: string;
  avatar?: string;
  pageContent?: Record<string, string>;
  isOrganization?: boolean;
  isSaved?: boolean;
  onToggleSaved?: () => void;
  hasIncompleteProfile?: boolean;
}

export const ProfileCard = ({
  id,
  username,
  profile_image,
  type = ProfileCapacityType.Learner,
  capacities = [],
  wantedCapacities = [],
  availableCapacities = [],
  languages = [],
  territory,
  avatar,
  isOrganization = false,
  isSaved = false,
  onToggleSaved,
  hasIncompleteProfile = false,
}: ProfileCardProps) => {
  const { darkMode } = useTheme();
  const { pageContent } = useApp();
  const router = useRouter();
  const { getName, preloadCapacities } = useCapacityCache();
  const { data: session } = useSession();
  const token = session?.user?.token;
  const { languages: availableLanguages } = useLanguage(token);
  const { territories: availableTerritories } = useTerritories(token);
  const { avatars } = useAvatars();

  // Determine if this is a multi-type profile (both sharer and learner)
  const isMultiType = Array.isArray(type) && type.length > 1;
  const primaryType = Array.isArray(type) ? type[0] : type;

  // Preload capacities to ensure they're available in the cache
  useEffect(() => {
    const allCapacities = [...capacities, ...wantedCapacities, ...availableCapacities];
    if (allCapacities.length > 0) {
      preloadCapacities();
    }
  }, [capacities, wantedCapacities, availableCapacities, preloadCapacities]);

  const wantedCapacitiesIcon = darkMode ? TargetIconWhite : TargetIcon;
  const availableCapacitiesIcon = darkMode ? EmojiIconWhite : EmojiIcon;

  const typeBadgeColorLightMode =
    primaryType === 'learner'
      ? 'text-purple-800 border-purple-800'
      : 'text-[#05A300] border-[#05A300]';

  const typeBadgeColorDarkMode =
    primaryType === 'learner'
      ? 'text-purple-200 border-purple-200'
      : 'text-[#05A300] border-[#05A300]';

  const defaultAvatar = darkMode ? NoAvatarIconWhite : NoAvatarIcon;

  const bookmarkIcon = isSaved
    ? darkMode
      ? BookmarkFilledWhite
      : BookmarkFilled
    : darkMode
      ? BookmarkWhite
      : Bookmark;

  const toggleSaved = () => {
    onToggleSaved && onToggleSaved();
  };

  return (
    <div
      className={`w-full rounded-lg border-[2px] ${
        darkMode
          ? 'text-capx-light-bg border-capx-light-bg'
          : 'text-capx-dark-box-bg border-capx-dark-box-bg'
      }`}
    >
      <div className="p-5">
        {/* Desktop Grid  - 2 Columns*/}
        <div role="article" className="md:grid md:grid-cols-[350px_1fr] md:gap-8">
          {/*  Right Column - Profile Info */}
          <div>
            <div className={`rounded-lg p-4 ${darkMode ? 'bg-capx-dark-box-bg' : 'bg-[#EFEFEF]'}`}>
              {/* Type Badge(s) */}
              <div className="flex justify-start mb-4 gap-2 flex-wrap">
                {hasIncompleteProfile ? (
                  <span
                    className={`md:text-[18px] inline-flex px-2 py-1 text-xs font-normal rounded-full border ${
                      darkMode
                        ? 'text-orange-200 border-orange-200'
                        : 'text-orange-600 border-orange-600'
                    }`}
                  >
                    {pageContent['profile-incomplete']}
                  </span>
                ) : isMultiType ? (
                  // Show both badges for multi-type profiles
                  <>
                    <span
                      className={`md:text-[18px] inline-flex px-2 py-1 text-xs font-normal rounded-full border ${
                        darkMode
                          ? 'text-purple-200 border-purple-200'
                          : 'text-purple-800 border-purple-800'
                      }`}
                    >
                      {pageContent['profile-learner']}
                    </span>
                    <span
                      className={`md:text-[18px] inline-flex px-2 py-1 text-xs font-normal rounded-full border ${
                        darkMode
                          ? 'text-[#05A300] border-[#05A300]'
                          : 'text-[#05A300] border-[#05A300]'
                      }`}
                    >
                      {pageContent['profile-sharer']}
                    </span>
                  </>
                ) : (
                  <span
                    className={`md:text-[18px] inline-flex px-2 py-1 text-xs font-normal rounded-full border ${
                      darkMode ? typeBadgeColorDarkMode : typeBadgeColorLightMode
                    }`}
                  >
                    {primaryType === 'learner'
                      ? pageContent['profile-learner']
                      : primaryType === 'sharer'
                        ? pageContent['profile-sharer']
                        : ''}
                  </span>
                )}
              </div>

              {/* Profile Image */}
              <div className="flex flex-col items-center mb-6">
                <div className="relative w-[100px] h-[100px] md:w-[200px] md:h-[200px]">
                  {profile_image || avatar ? (
                    <Image
                      src={
                        isOrganization
                          ? formatWikiImageUrl(profile_image || '')
                          : getProfileImage(profile_image, avatar ? Number(avatar) : null, avatars)
                      }
                      alt={pageContent['alt-profile-picture'] || 'User profile picture'}
                      fill
                      className="object-contain rounded-[4px]"
                      unoptimized
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Image
                        src={defaultAvatar}
                        alt={
                          pageContent['alt-profile-picture-default'] ||
                          'Default user profile picture'
                        }
                        fill
                        className="object-contain rounded-[4px]"
                        unoptimized
                        loading="lazy"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Username */}
            <div className="mt-4 mb-6 flex items-center justify-center md:justify-between">
              <h5
                className={`md:text-[32px] text-xl font-bold font-[Montserrat] ${
                  darkMode ? 'text-capx-light-bg' : 'text-capx-dark-box-bg'
                }`}
              >
                {username}
              </h5>
            </div>

            {/* Desktop Buttons - Below profile image */}
            <div className="hidden md:flex flex-col gap-2">
              {/* Profile Button */}
              <BaseButton
                customClass={`w-full font-[Montserrat] text-[20px] not-italic font-extrabold leading-[normal] inline-flex px-[13px] py-[6px] pb-[6px] justify-center items-center gap-[8px] flex-shrink-0 rounded-[8px] border-[2px] border-[solid]  ${
                  darkMode
                    ? 'text-capx-light-bg border-capx-light-bg'
                    : 'text-capx-dark-box-bg border-capx-dark-box-bg'
                }`}
                onClick={() => {
                  const routePath = isOrganization
                    ? `/organization_profile/${id}`
                    : `/profile/${encodeURIComponent(username)}`;
                  router.push(routePath);
                }}
                imageUrl={
                  isOrganization
                    ? darkMode
                      ? UserCircleIconWhite
                      : UserCircleIcon
                    : darkMode
                      ? AccountCircleWhite
                      : AccountCircle
                }
                imageAlt={pageContent['alt-view-profile-user'] || 'View user profile'}
                imageWidth={40}
                imageHeight={40}
                label={pageContent['saved-profiles-view-profile'] || 'View user profile'}
              />

              {/* Bookmark Button */}
              {onToggleSaved && (
                <BaseButton
                  customClass={`w-full font-[Montserrat] text-[20px] mt-[6px] not-italic font-extrabold leading-[normal] inline-flex px-[13px] py-[6px] pb-[6px] justify-center items-center gap-[8px] flex-shrink-0 rounded-[8px] border-[2px] border-[solid]  ${
                    darkMode
                      ? 'text-capx-light-bg border-capx-light-bg'
                      : 'text-capx-dark-box-bg border-capx-dark-box-bg'
                  }`}
                  label={isSaved ? 'Saved' : 'Save profile'}
                  onClick={toggleSaved}
                  aria-label={
                    isSaved
                      ? pageContent['alt-bookmark-remove'] ||
                        'Remove this profile from your saved list'
                      : pageContent['alt-bookmark-add'] || 'Save this profile to your saved list'
                  }
                  imageUrl={bookmarkIcon}
                  imageAlt={
                    isSaved
                      ? pageContent['alt-bookmark-saved'] || 'Profile saved to your list'
                      : pageContent['alt-bookmark-add'] || 'Save this profile to your saved list'
                  }
                  imageWidth={40}
                  imageHeight={40}
                />
              )}
            </div>
          </div>

          {/* Right Column - Info */}
          <div className="mt-4 md:mt-0 flex flex-col gap-4">
            {/* Available or Wanted Capacities */}
            {hasIncompleteProfile ? (
              <div className="flex items-center justify-center h-full min-h-[120px] md:min-h-[300px]">
                <div className="text-center max-w-md">
                  <p
                    className={`font-[Montserrat] md:text-[18px] text-[14px] leading-relaxed ${
                      darkMode ? 'text-orange-200' : 'text-orange-600'
                    }`}
                  >
                    {pageContent['profile-incomplete-description']}
                    <br />
                    {pageContent['profile-incomplete-description-2']}
                  </p>
                </div>
              </div>
            ) : isMultiType ? (
              // Show both wanted and available capacities for multi-type profiles
              <div className="flex flex-col gap-4">
                {wantedCapacities && wantedCapacities.length > 0 && (
                  <ProfileItem
                    icon={wantedCapacitiesIcon}
                    title={pageContent['body-profile-wanted-capacities-title']}
                    items={wantedCapacities}
                    showEmptyDataText={false}
                    getItemName={id => getName(Number(id))}
                    customClass={`font-[Montserrat] text-[14px] not-italic leading-[normal]`}
                  />
                )}
                {availableCapacities && availableCapacities.length > 0 && (
                  <ProfileItem
                    icon={availableCapacitiesIcon}
                    title={pageContent['body-profile-available-capacities-title']}
                    items={availableCapacities}
                    showEmptyDataText={false}
                    getItemName={id => getName(Number(id))}
                    customClass={`font-[Montserrat] text-[14px] not-italic leading-[normal]`}
                  />
                )}
                {/* Show message if no capacities are available */}
                {(!wantedCapacities || wantedCapacities.length === 0) &&
                  (!availableCapacities || availableCapacities.length === 0) && (
                    <div className="text-center py-4">
                      <p
                        className={`font-[Montserrat] text-[14px] ${
                          darkMode ? 'text-gray-400' : 'text-gray-600'
                        }`}
                      >
                        No capacities available
                      </p>
                    </div>
                  )}
              </div>
            ) : (
              <ProfileItem
                icon={primaryType === 'learner' ? wantedCapacitiesIcon : availableCapacitiesIcon}
                title={
                  primaryType === 'learner'
                    ? pageContent['body-profile-wanted-capacities-title']
                    : pageContent['body-profile-available-capacities-title']
                }
                items={capacities}
                showEmptyDataText={false}
                getItemName={id => getName(Number(id))}
                customClass={`font-[Montserrat] text-[14px] not-italic leading-[normal]`}
              />
            )}

            {/* Languages */}
            <ProfileItem
              icon={darkMode ? LanguageIconWhite : LanguageIcon}
              title={pageContent['body-profile-languages-title']}
              items={languages.map(language => language.id)}
              showEmptyDataText={false}
              getItemName={id => availableLanguages[id]}
              customClass={`font-[Montserrat] text-[14px] not-italic leading-[normal]`}
            />

            {/* Territory */}
            <ProfileItem
              icon={darkMode ? TerritoryIconWhite : TerritoryIcon}
              title={pageContent['body-profile-section-title-territory']}
              items={territory ? [territory] : []}
              getItemName={id => availableTerritories[id]}
              customClass={`font-[Montserrat] text-[14px] not-italic leading-[normal]`}
              showEmptyDataText={false}
            />

            {/* Mobile Buttons - Only visible on mobile */}
            <div className="flex md:hidden flex-row gap-1 mt-2">
              {/* Profile Button */}
              <button
                className={`inline-flex items-center justify-center p-1.5 rounded-full ${
                  darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                }`}
                onClick={() => {
                  const routePath = isOrganization
                    ? `/organization_profile/${id}`
                    : `/profile/${encodeURIComponent(username)}`;
                  router.push(routePath);
                }}
              >
                <Image
                  src={darkMode ? AccountCircleWhite : AccountCircle}
                  alt={pageContent['alt-view-profile-user'] || 'View user profile'}
                  width={32}
                  height={32}
                  className="w-[32px] h-[32px]"
                />
              </button>

              {/* Bookmark Button */}
              {onToggleSaved && (
                <button
                  className={`inline-flex items-center justify-center p-1.5 rounded-full ${
                    darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                  }`}
                  onClick={toggleSaved}
                  aria-label={
                    isSaved
                      ? pageContent['alt-bookmark-remove'] ||
                        'Remove this profile from your saved list'
                      : pageContent['alt-bookmark-add'] || 'Save this profile to your saved list'
                  }
                >
                  <Image
                    src={bookmarkIcon}
                    alt={
                      isSaved
                        ? pageContent['alt-bookmark-saved'] || 'Profile saved to your list'
                        : pageContent['alt-bookmark-add'] || 'Save this profile to your saved list'
                    }
                    width={32}
                    height={32}
                    className="w-[32px] h-[32px]"
                  />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileCard;
