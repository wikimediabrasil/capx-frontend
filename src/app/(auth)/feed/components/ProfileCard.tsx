import BaseButton from '@/components/BaseButton';
import { ProfileItem } from '@/components/ProfileItem';
import { getDefaultAvatar } from '@/constants/images';
import { usePageContent, useDarkMode, useCapacityStore } from '@/stores';
import { useLanguage } from '@/hooks/useLanguage';
import { useOrganizationDisplayName } from '@/hooks/useOrganizationDisplayName';
import { useProfileImage } from '@/hooks/useProfileImage';
import { useTerritories } from '@/hooks/useTerritories';
import AccountCircle from '@/public/static/images/account_circle.svg';
import AccountCircleWhite from '@/public/static/images/account_circle_white.svg';
import Bookmark from '@/public/static/images/bookmark.svg';
import BookmarkFilled from '@/public/static/images/bookmark_filled.svg';
import BookmarkFilledWhite from '@/public/static/images/bookmark_filled_white.svg';
import BookmarkWhite from '@/public/static/images/bookmark_white.svg';
import EmojiIcon from '@/public/static/images/emoji_objects.svg';
import EmojiIconWhite from '@/public/static/images/emoji_objects_white.svg';
import LanguageIcon from '@/public/static/images/language.svg';
import LanguageIconWhite from '@/public/static/images/language_white.svg';
import UserCircleIcon from '@/public/static/images/supervised_user_circle.svg';
import UserCircleIconWhite from '@/public/static/images/supervised_user_circle_white.svg';
import TargetIcon from '@/public/static/images/target.svg';
import TargetIconWhite from '@/public/static/images/target_white.svg';
import TerritoryIcon from '@/public/static/images/territory.svg';
import TerritoryIconWhite from '@/public/static/images/territory_white.svg';
import NeurologyIcon from '@/public/static/images/neurology.svg';
import NeurologyIconWhite from '@/public/static/images/neurology_white.svg';
import { LanguageProficiency } from '@/types/language';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { ProfileCapacityType } from '../types';

interface ProfileCardProps {
  id: string;
  username: string;
  profile_image?: string; // Only for organizations
  type: ProfileCapacityType | ProfileCapacityType[];
  capacities: (number | string)[];
  wantedCapacities?: (number | string)[];
  availableCapacities?: (number | string)[];
  knownCapacities?: (number | string)[];
  languages?: LanguageProficiency[];
  territory?: string;
  avatar?: string;
  wikidataQid?: string; // For people with Wikidata images
  pageContent?: Record<string, string>;
  isOrganization?: boolean;
  isSaved?: boolean;
  onToggleSaved?: () => void;
  hasIncompleteProfile?: boolean;
  showWanted?: boolean;
  showAvailable?: boolean;
  showKnown?: boolean;
}

// Helper functions
function getBookmarkIcon(isSaved: boolean, darkMode: boolean) {
  if (isSaved) {
    return darkMode ? BookmarkFilledWhite : BookmarkFilled;
  }
  return darkMode ? BookmarkWhite : Bookmark;
}

function getProfileButtonIcon(isOrganization: boolean, darkMode: boolean) {
  if (isOrganization) {
    return darkMode ? UserCircleIconWhite : UserCircleIcon;
  }
  return darkMode ? AccountCircleWhite : AccountCircle;
}

function getProfileRoute(isOrganization: boolean, id: string, username: string) {
  return isOrganization
    ? `/organization_profile/${id}`
    : `/profile/${encodeURIComponent(username)}`;
}

