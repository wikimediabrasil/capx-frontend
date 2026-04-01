'use client';

import { useDarkMode, useIsMobile } from '@/stores';
import SkeletonBase from './SkeletonBase';

export default function ProfileHeaderSkeleton() {
  const darkMode = useDarkMode();
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <div className="flex flex-col gap-4">
        {/* Avatar */}
        <SkeletonBase className="w-[100px] h-[100px] rounded-[4px]" />
        {/* Welcome text */}
        <SkeletonBase className="h-7 w-48" />
        {/* Username row */}
        <div className="flex items-center gap-2">
          <SkeletonBase className="w-5 h-5 rounded-full" />
          <SkeletonBase className="h-6 w-32" />
        </div>
        {/* Buttons */}
        <div className="flex flex-col gap-2">
          <SkeletonBase className="h-9 w-full rounded-[8px]" />
          <SkeletonBase className="h-9 w-full rounded-[8px]" />
          <SkeletonBase className="h-9 w-full rounded-[8px]" />
        </div>
      </div>
    );
  }

  return (
    <div
      className={`flex flex-row gap-8 md:gap-12 lg:gap-[96px] mb-8 md:mb-12 lg:mb-[96px] flex-wrap`}
    >
      {/* Avatar */}
      <SkeletonBase className="w-[200px] h-[200px] md:w-[250px] md:h-[250px] flex-shrink-0 rounded" />

      {/* Info column */}
      <div className="flex flex-col gap-6 flex-1 min-w-0">
        {/* Welcome heading */}
        <SkeletonBase className="h-10 md:h-12 lg:h-14 w-3/4" />
        {/* Username row */}
        <div className="flex items-center gap-2">
          <SkeletonBase className="w-10 h-10 rounded-full flex-shrink-0" />
          <SkeletonBase className="h-6 md:h-7 w-40" />
        </div>
        {/* Buttons */}
        <div className="flex flex-col gap-2 w-full">
          <SkeletonBase className="h-11 md:h-12 w-full rounded-[8px]" />
          <SkeletonBase className="h-11 md:h-12 w-full rounded-[8px]" />
          <SkeletonBase className="h-11 md:h-12 w-full rounded-[8px]" />
        </div>
      </div>
    </div>
  );
}
