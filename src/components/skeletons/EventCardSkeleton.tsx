'use client';

import { useDarkMode } from '@/stores';
import SkeletonBase from './SkeletonBase';

interface EventCardSkeletonProps {
  isHorizontalScroll?: boolean;
}

export default function EventCardSkeleton({ isHorizontalScroll = false }: EventCardSkeletonProps) {
  const darkMode = useDarkMode();

  return (
    <div
      className={`flex flex-col rounded rounded-[4px] p-4 min-w-[300px] h-fit ${
        darkMode
          ? 'bg-capx-dark-box-bg border border-white'
          : 'bg-capx-light-box-bg'
      }`}
    >
      <div className="flex flex-col gap-4 pr-5 mx-4 my-4 w-full">
        {/* Title */}
        <div className="flex flex-row py-2">
          <SkeletonBase className={`h-6 w-3/4 ${isHorizontalScroll ? 'min-h-[60px]' : ''}`} />
        </div>

        {/* Organized by */}
        {!isHorizontalScroll && (
          <div className="flex items-center gap-2">
            <SkeletonBase className="h-4 w-28" />
            <SkeletonBase className="h-4 w-32" />
          </div>
        )}

        <div className={`flex ${!isHorizontalScroll ? 'flex-row gap-8' : 'flex-col gap-4'}`}>
          {/* Time/Date/Location column */}
          <div className="flex flex-col gap-4 min-w-fit">
            <div className="flex flex-row gap-2 items-center">
              <SkeletonBase className="w-4 h-4 md:w-6 md:h-6 rounded-full flex-shrink-0" />
              <SkeletonBase className="h-4 w-36" />
            </div>
            <div className="flex flex-row gap-2 items-center">
              <SkeletonBase className="w-4 h-4 md:w-6 md:h-6 rounded-full flex-shrink-0" />
              <SkeletonBase className="h-4 w-40" />
            </div>
            <div className="flex flex-row gap-2 items-center">
              <SkeletonBase className="w-4 h-4 md:w-6 md:h-6 rounded-full flex-shrink-0" />
              <SkeletonBase className="h-4 w-28" />
            </div>
          </div>

          {/* Capacities column */}
          <div className="flex flex-col gap-4 mb-2">
            <div className="flex flex-row gap-2 items-center">
              <SkeletonBase className="w-4 h-4 md:w-6 md:h-6 rounded-full flex-shrink-0" />
              <SkeletonBase className="h-4 w-36" />
            </div>
            <div className="flex flex-row flex-wrap gap-2">
              <SkeletonBase className="h-7 w-20 rounded-[8px]" />
              <SkeletonBase className="h-7 w-24 rounded-[8px]" />
              <SkeletonBase className="h-7 w-16 rounded-[8px]" />
            </div>
            {/* Details button */}
            <div className="flex flex-row gap-2 justify-between mr-4">
              <SkeletonBase className="h-4 w-28" />
              <SkeletonBase className="h-4 w-4 rounded-full" />
            </div>
          </div>
        </div>

        {/* Action buttons */}
        {!isHorizontalScroll && (
          <div className="flex flex-row gap-2 my-4">
            <SkeletonBase className="h-12 w-28 rounded-lg" />
            <SkeletonBase className="h-12 w-28 rounded-lg" />
          </div>
        )}
      </div>
    </div>
  );
}
