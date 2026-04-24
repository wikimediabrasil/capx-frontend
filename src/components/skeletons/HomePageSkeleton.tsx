'use client';

import SkeletonBase from './SkeletonBase';
import RecommendationCarouselSkeleton from './RecommendationCarouselSkeleton';
import AnalyticsCallToActionSkeleton from './AnalyticsCallToActionSkeleton';

export default function HomePageSkeleton() {
  return (
    <div className="w-full flex flex-col gap-10">
      {/* Welcome banner */}
      <div className="flex flex-col gap-3">
        <SkeletonBase className="h-8 md:h-10 w-64 md:w-96" />
        <SkeletonBase className="h-5 w-48" />
      </div>

      {/* Profiles to share with carousel */}
      <RecommendationCarouselSkeleton type="profile" cardCount={3} />

      {/* Profiles to learn from carousel */}
      <RecommendationCarouselSkeleton type="profile" cardCount={3} />

      {/* Analytics CTA skeleton */}
      <AnalyticsCallToActionSkeleton />

      {/* Same language speakers carousel */}
      <RecommendationCarouselSkeleton type="profile" cardCount={3} />

      {/* Capacity recommendations carousel */}
      <RecommendationCarouselSkeleton type="capacity" cardCount={3} />

      {/* Event recommendations carousel */}
      <RecommendationCarouselSkeleton type="event" cardCount={3} />
    </div>
  );
}
