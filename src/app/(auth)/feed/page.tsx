"use client";

import { useEffect, useMemo, useState } from "react";
import { useTheme } from "@/contexts/ThemeContext";
import Image from "next/image";
import ProfileCard from "./components/Card";
import FilterIcon from "@/public/static/images/filter_icon.svg";
import FilterIconWhite from "@/public/static/images/filter_icon_white.svg";
import SearchIcon from "@/public/static/images/search_icon.svg";
import SearchIconWhite from "@/public/static/images/search_icon_white.svg";
import CloseIcon from "@/public/static/images/close_mobile_menu_icon_light_mode.svg";
import CloseIconWhite from "@/public/static/images/close_mobile_menu_icon_dark_mode.svg";
import { Filters } from "./components/Filters";
import { useApp } from "@/contexts/AppContext";
import {
  Skill,
  FilterState,
  ProfileCapacityType,
  ProfileFilterType,
} from "./types";
import { useOrganizations } from "@/hooks/useOrganizationProfile";
import { Organization } from "@/types/organization";
import { UserProfile } from "@/types/user";
import { useAllUsers } from "@/hooks/useUserProfile";
import { PaginationButtons } from "./components/PaginationButtons";
import CapacitySelectionModal from "@/components/CapacitySelectionModal";
import { useSearchParams, useRouter } from "next/navigation";
import { useCapacity } from "@/hooks/useCapacityDetails";
import { Capacity } from "@/types/capacity";

const createProfilesFromOrganizations = (
  organizations: Organization[],
  type: ProfileCapacityType
) => {
  const profiles: any[] = [];
  organizations.forEach((org) => {
    profiles.push({
      id: org.id,
      username: org.display_name,
      capacities:
        type === ProfileCapacityType.Learner
          ? org.wanted_capacities
          : org.available_capacities,
      type,
      profile_image: org.profile_image,
      territory: org.territory?.[0],
      avatar: org.profile_image || undefined,
      isOrganization: true,
    });
  });
  return profiles;
};

const createProfilesFromUsers = (
  users: UserProfile[],
  type: ProfileCapacityType
) => {
  const profiles: any[] = [];
  users.forEach((user) => {
    profiles.push({
      id: user.user.id,
      username: user.user.username,
      capacities:
        type === ProfileCapacityType.Sharer
          ? user.skills_available
          : user.skills_wanted,
      type,
      profile_image: user.profile_image,
      territory: user.territory?.[0],
      avatar: user.avatar,
      isOrganization: false,
    });
  });
  return profiles;
};

