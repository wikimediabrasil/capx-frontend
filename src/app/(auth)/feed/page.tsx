'use client';

import { useEffect, useMemo, useState } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import ProfileCard from './components/ProfileCard';
import { Filters } from './components/Filters';
import { useApp } from '@/contexts/AppContext';
import { Skill, FilterState, ProfileCapacityType, ProfileFilterType } from './types';
import { useAllUsers } from '@/hooks/useUserProfile';
import CapacitySelectionModal from '@/components/CapacitySelectionModal';
import { useSearchParams, useRouter } from 'next/navigation';
import { useCapacity } from '@/hooks/useCapacityDetails';
import { useSavedItems } from '@/hooks/useSavedItems';
import { useFilterCapacitySelection } from '@/hooks/useCapacitySelection';
import { createProfilesFromUsers } from './types';
import { PaginationButtons } from '@/components/PaginationButtons';
import { useSnackbar } from '@/app/providers/SnackbarProvider';
import { SearchBar } from './components/SearchBar';
import LoadingState from '@/components/LoadingState';

export default function FeedPage() {
  const { darkMode } = useTheme();
  const { pageContent } = useApp();
  const router = useRouter();
  const { showSnackbar } = useSnackbar();
  const searchParams = useSearchParams();
  const capacityCode = searchParams.get('capacityId');

  const [showFilters, setShowFilters] = useState(false);
  const [activeFilters, setActiveFilters] = useState<FilterState>({
    capacities: [] as Skill[],
    profileCapacityTypes: [
      ProfileCapacityType.Learner,
      ProfileCapacityType.Sharer,
    ] as ProfileCapacityType[],
    territories: [] as string[],
    languages: [] as string[],
    profileFilter: ProfileFilterType.Both,
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

  const shouldFetchLearnerUsers = activeFilters.profileCapacityTypes.includes(ProfileCapacityType.Learner);
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

  const shouldFetchSharerUsers =
    activeFilters.profileCapacityTypes.includes(ProfileCapacityType.Sharer);
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

    return savedItems.some(
      item => item.entity_id === profileId && item.entity === 'user'
    );
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
  }, [
    activeFilters,
    usersLearner,
    usersSharer,
    savedItems,
    isProfileSaved,
  ]);

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
    isUsersSharerLoading
  ) {
    return <LoadingState fullScreen={true} />;
  }

  const handleToggleSaved = (profile: any) => {
    try {
      if (profile.isSaved) {
        const savedItem = savedItems?.find(
          item =>
            item.entity_id === profile.id &&
            item.entity === 'user'
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
          {/* SearchBar and Filters Button */}
          <SearchBar
            showCapacitiesSearch={true}
            selectedCapacities={activeFilters.capacities}
            onRemoveCapacity={handleRemoveCapacity}
            onCapacityInputFocus={() => setShowSkillModal(true)}
            capacitiesPlaceholder={pageContent['filters-search-by-capacities']}
            removeItemAltText={pageContent['filters-remove-item-alt-icon']}
            onFilterClick={() => setShowFilters(true)}
            filterAriaLabel={pageContent['saved-profiles-filters-button']}
          />

          <CapacitySelectionModal
            isOpen={showSkillModal}
            onClose={() => setShowSkillModal(false)}
            onSelect={handleCapacitySelect}
            title={pageContent['select-capacity']}
          />

          {filteredProfiles.length > 0 ? (
            <div className="w-full mx-auto space-y-6">
              {filteredProfiles.map((profile, index) => (
                <ProfileCard
                  id={profile.id}
                  key={index}
                  profile_image={profile.profile_image}
                  username={profile.username}
                  type={profile.type}
                  capacities={profile.capacities}
                  avatar={profile.avatar}
                  languages={profile.languages}
                  territory={profile.territory}
                  isOrganization={false}
                  isSaved={profile.isSaved}
                  onToggleSaved={() => handleToggleSaved(profile)}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12">
              <p className={`text-lg font-medium ${darkMode ? 'text-white' : 'text-gray-700'}`}>
                {pageContent['feed-no-data-message']}
              </p>
              <p className={`mt-2 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                {pageContent['feed-no-data-description']}
              </p>
            </div>
          )}
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
