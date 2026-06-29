'use client';

import SkeletonBase from './SkeletonBase';
import EventCardSkeleton from './EventCardSkeleton';

export default function EventsSectionSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      <SkeletonBase className="h-6 w-32" />
      <div className="flex flex-row gap-4 overflow-hidden">
        {Array.from({ length: 3 }).map((_, i) => (
          <EventCardSkeleton key={i} isHorizontalScroll />
        ))}
      </div>
    </div>
  );
}
