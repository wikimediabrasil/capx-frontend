'use client';

import Image from 'next/image';
import { useApp } from '@/contexts/AppContext';
import { useTheme } from '@/contexts/ThemeContext';
import BaseButton from '@/components/BaseButton';
import { CapacityRecommendation } from '@/types/recommendation';
import { useCapacityCache } from '@/contexts/CapacityCacheContext';
import { getCapacityColor } from '@/lib/utils/capacitiesUtils';
import { useRouter } from 'next/navigation';
import lamp_purple from '@/public/static/images/lamp_purple.svg';
import { useEffect, useMemo, useState } from 'react';
import { useSession } from 'next-auth/react';
import { profileService } from '@/services/profileService';
import { useSnackbar } from '@/app/providers/SnackbarProvider';
import { useQueryClient } from '@tanstack/react-query';
import { UserProfile } from '@/types/user';
import { useUserCapacities } from '@/hooks/useUserCapacities';

type CapacityType = 'wanted' | 'known-and-available';

interface RecommendationCapacityCardBaseProps {
  readonly recommendation: CapacityRecommendation;
  readonly hintMessage?: string;
  readonly userProfile?: UserProfile | null;
  readonly capacityType: CapacityType;
}

export default function RecommendationCapacityCardBase({
  recommendation,
  hintMessage,
  userProfile: userProfileProp,
  capacityType,
}: RecommendationCapacityCardBaseProps) {
  const { pageContent } = useApp();
  const { darkMode } = useTheme();
  const { data: session } = useSession();
  const router = useRouter();
  const { getName, getIcon, getColor, getDescription, preloadCapacities } = useCapacityCache();
  const { showSnackbar } = useSnackbar();
  const queryClient = useQueryClient();
  const [isAdding, setIsAdding] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);

  const capacityId = recommendation.id;

  // Use userProfile from props if available, otherwise get from cache
  const userProfile =
    userProfileProp ||
    queryClient.getQueryData<UserProfile>(['userProfile', session?.user?.id, session?.user?.token]);

  // Get user capacities using custom hook
  const { userKnownCapacities, userAvailableCapacities, userWantedCapacities } =
    useUserCapacities(userProfile);

  // Check if capacity is already added based on type
  const isAdded = useMemo(() => {
    if (capacityType === 'wanted') {
      return userWantedCapacities.includes(capacityId);
    }
    // For known-and-available, check both lists
    return userKnownCapacities.includes(capacityId) && userAvailableCapacities.includes(capacityId);
  }, [
    capacityType,
    userKnownCapacities,
    userAvailableCapacities,
    userWantedCapacities,
    capacityId,
  ]);

  // Preload capacity data
  useEffect(() => {
    const loadCapacity = async () => {
      try {
        if (capacityId) {
          await preloadCapacities();
        }
      } catch (error) {
        console.error('Error preloading capacities:', error);
      }
    };
    loadCapacity();
  }, [capacityId]);

  const capacityName = useMemo(() => {
    if (typeof recommendation.name === 'string' && recommendation.name.trim().length > 0) {
      return recommendation.name;
    }
    return getName(capacityId);
  }, [recommendation.name, getName, capacityId]);

  const capacityIcon = useMemo(() => getIcon(capacityId), [getIcon, capacityId]);
  const capacityColorCategory = useMemo(
    () => recommendation.color || getColor(capacityId),
    [recommendation.color, getColor, capacityId]
  );
  const capacityDescription = useMemo(() => {
    if (
      typeof recommendation.description === 'string' &&
      recommendation.description.trim().length > 0
    ) {
      return recommendation.description;
    }
    return getDescription(capacityId);
  }, [recommendation.description, getDescription, capacityId]);

  const backgroundColor = capacityColorCategory
    ? getCapacityColor(capacityColorCategory)
    : '#0078D4';

  const handleAddToProfile = async () => {
    if (!session?.user?.token || !session?.user?.id || isAdding || isAdded || !userProfile) {
      return;
    }

    setIsAdding(true);
    try {
      // Prepare update payload based on capacity type
      const updatePayload: any = {};

      if (capacityType === 'wanted') {
        // Add to wanted list only
        const currentWanted = userWantedCapacities;
        if (!currentWanted.includes(capacityId)) {
          updatePayload.skills_wanted = [...currentWanted, capacityId].map(c => c.toString());
        }
      } else {
        // Add to both known and available lists
        const currentKnown = userKnownCapacities;
        const currentAvailable = userAvailableCapacities;

        updatePayload.skills_known = currentKnown.includes(capacityId)
          ? currentKnown.map(c => c.toString())
          : [...currentKnown, capacityId].map(c => c.toString());

        updatePayload.skills_available = currentAvailable.includes(capacityId)
          ? currentAvailable.map(c => c.toString())
          : [...currentAvailable, capacityId].map(c => c.toString());
      }

      // Include language field if it exists (required by backend)
      if (userProfile.language && Array.isArray(userProfile.language)) {
        updatePayload.language = userProfile.language;
      }

      // Start fade-out animation
      setIsRemoving(true);

      // Wait for animation
      await new Promise(resolve => setTimeout(resolve, 300));

      // Optimistically update cache
      const updatedProfile: UserProfile = { ...userProfile };
      if (capacityType === 'wanted') {
        updatedProfile.skills_wanted = updatePayload.skills_wanted;
      } else {
        updatedProfile.skills_known = updatePayload.skills_known;
        updatedProfile.skills_available = updatePayload.skills_available;
      }

      queryClient.setQueryData(
        ['userProfile', session.user.id, session.user.token],
        updatedProfile
      );

      // Update on server (non-blocking)
      profileService
        .updateProfile(Number(session.user.id), updatePayload, {
          headers: {
            Authorization: `Token ${session.user.token}`,
          },
        })
        .catch(error => {
          console.error('Error updating profile on server:', error);
        });

      showSnackbar(pageContent['capacity-added-success'] || 'Capacity added to profile', 'success');
    } catch (error: any) {
      console.error('Error adding capacity to profile:', error);
      const errorMessage =
        error?.response?.data?.error ||
        error?.message ||
        pageContent['error'] ||
        'Error adding capacity';
      showSnackbar(errorMessage, 'error');
      setIsRemoving(false);
    } finally {
      setIsAdding(false);
    }
  };

  const handleView = () => {
    router.push(`/feed?capacityId=${capacityId}`);
  };

  const iconFilter = 'brightness(0) invert(1)';

  return (
    <div
      className={`flex h-full flex-col justify-between items-start p-4 mx-auto rounded-md w-[270px] md:w-[370px] border min-h-[250px] md:min-h-[300px] transition-all duration-300 ${
        isRemoving ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
      } ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}
    >
      {hintMessage && (
        <div className="flex items-center justify-start gap-2 mb-4 w-full">
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
      <div className="w-full flex-1">
        <div className="flex items-start gap-4 mb-4 w-full">
          <div
            className="relative w-[60px] h-[60px] md:w-[80px] md:h-[80px] rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor }}
          >
            <div className="relative w-[40px] h-[40px] md:w-[50px] md:h-[50px]">
              <Image
                src={capacityIcon}
                alt={pageContent['capacity-icon'] || 'Capacity icon'}
                fill
                className="object-contain"
                style={{ filter: iconFilter }}
                priority
              />
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <h3
              className={`text-[16px] md:text-[24px] font-bold mb-1 break-words ${
                darkMode ? 'text-white' : 'text-capx-dark-box-bg'
              }`}
            >
              {capacityName}
            </h3>
            {capacityDescription && (
              <p
                className={`text-[12px] md:text-[16px] line-clamp-2 ${
                  darkMode ? 'text-gray-300' : 'text-gray-600'
                }`}
              >
                {capacityDescription}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-start gap-2 w-full mt-auto pt-2">
        {isAdded ? (
          <BaseButton
            onClick={() => {}}
            disabled
            customClass="flex justify-center items-center gap-2 px-4 py-2 rounded-lg text-[14px] font-extrabold bg-green-600 text-white md:text-[16px] md:px-6 md:py-3 opacity-75 cursor-not-allowed flex-shrink-0"
            label={`✓ ${pageContent['added'] || 'Added'}`}
          />
        ) : (
          <BaseButton
            onClick={handleAddToProfile}
            disabled={isAdding}
            customClass={`flex justify-center items-center gap-2 px-4 py-2 rounded-lg text-[14px] text-white font-extrabold bg-[#053749] hover:bg-[#04222F] md:text-[16px] md:px-6 md:py-3 flex-shrink-0 ${
              isAdding ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            label={
              isAdding
                ? pageContent['loading'] || 'Loading...'
                : pageContent['add-to-profile'] || 'Add to Profile'
            }
          />
        )}
        <BaseButton
          onClick={handleView}
          customClass={`flex justify-center items-center gap-2 px-4 py-2 rounded-lg text-[14px] font-extrabold border-2 border-[#053749] md:text-[16px] md:px-6 md:py-3 flex-shrink-0 ${
            darkMode
              ? 'text-white bg-gray-800 hover:bg-gray-700'
              : 'text-[#053749] bg-white hover:bg-gray-50'
          }`}
          label={pageContent['view'] || 'View'}
        />
      </div>
    </div>
  );
}
