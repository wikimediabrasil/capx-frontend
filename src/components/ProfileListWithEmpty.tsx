'use client';

import { ProfileCard } from '@/app/(auth)/feed/components/ProfileCard';
import { useApp } from '@/contexts/AppContext';
import { useTheme } from '@/contexts/ThemeContext';
import React from 'react';

interface ProfileListWithEmptyProps {
  profiles: any[];
  onToggleSaved?: (profile: any) => void;
  emptyMessage?: string;
  emptyDescription?: string;
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
}) => {
  const { darkMode } = useTheme();
  const { pageContent } = useApp();

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
            avatar={profile.avatar}
            languages={profile.languages}
            territory={profile.territory}
            isOrganization={profile.isOrganization || false}
            hasIncompleteProfile={profile.hasIncompleteProfile}
            isSaved={profile.isSaved}
            onToggleSaved={onToggleSaved ? () => onToggleSaved(profile) : undefined}
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
