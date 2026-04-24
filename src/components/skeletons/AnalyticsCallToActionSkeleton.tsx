'use client';

import SkeletonBase from './SkeletonBase';
import { useDarkMode, useIsMobile } from '@/stores';

export default function AnalyticsCallToActionSkeleton() {
  const isMobile = useIsMobile();
  const darkMode = useDarkMode();

  if (isMobile) {
    return (
      <section
        className={
          (darkMode ? 'bg-capx-dark-box-bg' : 'bg-capx-light-bg') +
          ' flex flex-col items-center justify-center w-full max-w-screen-xl mx-auto px-4 md:px-8 lg:px-12 py-8 md:py-16'
        }
      >
        <div className="flex flex-col items-center justify-center w-full gap-4">
          <div className="relative min-h-[60px] flex items-center justify-center w-full">
            <SkeletonBase className="h-5 w-3/4" />
          </div>
          <SkeletonBase className="h-9 w-36 rounded-md" />
        </div>
      </section>
    );
  }

  return (
    <section className="flex flex-col items-center justify-center w-full max-w-screen-xl mx-auto px-8 py-16">
      <div className="flex flex-col items-center justify-center w-full gap-6">
        <div className="relative min-h-[80px] flex items-center justify-center w-full">
          <SkeletonBase className="h-8 w-2/3" />
        </div>
        <SkeletonBase className="h-16 w-56 rounded-md" />
      </div>
    </section>
  );
}
