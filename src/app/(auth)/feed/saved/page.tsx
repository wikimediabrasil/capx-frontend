"use client";

import { useState, useEffect, useCallback } from "react";
import { useTheme } from "@/contexts/ThemeContext";
import { useApp } from "@/contexts/AppContext";
import { PaginationButtons } from "@/app/(auth)/feed/components/PaginationButtons";
import { ProfileCard } from "@/app/(auth)/feed/components/Card";
import { useSavedItems } from "@/hooks/useSavedItems";
import { Filters } from "@/app/(auth)/feed/components/Filters";
import LoadingState from "@/components/LoadingState";
import { FilterState, ProfileCapacityType, ProfileFilterType, Skill } from "../types";
import { LanguageProficiency } from "@/types/language";
import { SearchBar } from "../components/SearchBar";
import { NoResults } from "../components/NoResults";
import CapacitySelectionModal from "../../profile/edit/components/CapacitySelectionModal";
import { Capacity } from "@/types/capacity";

export default function SavedProfilesPage() {
  const { darkMode } = useTheme();
  const { pageContent } = useApp();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const [showFilters, setShowFilters] = useState(false);
  const [showSkillModal, setShowSkillModal] = useState(false);
  const [activeFilters, setActiveFilters] = useState({
    capacities: [] as Skill[],
    profileCapacityTypes: [ProfileCapacityType.Learner, ProfileCapacityType.Sharer] as ProfileCapacityType[],
    territories: [] as string[],
    languages: [] as string[],
    profileFilter: ProfileFilterType.Both
  });
  
  const { 
    paginatedProfiles,
    applyFilters,
    isLoading, 
    error, 
    count, 
    deleteSavedItem,
  } = useSavedItems();

  const handleFiltersChange = useCallback(() => {
    applyFilters({
      profileCapacityTypes: activeFilters.profileCapacityTypes,
      territories: activeFilters.territories,
      languages: activeFilters.languages,
      capacities: activeFilters.capacities,
      profileFilter: activeFilters.profileFilter
    });
    setCurrentPage(1);
  }, [activeFilters, applyFilters]);

  useEffect(() => {
    handleFiltersChange();
  }, [handleFiltersChange]);

  const currentProfiles = paginatedProfiles(currentPage, itemsPerPage);
  
  const totalPages = Math.ceil(count / itemsPerPage);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleApplyFilters = (filters: FilterState) => {
    setActiveFilters(filters);
    setShowFilters(false);
    setCurrentPage(1);
  };

  const handleRemoveSavedItem = async (savedItemId: number) => {
    await deleteSavedItem(savedItemId);
  };

  const handleCapacitySelect = (capacity: Capacity) => {
    const capacityExists = activeFilters.capacities.some(
      cap => cap.code == capacity.code
    );

    if (capacityExists) {
      return;
    }

    setActiveFilters(prev => ({
      ...prev,
      capacities: [...prev.capacities, {
        code: capacity.code,
        name: capacity.name,
      }]
    }));
  };

  const handleRemoveCapacity = (capacityCode: number) => {
    setActiveFilters(prev => ({
      ...prev,
      capacities: prev.capacities.filter(cap => cap.code !== capacityCode)
    }));
  };

  return (
    <div className="w-full flex flex-col items-center pt-24 md:pt-8">
      <div className="container mx-auto px-4">
        <div className="md:max-w-[1200px] w-full max-w-sm mx-auto space-y-6">
          {/* Page title */}
          <h1 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            {pageContent["saved-profiles-title"]}
          </h1>
          
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

          {/* Loading state */}
          {isLoading ? (
            <LoadingState />
          ) : error ? (
            <div className={`p-4 rounded-md ${darkMode ? 'bg-red-900 text-white' : 'bg-red-100 text-red-800'}`}>
              {error}
            </div>
          ) : count > 0 ? (
            <div className="w-full mx-auto space-y-6">
              {currentProfiles.map((profile, index) => (
                <ProfileCard 
                  id={String(profile.id)}
                  key={index}
                  profile_image={profile.profile_image}
                  username={profile.username}
                  type={profile.type as ProfileCapacityType}
                  capacities={profile.capacities || []}
                  avatar={profile.avatar}
                  languages={profile.languages as LanguageProficiency[]}
                  territory={profile.territory}
                  isOrganization={profile.isOrganization}
                  isSaved={true}
                  onToggleSaved={() => handleRemoveSavedItem(profile.savedItemId)}
                />
              ))}
            </div>
          ) : (
            <NoResults
              title={pageContent["feed-no-data-message"]}
              description={pageContent["feed-no-data-description"]}
            />
          )}
        </div>
      </div>
      
      {/* Pagination buttons */}
      {count > 0 && (
        <PaginationButtons
          currentPage={currentPage}
          totalPages={totalPages || 1}
          onPageChange={handlePageChange}
        />
      )}

      {/* Filters Modal */}
      {showFilters && <Filters
        onClose={() => setShowFilters(false)}
        onApplyFilters={handleApplyFilters}
        initialFilters={activeFilters}
      />}
    </div>
  );
}
