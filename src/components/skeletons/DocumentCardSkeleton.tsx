'use client';

import { useDarkMode } from '@/stores';
import SkeletonBase from './SkeletonBase';

interface DocumentCardSkeletonProps {
  isSingle?: boolean;
}

export default function DocumentCardSkeleton({ isSingle = false }: DocumentCardSkeletonProps) {
  const darkMode = useDarkMode();

  return (
    <div
      className={`rounded-[16px] flex-shrink-0 flex flex-col h-fit ${darkMode ? 'bg-[#04222F]' : 'bg-[#EFEFEF]'} ${isSingle ? 'w-full max-w-[600px] mx-auto md:mx-0' : 'w-[85vw] max-w-[350px] md:w-[350px]'}`}
    >
      {/* Image area */}
      <div className="p-6 flex items-center justify-center h-[250px]">
        <SkeletonBase className={`${isSingle ? 'w-[70vw] max-w-[280px] h-[200px]' : 'w-[200px] h-[200px]'} rounded`} />
      </div>
      {/* Content */}
      <div className="p-4 flex flex-col gap-3">
        <SkeletonBase className="h-5 w-3/4" />
        <SkeletonBase className="h-4 w-full" />
        <SkeletonBase className="h-9 w-full rounded-lg" />
      </div>
    </div>
  );
}
