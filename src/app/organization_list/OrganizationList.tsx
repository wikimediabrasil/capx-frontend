'use client';

import { Filters } from '@/app/(auth)/feed/components/Filters';
import { FilterState, ProfileCapacityType, Skill } from '@/app/(auth)/feed/types';
import { useLanguageSync } from '@/components/LanguageSync';
import { PaginationButtons } from '@/components/PaginationButtons';
import { ProfileListWithEmpty } from '@/components/ProfileListWithEmpty';
import { SearchFilterSection } from '@/components/SearchFilterSection';
import { useApp } from '@/contexts/AppContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useOrganizations } from '@/hooks/useOrganizationProfile';
import { useDebounce } from '@/hooks/useDebounce';
import { useEffect, useMemo, useState } from 'react';

import Banner from '@/components/Banner';
import LoadingState from '@/components/LoadingState';
import OrgListBanner from '@/public/static/images/organization_list.svg';

// Removed duplicated components - now using shared components

export default function OrganizationList() {
  const { darkMode } = useTheme();
  const { pageContent } = useApp();

  // Use shared language sync logic
  const { isLanguageChanging, isLoadingTranslations } = useLanguageSync();

  const [showFilters, setShowFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const [isSearching, setIsSearching] = useState(false);
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);

  const [activeFilters, setActiveFilters] = useState({
    capacities: [] as Skill[],
    profileCapacityTypes: [
      ProfileCapacityType.Learner,
      ProfileCapacityType.Sharer,
    ] as ProfileCapacityType[],
    territories: [] as string[],
    languages: [] as string[],
    name: undefined as string | undefined,
  });

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Always fetch all organizations for client-side filtering and pagination
  const hasSearch = !!debouncedSearchTerm;
  const fetchLimit = 1000;
  const fetchOffset = 0;

  // Track when user is typing (before debounce finishes)
  useEffect(() => {
    if (searchTerm !== debouncedSearchTerm) {
      setIsSearching(true);
    } else {
      setIsSearching(false);
    }
  }, [searchTerm, debouncedSearchTerm]);

  // Get all organizations (fetch more data for frontend pagination)
  // Don't send name filter to backend as it doesn't support it
  const {
    organizations: allOrganizations,
    count: allOrganizationsCount,
    isLoading: isAllOrganizationsLoading,
  } = useOrganizations(fetchLimit, fetchOffset, {
    // Fetch more data for proper sorting
    capacities: activeFilters.capacities,
    profileCapacityTypes: [],
    territories: activeFilters.territories,
    languages: activeFilters.languages,
    // Don't send name - backend doesn't support it
  });

  // Mark as loaded once data is fetched
  useEffect(() => {
    if (!isAllOrganizationsLoading && allOrganizations) {
      setHasLoadedOnce(true);
    }
  }, [isAllOrganizationsLoading, allOrganizations]);

  const totalRecords = allOrganizationsCount;

  // Helper function to create organization profile object
  const createOrganizationProfile = (
    org: any,
    capacities: any[],
    type: ProfileCapacityType | ProfileCapacityType[] | 'incomplete',
    hasIncompleteProfile: boolean,
    priority: number,
    wantedCapacities?: any[],
    availableCapacities?: any[]
  ) => ({
    id: org.id,
    username: org.display_name,
    capacities,
    wantedCapacities: wantedCapacities || [],
    availableCapacities: availableCapacities || [],
    type,
    profile_image: org.profile_image,
    territory: org.territory?.[0],
    avatar: org.profile_image || undefined,
    isOrganization: true,
    hasIncompleteProfile,
    priority,
  });

  // Helper function to check if capacities array is valid and non-empty
  const hasValidCapacities = (capacities: any) =>
    capacities && Array.isArray(capacities) && capacities.length > 0;

  // Create profiles (to create cards) from organizations
  const allProfiles = useMemo(() => {
    if (!allOrganizations) return [];

    const organizationProfiles: any[] = [];

    allOrganizations.forEach(org => {
      const hasWantedCapacities = hasValidCapacities(org.wanted_capacities);
      const hasAvailableCapacities = hasValidCapacities(org.available_capacities);

      if (hasWantedCapacities && hasAvailableCapacities) {
        // Organization has both wanted and available capacities - create unified profile
        organizationProfiles.push(
          createOrganizationProfile(
            org,
            [...(org.wanted_capacities || []), ...(org.available_capacities || [])],
            [ProfileCapacityType.Learner, ProfileCapacityType.Sharer],
            false,
            1,
            org.wanted_capacities,
            org.available_capacities
          )
        );
      } else if (hasWantedCapacities) {
        // Organization has only wanted capacities
        organizationProfiles.push(
          createOrganizationProfile(
            org,
            org.wanted_capacities,
            ProfileCapacityType.Learner,
            false,
            1,
            org.wanted_capacities,
            []
          )
        );
      } else if (hasAvailableCapacities) {
        // Organization has only available capacities
        organizationProfiles.push(
          createOrganizationProfile(
            org,
            org.available_capacities,
            ProfileCapacityType.Sharer,
            false,
            1,
            [],
            org.available_capacities
          )
        );
      } else {
        // Organization has no capacities - create incomplete profile
        organizationProfiles.push(
          createOrganizationProfile(org, [], 'incomplete' as any, true, 2, [], [])
        );
      }
    });

    // Sort profiles by priority (organizations with capacities first, then incomplete ones)
    const sortedProfiles = organizationProfiles.sort((a, b) => {
      // First sort by priority
      if (a.priority !== b.priority) {
        return a.priority - b.priority;
      }
      // Then sort by username alphabetically within the same priority
      return a.username.localeCompare(b.username);
    });

    // Filter by search term if present (client-side filtering)
    if (debouncedSearchTerm) {
      const searchLower = debouncedSearchTerm.toLowerCase();
      return sortedProfiles.filter(profile =>
        profile.username.toLowerCase().includes(searchLower)
      );
    }

    return sortedProfiles;
  }, [allOrganizations, debouncedSearchTerm]);

  // Apply pagination to sorted and filtered profiles (always client-side)
  const filteredProfiles = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return allProfiles.slice(startIndex, endIndex);
  }, [allProfiles, currentPage, itemsPerPage]);

  // Calculate total of pages based on filtered profiles
  const numberOfPages = useMemo(() => {
    return Math.ceil(allProfiles.length / itemsPerPage);
  }, [allProfiles.length, itemsPerPage]);

  // Reset to first page when search term or filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchTerm, activeFilters.capacities, activeFilters.territories]);

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
    (!hasLoadedOnce && isAllOrganizationsLoading) ||
    isLoadingTranslations ||
    isLanguageChanging;

  if (shouldShowFullLoading) {
    return <LoadingState fullScreen={true} />;
  }

  return (
    <div className="w-full flex flex-col items-center pt-24 md:pt-8">
      <Banner
        image={OrgListBanner}
        title={pageContent['organization-list-banner-page']}
        alt={pageContent['organization-list-alt-banner']}
      />
      <div className="container mx-auto px-4 mt-6">
        <div className="md:max-w-[1200px] w-full max-w-sm mx-auto space-y-6">
          <SearchFilterSection
            searchTerm={searchTerm}
            onSearchChange={handleSearchChange}
            onShowFilters={setShowFilters}
            searchPlaceholder={pageContent['filters-search-by-organization']}
          />

          <ProfileListWithEmpty profiles={filteredProfiles} />
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
          isOnlyOrganization={true}
        />
      )}
    </div>
  );
}
