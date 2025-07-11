'use client';

import { useEffect, useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { useTheme } from '@/contexts/ThemeContext';
import Image from 'next/image';
import { FilterState } from '../types';

import ArrowBackIcon from '@/public/static/images/arrow_back_icon.svg';
import ArrowBackIconWhite from '@/public/static/images/arrow_back_icon_white.svg';
import CapxIcon from '@/public/static/images/capx_icon.svg';
import CapxIconWhite from '@/public/static/images/capx_icon_white.svg';
import ProfilesIcon from '@/public/static/images/profiles_icon.svg';
import ProfilesIconWhite from '@/public/static/images/profiles_icon_white.svg';
import CloseIcon from '@/public/static/images/close_mobile_menu_icon_light_mode.svg';
import CloseIconWhite from '@/public/static/images/close_mobile_menu_icon_dark_mode.svg';
import BaseButton from '@/components/BaseButton';
import SearchIcon from '@/public/static/images/search_icon.svg';
import SearchIconWhite from '@/public/static/images/search_icon_white.svg';
import AccountCircleIcon from '@/public/static/images/account_circle.svg';
import AccountCircleIconWhite from '@/public/static/images/account_circle_white.svg';
import OrganizationIcon from '@/public/static/images/supervised_user_circle.svg';
import OrganizationIconWhite from '@/public/static/images/supervised_user_circle_white.svg';
import AllProfilesIcon from '@/public/static/images/all_profiles_icon.svg';
import AllProfilesIconWhite from '@/public/static/images/all_profiles_icon_white.svg';
import LearnerIcon from '@/public/static/images/learner_icon.svg';
import LearnerIconWhite from '@/public/static/images/learner_icon_white.svg';
import SharerIcon from '@/public/static/images/sharer_icon.svg';
import SharerIconWhite from '@/public/static/images/sharer_icon_white.svg';

import { useTerritories } from '@/hooks/useTerritories';
import { useLanguage } from '@/hooks/useLanguage';
import { useSession } from 'next-auth/react';
import { LanguageSelector } from './LanguageSelector';
import { CheckboxButton } from './CheckboxButton';
import { TerritorySelector } from './TerritorySelector';
import { ProfileCapacityType, ProfileFilterType } from '../types';
import { Capacity } from '@/types/capacity';
import CapacitySelectionModal from '@/components/CapacitySelectionModal';

interface FiltersProps {
  isOnlyOrganization?: boolean;
  onClose: () => void;
  onApplyFilters: (filters: any) => void;
  initialFilters: FilterState;
}

export function Filters({
  onClose,
  onApplyFilters,
  initialFilters,
  isOnlyOrganization = false,
}: FiltersProps) {
  const { darkMode } = useTheme();
  const { pageContent } = useApp();
  const { data: session } = useSession();
  const token = session?.user?.token;
  const { languages } = useLanguage(token);
  const { territories } = useTerritories(token);
  const [searchCapacity, setSearchCapacity] = useState('');
  const [filters, setFilters] = useState(initialFilters);
  const [showSkillModal, setShowSkillModal] = useState(false);

  const handleCapacitySelect = (capacity: Capacity) => {
    const capacityExists = filters.capacities.some(cap => cap.code == capacity.code);

    if (capacityExists) {
      return;
    }

    setFilters(prev => ({
      ...prev,
      capacities: [
        ...prev.capacities,
        {
          name: capacity.name,
          code: capacity.code,
        },
      ],
    }));
  };

  const handleRemoveCapacity = (capacityCode: number) => {
    setFilters(prev => ({
      ...prev,
      capacities: prev.capacities.filter(cap => cap.code !== capacityCode),
    }));
  };

  const handleApply = () => {
    onApplyFilters(filters);
  };

  const handleClearAll = () => {
    setFilters({
      ...initialFilters,
    });
    setSearchCapacity('');
  };

  const handleProfileFilterChange = (type: ProfileFilterType) => {
    setFilters(prev => ({
      ...prev,
      profileFilter: type,
    }));
  };

  const handleProfileCapacityTypeToggle = (type: ProfileCapacityType) => {
    setFilters(prev => {
      const types = prev.profileCapacityTypes.includes(type)
        ? prev.profileCapacityTypes.filter(t => t !== type)
        : [...prev.profileCapacityTypes, type];
      return { ...prev, profileCapacityTypes: types };
    });
  };

  // Avoid multiple scrolls when the modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';

    // Cleanup: restore scroll when the modal closes
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center">
      {/* Dark Overlay */}
      <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose} />

      {/* Container's Modal */}
      <div
        className={`
        relative w-full h-full md:w-[800px] md:max-h-[80vh] md:mt-20 md:rounded-lg
        ${darkMode ? 'bg-capx-dark-bg' : 'bg-white'}
        flex flex-col overflow-hidden
      `}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b shrink-0">
          <div className="flex items-center gap-2">
            <button onClick={onClose}>
              <Image
                src={darkMode ? ArrowBackIconWhite : ArrowBackIcon}
                alt={pageContent['filters-back-icon']}
                width={24}
                height={24}
              />
            </button>
            <h1 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-black'}`}>
              {pageContent['filters-title']}
            </h1>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto min-h-0">
          <div className="p-4 space-y-6">
            {/* Capacities */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Image
                  src={darkMode ? CapxIconWhite : CapxIcon}
                  alt={pageContent['filters-capacities-alt-icon']}
                  width={24}
                  height={24}
                />
                <h2 className={`font-bold ${darkMode ? 'text-white' : 'text-black'}`}>
                  {pageContent['filters-capacities']}
                </h2>
              </div>
              <div className="relative">
                <input
                  type="text"
                  readOnly
                  value={searchCapacity}
                  onFocus={() => setShowSkillModal(true)}
                  placeholder={pageContent['filters-search-by-capacities']}
                  className={`
                    w-full p-2 rounded-lg border
                    ${
                      darkMode
                        ? 'bg-capx-dark-box-bg text-white border-gray-700 placeholder-gray-400'
                        : 'bg-white border-gray-300 placeholder-gray-500'
                    }
                  `}
                />
                <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                  <Image
                    src={darkMode ? SearchIconWhite : SearchIcon}
                    alt={pageContent['filters-search-icon']}
                    width={20}
                    height={20}
                  />
                </div>
              </div>

              {/* Selected Capacities */}
              {filters.capacities?.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {filters.capacities.map((capacity, index) => (
                    <div
                      key={index}
                      className={`
                        inline-flex items-center gap-1 px-2 py-1 rounded-md text-sm
                        max-w-[150px] shrink-0
                        ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}
                      `}
                    >
                      <span className="truncate" title={capacity.name}>
                        {capacity.name}
                      </span>
                      <button
                        onClick={() => handleRemoveCapacity(capacity.code)}
                        className="hover:opacity-80 flex-shrink-0"
                      >
                        <Image
                          src={darkMode ? CloseIconWhite : CloseIcon}
                          alt={pageContent['filters-remove-item-alt-icon']}
                          width={16}
                          height={16}
                        />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <CapacitySelectionModal
              isOpen={showSkillModal}
              onClose={() => setShowSkillModal(false)}
              onSelect={handleCapacitySelect}
              title={pageContent['select-capacity']}
            />

            {/* Divider */}
            <div className={`border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`} />

            {/* Exchange with */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Image
                  src={darkMode ? CapxIconWhite : CapxIcon}
                  alt={pageContent['filters-exchange-with-alt-icon']}
                  width={24}
                  height={24}
                />
                <h2 className={`font-bold ${darkMode ? 'text-white' : 'text-black'}`}>
                  {pageContent['filters-exchange-with']}
                </h2>
              </div>
              <div className="space-y-2">
                <CheckboxButton
                  icon={LearnerIcon}
                  iconDark={LearnerIconWhite}
                  label={pageContent['filters-learners']}
                  checked={
                    filters.profileCapacityTypes?.includes(ProfileCapacityType.Learner) ?? false
                  }
                  onClick={() => handleProfileCapacityTypeToggle(ProfileCapacityType.Learner)}
                />
                <CheckboxButton
                  icon={SharerIcon}
                  iconDark={SharerIconWhite}
                  label={pageContent['filters-sharers']}
                  checked={
                    filters.profileCapacityTypes?.includes(ProfileCapacityType.Sharer) ?? false
                  }
                  onClick={() => handleProfileCapacityTypeToggle(ProfileCapacityType.Sharer)}
                />
              </div>
            </div>

            {/* Divider */}
            <div className={`border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`} />

            {/* Territory */}
            <TerritorySelector
              territories={territories}
              selectedTerritories={filters.territories}
              onSelectTerritory={territoryId => {
                setFilters(prev => ({
                  ...prev,
                  territories: prev.territories.includes(territoryId)
                    ? prev.territories.filter(id => id !== territoryId)
                    : [...prev.territories, territoryId],
                }));
              }}
              placeholder={pageContent['filters-add-territory']}
            />

            {!isOnlyOrganization && (
              <>
                {/* Divider */}
                <div className={`border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`} />

                {/* Languages */}
                <LanguageSelector
                  languages={languages}
                  selectedLanguages={filters.languages}
                  onSelectLanguage={languageId => {
                    setFilters(prev => ({
                      ...prev,
                      languages: prev.languages.includes(languageId)
                        ? prev.languages.filter(id => id !== languageId)
                        : [...prev.languages, languageId],
                    }));
                  }}
                  placeholder={pageContent['edit-profile-add-language']}
                />
              </>
            )}

            {!isOnlyOrganization && (
              <>
                {/* Divider */}
                <div className={`border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`} />

                {/* Profiles */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Image
                      src={darkMode ? ProfilesIconWhite : ProfilesIcon}
                      alt={pageContent['filters-profiles-alt-icon']}
                      width={24}
                      height={24}
                    />
                    <h2 className={`font-bold ${darkMode ? 'text-white' : 'text-black'}`}>
                      {pageContent['filters-profiles']}
                    </h2>
                  </div>
                  <div className="space-y-2">
                    <button
                      onClick={() => handleProfileFilterChange(ProfileFilterType.Both)}
                      className={`w-full p-3 rounded-lg border flex justify-between items-center ${
                        filters.profileFilter === ProfileFilterType.Both
                          ? darkMode
                            ? 'bg-capx-dark-box-bg border-purple-500'
                            : 'bg-purple-100 border-purple-500'
                          : darkMode
                            ? 'bg-capx-dark-box-bg border-gray-700'
                            : 'bg-white border-gray-300'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Image
                          src={darkMode ? AllProfilesIconWhite : AllProfilesIcon}
                          alt={pageContent['filters-all-profiles-alt-icon']}
                          width={20}
                          height={20}
                        />
                        <span className={darkMode ? 'text-white' : 'text-black'}>
                          {pageContent['filters-all-profiles']}
                        </span>
                      </div>
                      <div className="ml-auto">
                        <input
                          type="checkbox"
                          checked={filters.profileFilter === ProfileFilterType.Both}
                          readOnly
                          className="h-4 w-4"
                        />
                      </div>
                    </button>
                    <button
                      onClick={() => handleProfileFilterChange(ProfileFilterType.Organization)}
                      className={`w-full p-3 rounded-lg border flex justify-between items-center ${
                        filters.profileFilter === ProfileFilterType.Organization
                          ? darkMode
                            ? 'bg-capx-dark-box-bg border-purple-500'
                            : 'bg-purple-100 border-purple-500'
                          : darkMode
                            ? 'bg-capx-dark-box-bg border-gray-700'
                            : 'bg-white border-gray-300'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Image
                          src={darkMode ? OrganizationIconWhite : OrganizationIcon}
                          alt={pageContent['filters-organization-profile-alt-icon']}
                          width={20}
                          height={20}
                        />
                        <span className={darkMode ? 'text-white' : 'text-black'}>
                          {pageContent['filters-organization-profile']}
                        </span>
                      </div>
                      <div className="ml-auto">
                        <input
                          type="checkbox"
                          checked={filters.profileFilter === ProfileFilterType.Organization}
                          readOnly
                          className="h-4 w-4"
                        />
                      </div>
                    </button>
                    <button
                      onClick={() => handleProfileFilterChange(ProfileFilterType.User)}
                      className={`w-full p-3 rounded-lg border flex justify-between items-center ${
                        filters.profileFilter === ProfileFilterType.User
                          ? darkMode
                            ? 'bg-capx-dark-box-bg border-purple-500'
                            : 'bg-purple-100 border-purple-500'
                          : darkMode
                            ? 'bg-capx-dark-box-bg border-gray-700'
                            : 'bg-white border-gray-300'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Image
                          src={darkMode ? AccountCircleIconWhite : AccountCircleIcon}
                          alt={pageContent['filters-user-profile-alt-icon']}
                          width={20}
                          height={20}
                        />
                        <span className={darkMode ? 'text-white' : 'text-black'}>
                          {pageContent['filters-profiles']}
                        </span>
                      </div>
                      <div className="ml-auto">
                        <input
                          type="checkbox"
                          checked={filters.profileFilter === ProfileFilterType.User}
                          readOnly
                          className="h-4 w-4"
                        />
                      </div>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 flex gap-4 border-t bg-inherit shrink-0">
          <BaseButton
            onClick={handleClearAll}
            label={pageContent['filters-clear-all']}
            customClass={`flex-1 ${
              darkMode
                ? 'bg-transparent hover:bg-capx-primary-green border-capx-light-bg border-2 text-capx-light-bg font-extrabold rounded-lg text-center text-[14px] py-2 px-4'
                : 'bg-capx-light-bg hover:bg-capx-primary-green border-capx-dark-box-bg border-2 text-capx-dark-box-bg font-extrabold rounded-lg text-center text-[14px] py-2 px-4'
            }`}
          />
          <BaseButton
            onClick={handleApply}
            label={pageContent['filters-show-results']}
            customClass="flex-1 bg-capx-secondary-purple hover:bg-capx-primary-green text-white hover:text-capx-dark-bg font-extrabold rounded-lg text-center text-[14px] py-2 px-4"
          />
        </div>
      </div>
    </div>
  );
}
