'use client';

import SkeletonBase from './SkeletonBase';
import EventCardSkeleton from './EventCardSkeleton';

export default function EventsPageSkeleton() {
  return (
    <div className="w-full flex flex-col gap-6">
      {/* Search + filter row */}
      <div className="flex flex-row gap-3 items-center">
        <SkeletonBase className="h-10 flex-1 rounded-lg" />
        <SkeletonBase className="h-10 w-10 rounded-lg flex-shrink-0" />
      </div>

      {/* Filter chips */}
      <div className="flex flex-row flex-wrap gap-3">
        <SkeletonBase className="h-8 w-24 rounded-full" />
        <SkeletonBase className="h-8 w-28 rounded-full" />
        <SkeletonBase className="h-8 w-20 rounded-full" />
      </div>

      {/* Events grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <EventCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
