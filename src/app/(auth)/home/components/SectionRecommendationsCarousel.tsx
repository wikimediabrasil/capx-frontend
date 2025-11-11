'use client';

import { useApp } from '@/contexts/AppContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useRecommendations } from '@/hooks/useRecommendations';
import RecommendationCarousel from '@/app/(auth)/home/components/RecommendationCarousel';
import RecommendationProfileCard from '@/app/(auth)/home/components/RecommendationProfileCard';
import RecommendationCapacityCard from '@/app/(auth)/home/components/RecommendationCapacityCard';
import RecommendationEventCard from '@/app/(auth)/home/components/RecommendationEventCard';
import LoadingState from '@/components/LoadingState';
import { ProfileRecommendation, OrganizationRecommendation } from '@/types/recommendation';

export default function SectionRecommendationsCarousel() {
  const { isMobile, pageContent } = useApp();
    const { darkMode } = useTheme();
  const { data, isLoading, error } = useRecommendations();
  console.log('Recommendations data:', data);
  console.log('Recommendations isLoading:', isLoading);
  console.log('Recommendations error:', error);

  const handleSaveProfile = (id: number) => {
    // TODO: Implement save profile functionality
    console.log('Save profile:', id);
  };

  const handleSaveEvent = (id: number) => {
    // TODO: Implement save event functionality
    console.log('Save event:', id);
  };

  const handleAddCapacity = (id: number) => {
    // TODO: Implement add capacity to profile functionality
    console.log('Add capacity:', id);
  };

  if (isLoading) {
    return (
        <section
            className={`flex flex-col items-center justify-center w-full max-w-screen-xl mx-auto px-8 py-8 lg:px-12 ${
                darkMode ? 'bg-capx-dark-bg' : 'bg-[#F6F6F6]'
            }`}
        >
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
  const hasAnyRecommendations =
    (data.share_with && data.share_with.length > 0) ||
    (data.learn_from && data.learn_from.length > 0) ||
    (data.same_language && data.same_language.length > 0) ||
    (data.share_with_orgs && data.share_with_orgs.length > 0) ||
    (data.learn_from_orgs && data.learn_from_orgs.length > 0) ||
    (data.new_skills && data.new_skills.length > 0) ||
    (data.events && data.events.length > 0);

  console.log('Has any recommendations:', hasAnyRecommendations);
  console.log('share_with:', data.share_with?.length || 0);
  console.log('learn_from:', data.learn_from?.length || 0);
  console.log('same_language:', data.same_language?.length || 0);
  console.log('share_with_orgs:', data.share_with_orgs?.length || 0);
  console.log('learn_from_orgs:', data.learn_from_orgs?.length || 0);
  console.log('new_skills:', data.new_skills?.length || 0);
  console.log('events:', data.events?.length || 0);

  if (!hasAnyRecommendations) {
    console.log('No recommendations to display');
    return null;
  }

  const sectionContent = (
    <div className="flex flex-col items-center justify-center w-full gap-8 md:gap-16">
      {data.share_with && data.share_with.length > 0 && (
        <RecommendationCarousel
          title={pageContent['recommendations-share-with'] || 'Profiles to share with'}
        >
          {data.share_with.map((profile) => (
            <RecommendationProfileCard
              key={profile.id}
              recommendation={profile}
              onSave={handleSaveProfile}
              capacityType="available"
            />
          ))}
        </RecommendationCarousel>
      )}

      {data.learn_from && data.learn_from.length > 0 && (
        <RecommendationCarousel
          title={pageContent['recommendations-learn-from'] || 'Profiles to learn from'}
        >
          {data.learn_from.map((profile) => (
            <RecommendationProfileCard
              key={profile.id}
              recommendation={profile}
              onSave={handleSaveProfile}
              capacityType="wanted"
            />
          ))}
        </RecommendationCarousel>
      )}

      {data.same_language && data.same_language.length > 0 && (
        <RecommendationCarousel
          title={pageContent['recommendations-same-language'] || 'Same language speakers'}
          description={
            pageContent['recommendations-based-on-languages'] || 'Based on your languages'
          }
        >
          {data.same_language.map((profile) => (
            <RecommendationProfileCard
              key={profile.id}
              recommendation={profile}
              onSave={handleSaveProfile}
              capacityType="available"
            />
          ))}
        </RecommendationCarousel>
      )}

      {data.share_with_orgs && data.share_with_orgs.length > 0 && (
        <RecommendationCarousel
          title={
            pageContent['recommendations-share-with-orgs'] || 'Organizations to share with'
          }
        >
          {data.share_with_orgs.map((org) => (
            <RecommendationProfileCard
              key={org.id}
              recommendation={org as unknown as ProfileRecommendation}
              onSave={handleSaveProfile}
              capacityType="available"
            />
          ))}
        </RecommendationCarousel>
      )}

      {data.learn_from_orgs && data.learn_from_orgs.length > 0 && (
        <RecommendationCarousel
          title={
            pageContent['recommendations-learn-from-orgs'] || 'Organizations to learn from'
          }
        >
          {data.learn_from_orgs.map((org) => (
            <RecommendationProfileCard
              key={org.id}
              recommendation={org as unknown as ProfileRecommendation}
              onSave={handleSaveProfile}
              capacityType="wanted"
            />
          ))}
        </RecommendationCarousel>
      )}

      {data.new_skills && data.new_skills.length > 0 && (
        <RecommendationCarousel
          title={pageContent['recommendations-new-skills'] || 'Recommended Capacities'}
        >
          {data.new_skills.map((capacity) => (
            <RecommendationCapacityCard
              key={capacity.id}
              recommendation={capacity}
              onAddToProfile={handleAddCapacity}
            />
          ))}
        </RecommendationCarousel>
      )}

      {data.events && data.events.length > 0 && (
        <RecommendationCarousel
          title={pageContent['recommendations-events'] || 'Events You Might Like'}
        >
          {data.events.map((event) => (
            <RecommendationEventCard
              key={event.id}
              recommendation={event}
              onSave={handleSaveEvent}
            />
          ))}
        </RecommendationCarousel>
      )}
                </div>
  );

  return isMobile ? (
    <section
      className={`flex flex-col items-center justify-center w-full max-w-screen-xl mx-auto px-8 py-8 lg:px-12 ${
        darkMode ? 'bg-capx-dark-bg' : 'bg-[#F6F6F6]'
      }`}
    >
      {sectionContent}
        </section>
        ) : (
        <section
        className={`flex flex-col items-center justify-center w-full max-w-screen-xl mx-auto px-4 md:px-8 md:mb-[128px] ${
            darkMode ? 'bg-capx-dark-bg' : 'bg-[#F6F6F6]'
        }`}
        >
        <div className="flex flex-col items-center justify-between w-full py-16 gap-16">
        {sectionContent}
        </div>
        </section>
    );
}
