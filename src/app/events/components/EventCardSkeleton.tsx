'use client';

import { useDarkMode } from '@/stores';

interface EventCardSkeletonProps {
  isHorizontalScroll?: boolean;
}

function CardSkeleton({ darkMode, base }: { darkMode: boolean; base: string }) {
  return (
    <div
      className={`flex flex-col rounded-[4px] p-4 w-full ${
        darkMode ? 'bg-capx-dark-bg' : 'bg-[#EFEFEF]'
      }`}
    >
      <div className="flex flex-col gap-4">
        {/* Title */}
        <div className="flex flex-col gap-2">
          <div className={`h-5 w-3/4 rounded-[4px] ${base}`} />
          <div className={`h-5 w-1/2 rounded-[4px] ${base}`} />
          <div className={`h-4 w-1/3 rounded-[4px] ${base}`} />
        </div>

        {/* Date + location badge */}
        <div className="flex items-center gap-2">
          <div className={`h-4 w-32 rounded-[4px] ${base}`} />
          <div className={`h-6 w-16 rounded-[8px] ${base}`} />
        </div>

        {/* Time range */}
        <div className={`h-4 w-40 rounded-[4px] ${base}`} />

        {/* Capacities label */}
        <div className={`h-4 w-28 rounded-[4px] ${base}`} />

        {/* Capacity pills */}
        <div className="flex flex-wrap gap-2">
          <div className={`h-7 w-20 rounded-[8px] ${base}`} />
          <div className={`h-7 w-24 rounded-[8px] ${base}`} />
          <div className={`h-7 w-16 rounded-[8px] ${base}`} />
        </div>

        {/* Description */}
        <div className="flex flex-col gap-1.5">
          <div className={`h-3.5 w-full rounded-[4px] ${base}`} />
          <div className={`h-3.5 w-5/6 rounded-[4px] ${base}`} />
          <div className={`h-3.5 w-3/4 rounded-[4px] ${base}`} />
        </div>

        {/* Buttons */}
        <div className="flex flex-row gap-2 mt-auto">
          <div className={`h-12 flex-1 rounded-[8px] ${base}`} />
          <div className={`h-12 flex-1 rounded-[8px] ${base}`} />
        </div>
      </div>
    </div>
  );
}

export default function EventCardSkeleton({ isHorizontalScroll }: EventCardSkeletonProps) {
  const darkMode = useDarkMode();

  const base = darkMode ? 'bg-white/15' : 'bg-capx-dark-box-bg/10';

  // Horizontal scroll: single compact card skeleton
  if (isHorizontalScroll) {
    return (
      <div
        className={`flex flex-col rounded-[4px] p-4 min-w-[300px] max-w-[350px] flex-shrink-0 animate-pulse ${
          darkMode ? 'bg-capx-dark-bg' : 'bg-[#EFEFEF]'
        }`}
      >
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2 min-h-[80px]">
            <div className={`h-5 w-3/4 rounded-[4px] ${base}`} />
            <div className={`h-5 w-1/2 rounded-[4px] ${base}`} />
          </div>
          <div className="flex items-center gap-2">
            <div className={`h-4 w-24 rounded-[4px] ${base}`} />
            <div className={`h-6 w-14 rounded-[8px] ${base}`} />
          </div>
          <div className={`h-4 w-20 rounded-[4px] ${base}`} />
          <div className="flex gap-2">
            <div className={`h-7 w-16 rounded-[8px] ${base}`} />
            <div className={`h-7 w-20 rounded-[8px] ${base}`} />
          </div>
        </div>
      </div>
    );
  }

  // Full page skeleton: banner + search bar + filter button + card list
  return (
    <div className="animate-pulse w-full flex flex-col gap-4">
      {/* Banner skeleton */}
      <div className="md:max-w-[1200px] w-full max-w-sm mx-auto px-4 md:px-4">
        <div
          className={`w-full h-[200px] md:h-[350px] rounded-lg ${darkMode ? 'bg-capx-dark-bg' : 'bg-[#EFEFEF]'}`}
        />
      </div>

      <div className="w-full max-w-screen-xl mx-auto px-4 flex flex-col gap-4">
        {/* Search bar + filter button skeleton */}
        <div className="flex gap-2 items-stretch">
          <div
            className={`flex-1 h-14 rounded-xl ${darkMode ? 'bg-capx-dark-bg' : 'bg-[#EFEFEF]'}`}
          />
          <div
            className={`w-14 h-14 rounded-xl shrink-0 ${darkMode ? 'bg-capx-dark-bg' : 'bg-[#EFEFEF]'}`}
          />
        </div>

        {/* Card skeletons */}
        {Array.from({ length: 3 }).map((_, i) => (
          <CardSkeleton key={i} darkMode={darkMode} base={base} />
        ))}
      </div>
    </div>
  );
}
