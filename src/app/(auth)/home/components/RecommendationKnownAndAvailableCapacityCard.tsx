'use client';

import { CapacityRecommendation } from '@/types/recommendation';
import { UserProfile } from '@/types/user';
import RecommendationCapacityCardBase from './RecommendationCapacityCardBase';

interface RecommendationKnownAndAvailableCapacityCardProps {
  readonly recommendation: CapacityRecommendation;
  readonly hintMessage?: string;
  readonly userProfile?: UserProfile | null;
}

export default function RecommendationKnownAndAvailableCapacityCard({
  recommendation,
  hintMessage,
  userProfile,
}: RecommendationKnownAndAvailableCapacityCardProps) {
  return (
    <RecommendationCapacityCardBase
      recommendation={recommendation}
      hintMessage={hintMessage}
      userProfile={userProfile}
      capacityType="known-and-available"
    />
  );
}
