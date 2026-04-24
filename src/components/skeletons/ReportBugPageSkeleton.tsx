'use client';

import { useDarkMode } from '@/stores';
import SkeletonBase from './SkeletonBase';

export default function ReportBugPageSkeleton() {
  const darkMode = useDarkMode();

  return (
    <section className="w-full flex flex-col min-h-screen pt-24 md:pt-8 gap-4 mx-auto md:max-w-[1200px]">
      {/* Banner */}
      <div className="md:max-w-[1200px] w-full max-w-sm mx-auto px-4">
        <div
          className={`w-full md:h-[350px] rounded-lg overflow-hidden flex items-center justify-center px-4 md:px-16 py-6 ${
            darkMode ? 'bg-gray-800' : 'bg-gray-200'
          }`}
        >
          <SkeletonBase className="w-[140px] h-[140px] md:w-[180px] md:h-[180px] rounded-lg" />
        </div>
      </div>

      {/* NavBar tabs */}
      <div className="w-full px-4">
        <div className="flex flex-row gap-4 border-b pb-2 md:gap-20">
          <SkeletonBase className="h-6 w-24 md:h-12 md:w-36" />
          <SkeletonBase className="h-6 w-28 md:h-12 md:w-40" />
        </div>
      </div>

      {/* Form content */}
      <div className="w-full px-4 py-4 flex flex-col gap-6">
        {/* Heading row: icon + title */}
        <div className="flex items-start gap-2">
          <SkeletonBase className="w-4 h-5 md:w-[42px] md:h-[42px] flex-shrink-0" />
          <SkeletonBase className="h-5 w-48 md:h-9 md:w-72" />
        </div>

        {/* Title field */}
        <div className="flex flex-col gap-2 md:mb-14">
          <SkeletonBase className="h-4 w-16 md:h-7 md:w-24" />
          <SkeletonBase className="h-9 w-full rounded-md md:h-16" />
        </div>

        {/* Description field */}
        <div className="flex flex-col gap-2 md:mb-14">
          <SkeletonBase className="h-4 w-24 md:h-7 md:w-36" />
          <SkeletonBase className="h-24 w-full rounded-md md:h-36" />
          <SkeletonBase className="h-3 w-3/4 md:h-5" />
        </div>

        {/* Bug type selector */}
        <div className="flex flex-col gap-2">
          <SkeletonBase className="h-4 w-32 md:h-7 md:w-48" />
          <SkeletonBase className="h-9 w-full rounded-md md:h-16" />
          <SkeletonBase className="h-3 w-2/3 md:h-5" />
        </div>

        {/* Buttons — mobile */}
        <div className="flex flex-col gap-2 md:hidden">
          <SkeletonBase className="h-9 w-full rounded-md" />
          <SkeletonBase className="h-9 w-full rounded-md" />
        </div>

        {/* Buttons — desktop */}
        <div className="hidden md:flex flex-row gap-6 w-3/4">
          <SkeletonBase className="h-14 w-full rounded-md" />
          <SkeletonBase className="h-14 w-full rounded-md" />
        </div>
      </div>
    </section>
  );
}
