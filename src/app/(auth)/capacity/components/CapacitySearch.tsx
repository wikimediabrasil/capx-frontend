'use client';

import BaseInput from '@/components/BaseInput';
import LoadingState from '@/components/LoadingState';
import { useApp } from '@/contexts/AppContext';
import { useCapacityCache } from '@/contexts/CapacityCacheContext';
import { useTheme } from '@/contexts/ThemeContext';
import SearchIcon from '@/public/static/images/search.svg';
import SearchIconWhite from '@/public/static/images/search_icon_white.svg';
import { useCallback, useEffect, useRef, useState } from 'react';
import { CapacityCard } from './CapacityCard';

interface CapacitySearchProps {
  onSearchStart?: () => void;
  onSearchEnd?: () => void;
  onSearch?: (term: string) => void;
  // Selection props
  onSelect?: (capacities: Array<{ code: number; name: string }>) => void;
  selectedCapacities?: Array<{ code: number; name: string }>;
  allowMultipleSelection?: boolean;
  showSelectedChips?: boolean;
  compact?: boolean; // Use compact view for filters
}

// simple debounce
function useDebounce<Args extends unknown[], Return>(
  callback: (...args: Args) => Return,
  delay: number
) {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const debouncedFunction = useCallback(
    (...args: Args): void => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        callback(...args);
      }, delay);
    },
    [callback, delay]
  );

  // Function to cancel the debounce
  const cancel = useCallback((): void => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  // Clear the timeout when the component is unmounted
  useEffect(() => {
    return () => {
      cancel();
    };
  }, [cancel]);

  return { debouncedFunction, cancel };
}