export default function FeedPage() {
  const { darkMode } = useTheme();
  const { pageContent } = useApp();
  const router = useRouter();

  const searchParams = useSearchParams();
  const capacityCode = searchParams.get("capacityId");

  const [showFilters, setShowFilters] = useState(false);
  const [activeFilters, setActiveFilters] = useState({
    capacities: [] as Skill[],
    profileCapacityTypes: [
      ProfileCapacityType.Learner,
      ProfileCapacityType.Sharer,
    ] as ProfileCapacityType[],
    territories: [] as string[],
    languages: [] as string[],
    profileFilter: ProfileFilterType.Both,
  });
  const [showSkillModal, setShowSkillModal] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerList = 5; // For each type of profile (user or organization)
  const itemsPerPage = itemsPerList * 2; // Total of profiles per page
  const offset = (currentPage - 1) * itemsPerList;

  const { capacity, isLoading: isLoadingCapacity } = useCapacity(capacityCode);

  // Get data from capacityById
  useEffect(() => {
    if (capacityCode && capacity) {
      const capacityExists = activeFilters.capacities.some(
        (cap) => cap.code == Number(capacityCode)
      );

      if (capacityExists) {
        return;
      }

      setActiveFilters((prev) => ({
        ...prev,
        capacities: [
          {
            code: Number(capacity.code),
            name: capacity.name,
          },
        ],
      }));
    }
  }, [capacityCode, isLoadingCapacity]);

  const shouldFetchOrgs =
    activeFilters.profileFilter !== ProfileFilterType.User;
  const {
    organizations: organizationsLearner,
    count: organizationsLearnerCount,
    isLoading: isOrganizationsLearnerLoading,
  } = useOrganizations(
    shouldFetchOrgs ? itemsPerList : 0,
    shouldFetchOrgs ? offset : 0,
    shouldFetchOrgs
      ? {
          ...activeFilters,
          profileCapacityTypes: [ProfileCapacityType.Learner],
        }
      : undefined
  );

  const shouldFetchUsers =
    activeFilters.profileFilter !== ProfileFilterType.Organization;
  const {
    allUsers: usersLearner,
    count: usersLearnerCount,
    isLoading: isUsersLearnerLoading,
  } = useAllUsers({
    limit: shouldFetchUsers ? itemsPerList : 0,
    offset: shouldFetchUsers ? offset : 0,
    activeFilters: shouldFetchUsers
      ? {
          ...activeFilters,
          profileCapacityTypes: [ProfileCapacityType.Learner],
        }
      : undefined,
  });

  const shouldFetchSharerOrgs =
    activeFilters.profileFilter !== ProfileFilterType.User &&
    activeFilters.profileCapacityTypes.includes(ProfileCapacityType.Sharer);
  const {
    organizations: organizationsSharer,
    count: organizationsSharerCount,
    isLoading: isOrganizationsSharerLoading,
  } = useOrganizations(
    shouldFetchSharerOrgs ? itemsPerList : 0,
    shouldFetchSharerOrgs ? offset : 0,
    shouldFetchSharerOrgs
      ? {
          ...activeFilters,
          profileCapacityTypes: [ProfileCapacityType.Sharer],
        }
      : undefined
  );

  const shouldFetchSharerUsers =
    activeFilters.profileFilter !== ProfileFilterType.Organization &&
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
  let totalRecords = 0;

  switch (activeFilters.profileFilter) {
    case ProfileFilterType.User:
      totalRecords =
        (activeFilters.profileCapacityTypes.includes(
          ProfileCapacityType.Learner
        )
          ? usersLearnerCount
          : 0) +
        (activeFilters.profileCapacityTypes.includes(ProfileCapacityType.Sharer)
          ? usersSharerCount
          : 0);
      break;
    case ProfileFilterType.Organization:
      totalRecords =
        (activeFilters.profileCapacityTypes.includes(
          ProfileCapacityType.Learner
        )
          ? organizationsLearnerCount
          : 0) +
        (activeFilters.profileCapacityTypes.includes(ProfileCapacityType.Sharer)
          ? organizationsSharerCount
          : 0);
      break;
    case ProfileFilterType.Both:
    default:
      totalRecords =
        (activeFilters.profileCapacityTypes.includes(
          ProfileCapacityType.Learner
        )
          ? usersLearnerCount + organizationsLearnerCount
          : 0) +
        (activeFilters.profileCapacityTypes.includes(ProfileCapacityType.Sharer)
          ? usersSharerCount + organizationsSharerCount
          : 0);
  }

  // Create profiles (to create cards) from organizations and users
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

    const wantedUserProfiles = createProfilesFromUsers(
      usersLearner || [],
      ProfileCapacityType.Learner
    );
    const availableUserProfiles = createProfilesFromUsers(
      usersSharer || [],
      ProfileCapacityType.Sharer
    );

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

    // Filter based on activeFilters.profileFilter
    switch (activeFilters.profileFilter) {
      case ProfileFilterType.User:
        return userProfiles;
      case ProfileFilterType.Organization:
        return organizationProfiles;
      case ProfileFilterType.Both:
      default:
        return [...organizationProfiles, ...userProfiles];
    }
  }, [
    activeFilters,
    organizationsLearner,
    organizationsSharer,
    usersLearner,
    usersSharer,
  ]);

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

    const urlCapacityId = searchParams.get("capacityId");

    // If the capacity removed is the same as the URL, update the URL
    if (
      (urlCapacityId && urlCapacityId.toString() == capacityCode.toString()) ||
      (urlCapacityId && urlCapacityId.toString() == capacity?.code?.toString())
    ) {
      router.replace("/feed", { scroll: false });
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
    isOrganizationsLearnerLoading ||
    isOrganizationsSharerLoading ||
    isUsersLearnerLoading ||
    isUsersSharerLoading
  ) {
    return (
      <div className="flex justify-center items-center h-screen">
        {pageContent["loading"]}
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col items-center pt-24 md:pt-8">
      <div className="container mx-auto px-4">
        <div className="md:max-w-[1200px] w-full max-w-sm mx-auto space-y-6">
          {/* SearchBar and Filters Button */}
          <div className="flex gap-2 mb-6">
            {/* Search Field Container */}
            <div className="flex-1 relative">
              <div
                className={`
                flex flex-col rounded-lg border
                ${
                  darkMode
                    ? "bg-capx-dark-box-bg border-gray-700 text-white"
                    : "bg-white border-gray-300"
                }
              `}
              >
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
                <div
                  className={`
                  flex flex-wrap items-start gap-2 p-3 pr-12
                  ${darkMode ? "bg-capx-dark-box-bg" : "bg-white"}
                `}
                >
                  {/* Selected Capacities */}
                  {activeFilters.capacities.map((capacity, index) => (
                    <span
                      key={index}
                      className={`
                        inline-flex items-center gap-1 px-2 py-1 rounded-md text-sm max-w-[200px]
                        ${darkMode ? "bg-gray-700" : "bg-gray-100"}
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
                      placeholder={
                        activeFilters.capacities.length === 0
                          ? pageContent["filters-search-by-capacities"]
                          : ""
                      }
                      className={`
                        w-full outline-none overflow-ellipsis bg-transparent
                        ${
                          darkMode
                            ? "text-white placeholder:text-gray-400"
                            : "text-gray-900 placeholder:text-gray-500"
                        }
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
                ${
                  darkMode
                    ? "bg-capx-dark-box-bg text-white hover:bg-gray-700"
                    : "bg-white border border-gray-300 hover:bg-gray-50"
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
        />
      )}
    </div>
  );
}
