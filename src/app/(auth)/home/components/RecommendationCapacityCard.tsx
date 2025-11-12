'use client';

import Image from 'next/image';
import { useApp } from '@/contexts/AppContext';
import { useTheme } from '@/contexts/ThemeContext';
import BaseButton from '@/components/BaseButton';
import { CapacityRecommendation } from '@/types/recommendation';
import { useCapacityCache } from '@/contexts/CapacityCacheContext';
import { getCapacityColor } from '@/lib/utils/capacitiesUtils';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { useSession } from 'next-auth/react';
import { profileService } from '@/services/profileService';
import { userService } from '@/services/userService';
import { useSnackbar } from '@/app/providers/SnackbarProvider';
import CapacitySelectionModal from '@/components/CapacitySelectionModal';
import LoadingSpinner from '@/components/LoadingSpinner';
// Using a simple check mark - we'll use text or find an alternative icon

interface RecommendationCapacityCardProps {
  recommendation: CapacityRecommendation;
  onAddToProfile?: (id: number) => void;
}

export default function RecommendationCapacityCard({
  recommendation,
  onAddToProfile,
}: RecommendationCapacityCardProps) {
  const { pageContent } = useApp();
  const { darkMode } = useTheme();
  const router = useRouter();
  const { data: session } = useSession();
  const { getName, getIcon, getColor, getDescription, preloadCapacities, getCapacity } = useCapacityCache();
  const { showSnackbar } = useSnackbar();
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [isAdded, setIsAdded] = useState(false);
  const [showCapacityModal, setShowCapacityModal] = useState(false);
  const [userWantedCapacities, setUserWantedCapacities] = useState<number[]>([]);

  const capacityId = recommendation.id;
  
  // Check if capacity is already in user's wanted list
  useEffect(() => {
    const checkIfAdded = async () => {
      if (!session?.user?.token || !session?.user?.id) {
        return;
      }

      try {
        const userProfile = await userService.fetchUserProfile(
          Number(session.user.id),
          session.user.token
        );
        if (userProfile) {
          const wanted = (userProfile.skills_wanted || [])
            .map(c => typeof c === 'string' ? parseInt(c, 10) : c)
            .filter(c => !isNaN(c)) as number[];
          setUserWantedCapacities(wanted);
          setIsAdded(wanted.includes(capacityId));
        }
      } catch (error) {
        console.error('Error checking if capacity is added:', error);
      }
    };

    checkIfAdded();
  }, [session?.user?.token, session?.user?.id, capacityId]);
  
  // Preload capacity data
  useEffect(() => {
    const loadCapacity = async () => {
      if (capacityId) {
        await preloadCapacities();
        setIsLoading(false);
      }
    };
    loadCapacity();
  }, [capacityId, preloadCapacities]);

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
    if (typeof recommendation.description === 'string' && recommendation.description.trim().length > 0) {
      return recommendation.description;
    }
    return getDescription(capacityId);
  }, [recommendation.description, getDescription, capacityId]);
  
  // Get background color from capacity color category (e.g., "organizational" -> "#0078D4")
  const backgroundColor = capacityColorCategory ? getCapacityColor(capacityColorCategory) : '#0078D4';

  const handleAddToProfile = async () => {
    if (!session?.user?.token || !session?.user?.id || isAdding || isAdded) {
      return;
    }

    setIsAdding(true);
    try {
      // Fetch current user profile
      const userProfile = await userService.fetchUserProfile(
        Number(session.user.id),
        session.user.token
      );

      if (!userProfile) {
        showSnackbar(pageContent['error'] || 'Error loading profile', 'error');
        setIsAdding(false);
        return;
      }

      // Get current wanted capacities and convert to numbers for comparison
      const currentWanted = (userProfile.skills_wanted || [])
        .map(c => typeof c === 'string' ? parseInt(c, 10) : c)
        .filter(c => !isNaN(c)) as number[];

      // Add capacity if not already present
      if (!currentWanted.includes(capacityId)) {
        // Convert back to strings for the API (as UserProfile expects string[])
        const updatedWanted = [...currentWanted, capacityId].map(c => c.toString());

        // Prepare update payload - only send the fields that need to be updated
        const updatePayload = {
          skills_wanted: updatedWanted,
        };

        // Update profile
        await profileService.updateProfile(
          Number(session.user.id),
          updatePayload,
          {
            headers: {
              Authorization: `Token ${session.user.token}`,
            },
          }
        );

        setIsAdded(true);
        setUserWantedCapacities([...currentWanted, capacityId]);
        showSnackbar(pageContent['capacity-added-success'] || 'Capacity added to profile', 'success');
        
        if (onAddToProfile) {
          onAddToProfile(capacityId);
        }
      } else {
        // Already added
        setIsAdded(true);
      }
    } catch (error: any) {
      console.error('Error adding capacity to profile:', error);
      const errorMessage = error?.response?.data?.error || error?.message || pageContent['error'] || 'Error adding capacity';
      showSnackbar(errorMessage, 'error');
    } finally {
      setIsAdding(false);
    }
  };

  const handleView = () => {
    setShowCapacityModal(true);
  };

  const handleCapacitySelect = (selectedCapacities: any[]) => {
    // This is called when a capacity is selected in the modal
    // We can use this to navigate or perform other actions
    setShowCapacityModal(false);
  };

  const iconFilter = 'brightness(0) invert(1)';

  if (isLoading) {
    return (
      <div
        className={`flex h-full flex-col justify-center items-center p-4 mx-auto rounded-md w-[270px] md:w-[370px] border min-h-[250px] md:min-h-[300px] ${
          darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        }`}
      >
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div
      className={`flex h-full flex-col justify-between items-start p-4 mx-auto rounded-md w-[270px] md:w-[370px] border min-h-[250px] md:min-h-[300px] ${
        darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      }`}
    >
      <div className="w-full flex-1">
        <div className="flex items-start gap-4 mb-4 w-full">
          <div 
            className="relative w-[60px] h-[60px] md:w-[80px] md:h-[80px] rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor }}
          >
            <div className="relative w-[40px] h-[40px] md:w-[50px] md:h-[50px]">
              <Image
                src={capacityIcon}
                alt={capacityName}
                fill
                className="object-contain"
                style={{ filter: iconFilter }}
                priority
              />
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className={`text-[16px] md:text-[24px] font-bold mb-1 break-words ${
              darkMode ? 'text-white' : 'text-capx-dark-box-bg'
            }`}>
              {capacityName}
            </h3>
            {capacityDescription && (
              <p className={`text-[12px] md:text-[16px] line-clamp-2 ${
                darkMode ? 'text-gray-300' : 'text-gray-600'
              }`}>
                {capacityDescription}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-start gap-2 w-full mt-auto">
        {isAdded ? (
          <BaseButton
            onClick={() => {}}
            disabled
            customClass="flex justify-center items-center gap-2 px-4 py-2 rounded-lg text-[14px] font-extrabold bg-green-600 text-white md:text-[16px] md:px-6 md:py-3 opacity-75 cursor-not-allowed"
            label={`✓ ${pageContent['added'] || 'Added'}`}
          />
        ) : (
          <BaseButton
            onClick={handleAddToProfile}
            disabled={isAdding}
            customClass={`flex justify-center items-center gap-2 px-4 py-2 rounded-lg text-[14px] text-white font-extrabold bg-[#053749] hover:bg-[#04222F] md:text-[16px] md:px-6 md:py-3 ${
              isAdding ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            label={isAdding ? (pageContent['loading'] || 'Loading...') : (pageContent['add-to-profile'] || 'Add to Profile')}
          />
        )}
        <BaseButton
          onClick={handleView}
          customClass={`flex justify-center items-center gap-2 px-4 py-2 rounded-lg text-[14px] font-extrabold border-2 border-[#053749] md:text-[16px] md:px-6 md:py-3 ${
            darkMode 
              ? 'text-white bg-gray-800 hover:bg-gray-700' 
              : 'text-[#053749] bg-white hover:bg-gray-50'
          }`}
          label={pageContent['view'] || 'View'}
        />
      </div>

      <CapacitySelectionModal
        isOpen={showCapacityModal}
        onClose={() => setShowCapacityModal(false)}
        onSelect={handleCapacitySelect}
        title={capacityName || (pageContent['select-capacity'] || 'Select Capacity')}
        allowMultipleSelection={false}
      />
    </div>
  );
}

