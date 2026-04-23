'use client';

import SkeletonBase from './SkeletonBase';
import { useDarkMode } from '@/stores';

function BadgeCardSkeleton({ darkMode }: { darkMode: boolean }) {
  return (
    <div
      className={`p-4 rounded-lg flex flex-col items-center gap-3 ${
        darkMode ? 'bg-capx-dark-box-bg' : 'bg-[#F6F6F6]'
      }`}
    >
      {/* Badge image */}
      <SkeletonBase className="w-24 h-24 md:w-32 md:h-32 rounded-lg" />
      {/* Badge name */}
      <SkeletonBase className="h-5 w-28" />
      {/* Badge description */}
      <SkeletonBase className="h-3 w-full" />
      <SkeletonBase className="h-3 w-5/6" />
      {/* Progress bar */}
      <SkeletonBase className="h-3 w-full rounded-full mt-auto" />
    </div>
  );
}

export default function BadgesPageSkeleton() {
  const darkMode = useDarkMode();

  return (
    <main
      className={`w-full max-w-screen-xl mx-auto px-4 py-8 min-h-screen mt-[80px] ${
        darkMode ? 'bg-capx-dark-bg' : 'bg-white'
      }`}
    >
      <div className="flex flex-col gap-4">
        {/* Welcome text */}
        <SkeletonBase className="h-5 w-48" />

        {/* User name row */}
        <div className="flex items-center gap-2">
          <SkeletonBase className="w-6 h-6 rounded-full" />
          <SkeletonBase className="h-6 w-36" />
        </div>

        {/* Avatar section */}
        <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
          <SkeletonBase className="w-32 h-32 mx-auto rounded-lg" />
        </div>

        {/* Back button */}
        <SkeletonBase className="h-10 w-full rounded-md" />

        {/* Badges grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <BadgeCardSkeleton key={i} darkMode={darkMode} />
          ))}
        </div>
      </div>
    </main>
  );
}
