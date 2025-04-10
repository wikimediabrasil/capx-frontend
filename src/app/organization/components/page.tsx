"use client";

import { useEffect, useMemo, useState } from "react";
import { useTheme } from "@/contexts/ThemeContext";
import { useApp } from "@/contexts/AppContext";
import { useOrganizations } from "@/hooks/useOrganizationProfile";
import { Organization } from "@/types/organization";
import { useSearchParams, useRouter } from 'next/navigation';
import { useCapacity } from "@/hooks/useCapacityDetails";
import { Capacity } from "@/types/capacity";
import { PaginationButtons } from "@/components/PaginationButtons";
import { FilterState, ProfileCapacityType, ProfileFilterType, Skill } from "@/app/(auth)/feed/types";
import { Filters } from "@/app/(auth)/feed/components/Filters";

import ProfileCard from "@/app/(auth)/feed/components/Card";
import Image from "next/image";
import FilterIcon from "@/public/static/images/filter_icon.svg";
import FilterIconWhite from "@/public/static/images/filter_icon_white.svg";
import SearchIcon from "@/public/static/images/search_icon.svg";
import SearchIconWhite from "@/public/static/images/search_icon_white.svg";
import CloseIcon from "@/public/static/images/close_mobile_menu_icon_light_mode.svg";
import CloseIconWhite from "@/public/static/images/close_mobile_menu_icon_dark_mode.svg";
import CapacitySelectionModal from "@/app/(auth)/profile/edit/components/CapacitySelectionModal";
import OrgList from "@/public/static/images/org_list.svg";
import OrgListDesktop from "@/public/static/images/org_list_desktop.svg";

const createProfilesFromOrganizations = (organizations: Organization[], type: ProfileCapacityType) => {
  const profiles: any[] = [];
  organizations.forEach(org => {
      profiles.push({
        id: org.id,
        username: org.display_name,
        capacities: type === ProfileCapacityType.Learner ? org.wanted_capacities : org.available_capacities,
        type,
        profile_image: org.profile_image,
        territory: org.territory?.[0],
        avatar: org.profile_image || undefined,
        isOrganization: true
      });
  });
  return profiles;
};

