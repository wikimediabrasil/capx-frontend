'use client';

import { useDarkMode } from '@/stores';
import SkeletonBase from './SkeletonBase';

function StatCardSkeleton() {
  return (
    <div className="flex flex-col gap-2">
      <SkeletonBase className="h-4 w-24" />
      <SkeletonBase className="h-8 w-16" />
      <SkeletonBase className="h-3 w-20" />
    </div>
  );
}

export default function AnalyticsDashboardSkeleton() {
  const darkMode = useDarkMode();

  return (
    <section className="w-full flex flex-col min-h-screen gap-4 pt-24 md:pt-8 mx-auto md:max-w-[1200px]">
      {/* Banner */}
      <SkeletonBase className="w-full h-[100px] md:h-[120px] rounded-lg" />

      {/* Stats row */}
      <div className="flex flex-row justify-between md:justify-start gap-10 md:gap-60 py-8 px-4 w-full">
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
      </div>

      {/* World map section */}
      <div className="flex flex-col px-4 w-full gap-4 mt-[40px]">
        {/* Map title */}
        <SkeletonBase className="h-6 w-64" />

        {/* World map */}
        <SkeletonBase className="w-full h-[280px] md:h-[450px] rounded-lg" />

        {/* View mode toggles */}
        <div className="flex flex-row gap-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <SkeletonBase key={i} className="h-9 w-28 rounded-full" />
          ))}
        </div>
      </div>

      {/* Capacity cards section */}
      <div className="flex flex-col px-4 w-full gap-4 mt-[40px]">
        <SkeletonBase className="h-6 w-48" />
        <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4`}>
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className={`rounded-lg p-4 flex flex-col gap-3 ${darkMode ? 'bg-gray-800' : 'bg-[#EFEFEF]'}`}
            >
              <SkeletonBase className="h-5 w-3/4" />
              <SkeletonBase className="h-4 w-full" />
              <SkeletonBase className="h-4 w-5/6" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
