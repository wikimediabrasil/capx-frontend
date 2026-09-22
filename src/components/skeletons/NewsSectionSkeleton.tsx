'use client';

import { useDarkMode } from '@/stores';
import SkeletonBase from './SkeletonBase';

function NewsCardSkeleton({ darkMode }: { darkMode: boolean }) {
  return (
    <div
      className={`flex-shrink-0 snap-start flex flex-col w-[300px] md:w-[350px] px-[12px] py-[24px] items-center gap-[12px] rounded-[16px] ${
        darkMode ? 'bg-[#04222F]' : 'bg-[#EFEFEF]'
      }`}
    >
      <SkeletonBase className="w-full h-[200px] rounded-[16px]" />
      <SkeletonBase className="h-5 w-3/4" />
      <SkeletonBase className="h-4 w-1/2" />
    </div>
  );
}

export default function NewsSectionSkeleton() {
  const darkMode = useDarkMode();

  return (
    <section className="w-full max-w-screen-xl py-8">
      <div className="flex flex-row pl-0 pr-[13px] py-[6px] items-center gap-4 rounded-[8px] mb-6">
        <SkeletonBase className="w-[20px] h-[20px] md:w-[42px] md:h-[48px] rounded-full" />
        <SkeletonBase className="h-5 md:h-7 w-32" />
      </div>
      <div className="flex flex-row gap-4 overflow-hidden">
        {Array.from({ length: 3 }).map((_, i) => (
          <NewsCardSkeleton key={i} darkMode={darkMode} />
        ))}
      </div>
    </section>
  );
}