export default function FeedPage() {
  const { darkMode } = useTheme();
  const { pageContent } = useApp();
  const router = useRouter();

  const searchParams = useSearchParams();
  const capacityCode = searchParams.get('capacityId');

  const [showFilters, setShowFilters] = useState(false);
  const [activeFilters, setActiveFilters] = useState({
    capacities: [] as Skill[],
    profileCapacityTypes: [ProfileCapacityType.Learner, ProfileCapacityType.Sharer] as ProfileCapacityType[],
    territories: [] as string[],
    languages: [] as string[],
    profileFilter: ProfileFilterType.Organization
  });
  const [showSkillModal, setShowSkillModal] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const items = 10;
  const itemsPerPage = items * 2; // Total of profiles per page
  const offset = (currentPage - 1) * items;

  const { capacity, isLoading: isLoadingCapacity } = useCapacity(capacityCode);

  // Get data from capacityById
  useEffect(() => {
    if (capacityCode && capacity) {
      const capacityExists = activeFilters.capacities.some(
        cap => cap.code == Number(capacityCode)
      );

      if (capacityExists) {
        return;
      }

      setActiveFilters(prev => ({
        ...prev,
        capacities: [{
          code: Number(capacity.code),
          name: capacity.name,
        }]
      }));
    }
  }, [capacityCode, isLoadingCapacity]);

  const { organizations: organizationsLearner, count: organizationsLearnerCount, isLoading: isOrganizationsLearnerLoading } = useOrganizations(
    items,
    offset,
    {
      ...activeFilters,
      profileCapacityTypes: [ProfileCapacityType.Learner]
    }
  );

  const { organizations: organizationsSharer, count: organizationsSharerCount, isLoading: isOrganizationsSharerLoading } = useOrganizations(
    items,
    offset,
    {
      ...activeFilters,
      profileCapacityTypes: [ProfileCapacityType.Sharer]
    }
  );

  // Total of records according to the profileFilter
  let totalRecords = 0;


  // Create profiles (to create cards) from organizations
  const filteredProfiles = useMemo(() => {
    const learnerOrgProfiles = createProfilesFromOrganizations(organizationsLearner || [], ProfileCapacityType.Learner);
    const availableOrgProfiles = createProfilesFromOrganizations(organizationsSharer || [], ProfileCapacityType.Sharer);

    // Filter organizations based on activeFilters.profileCapacityTypes
    const orgProfilesLearner = activeFilters.profileCapacityTypes.includes(ProfileCapacityType.Learner) ? learnerOrgProfiles : [];
    const orgProfilesSharer = activeFilters.profileCapacityTypes.includes(ProfileCapacityType.Sharer) ? availableOrgProfiles : [];
    const organizationProfiles = [...orgProfilesLearner, ...orgProfilesSharer];
    return organizationProfiles;
  }, [activeFilters, organizationsLearner, organizationsSharer, items]);
   
  // Calculate total of pages based on total profiles
  const numberOfPages = Math.ceil(totalRecords / (itemsPerPage));

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [activeFilters]);

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

    const urlCapacityId = searchParams.get('capacityId');
    
    // If the capacity removed is the same as the URL, update the URL
    if (urlCapacityId && urlCapacityId.toString() == capacityCode.toString() || urlCapacityId && urlCapacityId.toString() == capacity?.code?.toString()) {
      router.replace('/feed/organization', { scroll: false });
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

  if (isOrganizationsLearnerLoading || isOrganizationsSharerLoading) {
    return <div className="flex justify-center items-center h-screen">{pageContent["loading"]}</div>;
  }

  return (
    <div className="w-full flex flex-col items-center pt-24 md:pt-8">
        <div className="w-full mx-auto px-4 py-8 md:max-w-[1200px] md:pt-0 relative">
          <div className="hidden md:block relative">
            <Image
                src={OrgListDesktop}
                alt={pageContent["organization-list-banner-desktop"]}
                className="w-full h-auto md:max-h-[600px]"
            />
            <h1 className="absolute left-[55%] top-[40%] text-[#FFFFFF] text-[48px] font-[Montserrat] font-bold">
                {pageContent["organization-list-banner-page"]}
            </h1>
          </div>
          <div className="block md:hidden relative">
            <Image
                src={OrgList}
                alt={pageContent["organization-list-banner-mobile"]}
                className="w-full h-auto md:max-h-[600px]"
            />
            <h1 className="absolute bottom-[8%] left-[30%] text-[#FFFFFF] text-center text-[20px] font-[Montserrat] font-bold ">
                {pageContent["organization-list-banner-page"]}
            </h1>
          </div>
        </div>
      <div className="container mx-auto px-4">
        <div className="md:max-w-[1200px] w-full max-w-sm mx-auto space-y-6">
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

                {/* Container for the selected capacities and the input */}
                <div className={`
                  flex flex-wrap items-start gap-2 p-3 pr-12
                  ${darkMode ? 'bg-capx-dark-box-bg' : 'bg-white'}
                `}>
                  {/* Selected Capacities */}
                  {activeFilters.capacities.map((capacity, index) => (
                    <span
                      key={index}
                      className={`
                        inline-flex items-center gap-1 px-2 py-1 rounded-md text-sm max-w-[200px]
                        ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}
                      `}
                    >
                      <span className="truncate">{capacity.name}</span>
                      <button
                        onClick={() => handleRemoveCapacity(capacity.code)}
                        className="hover:opacity-80 flex-shrink-0"
                      >
                        <Image
                          src={darkMode ? CloseIconWhite : CloseIcon}
                          alt={pageContent["filters-remove-item-alt-icon"]}
                          width={16}
                          height={16}
                        />
                      </button>
                    </span>
                  ))}

                  {/* Search Input */}
                  <div className="flex-1 min-w-[120px]">
                    <input
                      readOnly
                      type="text"
                      onFocus={() => setShowSkillModal(true)}
                      placeholder={activeFilters.capacities.length === 0 ? pageContent["filters-search-by-capacities"] : ''}
                      className={`
                        w-full outline-none overflow-ellipsis bg-transparent
                        ${darkMode ? 'text-white placeholder:text-gray-400' : 'text-gray-900 placeholder:text-gray-500'}
                      `}
                    />
                  </div>
                </div>
              </div>
            </div>

            <CapacitySelectionModal
              isOpen={showSkillModal}
              onClose={() => setShowSkillModal(false)}
              onSelect={handleCapacitySelect}
              title={pageContent["select-capacity"]}
            />

            {/* Filters Button */}
            <button
              onClick={() => setShowFilters(true)}
              className={`
                w-12 h-12 flex-shrink-0 rounded-lg flex items-center justify-center
                ${darkMode 
                  ? 'bg-capx-dark-box-bg text-white hover:bg-gray-700' 
                  : 'bg-white border border-gray-300 hover:bg-gray-50'
                }
              `}
              aria-label="Open filters"
            >
              <Image
                src={darkMode ? FilterIconWhite : FilterIcon}
                alt={pageContent["filters-icon"]}
                width={24}
                height={24}
              />
            </button>
          </div>

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
            <p className={`text-lg font-medium ${darkMode ? 'text-white' : 'text-gray-700'}`}>
              {pageContent["feed-no-data-message"]}
            </p>
            <p className={`mt-2 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
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
        />
      )}
    </div>
  );
}
