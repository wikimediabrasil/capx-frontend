'use client';

import { ProfileCard } from '@/app/(auth)/feed/components/ProfileCard';
import React from 'react';

import { useDarkMode, usePageContent } from '@/stores';
interface ProfileListWithEmptyProps {
  profiles: any[];
  onToggleSaved?: (profile: any) => void;
  emptyMessage?: string;
  emptyDescription?: string;
  showWanted?: boolean;
  showAvailable?: boolean;
  showKnown?: boolean;
}

/**
 * Reusable component for displaying profile list with empty state
 * Eliminates duplication between feed/page.tsx and OrganizationList.tsx
 */
export const ProfileListWithEmpty: React.FC<ProfileListWithEmptyProps> = ({
  profiles,
  onToggleSaved,
  emptyMessage,
  emptyDescription,
  showWanted = true,
  showAvailable = true,
  showKnown = false,
}) => {
  const darkMode = useDarkMode();
  const pageContent = usePageContent();

  if (profiles.length > 0) {
    return (
      <div className="w-full mx-auto space-y-6">
        {profiles.map((profile, index) => (
          <ProfileCard
            id={profile.id}
            key={index}
            profile_image={profile.profile_image}
            username={profile.username}
            type={profile.type}
            capacities={profile.capacities}
            wantedCapacities={profile.wantedCapacities}
            availableCapacities={profile.availableCapacities}
            knownCapacities={profile.knownCapacities}
            avatar={profile.avatar}
            wikidataQid={profile.wikidataQid}
            languages={profile.languages}
            territory={profile.territory}
            isOrganization={profile.isOrganization || false}
            hasIncompleteProfile={profile.hasIncompleteProfile}
            isSaved={profile.isSaved}
            onToggleSaved={onToggleSaved ? () => onToggleSaved(profile) : undefined}
            showWanted={showWanted}
            showAvailable={showAvailable}
            showKnown={showKnown}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-12">
      <p className={`text-lg font-medium ${darkMode ? 'text-white' : 'text-gray-700'}`}>
        {emptyMessage || pageContent['feed-no-data-message']}
      </p>
      <p className={`mt-2 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
        {emptyDescription || pageContent['feed-no-data-description']}
      </p>
    </div>
  );
};
