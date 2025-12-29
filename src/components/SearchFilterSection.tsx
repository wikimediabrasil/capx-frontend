'use client';

import { useApp } from '@/contexts/AppContext';
import React from 'react';
import { SearchBar } from '@/app/(auth)/feed/components/SearchBar';

interface SearchFilterSectionProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onShowFilters: (show: boolean) => void;
  searchPlaceholder?: string;
  filterAriaLabel?: string;
}

/**
 * Reusable search and filter section component
 * Used for searching users by username in the feed page
 */
export const SearchFilterSection: React.FC<SearchFilterSectionProps> = ({
  searchTerm,
  onSearchChange,
  onShowFilters,
  searchPlaceholder,
  filterAriaLabel,
}) => {
  const { pageContent } = useApp();

  return (
    <SearchBar
      showCapacitiesSearch={false}
      searchTerm={searchTerm}
      onSearchChange={e => onSearchChange(e.target.value)}
      onFilterClick={() => onShowFilters(true)}
      searchPlaceholder={searchPlaceholder || pageContent['filters-search-by-username']}
      filterAriaLabel={filterAriaLabel || pageContent['saved-profiles-filters-button']}
    />
  );
};
