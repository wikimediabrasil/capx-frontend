'use client';

import CardNoCapacities from '@/app/(auth)/home/components/CardNoRecommendations';
import RecommendationCapacityCard from '@/app/(auth)/home/components/RecommendationCapacityCard';
import RecommendationCarousel from '@/app/(auth)/home/components/RecommendationCarousel';
import RecommendationEventCard from '@/app/(auth)/home/components/RecommendationEventCard';
import RecommendationProfileCard from '@/app/(auth)/home/components/RecommendationProfileCard';
import SectionNoCapacities from '@/app/(auth)/home/components/SectionNoRecommendations';
import LoadingState from '@/components/LoadingState';
import { useApp } from '@/contexts/AppContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useRecommendations } from '@/hooks/useRecommendations';

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

  const handleAddCapacity = (id: number) => {
    // TODO: Implement add capacity to profile functionality
    console.log('Add capacity:', id);
  };

  if (isLoading) {
    return (
      <section
        className={`flex flex-col items-center justify-center w-full max-w-screen-xl mx-auto px-8 py-8 lg:px-12 bg-transparent
        `}
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

  // Check if there's any data to show (excluding new_skills)
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
    console.log('No recommendations to display');
    return <SectionNoCapacities />;
  }

  // If there are only new_skills (Recommended Capacities), show SectionNoRecommendations above + new_skills carousel
  const showOnlyNewSkills = hasNewSkills && !hasOtherRecommendations;

  // If only new_skills, show SectionNoRecommendations + new_skills carousel
  if (showOnlyNewSkills) {
    const newSkillsContent = (
      <div className="flex flex-col items-center justify-center w-full gap-8 md:gap-16">
        {data.new_skills && data.new_skills.length > 0 && (
          <RecommendationCarousel
            title={pageContent['recommendations-new-skills'] || 'Recommended Capacities'}
            tooltipText={pageContent['recommendations-new-skills-tooltip']}
          >
            {data.new_skills.map(capacity => (
              <RecommendationCapacityCard
                key={capacity.id}
                recommendation={capacity}
                hintMessage={
                  pageContent['recommendation-based-on-capacities'] || 'Based on your capacities'
                }
              />
            ))}
          </RecommendationCarousel>
        )}
      </div>
    );

    return (
      <>
        <SectionNoCapacities />
        {isMobile ? (
          <section
            className={`flex flex-col items-center justify-center w-full max-w-screen-xl mx-auto px-8 py-8 lg:px-12 ${
              darkMode ? 'bg-capx-dark-bg' : 'bg-[#F6F6F6]'
            }`}
          >
            {newSkillsContent}
          </section>
        ) : (
          <section
            className={`flex flex-col items-center justify-center w-full max-w-screen-xl mx-auto px-4 md:px-8 md:mb-[128px] bg-transparent`}
          >
            <div className="flex flex-col items-center justify-between w-full py-16 gap-16">
              {newSkillsContent}
            </div>
          </section>
        )}
      </>
    );
  }

  // Combine share_with and share_with_orgs
  const shareWithProfiles = [...(data.share_with || []), ...(data.share_with_orgs || [])];

  // Combine learn_from and learn_from_orgs
  const learnFromProfiles = [...(data.learn_from || []), ...(data.learn_from_orgs || [])];

  const sectionContent = (
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
              onSave={handleSaveProfile}
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
              onSave={handleSaveProfile}
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
        description={
          'By choosing the languages you know we can show you profiles and events you might want to explore.'
        }
        tooltipText={pageContent['recommendations-same-language-tooltip']}
      >
        {data.same_language && data.same_language.length > 0 ? (
          data.same_language.map(profile => (
            <RecommendationProfileCard
              key={profile.id}
              recommendation={profile}
              onSave={handleSaveProfile}
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

      {data.new_skills && data.new_skills.length > 0 && (
        <RecommendationCarousel
          title={pageContent['recommendations-new-skills'] || 'Recommended Capacities'}
          tooltipText={pageContent['recommendations-new-skills-tooltip']}
        >
          {data.new_skills.map(capacity => (
            <RecommendationCapacityCard
              key={capacity.id}
              recommendation={capacity}
              hintMessage={
                pageContent['recommendation-based-on-most-used-capacities'] ||
                'Based on the most used capacities in the network'
              }
            />
          ))}
        </RecommendationCarousel>
      )}

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
      className={`flex flex-col items-center justify-center w-full max-w-screen-xl mx-auto px-4 md:px-8 md:mb-[128px] bg-transparent`}
    >
      <div className="flex flex-col items-center justify-between w-full py-16 gap-16">
        {sectionContent}
      </div>
    </section>
  );
}
