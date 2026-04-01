'use client';

import { useDarkMode } from '@/stores';
import SkeletonBase from './SkeletonBase';

function SavedItemCardSkeleton({ darkMode }: { darkMode: boolean }) {
  return (
    <div className={`w-full rounded-lg border-[2px] p-4 flex flex-col md:flex-row gap-4 ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
      <SkeletonBase className="w-[80px] h-[80px] rounded flex-shrink-0" />
      <div className="flex flex-col gap-2 flex-1">
        <SkeletonBase className="h-5 w-40" />
        <SkeletonBase className="h-4 w-full" />
        <SkeletonBase className="h-4 w-3/4" />
      </div>
      <div className="flex flex-col gap-2 flex-shrink-0">
        <SkeletonBase className="h-9 w-28 rounded-lg" />
        <SkeletonBase className="h-9 w-28 rounded-lg" />
      </div>
    </div>
  );
}

export default function SavedItemsSkeleton() {
  const darkMode = useDarkMode();

  return (
    <div className="w-full mx-auto space-y-6">
      {Array.from({ length: 5 }).map((_, i) => (
        <SavedItemCardSkeleton key={i} darkMode={darkMode} />
      ))}
    </div>
  );
}
