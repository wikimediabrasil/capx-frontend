'use client';

import SkeletonBase from './SkeletonBase';

function FormSectionSkeleton() {
  return (
    <div className="flex flex-col gap-3">
      <SkeletonBase className="h-5 w-36" />
      <SkeletonBase className="h-10 w-full rounded-lg" />
    </div>
  );
}

function FormTextareaSkeleton() {
  return (
    <div className="flex flex-col gap-3">
      <SkeletonBase className="h-5 w-36" />
      <SkeletonBase className="h-24 w-full rounded-lg" />
    </div>
  );
}

export default function ProfileEditSkeleton() {
  return (
    <div className="w-full max-w-screen-xl mx-auto px-4 md:px-12 py-8 mt-[80px] md:mt-[64px]">
      <div className="flex flex-col gap-8 md:mx-[80px]">
        {/* Header: avatar + name */}
        <div className="flex flex-col md:flex-row gap-6 items-start">
          <SkeletonBase className="w-[100px] h-[100px] md:w-[160px] md:h-[160px] rounded-[4px] flex-shrink-0" />
          <div className="flex flex-col gap-4 flex-1">
            <SkeletonBase className="h-8 w-48" />
            <SkeletonBase className="h-10 w-36 rounded-[8px]" />
          </div>
        </div>

        {/* Form fields */}
        <div className="flex flex-col gap-6">
          <FormTextareaSkeleton />
          <FormSectionSkeleton />
          <FormSectionSkeleton />
          <FormSectionSkeleton />
          <FormSectionSkeleton />
        </div>

        {/* Capacities section */}
        <div className="flex flex-col gap-4">
          <SkeletonBase className="h-6 w-40" />
          <div className="flex flex-wrap gap-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonBase key={i} className="h-8 w-24 rounded-full" />
            ))}
          </div>
        </div>

        {/* Languages section */}
        <div className="flex flex-col gap-4">
          <SkeletonBase className="h-6 w-32" />
          <div className="flex flex-wrap gap-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <SkeletonBase key={i} className="h-8 w-20 rounded-full" />
            ))}
          </div>
        </div>

        {/* Save button */}
        <SkeletonBase className="h-12 w-full md:w-48 rounded-[8px]" />
      </div>
    </div>
  );
}
