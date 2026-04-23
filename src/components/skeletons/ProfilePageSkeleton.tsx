'use client';

import SkeletonBase from './SkeletonBase';
import ProfileHeaderSkeleton from './ProfileHeaderSkeleton';

function ProfileSectionSkeleton() {
  return (
    <div className="flex flex-col gap-3">
      {/* Section title */}
      <div className="flex items-center gap-2">
        <SkeletonBase className="w-5 h-5 rounded-full" />
        <SkeletonBase className="h-5 w-32" />
      </div>
      {/* Section items */}
      <div className="flex flex-col gap-2 pl-7">
        <SkeletonBase className="h-4 w-full" />
        <SkeletonBase className="h-4 w-5/6" />
        <SkeletonBase className="h-4 w-3/4" />
      </div>
    </div>
  );
}

export default function ProfilePageSkeleton() {
  return (
    <div className="w-full max-w-screen-xl mx-auto px-4 py-8 mt-[80px] md:mt-0 md:pb-6 md:pt-10 md:px-8 lg:px-12">
      <div className="flex flex-col gap-8 max-w-[600px] mx-auto md:max-w-full">
        {/* Profile header */}
        <ProfileHeaderSkeleton />

        {/* Mini bio */}
        <div className="flex flex-col gap-2">
          <SkeletonBase className="h-4 w-full" />
          <SkeletonBase className="h-4 w-5/6" />
          <SkeletonBase className="h-4 w-4/6" />
        </div>

        {/* Profile sections */}
        <div className="flex flex-col gap-8">
          <ProfileSectionSkeleton />
          <ProfileSectionSkeleton />
          <ProfileSectionSkeleton />
          <ProfileSectionSkeleton />
        </div>

        {/* Badges section */}
        <div className="flex flex-col gap-3">
          <SkeletonBase className="h-5 w-24" />
          <div className="flex flex-row gap-3 overflow-hidden">
            {Array.from({ length: 4 }).map((_, i) => (
              <SkeletonBase key={i} className="w-16 h-16 md:w-20 md:h-20 rounded-full flex-shrink-0" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
