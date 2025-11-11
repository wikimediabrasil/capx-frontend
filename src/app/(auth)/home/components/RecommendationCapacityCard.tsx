'use client';

import Image from 'next/image';
import { useApp } from '@/contexts/AppContext';
import { useTheme } from '@/contexts/ThemeContext';
import BaseButton from '@/components/BaseButton';
import { CapacityRecommendation } from '@/types/recommendation';
import { useCapacityCache } from '@/contexts/CapacityCacheContext';
import { getCapacityColor } from '@/lib/utils/capacitiesUtils';
import lamp_purple from '@/public/static/images/lamp_purple.svg';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import LoadingSpinner from '@/components/LoadingSpinner';

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
  const { getName, getIcon, getColor, getDescription, preloadCapacities } = useCapacityCache();
  const [isLoading, setIsLoading] = useState(true);

  const capacityId = recommendation.id;
  
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

  const capacityName = recommendation.name || getName(capacityId);
  const capacityIcon = recommendation.icon || getIcon(capacityId);
  const capacityColorCategory = recommendation.color || getColor(capacityId);
  const capacityDescription = recommendation.description || getDescription(capacityId);
  
  // Get background color from capacity color category (e.g., "organizational" -> "#0078D4")
  const backgroundColor = capacityColorCategory ? getCapacityColor(capacityColorCategory) : '#0078D4';

  const handleAddToProfile = () => {
    if (onAddToProfile) {
      onAddToProfile(recommendation.id);
    }
  };

  const handleView = () => {
    router.push(`/feed?capacityId=${capacityId}`);
  };

  if (isLoading) {
    return (
      <div className={`flex flex-col justify-center items-center p-4 mx-auto rounded-md w-[270px] md:w-[370px] border min-h-[250px] md:min-h-[300px] ${
        darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      }`}>
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className={`flex flex-col justify-between items-start p-4 mx-auto rounded-md w-[270px] md:w-[370px] border min-h-[250px] md:min-h-[300px] ${
      darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
    }`}>
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
        <BaseButton
          onClick={handleAddToProfile}
          customClass="flex justify-center items-center gap-2 px-4 py-2 rounded-lg text-[14px] text-white font-extrabold bg-[#053749] hover:bg-[#04222F] md:text-[16px] md:px-6 md:py-3"
          label={pageContent['add-to-profile'] || 'Add to Profile'}
        />
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
    </div>
  );
}

