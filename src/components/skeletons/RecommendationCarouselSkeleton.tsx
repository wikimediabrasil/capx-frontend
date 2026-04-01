'use client';

import { useDarkMode } from '@/stores';
import SkeletonBase from './SkeletonBase';
import RecommendationProfileCardSkeleton from './RecommendationProfileCardSkeleton';
import RecommendationCapacityCardSkeleton from './RecommendationCapacityCardSkeleton';

type CarouselType = 'profile' | 'capacity' | 'event';

interface RecommendationCarouselSkeletonProps {
  type?: CarouselType;
  cardCount?: number;
}

function EventCardMiniSkeleton({ darkMode }: { darkMode: boolean }) {
  return (
    <div
      className={`flex flex-col p-4 rounded-[4px] min-w-[300px] h-fit border ${
        darkMode ? 'bg-capx-dark-box-bg border-white' : 'bg-capx-light-box-bg border-gray-200'
      }`}
    >
      <SkeletonBase className="h-6 w-3/4 mb-4" />
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <SkeletonBase className="w-4 h-4 rounded-full" />
          <SkeletonBase className="h-4 w-36" />
        </div>
        <div className="flex items-center gap-2">
          <SkeletonBase className="w-4 h-4 rounded-full" />
          <SkeletonBase className="h-4 w-40" />
        </div>
        <div className="flex items-center gap-2">
          <SkeletonBase className="w-4 h-4 rounded-full" />
          <SkeletonBase className="h-4 w-28" />
        </div>
      </div>
    </div>
  );
}

export default function RecommendationCarouselSkeleton({
  type = 'profile',
  cardCount = 3,
}: RecommendationCarouselSkeletonProps) {
  const darkMode = useDarkMode();

  return (
    <div className="w-full">
      {/* Section title */}
      <SkeletonBase className="h-7 md:h-9 w-48 mb-4" />

      {/* Cards row */}
      <div className="flex flex-row gap-4 overflow-hidden">
        {Array.from({ length: cardCount }).map((_, i) => {
          if (type === 'profile') return <RecommendationProfileCardSkeleton key={i} />;
          if (type === 'capacity') return <RecommendationCapacityCardSkeleton key={i} />;
          return <EventCardMiniSkeleton key={i} darkMode={darkMode} />;
        })}
      </div>
    </div>
  );
}
