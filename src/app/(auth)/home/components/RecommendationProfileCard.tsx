'use client';

import { ProfileCapacityType } from '@/app/(auth)/feed/types';
import { useSnackbar } from '@/app/providers/SnackbarProvider';
import BaseButton from '@/components/BaseButton';
import { DEFAULT_AVATAR } from '@/constants/images';
import { useApp } from '@/contexts/AppContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useProfileImage } from '@/hooks/useProfileImage';
import { useSavedItems } from '@/hooks/useSavedItems';
import AccountCircle from '@/public/static/images/account_circle.svg';
import AccountCircleWhite from '@/public/static/images/account_circle_white.svg';
import Bookmark from '@/public/static/images/bookmark.svg';
import BookmarkFilled from '@/public/static/images/bookmark_filled.svg';
import BookmarkFilledWhite from '@/public/static/images/bookmark_filled_white.svg';
import BookmarkWhite from '@/public/static/images/bookmark_white.svg';
import lamp_purple from '@/public/static/images/lamp_purple.svg';
import UserCircleIcon from '@/public/static/images/supervised_user_circle.svg';
import UserCircleIconWhite from '@/public/static/images/supervised_user_circle_white.svg';
import { OrganizationRecommendation, ProfileRecommendation } from '@/types/recommendation';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

type ProfileCardRecommendation = ProfileRecommendation | OrganizationRecommendation;

interface RecommendationProfileCardProps {
  recommendation: ProfileCardRecommendation;
  onSave?: (id: number) => void;
  capacityType?: 'known' | 'available' | 'wanted';
  hintMessage?: string;
}

