'use client';

import { useDarkMode } from '@/stores';
import SkeletonBase from './SkeletonBase';

export default function ProfileCardSkeleton() {
  const darkMode = useDarkMode();

  return (
    <div
      className={`w-full rounded-lg border-[2px] ${
        darkMode ? 'border-gray-700' : 'border-gray-200'
      }`}
    >
      <div className="p-5">
        <div className="md:grid md:grid-cols-[350px_1fr] md:gap-8">
          {/* Left column */}
          <div>
            <div className={`rounded-lg p-4 ${darkMode ? 'bg-capx-dark-bg' : 'bg-[#EFEFEF]'}`}>
              {/* Type badge */}
              <div className="flex justify-start mb-4">
                <SkeletonBase className="h-6 w-20" />
              </div>
              {/* Avatar */}
              <div className="flex flex-col items-center mb-6">
                <SkeletonBase className="w-[100px] h-[100px] md:w-[200px] md:h-[200px] rounded-[4px]" />
              </div>
            </div>
            {/* Username */}
            <div className="mt-4 mb-6 flex items-center justify-center">
              <SkeletonBase className="h-7 md:h-9 w-32 md:w-48" />
            </div>
            {/* Desktop buttons */}
            <div className="hidden md:flex flex-col gap-2">
              <SkeletonBase className="h-12 w-full" />
              <SkeletonBase className="h-12 w-full mt-[6px]" />
            </div>
          </div>

          {/* Right column */}
          <div className="mt-4 md:mt-0 flex flex-col gap-4">
            {/* Capacities section */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <SkeletonBase className="w-5 h-5 rounded-full" />
                <SkeletonBase className="h-4 w-36" />
              </div>
              <div className="flex flex-col gap-1 pl-7">
                <SkeletonBase className="h-4 w-full" />
                <SkeletonBase className="h-4 w-5/6" />
                <SkeletonBase className="h-4 w-4/6" />
              </div>
            </div>

            {/* Languages section */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <SkeletonBase className="w-5 h-5 rounded-full" />
                <SkeletonBase className="h-4 w-24" />
              </div>
              <div className="flex flex-col gap-1 pl-7">
                <SkeletonBase className="h-4 w-3/4" />
              </div>
            </div>

            {/* Territory section */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <SkeletonBase className="w-5 h-5 rounded-full" />
                <SkeletonBase className="h-4 w-20" />
              </div>
              <div className="flex flex-col gap-1 pl-7">
                <SkeletonBase className="h-4 w-1/2" />
              </div>
            </div>

            {/* Mobile buttons */}
            <div className="flex md:hidden flex-row gap-1 mt-2">
              <SkeletonBase className="w-8 h-8 rounded-full" />
              <SkeletonBase className="w-8 h-8 rounded-full" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
