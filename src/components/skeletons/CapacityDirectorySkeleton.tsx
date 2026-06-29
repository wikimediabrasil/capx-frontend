'use client';

import SkeletonBase from './SkeletonBase';

function CapacityCardSkeleton() {
  return (
    <div className="flex flex-col gap-3 p-4 rounded-lg">
      {/* Color band + icon + title */}
      <div className="flex items-center gap-3">
        <SkeletonBase className="w-10 h-10 rounded-lg flex-shrink-0" />
        <SkeletonBase className="h-6 w-48" />
      </div>
      {/* Sub-cards row */}
      <div className="flex flex-row gap-3 mt-2 overflow-hidden">
        {Array.from({ length: 4 }).map((_, i) => (
          <SkeletonBase key={i} className="h-10 w-32 rounded-lg flex-shrink-0" />
        ))}
      </div>
    </div>
  );
}

export default function CapacityDirectorySkeleton() {
  return (
    <div className="w-full flex flex-col gap-8 py-8 px-4 lg:px-12 max-w-screen-xl mx-auto">
      {/* Banner */}
      <div className="flex flex-row items-center gap-4">
        <SkeletonBase className="w-16 h-16 rounded-lg flex-shrink-0" />
        <SkeletonBase className="h-8 w-64" />
      </div>

      {/* Description typewriter area */}
      <div className="flex flex-col items-center gap-2">
        <SkeletonBase className="h-6 w-80" />
        <SkeletonBase className="h-6 w-48" />
      </div>

      {/* Search bar */}
      <SkeletonBase className="h-12 w-full rounded-lg" />

      {/* Visualization mode switcher */}
      <div className="flex flex-row gap-2 w-full rounded-2xl p-2">
        <SkeletonBase className="flex-1 h-[52px] rounded-xl" />
        <SkeletonBase className="flex-1 h-[52px] rounded-xl" />
        <SkeletonBase className="flex-1 h-[52px] rounded-xl" />
      </div>

      {/* Capacity cards */}
      <div className="flex flex-col gap-10">
        {Array.from({ length: 5 }).map((_, i) => (
          <CapacityCardSkeleton key={i} />
        ))}
      </div>

      {/* Suggest link */}
      <SkeletonBase className="h-4 w-64 self-center" />
    </div>
  );
}
