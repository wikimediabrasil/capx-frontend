'use client';

import { useDarkMode } from '@/stores';
import MentorshipProgramCardSkeleton from './MentorshipProgramCardSkeleton';
import SkeletonBase from './SkeletonBase';

export default function MentorshipPageSkeleton() {
  const darkMode = useDarkMode();

  return (
    <section className="w-full flex flex-col min-h-screen pt-24 md:pt-8 gap-4 mx-auto md:max-w-[1200px]">
      {/* Banner */}
      <div className="flex flex-row items-center gap-4 px-4">
        <SkeletonBase className="w-16 h-16 rounded-lg flex-shrink-0" />
        <SkeletonBase className="h-8 w-56" />
      </div>

      {/* Programs grid */}
      <div className={`w-full py-8 md:py-12 ${darkMode ? 'bg-capx-dark-bg' : 'bg-[#F6F6F6]'}`}>
        <div className="container mx-auto px-4 max-w-screen-xl">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <MentorshipProgramCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
