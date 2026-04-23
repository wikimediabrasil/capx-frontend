'use client';

import SkeletonBase from './SkeletonBase';

export default function MessagePageSkeleton() {
  return (
    <section className="w-full flex flex-col min-h-screen gap-4 pt-24 md:pt-8 mx-auto md:max-w-[1200px]">
      {/* Banner */}
      <div className="flex flex-row items-center gap-4 px-4">
        <SkeletonBase className="w-16 h-16 rounded-lg flex-shrink-0" />
        <SkeletonBase className="h-8 w-48" />
      </div>

      {/* Nav tabs */}
      <div className="flex flex-row gap-20 px-4 pb-4 md:pb-14">
        <SkeletonBase className="h-8 w-24" />
        <SkeletonBase className="h-8 w-24" />
      </div>

      {/* Form area */}
      <div className="flex flex-col gap-4 px-4">
        {/* To field */}
        <div className="flex flex-col gap-2">
          <SkeletonBase className="h-4 w-16" />
          <SkeletonBase className="h-10 w-full rounded-lg" />
        </div>

        {/* Subject field */}
        <div className="flex flex-col gap-2">
          <SkeletonBase className="h-4 w-20" />
          <SkeletonBase className="h-10 w-full rounded-lg" />
        </div>

        {/* Message body */}
        <div className="flex flex-col gap-2">
          <SkeletonBase className="h-4 w-24" />
          <SkeletonBase className="h-32 w-full rounded-lg" />
        </div>

        {/* Submit button */}
        <SkeletonBase className="h-10 w-32 rounded-lg self-end" />
      </div>
    </section>
  );
}
