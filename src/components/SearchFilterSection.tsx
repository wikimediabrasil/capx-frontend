'use client';

import CapacitySelectionModal from '@/components/CapacitySelectionModal';
import { useApp } from '@/contexts/AppContext';
import { Capacity } from '@/types/capacity';
import React from 'react';
import { SearchBar } from '@/app/(auth)/feed/components/SearchBar';

interface SearchFilterSectionProps {
  activeFilters: {
    capacities: Array<{ code: number; name: string }>;
  };
  showSkillModal: boolean;
  onRemoveCapacity: (capacityCode: number) => void;
  onShowSkillModal: (show: boolean) => void;
  onShowFilters: (show: boolean) => void;
  onCapacitySelect: (capacities: Capacity[]) => void;
  capacitiesPlaceholder?: string;
  removeItemAltText?: string;
  filterAriaLabel?: string;
}

/**
 * Reusable search and filter section component
 * Eliminates duplication between feed/page.tsx and OrganizationList.tsx
 */
export const SearchFilterSection: React.FC<SearchFilterSectionProps> = ({
  activeFilters,
  showSkillModal,
  onRemoveCapacity,
  onShowSkillModal,
  onShowFilters,
  onCapacitySelect,
  capacitiesPlaceholder,
  removeItemAltText,
  filterAriaLabel,
}) => {
  const { pageContent } = useApp();

  return (
    <>
      <SearchBar
        showCapacitiesSearch={true}
        selectedCapacities={activeFilters.capacities}
        onRemoveCapacity={onRemoveCapacity}
        onCapacityInputFocus={() => onShowSkillModal(true)}
        capacitiesPlaceholder={capacitiesPlaceholder || pageContent['filters-search-by-capacities']}
        removeItemAltText={removeItemAltText || pageContent['filters-remove-item-alt-icon']}
        onFilterClick={() => onShowFilters(true)}
        filterAriaLabel={filterAriaLabel || pageContent['saved-profiles-filters-button']}
      />

      <CapacitySelectionModal
        isOpen={showSkillModal}
        onClose={() => onShowSkillModal(false)}
        onSelect={onCapacitySelect}
        title={pageContent['select-capacity']}
      />
    </>
  );
};