export default function RecommendationProfileCard({
  recommendation,
  onSave,
  capacityType = 'available',
  hintMessage,
}: RecommendationProfileCardProps) {
  const { pageContent, language } = useApp();
  const { darkMode } = useTheme();
  const router = useRouter();
  const { data: session } = useSession();
  const { savedItems, createSavedItem, deleteSavedItem } = useSavedItems();
  const { showSnackbar } = useSnackbar();
  const [isSaving, setIsSaving] = useState(false);

  const isOrganization = 'acronym' in recommendation;
  const organizationRecommendation = isOrganization
    ? (recommendation as OrganizationRecommendation)
    : null;
  const profileRecommendation = !isOrganization ? (recommendation as ProfileRecommendation) : null;
  const profileUsername = profileRecommendation?.username;

  const profileImage = recommendation.profile_image;
  const displayName = recommendation.display_name || profileUsername;
  const avatar = profileRecommendation?.avatar;
  const wikidataQid = profileRecommendation?.wikidata_qid;

  // Use custom hook for profile image loading
  const { profileImageUrl } = useProfileImage({
    isOrganization,
    profile_image: profileImage || undefined,
    avatar: avatar || undefined,
    wikidataQid: wikidataQid || undefined,
  });

  const handleViewProfile = () => {
    if (isOrganization) {
      window.location.href = `/organization_profile/${recommendation.id}`;
    } else if (profileUsername) {
      window.location.href = `/profile/${profileUsername}`;
    }
  };

  // Check if profile is saved
  const isSaved =
    savedItems?.some(
      item =>
        item.entity_id === recommendation.id && item.entity === (isOrganization ? 'org' : 'user')
    ) || false;

  const savedItem = savedItems?.find(
    item =>
      item.entity_id === recommendation.id && item.entity === (isOrganization ? 'org' : 'user')
  );

  const bookmarkIcon = isSaved
    ? darkMode
      ? BookmarkFilledWhite
      : BookmarkFilled
    : darkMode
      ? BookmarkWhite
      : Bookmark;

  const handleSave = async () => {
    if (!session?.user?.token || isSaving) return;

    setIsSaving(true);
    try {
      if (isSaved && savedItem) {
        const success = await deleteSavedItem(savedItem.id);
        if (success) {
          showSnackbar(
            pageContent['saved-profiles-delete-success'] || 'Profile removed from saved',
            'success'
          );
        } else {
          showSnackbar(pageContent['saved-profiles-error'] || 'Error removing profile', 'error');
        }
      } else {
        const saveType =
          capacityType === 'available' ? ProfileCapacityType.Sharer : ProfileCapacityType.Learner;
        const success = await createSavedItem(
          isOrganization ? 'org' : 'user',
          recommendation.id,
          saveType
        );
        if (success) {
          showSnackbar(
            pageContent['saved-profiles-add-success'] || 'Profile saved successfully',
            'success'
          );
        } else {
          showSnackbar(pageContent['saved-profiles-error'] || 'Error saving profile', 'error');
        }
      }
    } catch (error) {
      console.error('Error toggling saved status:', error);
      showSnackbar(pageContent['saved-profiles-error'] || 'Error saving profile', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div
      className={`flex h-full flex-col justify-between items-start p-4 rounded-md w-[270px] md:w-[370px] border min-h-[300px] md:min-h-[350px] ${
        darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      }`}
    >
      {hintMessage && (
        <div className="flex items-center justify-start gap-2 mb-4">
          <div className="relative w-[15px] h-[15px] md:w-[20px] md:h-[20px]" aria-hidden="true">
            <Image src={lamp_purple} alt="" fill className="object-contain" priority />
          </div>
          <p
            className={`text-[10px] md:text-[14px] ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}
          >
            {hintMessage}
          </p>
        </div>
      )}

      <div
        className={`relative w-full max-w-[195px] h-[115px] md:max-w-[280px] md:h-[180px] bg-[#EFEFEF] mt-4 mb-4 self-center rounded-md`}
      >
        <Image
          src={profileImageUrl || DEFAULT_AVATAR}
          alt={
            !profileImageUrl || profileImageUrl === DEFAULT_AVATAR
              ? pageContent['alt-profile-picture-default'] || 'Default user profile picture'
              : `${isOrganization ? pageContent['organization-logo'] || 'Organization logo' : pageContent['profile-picture'] || 'Profile picture'} - ${displayName || ''}`
          }
          fill
          className="object-contain"
          unoptimized
          priority
        />
      </div>

      <div className="flex items-center justify-start gap-2 mb-4 w-full">
        <div
          className="relative w-[15px] h-[15px] md:w-[30px] md:h-[30px] flex-shrink-0"
          aria-hidden="true"
        >
          <Image
            src={
              isOrganization
                ? darkMode
                  ? UserCircleIconWhite
                  : UserCircleIcon
                : darkMode
                  ? AccountCircleWhite
                  : AccountCircle
            }
            alt=""
            fill
            className="object-contain"
            priority
          />
        </div>
        <h3
          className={`text-[14px] md:text-[18px] font-bold truncate flex-1 ${
            darkMode ? 'text-white' : 'text-capx-dark-box-bg'
          }`}
        >
          {displayName}
        </h3>
      </div>

      <div className="flex items-center justify-start gap-2 w-full mt-auto">
        <BaseButton
          onClick={handleViewProfile}
          customClass="flex justify-center items-center gap-2 px-4 py-2 rounded-lg text-[14px] text-white font-extrabold bg-[#053749] hover:bg-[#04222F] md:text-[16px] md:px-6 md:py-3"
          label={pageContent['view-profile'] || 'View Profile'}
        />
        <BaseButton
          onClick={handleSave}
          disabled={isSaving}
          customClass={`flex justify-center items-center gap-2 px-4 !py-2 rounded-lg text-[14px] font-extrabold border-2 md:text-[16px] md:px-6 md:py-3 ${
            isSaved
              ? 'bg-[#053749] text-white border-[#053749] hover:bg-[#04222F]'
              : darkMode
                ? 'text-white border-white bg-transparent hover:bg-gray-700'
                : 'text-[#053749] border-[#053749] bg-white hover:bg-gray-50'
          } ${isSaving ? 'opacity-50 cursor-not-allowed' : ''}`}
          label={pageContent['save'] || 'Save'}
          imageUrl={bookmarkIcon}
          imageWidth={16}
          imageHeight={16}
        />
      </div>
    </div>
  );
}