export function CapacitySearch({
  onSearchStart,
  onSearchEnd,
  onSearch,
  onSelect,
  selectedCapacities = [],
  allowMultipleSelection = false,
  showSelectedChips = true,
  compact = false,
}: CapacitySearchProps) {
  const { isMobile, pageContent } = useApp();
  const { darkMode } = useTheme();
  const { getName, getDescription, getWdCode, getRootCapacities, getChildren } = useCapacityCache();
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);

  // Store the last search term to avoid duplicate requests
  const lastSearchRef = useRef<string>('');

  // Notificar o componente pai sobre o termo de busca
  // Usar um ref para rastrear o último termo enviado
  const lastNotifiedTermRef = useRef<string>('');

  // Search function using unified cache system
  const search = useCallback(
    async (term: string) => {
      // If the search term is the same as the last search, do nothing
      if (term === lastSearchRef.current) {
        return;
      }

      if (term) {
        setIsLoading(true);
        onSearchStart?.();

        try {
          // Search through cached data instead of making API calls
          const allCapacities: any[] = [];

          // Get all root capacities
          const rootCapacities = getRootCapacities();
          allCapacities.push(...rootCapacities);

          // Get all children and grandchildren from cache
          rootCapacities.forEach(root => {
            const children = getChildren(root.code);
            allCapacities.push(...children);

            children.forEach(child => {
              const grandchildren = getChildren(child.code);
              allCapacities.push(...grandchildren);
            });
          });

          // Filter capacities based on search term
          const searchTerm = term.toLowerCase();
          const results = allCapacities.filter(
            capacity => capacity.name && capacity.name.toLowerCase().includes(searchTerm)
          );

          setSearchResults(results);
        } catch (error) {
          console.error('Search error:', error);
          setSearchResults([]);
        }

        // Store the current search term
        lastSearchRef.current = term;
        setIsLoading(false);
      } else {
        setSearchResults([]);
        onSearchEnd?.();
        // Clear the last search
        lastSearchRef.current = '';
      }
    },
    [getRootCapacities, getChildren, onSearchStart, onSearchEnd]
  );

  // Use the custom debounce hook
  const { debouncedFunction: debouncedSearch } = useDebounce(search, 300);

  // Effect to call the debounce function when the search term changes
  useEffect(() => {
    debouncedSearch(searchTerm);
  }, [searchTerm, debouncedSearch]);

  // Notify the parant component with search term
  // Only notify if the term changed and onSearch exists
  useEffect(() => {
    if (onSearch && searchTerm !== lastNotifiedTermRef.current) {
      lastNotifiedTermRef.current = searchTerm;
      onSearch(searchTerm);
    }
  }, [searchTerm, onSearch]);

  // Handle capacity selection
  const handleCapacityClick = useCallback(
    (capacity: any) => {
      if (!onSelect) return;

      const selectedCapacity = { code: capacity.code, name: capacity.name };
      const isAlreadySelected = selectedCapacities.some(c => c.code === capacity.code);

      if (allowMultipleSelection) {
        if (isAlreadySelected) {
          // Remove from selection
          onSelect(selectedCapacities.filter(c => c.code !== capacity.code));
        } else {
          // Add to selection
          onSelect([...selectedCapacities, selectedCapacity]);
        }
      } else {
        // Single selection - replace
        onSelect([selectedCapacity]);
      }
    },
    [onSelect, selectedCapacities, allowMultipleSelection]
  );

  // Handle removing a selected capacity
  const handleRemoveCapacity = useCallback(
    (capacityCode: number) => {
      if (!onSelect) return;
      onSelect(selectedCapacities.filter(c => c.code !== capacityCode));
    },
    [onSelect, selectedCapacities]
  );

  // Check if a capacity is selected
  const isCapacitySelected = useCallback(
    (capacityCode: number) => {
      return selectedCapacities.some(c => c.code === capacityCode);
    },
    [selectedCapacities]
  );

  // Process the results to ensure correct levels and consistent colors
  const processedResults = searchResults.map(capacity => {
    // Use the level already defined by the cache, because the unified cache already has this information
    const level = capacity.level || 1;

    // For level 3, inherit root family color instead of using fixed color
    let color = capacity.color;
    if (level === 3 && capacity.parentCapacity?.parentCapacity?.color) {
      color = capacity.parentCapacity.parentCapacity.color; // Root family color
    } else if (level === 3 && capacity.parentCapacity?.color) {
      color = capacity.parentCapacity.color; // Parent color if there is no grandparent
    }

    return {
      ...capacity,
      level,
      color,
    };
  });

  return (
    <div className="w-full">
      {/* Selected Capacities Chips */}
      {showSelectedChips && selectedCapacities.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {selectedCapacities.map(capacity => (
            <div
              key={capacity.code}
              className={`
                inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm
                ${darkMode ? 'bg-gray-700 text-white' : 'bg-gray-200 text-gray-800'}
              `}
            >
              <span>{capacity.name}</span>
              <button
                onClick={() => handleRemoveCapacity(capacity.code)}
                className="hover:opacity-70 transition-opacity"
                aria-label="Remove capacity"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}

      <BaseInput
        type="text"
        value={searchTerm}
        onChange={e => {
          setSearchTerm(e.target.value);
        }}
        placeholder={pageContent['capacity-search-placeholder'] || 'Search capacities...'}
        className={`w-full ${compact ? '' : 'py-6 px-3'} rounded-[16px] opacity-50 ${
          darkMode ? 'text-white border-white' : 'text-capx-dark-box-bg border-capx-dark-box-bg '
        } ${!compact && isMobile ? 'text-[12px]' : ''} ${!compact && !isMobile ? 'text-[24px]' : ''}`}
        icon={darkMode ? SearchIconWhite : SearchIcon}
        iconPosition="right"
        size={compact ? 'small' : 'large'}
      />

      <div className={`mt-4 w-full ${compact ? 'space-y-2' : 'grid gap-4'}`}>
        {isLoading ? (
          <LoadingState />
        ) : compact ? (
          // Compact view for filters
          processedResults.map(capacity => {
            const isSelected = isCapacitySelected(capacity.code);
            return (
              <button
                key={capacity.code}
                type="button"
                onClick={() => handleCapacityClick(capacity)}
                className={`
                  w-full flex items-center justify-between px-3 py-2 rounded-lg
                  text-left transition-all
                  ${
                    darkMode
                      ? 'bg-capx-dark-box-bg hover:bg-gray-700'
                      : 'bg-gray-50 hover:bg-gray-100'
                  }
                  ${isSelected ? 'ring-2 ring-capx-primary-green' : ''}
                `}
              >
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <div
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: capacity.color }}
                  />
                  <span className={`text-sm truncate ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {getName(capacity.code) || capacity.name}
                  </span>
                </div>
                {isSelected && (
                  <div className="w-5 h-5 bg-capx-primary-green rounded-full flex items-center justify-center flex-shrink-0 ml-2">
                    <span className="text-white text-xs font-bold">✓</span>
                  </div>
                )}
              </button>
            );
          })
        ) : (
          // Full card view for capacity page
          processedResults.map(capacity => {
            const isSelected = isCapacitySelected(capacity.code);
            const content = (
              <>
                <CapacityCard
                  {...capacity}
                  name={getName(capacity.code) || capacity.name}
                  level={capacity.level}
                  isExpanded={false}
                  onExpand={() => {}}
                  isRoot={false}
                  hasChildren={false}
                  color={capacity.color}
                  icon={capacity.icon}
                  parentCapacity={capacity.parentCapacity}
                  description={getDescription(capacity.code)}
                  wd_code={getWdCode(capacity.code)}
                />
                {isSelected && allowMultipleSelection && (
                  <div className="absolute top-2 right-2 w-6 h-6 bg-capx-primary-green rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-bold">✓</span>
                  </div>
                )}
              </>
            );

            if (onSelect) {
              return (
                <button
                  key={capacity.code}
                  type="button"
                  onClick={() => handleCapacityClick(capacity)}
                  className={`
                    w-full cursor-pointer transition-all relative text-left p-0 bg-transparent border-0
                    hover:scale-[1.02]
                    ${isSelected ? 'ring-2 ring-capx-primary-green rounded-lg' : ''}
                  `}
                >
                  {content}
                </button>
              );
            }

            return (
              <div key={capacity.code} className="w-full relative">
                {content}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
