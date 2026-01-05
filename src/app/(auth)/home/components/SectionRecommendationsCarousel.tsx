'use client';

import { useMemo } from 'react';
import { useSession } from 'next-auth/react';
import { useQuery } from '@tanstack/react-query';
import CardNoCapacities from '@/app/(auth)/home/components/CardNoRecommendations';
import RecommendationCarousel from '@/app/(auth)/home/components/RecommendationCarousel';
import RecommendationEventCard from '@/app/(auth)/home/components/RecommendationEventCard';
import RecommendationProfileCard from '@/app/(auth)/home/components/RecommendationProfileCard';
import SectionNoCapacities from '@/app/(auth)/home/components/SectionNoRecommendations';
import RecommendationsSection from '@/app/(auth)/home/components/RecommendationsSection';
import CapacityRecommendationsCarousels from '@/app/(auth)/home/components/CapacityRecommendationsCarousels';
import LoadingState from '@/components/LoadingState';
import { useApp } from '@/contexts/AppContext';
import { useRecommendations } from '@/hooks/useRecommendations';
import { useUserCapacities } from '@/hooks/useUserCapacities';
import { userService } from '@/services/userService';

export default function SectionRecommendationsCarousel() {
  const { pageContent } = useApp();
  const { data, isLoading, error } = useRecommendations();
  const { data: session } = useSession();

  // Fetch user profile to filter recommendations
  const { data: userProfile } = useQuery({
    queryKey: ['userProfile', session?.user?.id, session?.user?.token],
    queryFn: async () => {
      if (!session?.user?.token || !session?.user?.id) {
        return null;
      }
      return userService.fetchUserProfile(Number(session.user.id), session.user.token);
    },
    enabled: !!session?.user?.token && !!session?.user?.id,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
  });

  // Extract user's current capacities using custom hook
  const { userKnownCapacities, userAvailableCapacities, userWantedCapacities } =
    useUserCapacities(userProfile);

  // Filter new_skills for each carousel - split into two mutually exclusive lists
  const { capacitiesToShare, capacitiesToLearn } = useMemo(() => {
    if (!data?.new_skills) return { capacitiesToShare: [], capacitiesToLearn: [] };

    const toShare: typeof data.new_skills = [];
    const toLearn: typeof data.new_skills = [];

    data.new_skills.forEach((capacity, index) => {
      const isInKnown = userKnownCapacities.includes(capacity.id);
      const isInAvailable = userAvailableCapacities.includes(capacity.id);
      const isInWanted = userWantedCapacities.includes(capacity.id);

      // Skip if already in any list
      if (isInKnown || isInAvailable || isInWanted) return;

      // Alternate between the two carousels to distribute capacities evenly
      if (index % 2 === 0) {
        toShare.push(capacity);
      } else {
        toLearn.push(capacity);
      }
    });

    return { capacitiesToShare: toShare, capacitiesToLearn: toLearn };
  }, [data?.new_skills, userKnownCapacities, userAvailableCapacities, userWantedCapacities]);

  if (isLoading) {
    return (
      <section className="flex flex-col items-center justify-center w-full max-w-screen-xl mx-auto px-8 py-8 lg:px-12 bg-transparent">
        <LoadingState />
      </section>
    );
  }

  if (error) {
    console.error('Error loading recommendations:', error);
    return null;
  }

  if (!data) {
    console.log('No recommendations data available');
    return null;
  }

  // Check if there's any data to show
  const hasOtherRecommendations =
    (data.share_with && data.share_with.length > 0) ||
    (data.learn_from && data.learn_from.length > 0) ||
    (data.same_language && data.same_language.length > 0) ||
    (data.share_with_orgs && data.share_with_orgs.length > 0) ||
    (data.learn_from_orgs && data.learn_from_orgs.length > 0) ||
    (data.events && data.events.length > 0);

  const hasNewSkills = data.new_skills && data.new_skills.length > 0;
  const hasAnyRecommendations = hasOtherRecommendations || hasNewSkills;

  // If there are no recommendations at all, show only the no recommendations section
  if (!hasAnyRecommendations) {
    return <SectionNoCapacities />;
  }

  // If there are only new_skills (Recommended Capacities), show SectionNoRecommendations above + new_skills carousel
  if (hasNewSkills && !hasOtherRecommendations) {
    return (
      <>
        <SectionNoCapacities />
        <RecommendationsSection>
          <div className="flex flex-col items-center justify-center w-full gap-8 md:gap-16">
            <CapacityRecommendationsCarousels
              capacitiesToShare={capacitiesToShare}
              capacitiesToLearn={capacitiesToLearn}
              userProfile={userProfile}
            />
          </div>
        </RecommendationsSection>
      </>
    );
  }

  // Combine share_with and share_with_orgs
  const shareWithProfiles = [...(data.share_with || []), ...(data.share_with_orgs || [])];

  // Combine learn_from and learn_from_orgs
  const learnFromProfiles = [...(data.learn_from || []), ...(data.learn_from_orgs || [])];

  return (
    <RecommendationsSection>
      <div className="flex flex-col items-center justify-center w-full gap-8 md:gap-16">
        {/* Combined Share With carousel */}
        <RecommendationCarousel
          title={pageContent['recommendations-share-with'] || 'Profiles to share with'}
          tooltipText={pageContent['recommendations-share-with-tooltip']}
        >
          {shareWithProfiles.length > 0 ? (
            shareWithProfiles.map(profile => (
              <RecommendationProfileCard
                key={`${'acronym' in profile ? 'org' : 'user'}-${profile.id}`}
                recommendation={profile}
                capacityType="available"
                hintMessage={
                  pageContent['recommendation-based-on-available-capacities'] ||
                  'Based on your available capacities'
                }
              />
            ))
          ) : (
            <CardNoCapacities alt="No profiles to share with" />
          )}
        </RecommendationCarousel>

        {/* Combined Learn From carousel */}
        <RecommendationCarousel
          title={pageContent['recommendations-learn-from'] || 'Profiles to learn from'}
          tooltipText={pageContent['recommendations-learn-from-tooltip']}
        >
          {learnFromProfiles.length > 0 ? (
            learnFromProfiles.map(profile => (
              <RecommendationProfileCard
                key={`${'acronym' in profile ? 'org' : 'user'}-${profile.id}`}
                recommendation={profile}
                capacityType="wanted"
                hintMessage={
                  pageContent['recommendation-based-on-wanted-capacities'] ||
                  'Based on your wanted capacities'
                }
              />
            ))
          ) : (
            <CardNoCapacities alt="No profiles to learn from" />
          )}
        </RecommendationCarousel>

        {/* Same Language carousel */}
        <RecommendationCarousel
          title={pageContent['recommendations-same-language'] || 'Same language speakers'}
          description="By choosing the languages you know we can show you profiles and events you might want to explore."
          tooltipText={pageContent['recommendations-same-language-tooltip']}
        >
          {data.same_language && data.same_language.length > 0 ? (
            data.same_language.map(profile => (
              <RecommendationProfileCard
                key={profile.id}
                recommendation={profile}
                capacityType="available"
                hintMessage={
                  pageContent['recommendations-based-on-languages'] || 'Based on your languages'
                }
              />
            ))
          ) : (
            <CardNoCapacities alt="No same language speakers" />
          )}
        </RecommendationCarousel>

        {/* Capacity Recommendations Carousels */}
        <CapacityRecommendationsCarousels
          capacitiesToShare={capacitiesToShare}
          capacitiesToLearn={capacitiesToLearn}
          userProfile={userProfile}
        />

        {/* Events carousel */}
        {data.events && data.events.length > 0 && (
          <RecommendationCarousel
            title={pageContent['recommendations-events-title']}
            tooltipText={pageContent['recommendations-events-tooltip']}
          >
            {data.events.map(event => (
              <RecommendationEventCard
                key={event.id}
                recommendation={event}
                hintMessage={
                  pageContent['recommendation-based-on-capacities'] || 'Based on your capacities'
                }
              />
            ))}
          </RecommendationCarousel>
        )}
      </div>
    </RecommendationsSection>
  );
}
