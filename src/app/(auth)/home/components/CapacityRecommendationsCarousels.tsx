'use client';

import RecommendationCapacityCard from './RecommendationCapacityCard';
import RecommendationCarousel from './RecommendationCarousel';
import RecommendationKnownAndAvailableCapacityCard from './RecommendationKnownAndAvailableCapacityCard';
import { CapacityRecommendation } from '@/types/recommendation';
import { UserProfile } from '@/types/user';
import { useApp } from '@/contexts/AppContext';

interface CapacityRecommendationsCarouselsProps {
  capacitiesToShare: CapacityRecommendation[];
  capacitiesToLearn: CapacityRecommendation[];
  userProfile: UserProfile | null | undefined;
}

export default function CapacityRecommendationsCarousels({
  capacitiesToShare,
  capacitiesToLearn,
  userProfile,
}: CapacityRecommendationsCarouselsProps) {
  const { pageContent } = useApp();

  return (
    <>
      {/* Known and Available Capacities carousel */}
      {capacitiesToShare.length > 0 && (
        <RecommendationCarousel
          title={
            pageContent['recommendations-known-available-skills'] ||
            'Recommended Capacities to Share'
          }
          tooltipText={pageContent['recommendations-known-available-skills-tooltip']}
        >
          {capacitiesToShare.map(capacity => (
            <RecommendationKnownAndAvailableCapacityCard
              key={capacity.id}
              recommendation={capacity}
              userProfile={userProfile}
              hintMessage={
                pageContent['recommendations-based-on-most-used-capacities'] ||
                'Based on the most used capacities in the network'
              }
            />
          ))}
        </RecommendationCarousel>
      )}

      {/* Wanted Capacities carousel */}
      {capacitiesToLearn.length > 0 && (
        <RecommendationCarousel
          title={pageContent['recommendations-new-skills'] || 'Recommended Capacities'}
          tooltipText={pageContent['recommendations-new-skills-tooltip']}
        >
          {capacitiesToLearn.map(capacity => (
            <RecommendationCapacityCard
              key={capacity.id}
              recommendation={capacity}
              userProfile={userProfile}
              hintMessage={
                pageContent['recommendation-based-on-capacities'] ||
                'Based on the most used capacities in the network'
              }
            />
          ))}
        </RecommendationCarousel>
      )}
    </>
  );
}
