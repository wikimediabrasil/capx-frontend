'use client';

import { useDarkMode } from '@/stores';
import SkeletonBase from './SkeletonBase';

export default function RecommendationCapacityCardSkeleton() {
  const darkMode = useDarkMode();

  return (
    <div
      className={`flex h-full flex-col justify-between items-start p-4 mx-auto rounded-md w-[270px] md:w-[370px] border min-h-[250px] md:min-h-[300px] ${
        darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      }`}
    >
      {/* Hint message */}
      <div className="flex items-center gap-2 mb-4 w-full">
        <SkeletonBase className="w-[15px] h-[15px] md:w-[20px] md:h-[20px] rounded-full" />
        <SkeletonBase className="h-3 w-3/4" />
      </div>

      {/* Icon + name + description */}
      <div className="w-full flex-1">
        <div className="flex items-start gap-4 mb-4 w-full">
          {/* Colored icon box */}
          <SkeletonBase className="w-[60px] h-[60px] md:w-[80px] md:h-[80px] rounded-lg flex-shrink-0" />
          <div className="flex-1 min-w-0 flex flex-col gap-2">
            <SkeletonBase className="h-6 md:h-8 w-3/4" />
            <SkeletonBase className="h-4 w-full" />
            <SkeletonBase className="h-4 w-5/6" />
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-2 w-full mt-auto pt-2">
        <SkeletonBase className="h-9 md:h-11 w-28 md:w-36 rounded-lg flex-shrink-0" />
        <SkeletonBase className="h-9 md:h-11 w-16 md:w-20 rounded-lg flex-shrink-0" />
      </div>
    </div>
  );
}
