'use client';

import Image from 'next/image';
import { useApp } from '@/contexts/AppContext';
import { useTheme } from '@/contexts/ThemeContext';
import BaseButton from '@/components/BaseButton';
import { ProfileRecommendation } from '@/types/recommendation';
import { getProfileImage } from '@/lib/utils/getProfileImage';
import { formatWikiImageUrl } from '@/lib/utils/fetchWikimediaData';
import { useAvatars } from '@/hooks/useAvatars';
import { useCapacityCache } from '@/contexts/CapacityCacheContext';
import lamp_purple from '@/public/static/images/lamp_purple.svg';
import AccountCircle from '@/public/static/images/account_circle.svg';
import NoAvatarIcon from '@/public/static/images/no_avatar.svg';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { userService } from '@/services/userService';
import { organizationProfileService } from '@/services/organizationProfileService';
import { useSavedItems } from '@/hooks/useSavedItems';
import { useSnackbar } from '@/app/providers/SnackbarProvider';
import LoadingSpinner from '@/components/LoadingSpinner';
import Bookmark from '@/public/static/images/bookmark.svg';
import BookmarkWhite from '@/public/static/images/bookmark_white.svg';
import BookmarkFilled from '@/public/static/images/bookmark_filled.svg';
import BookmarkFilledWhite from '@/public/static/images/bookmark_filled_white.svg';
import { ProfileCapacityType } from '@/app/(auth)/feed/types';

interface RecommendationProfileCardProps {
  recommendation: ProfileRecommendation;
  onSave?: (id: number) => void;
  capacityType?: 'known' | 'available' | 'wanted';
}

const CAPACITY_STYLES = {
  known: {
    backgroundColor: 'bg-[#0070B9]',
    textColor: 'text-white',
  },
  available: {
    backgroundColor: 'bg-[#075F36]',
    textColor: 'text-white',
  },
  wanted: {
    backgroundColor: 'bg-[#D43831]',
    textColor: 'text-white',
  },
  default: {
    backgroundColor: 'bg-[#EFEFEF]',
    textColor: 'text-black',
  },
} as const;

