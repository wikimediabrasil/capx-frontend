'use client';

import { CapacityRecommendation } from '@/types/recommendation';
import { UserProfile } from '@/types/user';
import RecommendationCapacityCardBase from './RecommendationCapacityCardBase';

interface RecommendationCapacityCardProps {
  recommendation: CapacityRecommendation;
  hintMessage?: string;
  userProfile?: UserProfile | null;
}

export default function RecommendationCapacityCard({
  recommendation,
  hintMessage,
  userProfile,
}: RecommendationCapacityCardProps) {
  return (
    <RecommendationCapacityCardBase
      recommendation={recommendation}
      hintMessage={hintMessage}
      userProfile={userProfile}
      capacityType="wanted"
    />
  );
}
