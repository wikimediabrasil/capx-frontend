'use client';

import { useDarkMode } from '@/stores';
import SkeletonBase from './SkeletonBase';

export default function RecommendationProfileCardSkeleton() {
  const darkMode = useDarkMode();

  return (
    <div
      className={`flex h-full flex-col justify-between items-start p-4 rounded-md w-[270px] md:w-[370px] border min-h-[300px] md:min-h-[350px] ${
        darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      }`}
    >
      {/* Hint message row */}
      <div className="flex items-center gap-2 mb-4 w-full">
        <SkeletonBase className="w-[15px] h-[15px] md:w-[20px] md:h-[20px] rounded-full" />
        <SkeletonBase className="h-3 w-3/4" />
      </div>

      {/* Profile image */}
      <SkeletonBase className="w-full max-w-[195px] h-[115px] md:max-w-[280px] md:h-[180px] mt-4 mb-4 self-center rounded-md" />

      {/* Profile icon + name */}
      <div className="flex items-center gap-2 mb-4 w-full">
        <SkeletonBase className="w-[15px] h-[15px] md:w-[30px] md:h-[30px] rounded-full flex-shrink-0" />
        <SkeletonBase className="h-5 md:h-6 flex-1" />
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-2 w-full mt-auto">
        <SkeletonBase className="h-9 md:h-11 w-28 md:w-36 rounded-lg" />
        <SkeletonBase className="h-9 md:h-11 w-20 md:w-28 rounded-lg" />
      </div>
    </div>
  );
}