export default function RecommendationProfileCard({
  recommendation,
  onSave,
  capacityType = 'available',
}: RecommendationProfileCardProps) {
  const { pageContent, language } = useApp();
  const { darkMode } = useTheme();
  const { avatars } = useAvatars();
  const router = useRouter();
  const { getName, preloadCapacities } = useCapacityCache();
  const { data: session } = useSession();
  const { savedItems, createSavedItem, deleteSavedItem } = useSavedItems();
  const { showSnackbar } = useSnackbar();
  const [capacities, setCapacities] = useState<number[]>(recommendation.capacities || []);
  const [isLoadingCapacities, setIsLoadingCapacities] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const isOrganization = 'acronym' in recommendation;
  const profileImage = recommendation.profile_image;
  const displayName = recommendation.display_name || recommendation.username;
  
  const finalCapacityType = capacityType;
  const capacityStyle = CAPACITY_STYLES[finalCapacityType] || CAPACITY_STYLES.default;
  const tagBgColor = capacityStyle.backgroundColor;
  const tagTextColor = capacityStyle.textColor;

  // Fetch capacities from profile if not already available
  useEffect(() => {
    const fetchCapacities = async () => {
      if (capacities.length > 0 || !session?.user?.token) {
        return;
      }

      setIsLoadingCapacities(true);
      try {
        if (isOrganization) {
          const orgData = await organizationProfileService.getOrganizationById(
            session.user.token,
            recommendation.id
          );
          if (orgData) {
            const orgCapacities =
              finalCapacityType === 'available'
                ? orgData.available_capacities || []
                : orgData.wanted_capacities || [];
            // Ensure capacities are numbers
            const numericCapacities = orgCapacities.map(c => typeof c === 'string' ? parseInt(c, 10) : c).filter(c => !isNaN(c)) as number[];
            setCapacities(numericCapacities);
            if (orgCapacities.length > 0) {
              preloadCapacities();
            }
          }
        } else {
          const userData = await userService.fetchUserProfile(
            recommendation.id,
            session.user.token
          );
          if (userData) {
            const userCapacities =
              finalCapacityType === 'available'
                ? userData.skills_available || []
                : finalCapacityType === 'wanted'
                  ? userData.skills_wanted || []
                  : userData.skills_known || [];
            // Ensure capacities are numbers
            const numericCapacities = userCapacities.map(c => typeof c === 'string' ? parseInt(c, 10) : c).filter(c => !isNaN(c)) as number[];
            setCapacities(numericCapacities);
            if (userCapacities.length > 0) {
              preloadCapacities();
            }
          }
        }
      } catch (error) {
        console.error('Error fetching capacities:', error);
      } finally {
        setIsLoadingCapacities(false);
      }
    };

    fetchCapacities();
  }, [recommendation.id, isOrganization, finalCapacityType, session?.user?.token, preloadCapacities, capacities.length]);

  const handleViewProfile = () => {
    if (isOrganization) {
      router.push(`/organization_profile/${recommendation.id}`);
    } else if (recommendation.username) {
      router.push(`/profile/${recommendation.username}`);
    }
  };

  // Check if profile is saved
  const isSaved = savedItems?.some(
    item => item.entity_id === recommendation.id && item.entity === (isOrganization ? 'org' : 'user')
  ) || false;

  const savedItem = savedItems?.find(
    item => item.entity_id === recommendation.id && item.entity === (isOrganization ? 'org' : 'user')
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
          showSnackbar(pageContent['saved-profiles-delete-success'] || 'Profile removed from saved', 'success');
        } else {
          showSnackbar(pageContent['saved-profiles-error'] || 'Error removing profile', 'error');
        }
      } else {
        const saveType = capacityType === 'available' ? ProfileCapacityType.Sharer : ProfileCapacityType.Learner;
        const success = await createSavedItem(
          isOrganization ? 'org' : 'user',
          recommendation.id,
          saveType
        );
        if (success) {
          showSnackbar(pageContent['saved-profiles-add-success'] || 'Profile saved successfully', 'success');
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

  const imageUrl = isOrganization
    ? formatWikiImageUrl(profileImage || '')
    : getProfileImage(profileImage, null, avatars);

  // Preload capacities when they're available
  useEffect(() => {
    if (capacities.length > 0) {
      preloadCapacities();
    }
  }, [capacities, preloadCapacities]);

  return (
    <div className="flex flex-col justify-start items-start bg-white p-4 mx-auto rounded-md w-[270px] md:w-[370px] border border-gray-200 min-h-[400px] md:min-h-[450px]">
      {false && (
        <div className="flex items-center justify-start gap-2 mb-4">
          <div className="relative w-[15px] h-[15px] md:w-[30px] md:h-[30px]">
            <Image src={lamp_purple} alt="" fill className="object-contain" priority />
          </div>
          <p className="text-[10px] md:text-[18px] text-gray-500">
            {pageContent['recommendation-based-on-capacities'] || 'Based on your capacities'}
          </p>
        </div>
      )}

      <div className="relative w-[195px] h-[115px] md:w-[280px] md:h-[180px] bg-[#EFEFEF] mt-4 mb-4 mx-auto">
        {profileImage ? (
          <Image
            src={imageUrl}
            alt={displayName || ''}
            fill
            className="object-contain"
            unoptimized
            priority
          />
        ) : (
          <Image src={NoAvatarIcon} alt={displayName} fill className="object-contain" />
        )}
      </div>

      <div className="flex items-center justify-start gap-2 mb-4 w-full">
        <div className="relative w-[15px] h-[15px] md:w-[30px] md:h-[30px]">
          <Image src={AccountCircle} alt="" fill className="object-contain" priority />
        </div>
        <p className="text-[14px] md:text-[18px] font-bold text-capx-dark-box-bg truncate flex-1">
          {displayName}
        </p>
      </div>

      {/* Capacities section */}
      {isLoadingCapacities ? (
        <div className="flex items-center justify-center w-full mb-4 min-h-[40px]">
          <LoadingSpinner />
        </div>
      ) : capacities.length > 0 ? (
        <div className="flex flex-wrap gap-2 mb-4 w-full min-h-[40px]">
          {capacities.slice(0, 3).map((capacityId, index) => {
            const capacityName = getName(Number(capacityId));
            return (
              <span
                key={`capacity-${capacityId}-${index}`}
                className={`${tagBgColor} ${tagTextColor} text-[10px] md:text-[14px] px-2 py-1 rounded-[8px] font-normal`}
              >
                {capacityName}
              </span>
            );
          })}
          {capacities.length > 3 && (
            <span className="bg-gray-200 text-gray-600 text-[10px] md:text-[14px] px-2 py-1 rounded-[8px]">
              ...
            </span>
          )}
        </div>
      ) : (
        <div className="mb-4 min-h-[40px]" />
      )}

      <div className="flex items-center justify-start gap-2 w-full">
        <BaseButton
          onClick={handleViewProfile}
          customClass="flex justify-center items-center gap-2 px-4 py-2 rounded-lg text-[14px] text-white font-extrabold bg-[#053749] md:text-[16px] md:px-6 md:py-3"
          label={pageContent['view-profile'] || 'View Profile'}
        />
        <BaseButton
          onClick={handleSave}
          disabled={isSaving}
          customClass={`flex justify-center items-center gap-2 px-4 py-2 rounded-lg text-[14px] font-extrabold border-2 md:text-[16px] md:px-6 md:py-3 ${
            isSaved
              ? 'bg-[#053749] text-white border-[#053749]'
              : 'text-[#053749] border-[#053749] bg-white'
          } ${isSaving ? 'opacity-50 cursor-not-allowed' : ''}`}
          label={isSaving ? (pageContent['loading'] || 'Loading...') : (isSaved ? (pageContent['saved'] || 'Saved') : (pageContent['save'] || 'Save'))}
          imageUrl={bookmarkIcon}
          imageWidth={16}
          imageHeight={16}
        />
      </div>
    </div>
  );
}

