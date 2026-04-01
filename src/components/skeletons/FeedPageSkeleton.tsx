'use client';

import { useDarkMode } from '@/stores';
import SkeletonBase from './SkeletonBase';
import ProfileCardSkeleton from './ProfileCardSkeleton';

export default function FeedPageSkeleton() {
  const darkMode = useDarkMode();

  return (
    <div className="w-full flex flex-col gap-6">
      {/* Search bar */}
      <SkeletonBase className="h-10 w-full rounded-lg" />

      {/* Filters row */}
      <div className="flex flex-row flex-wrap gap-3">
        <SkeletonBase className="h-8 w-28 rounded-full" />
        <SkeletonBase className="h-8 w-32 rounded-full" />
        <SkeletonBase className="h-8 w-24 rounded-full" />
        <SkeletonBase className="h-8 w-36 rounded-full" />
      </div>

      {/* Profile cards */}
      <div className="flex flex-col gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <ProfileCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
