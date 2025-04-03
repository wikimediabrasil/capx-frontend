"use client";

import { useState, useEffect } from "react";
import { useTheme } from "@/contexts/ThemeContext";
import { useApp } from "@/contexts/AppContext";
import { PaginationButtons } from "@/app/(auth)/feed/components/PaginationButtons";
import { ProfileCard } from "@/app/(auth)/feed/components/Card";
import { useSavedItems, } from "@/hooks/useSavedItems";
import Image from "next/image";
import FilterIcon from "@/public/static/images/filter_icon.svg";
import FilterIconWhite from "@/public/static/images/filter_icon_white.svg";
import SearchIcon from "@/public/static/images/search_icon.svg";
import SearchIconWhite from "@/public/static/images/search_icon_white.svg";
import { Filters } from "@/app/(auth)/feed/components/Filters";
import LoadingState from "@/components/LoadingState";
import { ProfileCapacityType, ProfileFilterType } from "../types";
import { LanguageProficiency } from "@/types/language";

export default function SavedProfilesPage() {
  const { darkMode } = useTheme();
  const { pageContent } = useApp();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [activeFilters, setActiveFilters] = useState({
    type: [],
    territory: [],
    language: [],
  });

  const offset = (currentPage - 1) * itemsPerPage;
  
  const { 
    savedProfiles, 
    isLoading, 
    error, 
    count, 
    deleteSavedItem,
  } = useSavedItems(itemsPerPage, offset);

  const filteredProfiles = savedProfiles.filter(profile => {
    const matchesSearch = searchTerm === "" || 
      profile.username.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = activeFilters.type.length === 0 || 
      activeFilters.type.includes(profile.type as never);
    
    const matchesTerritory = activeFilters.territory.length === 0 || 
      (profile.territory && activeFilters.territory.includes(profile.territory as never));
    
    const matchesLanguage = activeFilters.language.length === 0 || 
      (profile.languages && profile.languages.some(lang => 
        activeFilters.language.includes(lang as never)
      ));
    
    return matchesSearch && matchesType && matchesTerritory && matchesLanguage;
  });

  const totalPages = Math.ceil(filteredProfiles.length / itemsPerPage);
  const paginatedProfiles = filteredProfiles.slice(
    0,
    itemsPerPage
  );

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleApplyFilters = (filters: any) => {
    setActiveFilters(filters);
    setShowFilters(false);
    setCurrentPage(1);
  };

  const handleRemoveSavedItem = async (savedItemId: number) => {
    await deleteSavedItem(savedItemId);
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
          <div className="flex gap-2 mb-6">
            {/* Search Field Container */}
            <div className="flex-1 relative">
              <div className={`
                flex flex-col rounded-lg border
                ${darkMode 
                  ? 'bg-capx-dark-box-bg border-gray-700 text-white' 
                  : 'bg-white border-gray-300'
                }
              `}>
                {/* Search Icon */}
                <div className="absolute right-3 top-4">
                  <Image
                    src={darkMode ? SearchIconWhite : SearchIcon}
                    alt="Search"
                    width={20}
                    height={20}
                  />
                </div>

                {/* Search Input */}
                <input
                  type="text"
                  placeholder={pageContent["saved-profiles-search-placeholder"] || "Buscar perfis..."}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`
                    w-full py-3 px-4 rounded-lg
                    ${darkMode 
                      ? 'bg-capx-dark-box-bg text-white placeholder-gray-400' 
                      : 'bg-white text-gray-900 placeholder-gray-500'
                    }
                    focus:outline-none
                  `}
                />
              </div>
            </div>

            {/* Filters Button */}
            <button
              onClick={() => setShowFilters(true)}
              className={`
                p-3 rounded-lg border
                ${darkMode 
                  ? 'bg-capx-dark-box-bg border-gray-700 hover:bg-gray-700' 
                  : 'bg-white border-gray-300 hover:bg-gray-100'
                }
              `}
              aria-label={pageContent["saved-profiles-filters-button"] || "Filtros"}
            >
              <Image
                src={darkMode ? FilterIconWhite : FilterIcon}
                alt="Filters"
                width={20}
                height={20}
              />
            </button>
          </div>

          {/* Loading state */}
          {isLoading ? (
            <LoadingState />
          ) : error ? (
            <div className={`p-4 rounded-md ${darkMode ? 'bg-red-900 text-white' : 'bg-red-100 text-red-800'}`}>
              {error}
            </div>
          ) : paginatedProfiles.length > 0 ? (
            <div className="w-full mx-auto space-y-6">
              {paginatedProfiles.map((profile, index) => (
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
            <div className="flex flex-col items-center justify-center py-12">
              <p className={`text-lg font-medium ${darkMode ? 'text-white' : 'text-gray-700'}`}>
                {pageContent["saved-profiles-no-data-message"] || "Nenhum perfil salvo encontrado"}
              </p>
              <p className={`mt-2 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                {pageContent["saved-profiles-no-data-description"] || "Tente ajustar os filtros ou salve alguns perfis"}
              </p>
            </div>
          )}
        </div>
      </div>
      
      {/* Pagination buttons */}
      {filteredProfiles.length > 0 && (
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
        initialFilters={{
          ...activeFilters,
          capacities: [],
          profileCapacityTypes: [],
          territories: [],
          languages: [],
          profileFilter: ProfileFilterType.Both
        }}
      />}
    </div>
  );
}
