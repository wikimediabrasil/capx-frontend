'use client';

import { Filters } from '@/app/(auth)/feed/components/Filters';
import { SearchBar } from '@/app/(auth)/feed/components/SearchBar';
import {
  createProfilesFromOrganizations,
  FilterState,
  ProfileCapacityType,
  Skill,
} from '@/app/(auth)/feed/types';
import { PaginationButtons } from '@/components/PaginationButtons';
import { useApp } from '@/contexts/AppContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useOrganizations } from '@/hooks/useOrganizationProfile';
import { Capacity } from '@/types/capacity';
import { useEffect, useMemo, useState } from 'react';

import { ProfileCard } from '@/app/(auth)/feed/components/ProfileCard';
import Banner from '@/components/Banner';
import CapacitySelectionModal from '@/components/CapacitySelectionModal';
import LoadingState from '@/components/LoadingState';
import { addUniqueCapacities } from '@/lib/utils/capacitiesUtils';
import OrgListBanner from '@/public/static/images/organization_list.svg';

export default function OrganizationList() {
  const { darkMode } = useTheme();
  const { pageContent } = useApp();

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

  // Create profiles (to create cards) from organizations
  const allProfiles = useMemo(() => {
    if (!allOrganizations) return [];

    const organizationProfiles: any[] = [];

    allOrganizations.forEach(org => {
      // Check if the organization has wanted capacities (learner)
      const hasWantedCapacities =
        org.wanted_capacities &&
        Array.isArray(org.wanted_capacities) &&
        org.wanted_capacities.length > 0;
      // Check if the organization has available capacities (sharer)
      const hasAvailableCapacities =
        org.available_capacities &&
        Array.isArray(org.available_capacities) &&
        org.available_capacities.length > 0;

      // If the organization has wanted capacities, create a learner profile
      if (hasWantedCapacities) {
        organizationProfiles.push({
          id: org.id,
          username: org.display_name,
          capacities: org.wanted_capacities,
          type: ProfileCapacityType.Learner,
          profile_image: org.profile_image,
          territory: org.territory?.[0],
          avatar: org.profile_image || undefined,
          isOrganization: true,
          hasIncompleteProfile: false,
          priority: 1, // High priority for organizations with capacities
        });
      }

      // If the organization has available capacities, create a sharer profile
      if (hasAvailableCapacities) {
        organizationProfiles.push({
          id: org.id,
          username: org.display_name,
          capacities: org.available_capacities,
          type: ProfileCapacityType.Sharer,
          profile_image: org.profile_image,
          territory: org.territory?.[0],
          avatar: org.profile_image || undefined,
          isOrganization: true,
          hasIncompleteProfile: false,
          priority: 1, // High priority for organizations with capacities
        });
      }

      // If the organization has no capacities, create an incomplete profile
      if (!hasWantedCapacities && !hasAvailableCapacities) {
        organizationProfiles.push({
          id: org.id,
          username: org.display_name,
          capacities: [],
          type: 'incomplete' as any, // Special type for incomplete profile
          profile_image: org.profile_image,
          territory: org.territory?.[0],
          avatar: org.profile_image || undefined,
          isOrganization: true,
          hasIncompleteProfile: true,
          priority: 2, // Lower priority for incomplete profiles
        });
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

  const handleCapacitySelect = (capacities: Capacity[]) => {
    setActiveFilters(prev => ({
      ...prev,
      capacities: addUniqueCapacities(prev.capacities, capacities),
    }));
  };

  const handleRemoveCapacity = (capacityCode: number) => {
    setActiveFilters(prev => ({
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

  if (isAllOrganizationsLoading) {
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
                  isOrganization={profile.isOrganization}
                  hasIncompleteProfile={profile.hasIncompleteProfile}
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
          isOnlyOrganization={true}
        />
      )}
    </div>
  );
}
