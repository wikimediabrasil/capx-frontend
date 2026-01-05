import { useTheme } from '@/contexts/ThemeContext';
import { useApp } from '@/contexts/AppContext';
import Image from 'next/image';
import SearchIcon from '@/public/static/images/search_icon.svg';
import SearchIconWhite from '@/public/static/images/search_icon_white.svg';
import FilterIcon from '@/public/static/images/filter_icon.svg';
import FilterIconWhite from '@/public/static/images/filter_icon_white.svg';
import CloseIcon from '@/public/static/images/close_mobile_menu_icon_light_mode.svg';
import CloseIconWhite from '@/public/static/images/close_mobile_menu_icon_dark_mode.svg';
import { Skill } from '../types';

interface SearchBarProps {
  searchTerm?: string;
  onSearchChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onFilterClick: () => void;
  searchPlaceholder?: string;
  filterAriaLabel?: string;
  selectedCapacities?: Skill[];
  onRemoveCapacity?: (capacityCode: number) => void;
  onCapacityInputFocus?: () => void;
  capacitiesPlaceholder?: string;
  removeItemAltText?: string;
  showCapacitiesSearch?: boolean;
}

export function SearchBar({
  searchTerm = '',
  onSearchChange,
  onFilterClick,
  searchPlaceholder = '',
  filterAriaLabel = '',
  selectedCapacities = [],
  onRemoveCapacity,
  onCapacityInputFocus,
  capacitiesPlaceholder = '',
  removeItemAltText = '',
  showCapacitiesSearch = false,
}: SearchBarProps) {
  const { darkMode } = useTheme();
  const { pageContent } = useApp();

  return (
    <div className="flex gap-2 mb-6 w-full min-w-0">
      {/* Search Field Container */}
      <div className="flex-1 relative min-w-0">
        {showCapacitiesSearch ? (
          <div
            className={`
            flex flex-col rounded-lg border w-full min-w-0
            ${
              darkMode
                ? 'bg-capx-dark-box-bg border-gray-700 text-white'
                : 'bg-white border-gray-300'
            }
          `}
          >
            {/* Search Icon */}
            <div className="absolute right-3 top-4">
              <Image
                src={darkMode ? SearchIconWhite : SearchIcon}
                alt={pageContent['alt-search'] || 'Search icon'}
                width={20}
                height={20}
              />
            </div>

            {/* Container for the selected capacities and the input */}
            <div
              className={`
              flex flex-wrap items-start gap-2 p-3 pr-12 w-full min-w-0
              ${darkMode ? 'bg-capx-dark-box-bg' : 'bg-white'}
            `}
            >
              {/* Selected Capacities */}
              {selectedCapacities.map((capacity, index) => (
                <span
                  key={index}
                  className={`
                    inline-flex items-center gap-1 px-2 py-1 rounded-md text-sm max-w-[200px] shrink-0
                    ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}
                  `}
                >
                  <span className="truncate">{capacity.name}</span>
                  {onRemoveCapacity && (
                    <button
                      onClick={() => onRemoveCapacity(capacity.code)}
                      className="hover:opacity-80 flex-shrink-0"
                    >
                      <Image
                        src={darkMode ? CloseIconWhite : CloseIcon}
                        alt={pageContent['alt-close'] || 'Close dialog or panel'}
                        width={16}
                        height={16}
                      />
                    </button>
                  )}
                </span>
              ))}

              {/* Search Input */}
              <div className="flex-1 min-w-[120px] max-w-full">
                <input
                  readOnly
                  type="text"
                  aria-label={
                    pageContent['aria-label-search-by-capacities'] || 'Search by capacities'
                  }
                  onFocus={onCapacityInputFocus}
                  placeholder={selectedCapacities.length === 0 ? capacitiesPlaceholder : ''}
                  className={`
                    w-full outline-none overflow-ellipsis bg-transparent
                    ${darkMode ? 'text-white placeholder:text-gray-400' : 'text-gray-900 placeholder:text-gray-500'}
                  `}
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="relative">
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <Image
                src={darkMode ? SearchIconWhite : SearchIcon}
                alt={pageContent['alt-search'] || 'Search icon'}
                width={20}
                height={20}
              />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={onSearchChange}
              placeholder={searchPlaceholder}
              className={`
                w-full py-3 px-4 pr-12 rounded-lg border
                ${
                  darkMode
                    ? 'bg-capx-dark-box-bg border-gray-700 text-white placeholder:text-gray-400'
                    : 'bg-white border-gray-300 text-gray-900 placeholder:text-gray-500'
                }
                focus:outline-none
              `}
            />
          </div>
        )}
      </div>

      {/* Filters Button */}
      <button
        onClick={onFilterClick}
        className={`
          p-3 rounded-lg border flex-shrink-0
          ${
            darkMode
              ? 'bg-capx-dark-box-bg border-gray-700 hover:bg-gray-700'
              : 'bg-white border-gray-300 hover:bg-gray-100'
          }
        `}
        aria-label={filterAriaLabel}
      >
        <Image
          src={darkMode ? FilterIconWhite : FilterIcon}
          alt={pageContent['alt-filter'] || 'Filter options'}
          width={20}
          height={20}
        />
      </button>
    </div>
  );
}
