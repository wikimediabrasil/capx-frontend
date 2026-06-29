'use client';

import { useDarkMode } from '@/stores';
import SkeletonBase from './SkeletonBase';

export default function MentorshipProgramCardSkeleton() {
  const darkMode = useDarkMode();

  return (
    <div
      className={`flex flex-col p-4 md:p-6 rounded-lg border ${
        darkMode ? 'bg-capx-dark-box-bg border-gray-700' : 'bg-white border-gray-200'
      }`}
    >
      {/* Logo */}
      <div className="mb-4 flex justify-center">
        <SkeletonBase className="w-20 h-20 md:w-24 md:h-24 rounded-lg" />
      </div>

      {/* Location + status */}
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          <SkeletonBase className="w-4 h-4 rounded-full" />
          <SkeletonBase className="h-4 w-28" />
        </div>
        <SkeletonBase className="h-5 w-16 rounded-full" />
      </div>

      {/* Registration period */}
      <div className="mb-3 flex flex-col gap-1">
        <SkeletonBase className="h-3 w-28" />
        <SkeletonBase className="h-3 w-40" />
      </div>

      {/* Description */}
      <div className="mb-4 flex flex-col gap-2">
        <SkeletonBase className="h-3 w-full" />
        <SkeletonBase className="h-3 w-full" />
        <SkeletonBase className="h-3 w-5/6" />
        <SkeletonBase className="h-3 w-4/6" />
      </div>

      {/* Attributes */}
      <div className="space-y-3 mb-4">
        {/* Format */}
        <div className="flex items-center gap-2">
          <SkeletonBase className="w-4 h-4 rounded-full" />
          <SkeletonBase className="h-3 w-24" />
        </div>

        {/* Capacities */}
        <div>
          <SkeletonBase className="h-3 w-16 mb-1" />
          <div className="flex flex-wrap gap-2">
            <SkeletonBase className="h-6 w-20 rounded-md" />
            <SkeletonBase className="h-6 w-24 rounded-md" />
            <SkeletonBase className="h-6 w-16 rounded-md" />
          </div>
        </div>

        {/* Languages */}
        <div className="flex items-start gap-2">
          <SkeletonBase className="w-4 h-4 rounded-full flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <SkeletonBase className="h-3 w-16 mb-1" />
            <div className="flex flex-wrap gap-1">
              <SkeletonBase className="h-5 w-14 rounded" />
              <SkeletonBase className="h-5 w-14 rounded" />
            </div>
          </div>
        </div>

        {/* Subscribers */}
        <div className="flex items-center gap-2">
          <SkeletonBase className="w-4 h-4 rounded-full" />
          <SkeletonBase className="h-3 w-24" />
        </div>
      </div>

      {/* Subscribe button */}
      <div className="flex gap-2 mt-auto">
        <SkeletonBase className="h-9 flex-1 rounded-lg" />
      </div>
    </div>
  );
}
