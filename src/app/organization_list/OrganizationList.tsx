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
import { Capacity } from '@/types/capacity';
import { useEffect, useMemo, useState } from 'react';

import Banner from '@/components/Banner';
import LoadingState from '@/components/LoadingState';
import { addUniqueCapacities } from '@/lib/utils/capacitiesUtils';
import OrgListBanner from '@/public/static/images/organization_list.svg';

// Removed duplicated components - now using shared components

export default function OrganizationList() {
  const { darkMode } = useTheme();
  const { pageContent } = useApp();

  // Use shared language sync logic
  const { isLanguageChanging, isLoadingTranslations } = useLanguageSync();

  const [showFilters, setShowFilters] = useState(false);
  const [activeFilters, setActiveFilters] = useState({
    capacities: [] as Skill[],
    profileCapacityTypes: [
      ProfileCapacityType.Learner,
      ProfileCapacityType.Sharer,
    ] as ProfileCapacityType[],
    territories: [] as string[],
    languages: [] as string[],
  });
  const [showSkillModal, setShowSkillModal] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const offset = (currentPage - 1) * itemsPerPage;

  // Get all organizations (fetch more data for frontend pagination)
  const {
    organizations: allOrganizations,
    count: allOrganizationsCount,
    isLoading: isAllOrganizationsLoading,
  } = useOrganizations(1000, 0, {
    // Fetch more data for proper sorting
    ...activeFilters,
    profileCapacityTypes: [],
  });

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
    return organizationProfiles.sort((a, b) => {
      // First sort by priority
      if (a.priority !== b.priority) {
        return a.priority - b.priority;
      }
      // Then sort by username alphabetically within the same priority
      return a.username.localeCompare(b.username);
    });
  }, [allOrganizations]);

  // Apply pagination to sorted profiles
  const filteredProfiles = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return allProfiles.slice(startIndex, endIndex);
  }, [allProfiles, currentPage, itemsPerPage]);

  // Calculate total of pages based on sorted profiles
  const numberOfPages = Math.ceil(allProfiles.length / itemsPerPage);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [activeFilters]);

  // Helper function to update active filters
  const updateActiveFilters = (updater: (prev: typeof activeFilters) => typeof activeFilters) => {
    setActiveFilters(updater);
  };

  const handleCapacitySelect = (capacities: Capacity[]) => {
    updateActiveFilters(prev => ({
      ...prev,
      capacities: addUniqueCapacities(prev.capacities, capacities),
    }));
  };

  const handleRemoveCapacity = (capacityCode: number) => {
    updateActiveFilters(prev => ({
      ...prev,
      capacities: prev.capacities.filter(cap => cap.code !== capacityCode),
    }));
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

  if (isAllOrganizationsLoading || isLoadingTranslations || isLanguageChanging) {
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
            activeFilters={activeFilters}
            showSkillModal={showSkillModal}
            onRemoveCapacity={handleRemoveCapacity}
            onShowSkillModal={setShowSkillModal}
            onShowFilters={setShowFilters}
            onCapacitySelect={handleCapacitySelect}
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
