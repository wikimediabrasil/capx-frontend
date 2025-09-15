'use client';

import { useSnackbar } from '@/app/providers/SnackbarProvider';
import LoadingState from '@/components/LoadingState';
import { PaginationButtons } from '@/components/PaginationButtons';
import { useApp } from '@/contexts/AppContext';
import { useCapacity } from '@/hooks/useCapacityDetails';
import { useFilterCapacitySelection } from '@/hooks/useCapacitySelection';
import { useSavedItems } from '@/hooks/useSavedItems';
import { useAllUsers } from '@/hooks/useUserProfile';
import { useRouter, useSearchParams } from 'next/navigation';
import React, { useEffect, useMemo, useState } from 'react';
import { Filters } from './components/Filters';
import { createProfilesFromUsers, FilterState, ProfileCapacityType, Skill } from './types';
import { useLanguageSync } from '@/components/shared/LanguageSync';
import { SearchFilterSection } from '@/components/shared/SearchFilterSection';
import { ProfileListWithEmpty } from '@/components/shared/ProfileListWithEmpty';

export default function FeedPage() {
  const { pageContent } = useApp();
  const router = useRouter();
  const { showSnackbar } = useSnackbar();
  const searchParams = useSearchParams();
  const capacityCode = searchParams.get('capacityId');

  // Use shared language sync logic
  const { isLanguageChanging, isLoadingTranslations } = useLanguageSync();

  const [showFilters, setShowFilters] = useState(false);
  const [activeFilters, setActiveFilters] = useState<FilterState>({
    capacities: [] as Skill[],
    profileCapacityTypes: [
      ProfileCapacityType.Learner,
      ProfileCapacityType.Sharer,
    ] as ProfileCapacityType[],
    territories: [] as string[],
    languages: [] as string[],
    username: undefined,
    affiliations: [] as string[],
  });
  const [showSkillModal, setShowSkillModal] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerList = 5;
  const itemsPerPage = 10;
  const offset = (currentPage - 1) * itemsPerList;

  const { capacity } = useCapacity(capacityCode);
  const { savedItems, createSavedItem, deleteSavedItem } = useSavedItems();

  // Get data from capacityById
  useEffect(() => {
    if (capacity) {
      try {
        const capacityExists = activeFilters.capacities.some(
          cap => cap.code == Number(capacity.code)
        );

        if (!capacityExists) {
          setActiveFilters(prev => ({
            ...prev,
            capacities: [
              ...prev.capacities,
              {
                code: Number(capacity.code),
                name: capacity.name,
              },
            ],
          }));
        }
      } catch (error) {
        console.error('Error parsing capacity from URL:', error);
      }
    }
  }, [capacity, activeFilters.capacities]);

  const shouldFetchLearnerUsers = activeFilters.profileCapacityTypes.includes(
    ProfileCapacityType.Learner
  );
  const {
    allUsers: usersLearner,
    count: usersLearnerCount,
    isLoading: isUsersLearnerLoading,
  } = useAllUsers({
    limit: shouldFetchLearnerUsers ? itemsPerList : 0,
    offset: shouldFetchLearnerUsers ? offset : 0,
    activeFilters: shouldFetchLearnerUsers
      ? {
          ...activeFilters,
          profileCapacityTypes: [ProfileCapacityType.Learner],
        }
      : undefined,
  });

  const shouldFetchSharerUsers = activeFilters.profileCapacityTypes.includes(
    ProfileCapacityType.Sharer
  );
  const {
    allUsers: usersSharer,
    count: usersSharerCount,
    isLoading: isUsersSharerLoading,
  } = useAllUsers({
    limit: shouldFetchSharerUsers ? itemsPerList : 0,
    offset: shouldFetchSharerUsers ? offset : 0,
    activeFilters: shouldFetchSharerUsers
      ? {
          ...activeFilters,
          profileCapacityTypes: [ProfileCapacityType.Sharer],
        }
      : undefined,
  });

  // Total of records according to the profileFilter
  const totalRecords =
    (activeFilters.profileCapacityTypes.includes(ProfileCapacityType.Learner)
      ? usersLearnerCount
      : 0) +
    (activeFilters.profileCapacityTypes.includes(ProfileCapacityType.Sharer)
      ? usersSharerCount
      : 0);

  const isProfileSaved = (profileId: number) => {
    if (!savedItems) return false;

    return savedItems.some(item => item.entity_id === profileId && item.entity === 'user');
  };

  // Create profiles (to create cards) from users
  const filteredProfiles = useMemo(() => {
    const wantedUserProfiles = createProfilesFromUsers(
      usersLearner || [],
      ProfileCapacityType.Learner
    ).map(profile => ({
      ...profile,
      isSaved: isProfileSaved(profile.id),
    }));

    const availableUserProfiles = createProfilesFromUsers(
      usersSharer || [],
      ProfileCapacityType.Sharer
    ).map(profile => ({
      ...profile,
      isSaved: isProfileSaved(profile.id),
    }));

    // Filter users based on activeFilters.profileCapacityTypes
    const userProfilesWanted = activeFilters.profileCapacityTypes.includes(
      ProfileCapacityType.Learner
    )
      ? wantedUserProfiles
      : [];
    const userProfilesAvailable = activeFilters.profileCapacityTypes.includes(
      ProfileCapacityType.Sharer
    )
      ? availableUserProfiles
      : [];
    const userProfiles = [...userProfilesWanted, ...userProfilesAvailable];

    return userProfiles;
  }, [activeFilters, usersLearner, usersSharer, savedItems, isProfileSaved]);

  // Calculate total of pages based on total profiles
  const numberOfPages = Math.ceil(totalRecords / itemsPerPage);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [activeFilters]);

  const { handleCapacitySelect } = useFilterCapacitySelection(
    activeFilters.capacities,
    newCapacities => {
      setActiveFilters(prev => ({
        ...prev,
        capacities: newCapacities,
      }));
    }
  );

  const handleRemoveCapacity = (capacityCode: number) => {
    setActiveFilters(prev => ({
      ...prev,
      capacities: prev.capacities.filter(cap => cap.code !== capacityCode),
    }));

    const urlCapacityId = searchParams.get('capacityId');

    // If the capacity removed is the same as the URL, update the URL
    if (
      (urlCapacityId && urlCapacityId.toString() == capacityCode.toString()) ||
      (urlCapacityId && urlCapacityId.toString() == capacity?.code?.toString())
    ) {
      router.replace('/feed', { scroll: false });
    }
  };

  const handleApplyFilters = (newFilters: FilterState) => {
    setActiveFilters(newFilters);
    setShowFilters(false);
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= numberOfPages) {
      setCurrentPage(newPage);
      // Scroll to top of the page
      window.scrollTo(0, 0);
    }
  };

  if (
    isUsersLearnerLoading ||
    isUsersSharerLoading ||
    isLoadingTranslations ||
    isLanguageChanging
  ) {
    return <LoadingState fullScreen={true} />;
  }

  const handleToggleSaved = (profile: any) => {
    try {
      if (profile.isSaved) {
        const savedItem = savedItems?.find(
          item => item.entity_id === profile.id && item.entity === 'user'
        );

        if (savedItem) {
          deleteSavedItem(savedItem.id);
          showSnackbar(pageContent['saved-profiles-delete-success'], 'success');
        }
      } else {
        createSavedItem('user', profile.id, profile.type);
        showSnackbar(pageContent['saved-profiles-add-success'], 'success');
      }
    } catch {
      showSnackbar(pageContent['saved-profiles-error'], 'error');
    }
  };

  return (
    <div className="w-full flex flex-col items-center pt-24 md:pt-8">
      <div className="container mx-auto px-4">
        <div className="md:max-w-[1200px] w-full max-w-sm mx-auto space-y-6">
          <SearchFilterSection
            activeFilters={activeFilters}
            showSkillModal={showSkillModal}
            onRemoveCapacity={handleRemoveCapacity}
            onShowSkillModal={setShowSkillModal}
            onShowFilters={setShowFilters}
            onCapacitySelect={handleCapacitySelect}
          />

          <ProfileListWithEmpty profiles={filteredProfiles} onToggleSaved={handleToggleSaved} />
        </div>
      </div>

      {/* Pagination buttons */}
      <PaginationButtons
        currentPage={currentPage}
        totalPages={numberOfPages || 1}
        onPageChange={handlePageChange}
      />

      {/* Filters Modal */}
      {showFilters && (
        <Filters
          onClose={() => setShowFilters(false)}
          onApplyFilters={handleApplyFilters}
          initialFilters={activeFilters}
        />
      )}
    </div>
  );
}
