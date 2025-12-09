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
import { UserProfile } from '@/types/profile';

interface RecommendationCapacityCardProps {
  recommendation: CapacityRecommendation;
  hintMessage?: string;
  userProfile?: UserProfile | null;
}

export default function RecommendationCapacityCard({
  recommendation,
  hintMessage,
  userProfile: userProfileProp,
}: RecommendationCapacityCardProps) {
  const { pageContent } = useApp();
  const { darkMode } = useTheme();
  const { data: session } = useSession();
  const router = useRouter();
  const { getName, getIcon, getColor, getDescription, preloadCapacities, getCapacity } =
    useCapacityCache();
  const { showSnackbar } = useSnackbar();
  const queryClient = useQueryClient();
  const [isAdding, setIsAdding] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);

  const capacityId = recommendation.id;

  // Use userProfile from props if available, otherwise get from cache
  const userProfile =
    userProfileProp ||
    queryClient.getQueryData<UserProfile>(['userProfile', session?.user?.id, session?.user?.token]);

  // Check if capacity is already in user's wanted list
  const userWantedCapacities = useMemo(() => {
    if (!userProfile) return [];
    return (userProfile.skills_wanted || [])
      .map(c => (typeof c === 'string' ? parseInt(c, 10) : c))
      .filter(c => !isNaN(c)) as number[];
  }, [userProfile]);

  const isAdded = useMemo(() => {
    return userWantedCapacities.includes(capacityId);
  }, [userWantedCapacities, capacityId]);

  // Preload capacity data
  useEffect(() => {
    const loadCapacity = async () => {
      try {
        if (capacityId) {
          await preloadCapacities();
        }
      } catch (error) {
        // Silently handle errors - component should still render
        console.error('Error preloading capacities:', error);
      }
    };
    loadCapacity();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [capacityId]); // preloadCapacities is stable from context, no need to include in deps

  const capacityName = useMemo(() => {
    if (typeof recommendation.name === 'string' && recommendation.name.trim().length > 0) {
      return recommendation.name;
    }
    const resolvedName = getName(capacityId);
    return resolvedName;
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

  // Get background color from capacity color category (e.g., "organizational" -> "#0078D4")
  const backgroundColor = capacityColorCategory
    ? getCapacityColor(capacityColorCategory)
    : '#0078D4';

  const handleAddToProfile = async () => {
    if (!session?.user?.token || !session?.user?.id || isAdding || isAdded || !userProfile) {
      return;
    }

    setIsAdding(true);
    try {
      // Get current wanted capacities and convert to numbers for comparison
      const currentWanted = userWantedCapacities;

      // Add capacity if not already present
      if (!currentWanted.includes(capacityId)) {
        // Convert back to strings for the API (as UserProfile expects string[])
        const updatedWanted = [...currentWanted, capacityId].map(c => c.toString());

        // Prepare update payload - include language field as it's required by the backend
        const updatePayload: any = {
          skills_wanted: updatedWanted,
        };

        // Include language field if it exists in the current profile (required by backend)
        if (userProfile.language && Array.isArray(userProfile.language)) {
          updatePayload.language = userProfile.language;
        }

        // Start fade-out animation
        setIsRemoving(true);

        // Wait for animation to complete before updating cache
        await new Promise(resolve => setTimeout(resolve, 300));

        // Optimistically update the cache AFTER animation
        queryClient.setQueryData(['userProfile', session.user.id, session.user.token], {
          ...userProfile,
          skills_wanted: updatedWanted,
        });

        // Update profile on the server (non-blocking)
        profileService
          .updateProfile(Number(session.user.id), updatePayload, {
            headers: {
              Authorization: `Token ${session.user.token}`,
            },
          })
          .catch(error => {
            console.error('Error updating profile on server:', error);
          });

        showSnackbar(
          pageContent['capacity-added-success'] || 'Capacity added to profile',
          'success'
        );
      }
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
    // Redirect to feed page with capacity filter
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
