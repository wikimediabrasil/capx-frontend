'use client';

import { useApp } from '@/contexts/AppContext';
import { useTheme } from '@/contexts/ThemeContext';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { FilterState } from '../types';

import BaseButton from '@/components/BaseButton';

import ArrowBackIcon from '@/public/static/images/arrow_back_icon.svg';
import ArrowBackIconWhite from '@/public/static/images/arrow_back_icon_white.svg';
import CapxIcon from '@/public/static/images/capx_icon.svg';
import CapxIconWhite from '@/public/static/images/capx_icon_white.svg';
import LearnerIcon from '@/public/static/images/learner_icon.svg';
import LearnerIconWhite from '@/public/static/images/learner_icon_white.svg';
import SharerIcon from '@/public/static/images/sharer_icon.svg';
import SharerIconWhite from '@/public/static/images/sharer_icon_white.svg';

import { CapacitySearch } from '@/app/(auth)/capacity/components/CapacitySearch';
import { useAffiliation } from '@/hooks/useAffiliation';
import { useLanguage } from '@/hooks/useLanguage';
import { useTerritories } from '@/hooks/useTerritories';
import UserIcon from '@/public/static/images/account_circle.svg';
import UserIconWhite from '@/public/static/images/account_circle_white.svg';
import { useSession } from 'next-auth/react';
import React from 'react';
import { ProfileCapacityType } from '../types';
import { AffiliationSelector } from './AffiliationSelector';
import { CheckboxButton } from './CheckboxButton';
import { LanguageSelector } from './LanguageSelector';
import { TerritorySelector } from './TerritorySelector';

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
  const { affiliations } = useAffiliation(token);
  const [filters, setFilters] = useState(initialFilters);

  const handleCapacitySelect = (capacities: Array<{ code: number; name: string }>) => {
    setFilters(prev => ({
      ...prev,
      capacities,
    }));
  };

  const handleApply = () => {
    onApplyFilters(filters);
  };

  const handleClearAll = () => {
    setFilters({
      ...initialFilters,
    });
  };

  const handleProfileCapacityTypeToggle = (type: ProfileCapacityType) => {
    setFilters(prev => {
      const types = prev.profileCapacityTypes.includes(type)
        ? prev.profileCapacityTypes.filter(t => t !== type)
        : [...prev.profileCapacityTypes, type];
      return { ...prev, profileCapacityTypes: types };
    });
  };

  const handleNameChange = (name: string) => {
    setFilters(prev => ({
      ...prev,
      name: name || undefined,
    }));
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
              <CapacitySearch
                onSelect={handleCapacitySelect}
                selectedCapacities={filters.capacities}
                allowMultipleSelection={true}
                showSelectedChips={true}
                compact={true}
              />
            </div>

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

            {/* Username Filter - Only for user profiles */}
            {!isOnlyOrganization && (
              <>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Image
                      src={darkMode ? UserIconWhite : UserIcon}
                      alt={pageContent['filters-username-alt-icon']}
                      width={24}
                      height={24}
                    />
                    <h2 className={`font-bold ${darkMode ? 'text-white' : 'text-black'}`}>
                      {pageContent['filters-username']}
                    </h2>
                  </div>
                  <input
                    type="text"
                    value={filters.name || ''}
                    onChange={e => handleNameChange(e.target.value)}
                    placeholder={pageContent['filters-search-by-username']}
                    className={`
                      w-full p-2 rounded-lg border
                      ${
                        darkMode
                          ? 'bg-capx-dark-box-bg text-white border-gray-700 placeholder-gray-400'
                          : 'bg-white border-gray-300 placeholder-gray-500'
                      }
                    `}
                  />
                </div>

                {/* Divider */}
                <div className={`border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`} />
              </>
            )}

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

            {/* Divider */}
            <div className={`border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`} />

            {/* Affiliations - Only for user profiles */}
            {!isOnlyOrganization && (
              <>
                <AffiliationSelector
                  affiliations={affiliations}
                  selectedAffiliations={filters.affiliations || []}
                  onSelectAffiliation={affiliationId => {
                    setFilters(prev => ({
                      ...prev,
                      affiliations: prev.affiliations?.includes(affiliationId)
                        ? prev.affiliations?.filter(id => id !== affiliationId)
                        : [...(prev.affiliations || []), affiliationId],
                    }));
                  }}
                  placeholder={pageContent['filters-add-affiliation']}
                />

                {/* Divider */}
                <div className={`border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`} />
              </>
            )}

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
