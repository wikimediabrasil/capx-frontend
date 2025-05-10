"use client";

import { useEffect, useMemo, useState } from "react";
import { useTheme } from "@/contexts/ThemeContext";
import { useApp } from "@/contexts/AppContext";
import { useOrganizations } from "@/hooks/useOrganizationProfile";
import { Capacity } from "@/types/capacity";
import { PaginationButtons } from "@/components/PaginationButtons";
import {
  createProfilesFromOrganizations,
  FilterState,
  ProfileCapacityType,
  ProfileFilterType,
  Skill,
} from "@/app/(auth)/feed/types";
import { Filters } from "@/app/(auth)/feed/components/Filters";
import { SearchBar } from "@/app/(auth)/feed/components/SearchBar";

import Banner from "@/components/Banner";
import CapacitySelectionModal from "@/components/CapacitySelectionModal";
import OrgListBanner from "@/public/static/images/organization_list.svg";
import LoadingState from "@/components/LoadingState";
import ProfileCard from "@/app/(auth)/feed/components/ProfileCard";

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
    profileFilter: ProfileFilterType.Organization,
  });
  const [showSkillModal, setShowSkillModal] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const offset = (currentPage - 1) * itemsPerPage;

  const {
    organizations: organizationsLearner,
    count: organizationsLearnerCount,
    isLoading: isOrganizationsLearnerLoading,
  } = useOrganizations(itemsPerPage, offset, {
    ...activeFilters,
    profileCapacityTypes: [ProfileCapacityType.Learner],
  });

  const {
    organizations: organizationsSharer,
    count: organizationsSharerCount,
    isLoading: isOrganizationsSharerLoading,
  } = useOrganizations(itemsPerPage, offset, {
    ...activeFilters,
    profileCapacityTypes: [ProfileCapacityType.Sharer],
  });

  const totalRecords =
    (activeFilters.profileCapacityTypes.includes(ProfileCapacityType.Learner)
      ? organizationsLearnerCount
      : 0) +
    (activeFilters.profileCapacityTypes.includes(ProfileCapacityType.Sharer)
      ? organizationsSharerCount
      : 0);

  // Create profiles (to create cards) from organizations
  const filteredProfiles = useMemo(() => {
    const learnerOrgProfiles = createProfilesFromOrganizations(
      organizationsLearner || [],
      ProfileCapacityType.Learner
    );
    const availableOrgProfiles = createProfilesFromOrganizations(
      organizationsSharer || [],
      ProfileCapacityType.Sharer
    );

    // Filter organizations based on activeFilters.profileCapacityTypes
    const orgProfilesLearner = activeFilters.profileCapacityTypes.includes(
      ProfileCapacityType.Learner
    )
      ? learnerOrgProfiles
      : [];
    const orgProfilesSharer = activeFilters.profileCapacityTypes.includes(
      ProfileCapacityType.Sharer
    )
      ? availableOrgProfiles
      : [];
    const organizationProfiles = [...orgProfilesLearner, ...orgProfilesSharer];
    return organizationProfiles;
  }, [activeFilters, organizationsLearner, organizationsSharer, itemsPerPage]);

  // Calculate total of pages based on total profiles
  const numberOfPages = Math.ceil(totalRecords / itemsPerPage);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [activeFilters]);

  const handleCapacitySelect = (capacity: Capacity) => {
    const capacityExists = activeFilters.capacities.some(
      (cap) => cap.code == capacity.code
    );

    if (capacityExists) {
      return;
    }

    setActiveFilters((prev) => ({
      ...prev,
      capacities: [
        ...prev.capacities,
        {
          code: capacity.code,
          name: capacity.name,
        },
      ],
    }));
  };

  const handleRemoveCapacity = (capacityCode: number) => {
    setActiveFilters((prev) => ({
      ...prev,
      capacities: prev.capacities.filter((cap) => cap.code !== capacityCode),
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

  if (isOrganizationsLearnerLoading || isOrganizationsSharerLoading) {
    return <LoadingState />;
  }

  return (
    <div className="w-full flex flex-col items-center pt-24 md:pt-8">
      <Banner
        image={OrgListBanner}
        title={pageContent["organization-list-banner-page"]}
        alt={pageContent["organization-list-alt-banner"]}
      />
      <div className="container mx-auto px-4 mt-6">
        <div className="md:max-w-[1200px] w-full max-w-sm mx-auto space-y-6">
          {/* SearchBar and Filters Button */}
          <SearchBar
            showCapacitiesSearch={true}
            selectedCapacities={activeFilters.capacities}
            onRemoveCapacity={handleRemoveCapacity}
            onCapacityInputFocus={() => setShowSkillModal(true)}
            capacitiesPlaceholder={pageContent["filters-search-by-capacities"]}
            removeItemAltText={pageContent["filters-remove-item-alt-icon"]}
            onFilterClick={() => setShowFilters(true)}
            filterAriaLabel={pageContent["saved-profiles-filters-button"]}
          />

          <CapacitySelectionModal
            isOpen={showSkillModal}
            onClose={() => setShowSkillModal(false)}
            onSelect={handleCapacitySelect}
            title={pageContent["select-capacity"]}
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
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12">
              <p
                className={`text-lg font-medium ${
                  darkMode ? "text-white" : "text-gray-700"
                }`}
              >
                {pageContent["feed-no-data-message"]}
              </p>
              <p
                className={`mt-2 text-sm ${
                  darkMode ? "text-gray-400" : "text-gray-500"
                }`}
              >
                {pageContent["feed-no-data-description"]}
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
