'use client';

import Image from 'next/image';
import { useApp } from '@/contexts/AppContext';
import { useTheme } from '@/contexts/ThemeContext';
import BaseButton from '@/components/BaseButton';
import {
  OrganizationRecommendation,
  ProfileRecommendation,
} from '@/types/recommendation';
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

type ProfileCardRecommendation = ProfileRecommendation | OrganizationRecommendation;

interface RecommendationProfileCardProps {
  recommendation: ProfileCardRecommendation;
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
  const [capacities, setCapacities] = useState<number[]>(
    Array.isArray(recommendation.capacities)
      ? recommendation.capacities
          .map(capacityId =>
            typeof capacityId === 'string' ? parseInt(capacityId, 10) : capacityId
          )
          .filter(capacityId => !Number.isNaN(capacityId))
      : []
  );
  const [isLoadingCapacities, setIsLoadingCapacities] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const isOrganization = 'acronym' in recommendation;
  const organizationRecommendation = isOrganization
    ? (recommendation as OrganizationRecommendation)
    : null;
  const profileRecommendation = !isOrganization ? (recommendation as ProfileRecommendation) : null;
  const profileUsername = profileRecommendation?.username;

  const profileImage = recommendation.profile_image;
  const displayName = recommendation.display_name || profileUsername;
  
  const finalCapacityType = capacityType;
  const capacityStyle = CAPACITY_STYLES[finalCapacityType] || CAPACITY_STYLES.default;
  const tagBgColor = capacityStyle.backgroundColor;
  const tagTextColor = capacityStyle.textColor;

  const parseCapacityIds = (values?: Array<number | string> | null): number[] => {
    if (!values || !Array.isArray(values)) {
      return [];
    }

    return values
      .map(value => (typeof value === 'string' ? parseInt(value, 10) : value))
      .filter(value => !Number.isNaN(value) && typeof value === 'number');
  };

  // Hydrate capacities from the recommendation payload when available
  useEffect(() => {
    const directCapacities = parseCapacityIds(recommendation.capacities);

    let additionalCapacities: number[] = [];

    if (isOrganization && organizationRecommendation) {
      additionalCapacities =
        finalCapacityType === 'available'
          ? parseCapacityIds(organizationRecommendation.available_capacities)
          : parseCapacityIds(organizationRecommendation.wanted_capacities);
    } else if (profileRecommendation) {
      additionalCapacities =
        finalCapacityType === 'available'
          ? parseCapacityIds(profileRecommendation.skills_available)
          : finalCapacityType === 'wanted'
            ? parseCapacityIds(profileRecommendation.skills_wanted)
            : parseCapacityIds(profileRecommendation.skills_known);
    }

    const mergedCapacities = Array.from(new Set([...directCapacities, ...additionalCapacities]));

    if (mergedCapacities.length > 0) {
      setCapacities(prev => {
        // Only update if the capacities are actually different
        const prevSet = new Set(prev);
        const newSet = new Set(mergedCapacities);
        if (prevSet.size === newSet.size && mergedCapacities.every(c => prevSet.has(c))) {
          return prev;
        }
        return mergedCapacities;
      });

      preloadCapacities();
    }
  }, [recommendation, preloadCapacities, finalCapacityType, isOrganization]);

  // Fetch capacities from profile if not already available
  useEffect(() => {
    const fetchCapacities = async () => {
      if (!session?.user?.token) {
        return;
      }

      // Check if we already have capacities from the initial recommendation data
      const hasInitialCapacities = 
        (Array.isArray(recommendation.capacities) && recommendation.capacities.length > 0) ||
        (isOrganization && organizationRecommendation && (
          (finalCapacityType === 'available' && Array.isArray(organizationRecommendation.available_capacities) && organizationRecommendation.available_capacities.length > 0) ||
          (finalCapacityType === 'wanted' && Array.isArray(organizationRecommendation.wanted_capacities) && organizationRecommendation.wanted_capacities.length > 0)
        )) ||
        (profileRecommendation && (
          (finalCapacityType === 'available' && Array.isArray(profileRecommendation.skills_available) && profileRecommendation.skills_available.length > 0) ||
          (finalCapacityType === 'wanted' && Array.isArray(profileRecommendation.skills_wanted) && profileRecommendation.skills_wanted.length > 0) ||
          (finalCapacityType === 'known' && Array.isArray(profileRecommendation.skills_known) && profileRecommendation.skills_known.length > 0)
        ));

      // If we have initial capacities and they're already set in state, don't fetch again
      if (hasInitialCapacities && capacities.length > 0) {
        return;
      }

      // If we don't have capacities, try to fetch them
      if (capacities.length === 0) {
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
              if (numericCapacities.length > 0) {
                setCapacities(numericCapacities);
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
              if (numericCapacities.length > 0) {
                setCapacities(numericCapacities);
                preloadCapacities();
              }
            }
          }
        } catch (error) {
          console.error('Error fetching capacities:', error);
        } finally {
          setIsLoadingCapacities(false);
        }
      }
    };

    fetchCapacities();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recommendation.id, isOrganization, finalCapacityType, session?.user?.token]);

  const handleViewProfile = () => {
    if (isOrganization) {
      router.push(`/organization_profile/${recommendation.id}`);
    } else if (profileUsername) {
      router.push(`/profile/${profileUsername}`);
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
    <div
      className={`flex h-full flex-col justify-between items-start p-4 rounded-md w-[270px] md:w-[370px] border min-h-[400px] md:min-h-[450px] ${
        darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      }`}
    >
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

      <div
        className={`relative w-full max-w-[195px] h-[115px] md:max-w-[280px] md:h-[180px] ${
          darkMode ? 'bg-gray-700' : 'bg-[#EFEFEF]'
        } mt-4 mb-4 self-center rounded-md`}
      >
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
          <Image src={NoAvatarIcon} alt={displayName || ''} fill className="object-contain" />
        )}
      </div>

      <div className="flex items-center justify-start gap-2 mb-4 w-full">
        <div className="relative w-[15px] h-[15px] md:w-[30px] md:h-[30px]">
          <Image src={AccountCircle} alt="" fill className="object-contain" priority />
        </div>
        <p
          className={`text-[14px] md:text-[18px] font-bold truncate flex-1 ${
            darkMode ? 'text-white' : 'text-capx-dark-box-bg'
          }`}
        >
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

      <div className="flex items-center justify-start gap-2 w-full mt-auto">
        <BaseButton
          onClick={handleViewProfile}
          customClass="flex justify-center items-center gap-2 px-4 py-2 rounded-lg text-[14px] text-white font-extrabold bg-[#053749] hover:bg-[#04222F] md:text-[16px] md:px-6 md:py-3"
          label={pageContent['view-profile'] || 'View Profile'}
        />
        <BaseButton
          onClick={handleSave}
          disabled={isSaving}
          customClass={`flex justify-center items-center gap-2 px-4 py-2 rounded-lg text-[14px] font-extrabold border-2 md:text-[16px] md:px-6 md:py-3 ${
            isSaved
              ? 'bg-[#053749] text-white border-[#053749] hover:bg-[#04222F]'
              : darkMode
                ? 'text-white border-white bg-transparent hover:bg-gray-700'
                : 'text-[#053749] border-[#053749] bg-white hover:bg-gray-50'
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

