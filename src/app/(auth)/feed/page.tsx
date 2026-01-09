'use client';

import { useSnackbar } from '@/app/providers/SnackbarProvider';
import { useLanguageSync } from '@/components/LanguageSync';
import LoadingState from '@/components/LoadingState';
import { PaginationButtons } from '@/components/PaginationButtons';
import { ProfileListWithEmpty } from '@/components/ProfileListWithEmpty';
import { SearchFilterSection } from '@/components/SearchFilterSection';
import { useApp } from '@/contexts/AppContext';
import { useDebounce } from '@/hooks/useDebounce';
import { useSavedItems } from '@/hooks/useSavedItems';
import { useAllUsers } from '@/hooks/useUserProfile';
import { useEffect, useMemo, useState } from 'react';
import { Filters } from './components/Filters';
import {
  createProfilesFromUsers,
  createUnifiedProfiles,
  FilterState,
  ProfileCapacityType,
  Skill,
} from './types';

export default function FeedPage() {
  const { pageContent } = useApp();
  const { showSnackbar } = useSnackbar();

  // Use shared language sync logic
  const { isLanguageChanging, isLoadingTranslations } = useLanguageSync();

  const [showFilters, setShowFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);

  const [activeFilters, setActiveFilters] = useState<FilterState>({
    capacities: [] as Skill[],
    profileCapacityTypes: [
      ProfileCapacityType.Learner,
      ProfileCapacityType.Sharer,
    ] as ProfileCapacityType[],
    territories: [] as string[],
    languages: [] as string[],
    name: undefined,
    affiliations: [] as string[],
  });

  // Update activeFilters with debounced search term
  useEffect(() => {
    setActiveFilters(prev => ({
      ...prev,
      name: debouncedSearchTerm || undefined,
    }));
  }, [debouncedSearchTerm]);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerList = 5;
  const itemsPerPage = 10;
  const offset = (currentPage - 1) * itemsPerList;

  const { savedItems, createSavedItem, deleteSavedItem } = useSavedItems();

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
    ordering: '-last_update',
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
    ordering: '-last_update',
  });

  // Mark as loaded once data is fetched
  useEffect(() => {
    if (!isUsersLearnerLoading && !isUsersSharerLoading) {
      setHasLoadedOnce(true);
    }
  }, [isUsersLearnerLoading, isUsersSharerLoading]);

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
    const isBothTypesSelected =
      activeFilters.profileCapacityTypes.includes(ProfileCapacityType.Learner) &&
      activeFilters.profileCapacityTypes.includes(ProfileCapacityType.Sharer);

    if (isBothTypesSelected) {
      // When both types are selected, use unified profiles to avoid duplicates
      const allUsers = [...(usersLearner || []), ...(usersSharer || [])];
      // Remove duplicates based on user ID
      const uniqueUsers = allUsers.filter(
        (user, index, self) => index === self.findIndex(u => u.user.id === user.user.id)
      );

      return createUnifiedProfiles(uniqueUsers)
        .map(profile => ({
          ...profile,
          isSaved: isProfileSaved(profile.id),
        }))
        .sort((a, b) => new Date(b.last_update).getTime() - new Date(a.last_update).getTime());
    } else {
      // When only one type is selected, use the original logic
      const wantedUserProfiles = activeFilters.profileCapacityTypes.includes(
        ProfileCapacityType.Learner
      )
        ? createProfilesFromUsers(usersLearner || [], ProfileCapacityType.Learner)
        : [];

      const availableUserProfiles = activeFilters.profileCapacityTypes.includes(
        ProfileCapacityType.Sharer
      )
        ? createProfilesFromUsers(usersSharer || [], ProfileCapacityType.Sharer)
        : [];

      const userProfiles = [...wantedUserProfiles, ...availableUserProfiles];

      return userProfiles.map(profile => ({
        ...profile,
        isSaved: isProfileSaved(profile.id),
      }));
    }
  }, [activeFilters, usersLearner, usersSharer, savedItems, isProfileSaved]);

  // Calculate total of pages based on total profiles
  const numberOfPages = Math.ceil(totalRecords / itemsPerPage);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [activeFilters]);

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
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

  // Only show full loading on initial load, not during search
  const shouldShowFullLoading =
    (!hasLoadedOnce && (isUsersLearnerLoading || isUsersSharerLoading)) ||
    isLoadingTranslations ||
    isLanguageChanging;

  if (shouldShowFullLoading) {
    return <LoadingState fullScreen={true} />;
  }

  // Ensure save type is a single value even when the profile is multi-type
  // To avoid errors when saving the profile
  // TODO: Fix this in the future, removing type from backend
  const resolveSaveType = (type: any) => {
    if (Array.isArray(type)) {
      // Prefer Sharer if present; otherwise use the first
      return type.includes(ProfileCapacityType.Sharer) ? ProfileCapacityType.Sharer : type[0];
    }
    return type;
  };

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
        const saveType = resolveSaveType(profile.type);
        createSavedItem('user', profile.id, saveType);
        showSnackbar(pageContent['saved-profiles-add-success'], 'success');
      }
    } catch {
      showSnackbar(pageContent['saved-profiles-error'], 'error');
    }
  };

  return (
    <div className="w-full flex flex-col items-center pt-24 md:pt-8 overflow-x-hidden">
      <div className="container mx-auto px-4 w-full max-w-full">
        <div className="md:max-w-[1200px] w-full max-w-sm mx-auto space-y-6">
          <SearchFilterSection
            searchTerm={searchTerm}
            onSearchChange={handleSearchChange}
            onShowFilters={setShowFilters}
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
