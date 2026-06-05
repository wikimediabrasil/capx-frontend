'use client';

import { useSnackbar } from '@/app/providers/SnackbarProvider';
import { useLanguageSync } from '@/components/LanguageSync';
import { FeedPageSkeleton } from '@/components/skeletons';
import { PaginationButtons } from '@/components/PaginationButtons';
import { ProfileListWithEmpty } from '@/components/ProfileListWithEmpty';
import { SearchFilterSection } from '@/components/SearchFilterSection';
import { useDebounce } from '@/hooks/useDebounce';
import { useSavedItems } from '@/hooks/useSavedItems';
import { useAllUsers } from '@/hooks/useUserProfile';
import { useEffect, useMemo, useState } from 'react';
import { Filters } from './components/Filters';
import { CapacityVisibilityControls } from './components/CapacityVisibilityControls';
import { usePageContent } from '@/stores';
import { createUnifiedProfiles, FilterState, ProfileCapacityType, Skill } from './types';

export default function FeedPage() {
  const pageContent = usePageContent();
  const { showSnackbar } = useSnackbar();

  // Use shared language sync logic
  const { isLanguageChanging, isLoadingTranslations } = useLanguageSync();

  const [showFilters, setShowFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);
  const [showWanted, setShowWanted] = useState(true);
  const [showAvailable, setShowAvailable] = useState(true);
  const [showKnown, setShowKnown] = useState(true);

  const [activeFilters, setActiveFilters] = useState<FilterState>({
    capacities: [] as Skill[],
    profileCapacityTypes: [
      ProfileCapacityType.Learner,
      ProfileCapacityType.Sharer,
      ProfileCapacityType.Known,
    ] as ProfileCapacityType[],
    territories: [] as string[],
    languages: [] as string[],
    name: undefined,
    affiliations: [] as string[],
    includeIncompleteProfiles: true,
  });

  // Update activeFilters with debounced search term
  useEffect(() => {
    setActiveFilters(prev => ({
      ...prev,
      name: debouncedSearchTerm || undefined,
    }));
  }, [debouncedSearchTerm]);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const offset = (currentPage - 1) * itemsPerPage;

  const { savedItems, createSavedItem, deleteSavedItem } = useSavedItems();

  const {
    allUsers,
    count: totalRecords,
    isLoading: isUsersLoading,
  } = useAllUsers({
    limit: itemsPerPage,
    offset,
    activeFilters,
    ordering: '-last_update',
    includeUsersWithoutSkills: activeFilters.includeIncompleteProfiles,
  });

  // Mark as loaded once data is fetched
  useEffect(() => {
    if (!isUsersLoading) {
      setHasLoadedOnce(true);
    }
  }, [isUsersLoading]);

  const isProfileSaved = (profileId: number) => {
    if (!savedItems) return false;

    return savedItems.some(item => item.entity_id === profileId && item.entity === 'user');
  };

  // Create profiles (to create cards) from users — includes incomplete profiles (no capacities)
  const filteredProfiles = useMemo(() => {
    if (!allUsers?.length) return [];

    return createUnifiedProfiles(allUsers)
      .map(profile => ({
        ...profile,
        isSaved: isProfileSaved(profile.id),
      }))
      .filter(profile => activeFilters.includeIncompleteProfiles || !profile.hasIncompleteProfile)
      .sort((a, b) => new Date(b.last_update).getTime() - new Date(a.last_update).getTime());
  }, [allUsers, savedItems, activeFilters.includeIncompleteProfiles]);

  // Calculate total of pages based on total profiles
  const numberOfPages = Math.ceil(totalRecords / itemsPerPage) || 1;

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

  const isInitialLoading = !hasLoadedOnce && isUsersLoading;
  const isTranslationLoading = isLoadingTranslations || isLanguageChanging;


  if (isInitialLoading) {
    return (
      <div className="w-full flex flex-col items-center pt-24 md:pt-8 overflow-x-hidden">
        <div className="container mx-auto px-4 w-full max-w-full">
          <div className="md:max-w-[1200px] w-full max-w-sm mx-auto space-y-6">
            <FeedPageSkeleton />
          </div>
        </div>
      </div>
    );
  }

  if (isTranslationLoading) {
    return (
      <div className="w-full flex flex-col items-center pt-24 md:pt-8 overflow-x-hidden">
        <div className="container mx-auto px-4 w-full max-w-full">
          <div className="md:max-w-[1200px] w-full max-w-sm mx-auto space-y-6">
            <FeedPageSkeleton />
          </div>
        </div>
      </div>
    );
  }

  // Ensure save type is a single value even when the profile is multi-type
  // TODO: Fix this in the future, removing type from backend
  const resolveSaveType = (type: any) => {
    if (type === ProfileCapacityType.Incomplete) {
      return ProfileCapacityType.Learner;
    }
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

          <CapacityVisibilityControls
            showWanted={showWanted}
            showAvailable={showAvailable}
            showKnown={showKnown}
            includeIncompleteProfiles={activeFilters.includeIncompleteProfiles}
            onToggleWanted={() => setShowWanted(!showWanted)}
            onToggleAvailable={() => setShowAvailable(!showAvailable)}
            onToggleKnown={() => setShowKnown(!showKnown)}
            onToggleIncludeIncompleteProfiles={() =>
              setActiveFilters(prev => ({
                ...prev,
                includeIncompleteProfiles: !prev.includeIncompleteProfiles,
              }))
            }
          />

          <ProfileListWithEmpty
            profiles={filteredProfiles}
            onToggleSaved={handleToggleSaved}
            showWanted={showWanted}
            showAvailable={showAvailable}
            showKnown={showKnown}
          />
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