export const ProfileCard = ({
  id,
  username,
  profile_image,
  type = ProfileCapacityType.Learner,
  capacities = [],
  wantedCapacities = [],
  availableCapacities = [],
  knownCapacities = [],
  languages = [],
  territory,
  avatar,
  wikidataQid,
  isOrganization = false,
  isSaved = false,
  onToggleSaved,
  hasIncompleteProfile = false,
  showWanted = true,
  showAvailable = true,
  showKnown = false,
}: ProfileCardProps) => {
  const darkMode = useDarkMode();
  const pageContent = usePageContent();
  const router = useRouter();
  const { getName, preloadCapacities } = useCapacityStore();
  const { data: session } = useSession();
  const token = session?.user?.token;
  const { languages: availableLanguages } = useLanguage(token);
  const { territories: availableTerritories } = useTerritories(token);

  // Use custom hook for profile image loading
  const { profileImageUrl } = useProfileImage({
    isOrganization,
    profile_image,
    avatar,
    wikidataQid,
  });

  // Get translated organization name if it's an organization
  const { displayName: translatedOrgName } = useOrganizationDisplayName({
    organizationId: isOrganization ? Number(id) : undefined,
    defaultName: isOrganization ? username : '',
    token,
  });

  // Use translated name for organizations, username for users
  const displayName = isOrganization ? translatedOrgName || username : username;

  // Determine if this is a multi-type profile (both sharer and learner)
  const isMultiType = Array.isArray(type) && type.length > 1;
  const primaryType = Array.isArray(type) ? type[0] : type;

  // Preload capacities to ensure they're available in the cache
  useEffect(() => {
    const allCapacities = [
      ...capacities,
      ...wantedCapacities,
      ...availableCapacities,
      ...knownCapacities,
    ];
    if (allCapacities.length > 0 && token) {
      preloadCapacities(token);
    }
  }, [
    capacities,
    wantedCapacities,
    availableCapacities,
    knownCapacities,
    preloadCapacities,
    token,
  ]);

  const wantedCapacitiesIcon = darkMode ? TargetIconWhite : TargetIcon;
  const availableCapacitiesIcon = darkMode ? EmojiIconWhite : EmojiIcon;
  const knownCapacitiesIcon = darkMode ? NeurologyIconWhite : NeurologyIcon;
  const bookmarkIcon = getBookmarkIcon(isSaved, darkMode);
  const profileButtonIcon = getProfileButtonIcon(isOrganization, darkMode);

  const learnerLabel = pageContent['profile-learner'] || 'Learner';
  const sharerLabel = pageContent['profile-sharer'] || 'Sharer';
  const proficientLabel = pageContent['profile-proficient'] || 'Proficient';
  const typeBadgeBaseClass =
    'md:text-[18px] inline-flex px-2 py-1 text-xs font-normal rounded-full border';

  const defaultAvatar = getDefaultAvatar();

  const capacityItemClass = 'font-[Montserrat] text-[14px] not-italic leading-[normal]';

  const capacitiesTitleSingle =
    primaryType === 'learner'
      ? pageContent['body-profile-wanted-capacities-title']
      : pageContent['body-profile-available-capacities-title'];

  const toggleSaved = () => {
    onToggleSaved && onToggleSaved();
  };

  const navigateToProfile = () => {
    router.push(getProfileRoute(isOrganization, id, username));
  };

  const renderTypeBadges = () => {
    if (hasIncompleteProfile) {
      return (
        <span
          className={`md:text-[18px] inline-flex px-2 py-1 text-xs font-normal rounded-full border ${
            darkMode ? 'text-orange-200 border-orange-200' : 'text-orange-600 border-orange-600'
          }`}
        >
          {pageContent['profile-incomplete']}
        </span>
      );
    }

    const typeArray = Array.isArray(type) ? type : [type];
    const hasKnownType = typeArray.includes(ProfileCapacityType.Known);

    if (
      isMultiType ||
      (hasKnownType &&
        (typeArray.includes(ProfileCapacityType.Learner) ||
          typeArray.includes(ProfileCapacityType.Sharer)))
    ) {
      return (
        <>
          {typeArray.includes(ProfileCapacityType.Learner) && (
            <span
              className={`${typeBadgeBaseClass} ${
                darkMode ? 'text-purple-200 border-purple-200' : 'text-purple-800 border-purple-800'
              }`}
            >
              {learnerLabel}
            </span>
          )}
          {typeArray.includes(ProfileCapacityType.Sharer) && (
            <span
              className={`${typeBadgeBaseClass} ${
                darkMode ? 'text-[#05A300] border-[#05A300]' : 'text-[#166534] border-[#166534]'
              }`}
            >
              {sharerLabel}
            </span>
          )}
          {hasKnownType && (
            <span
              className={`${typeBadgeBaseClass} ${
                darkMode ? 'text-orange-200 border-orange-200' : 'text-orange-600 border-orange-600'
              }`}
            >
              {proficientLabel}
            </span>
          )}
        </>
      );
    }

    let typeLabel = '';
    let badgeColor = '';

    if (primaryType === 'learner') {
      typeLabel = learnerLabel;
      badgeColor = darkMode
        ? 'text-purple-200 border-purple-200'
        : 'text-purple-800 border-purple-800';
    } else if (primaryType === 'sharer') {
      typeLabel = sharerLabel;
      badgeColor = darkMode ? 'text-[#05A300] border-[#05A300]' : 'text-[#166534] border-[#166534]';
    } else if (primaryType === 'known') {
      typeLabel = proficientLabel;
      badgeColor = darkMode
        ? 'text-orange-200 border-orange-200'
        : 'text-orange-600 border-orange-600';
    }

    return <span className={`${typeBadgeBaseClass} ${badgeColor}`}>{typeLabel}</span>;
  };

  const renderCapacitiesSection = () => {
    if (hasIncompleteProfile) {
      return (
        <div className="flex items-center justify-center h-full min-h-[120px] md:min-h-[300px]">
          <div className="text-center max-w-md">
            <p
              className={`font-[Montserrat] md:text-[18px] text-[14px] leading-relaxed ${
                darkMode ? 'text-orange-200' : 'text-orange-600'
              }`}
            >
              {pageContent['profile-incomplete-description']}
            </p>
          </div>
        </div>
      );
    }

    // Collect all capacity sections to display
    const sectionsToShow: React.ReactElement[] = [];

    // Always show wanted if it exists and is enabled
    if (showWanted && wantedCapacities && wantedCapacities.length > 0) {
      sectionsToShow.push(
        <ProfileItem
          key="wanted"
          icon={wantedCapacitiesIcon}
          title={pageContent['body-profile-wanted-capacities-title']}
          items={wantedCapacities}
          showEmptyDataText={false}
          getItemName={id => getName(Number(id))}
          customClass={capacityItemClass}
        />
      );
    }

    // Show available if it exists and is enabled
    if (showAvailable && availableCapacities && availableCapacities.length > 0) {
      sectionsToShow.push(
        <ProfileItem
          key="available"
          icon={availableCapacitiesIcon}
          title={pageContent['body-profile-available-capacities-title']}
          items={availableCapacities}
          showEmptyDataText={false}
          getItemName={id => getName(Number(id))}
          customClass={capacityItemClass}
        />
      );
    }

    // Show known if it exists and is enabled
    if (showKnown && knownCapacities && knownCapacities.length > 0) {
      sectionsToShow.push(
        <ProfileItem
          key="known"
          icon={knownCapacitiesIcon}
          title={pageContent['body-profile-known-capacities-title']}
          items={knownCapacities}
          showEmptyDataText={false}
          getItemName={id => getName(Number(id))}
          customClass={capacityItemClass}
        />
      );
    }

    // If multi-type or has multiple capacity types, show all enabled sections
    if (isMultiType || sectionsToShow.length > 1) {
      return <div className="flex flex-col gap-4">{sectionsToShow}</div>;
    }

    // Single type: show primary capacity type if enabled, otherwise show first available
    if (sectionsToShow.length > 0) {
      return sectionsToShow[0];
    }

    // Fallback: determine icon and title based on type
    let icon = availableCapacitiesIcon;
    let title = capacitiesTitleSingle;

    if (primaryType === 'learner') {
      icon = wantedCapacitiesIcon;
      title = pageContent['body-profile-wanted-capacities-title'];
    } else if (primaryType === 'known') {
      icon = knownCapacitiesIcon;
      title = pageContent['body-profile-known-capacities-title'];
    }

    return (
      <ProfileItem
        icon={icon}
        title={title}
        items={capacities}
        showEmptyDataText={false}
        getItemName={id => getName(Number(id))}
        customClass={capacityItemClass}
      />
    );
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
            <div className={`rounded-lg p-4 ${darkMode ? 'bg-capx-dark-bg' : 'bg-[#EFEFEF]'}`}>
              {/* Type Badge(s) */}
              <div className="flex justify-start mb-4 gap-2 flex-wrap">{renderTypeBadges()}</div>

              {/* Profile Image */}
              <div className="flex flex-col items-center mb-6">
                <button
                  onClick={navigateToProfile}
                  className={`relative w-[100px] h-[100px] md:w-[200px] md:h-[200px] ${
                    darkMode ? 'bg-[#EFEFEF]' : ''
                  } rounded-[4px] cursor-pointer hover:opacity-90 transition-opacity`}
                  aria-label={pageContent['alt-view-profile-user'] || 'View user profile'}
                >
                  <Image
                    src={profileImageUrl || defaultAvatar}
                    alt={
                      !profileImageUrl || profileImageUrl === defaultAvatar
                        ? pageContent['alt-profile-picture-default'] ||
                          'Default user profile picture'
                        : pageContent['alt-profile-picture'] || 'User profile picture'
                    }
                    fill
                    className="object-contain rounded-[4px]"
                    unoptimized
                    loading="lazy"
                  />
                </button>
              </div>
            </div>

            {/* Username */}
            <div className="mt-4 mb-6 flex items-center justify-center md:justify-between">
              <h5
                className={`md:text-[32px] text-xl font-bold font-[Montserrat] ${
                  darkMode ? 'text-capx-light-bg' : 'text-capx-dark-box-bg'
                }`}
              >
                {displayName}
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
                onClick={navigateToProfile}
                imageUrl={profileButtonIcon}
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
                  label={
                    isSaved
                      ? pageContent['saved-profiles-saved-profile']
                      : pageContent['edit-profile-save']
                  }
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
            {renderCapacitiesSection()}

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
                onClick={navigateToProfile}
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
