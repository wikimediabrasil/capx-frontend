import BaseButton from '@/components/BaseButton';
import { TranslationContributeCTA } from '@/components/TranslationContributeCTA';
import { useApp } from '@/contexts/AppContext';
import { useCapacityCache } from '@/contexts/CapacityCacheContext';
import { useTheme } from '@/contexts/ThemeContext';
import { getCapacityIcon } from '@/lib/utils/capacitiesUtils';
import InfoIcon from '@/public/static/images/info.svg';
import InfoFilledIcon from '@/public/static/images/info_filled.svg';
import ArrowDownIcon from '@/public/static/images/keyboard_arrow_down.svg';
import LinkIconWhite from '@/public/static/images/link_icon_white.svg';
import { Capacity } from '@/types/capacity';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import Link from 'next/link';
import React, { useCallback, useEffect, useState } from 'react';

interface CapacitySelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (capacities: Capacity[]) => void;
  title: string;
  allowMultipleSelection?: boolean;
}

// Helper function to convert cached capacity to Capacity object
const convertCachedToCapacity = (cachedCapacity: any): Capacity => {
  return {
    code: cachedCapacity.code,
    name: cachedCapacity.name,
    color: cachedCapacity.color,
    icon: cachedCapacity.icon,
    hasChildren: cachedCapacity.hasChildren,
    skill_type: cachedCapacity.code,
    skill_wikidata_item: cachedCapacity.wd_code || '',
    level: cachedCapacity.level || 1,
    parentCapacity: cachedCapacity.parentCapacity,
    description: cachedCapacity.description || '',
    metabase_code: cachedCapacity.metabase_code || '',
  };
};

export default function CapacitySelectionModal({
  isOpen,
  onClose,
  onSelect,
  title,
  allowMultipleSelection = true,
}: CapacitySelectionModalProps) {
  const { darkMode } = useTheme();
  const { data: session } = useSession();
  const { pageContent, isMobile, language } = useApp();
  const [selectedPath, setSelectedPath] = useState<number[]>([]);
  const [selectedCapacities, setSelectedCapacities] = useState<Capacity[]>([]);
  const [showInfoMap, setShowInfoMap] = useState<Record<number, boolean>>({});

  // Get capacity data from the global cache system
  const capacityCache = useCapacityCache();
  const {
    getRootCapacities,
    getChildren,
    getCapacity,
    hasChildren,
    getName,
    getDescription,
    getColor,
    getIcon,
    getMetabaseCode,
    isFallbackTranslation,
    isLoadingTranslations,
    updateLanguage,
  } = capacityCache;

  // Initialize data when modal opens
  useEffect(() => {
    if (isOpen && session?.user?.token) {
      // Ensure the cache is loaded for the current language
      updateLanguage(language);

      // Reset the state when the modal opens
      setSelectedPath([]);
      setSelectedCapacities([]);
      setShowInfoMap({});
    }
  }, [isOpen, session?.user?.token, language, updateLanguage]);

  // Handler for selecting a capacity
  const handleCategorySelect = async (category: Capacity) => {
    try {
      const categoryId = category.code;

      if (allowMultipleSelection) {
        // Multiple selection mode
        setSelectedCapacities(prev => {
          const isAlreadySelected = prev.some(cap => cap.code === categoryId);

          if (isAlreadySelected) {
            // Remove from selection if already selected
            return prev.filter(cap => cap.code !== categoryId);
          } else {
            // Add to selection if not selected
            return [...prev, category];
          }
        });
      } else {
        // Single selection mode (backward compatibility)
        setSelectedCapacities([category]);
      }

      // If this category is already in the path, we don't need to do anything
      const currentPathIndex = selectedPath.indexOf(categoryId);
      if (currentPathIndex !== -1) {
        return;
      }
    } catch (err) {
      console.error('Error selecting category:', err);
    }
  };

  // Function to handle expansion separately
  const handleCategoryExpand = async (e: React.MouseEvent, category: Capacity) => {
    e.stopPropagation(); // Prevent the selection when expanding

    try {
      const categoryId = category.code;
      const currentPathIndex = selectedPath.indexOf(categoryId);

      if (currentPathIndex !== -1) {
        // If it's already in the path, collapse
        setSelectedPath(prev => prev.slice(0, currentPathIndex + 1));
        return;
      }

      // Check if the capacity has children using the cache
      if (hasChildren(categoryId)) {
        setSelectedPath(prev => [...prev, categoryId]);
      }
    } catch (err) {
      console.error('Error expanding category:', err);
    }
  };

  const handleConfirm = () => {
    if (selectedCapacities.length > 0) {
      const capacitiesToReturn = selectedCapacities.map(capacity => ({
        ...capacity,
        skill_type: selectedPath.length > 0 ? selectedPath[selectedPath.length - 1] : capacity.code,
      }));
      onSelect(capacitiesToReturn);
      onClose();
    }
  };

  const getCurrentCapacities = useCallback(() => {
    if (selectedPath.length === 0) {
      // Return root capacities from cache, converted to Capacity objects
      return getRootCapacities().map(convertCachedToCapacity);
    }

    const currentParentId = selectedPath[selectedPath.length - 1];
    // Get children from cache, converted to Capacity objects
    return getChildren(currentParentId).map(convertCachedToCapacity);
  }, [selectedPath, getRootCapacities, getChildren]);

  // Function to find the capacity by code using the global cache
  const findCapacityByCode = useCallback(
    (code: number): Capacity | undefined => {
      const cachedCapacity = getCapacity(code);
      return cachedCapacity ? convertCachedToCapacity(cachedCapacity) : undefined;
    },
    [getCapacity]
  );

  // Function to capitalize the first letter of a text
  const capitalizeFirstLetter = (text?: string) => {
    if (!text) return '';
    return text.charAt(0).toUpperCase() + text.slice(1);
  };

  // Function to toggle the display of the capacity description
  const toggleCapacityInfo = async (e: React.MouseEvent, capacity: Capacity) => {
    e.stopPropagation(); // Prevent the click event from propagating to the card

    try {
      const capacityCode = capacity.code;

      // Toggle the display of the description
      setShowInfoMap(prev => ({
        ...prev,
        [capacityCode]: !prev[capacityCode],
      }));
    } catch (error) {
      console.error('Error toggling capacity info:', error);
    }
  };

  // Helper functions for breadcrumb styling
  const getRootButtonClasses = (isActive: boolean, darkMode: boolean): string => {
    if (isActive) {
      return darkMode ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-900';
    }
    return darkMode
      ? 'text-gray-300 hover:text-white hover:bg-gray-700'
      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100';
  };

  const getBreadcrumbItemClasses = (isLast: boolean, darkMode: boolean): string => {
    if (isLast) {
      return darkMode ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-900';
    }
    return darkMode
      ? 'text-gray-300 hover:text-white hover:bg-gray-700'
      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100';
  };

  const getSeparatorClasses = (darkMode: boolean): string => {
    return darkMode ? 'text-gray-500' : 'text-gray-400';
  };

  const activateOnEnterSpace = (e: React.KeyboardEvent, action: () => void) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      action();
    }
  };

  // Function to render a custom capacity card for the modal
  const renderCapacityCard = (capacity: Capacity, isRoot: boolean) => {
    const isSelected = selectedCapacities.some(cap => cap.code === capacity.code);
    const showInfo = showInfoMap[capacity.code] || false;
    const description = getDescription(capacity.code) || capacity.description || '';
    const metabaseCode = getMetabaseCode(capacity.code);
    const metabase_url = metabaseCode
      ? `https://metabase.wikibase.cloud/wiki/Item:${metabaseCode}`
      : '';

    // Check if this capacity is using fallback translation
    const isUsingFallback = isFallbackTranslation(capacity.code);

    // Get the parent capacity to color the icons of the child cards
    const parentCapacity = isRoot
      ? undefined
      : selectedPath.length > 0
        ? findCapacityByCode(selectedPath[selectedPath.length - 1])
        : undefined;

    // Get the root capacity for color inheritance (first item in selectedPath)
    const getRootCapacity = (): Capacity | undefined => {
      if (isRoot) {
        return capacity;
      }

      // For child capacities, find the root from the selectedPath
      if (selectedPath.length > 0) {
        return findCapacityByCode(selectedPath[0]);
      }

      return undefined;
    };

    const rootCapacity = getRootCapacity();

    // Check if capacity has children using the cache
    const capacityHasChildren = hasChildren(capacity.code);

    // Determine the level of this capacity in the hierarchy
    const level = isRoot
      ? 1
      : parentCapacity?.parentCapacity ||
          (parentCapacity && parentCapacity.skill_type !== parentCapacity.code)
        ? 3
        : 2;

    // Get background color from cache
    const backgroundColor = getColor(capacity.code);

    // Function to determine if a color is light or dark
    const isLightColor = (hexColor: string): boolean => {
      // Remove # if present
      const hex = hexColor.replace('#', '');

      // Parse RGB
      const r = parseInt(hex.substr(0, 2), 16);
      const g = parseInt(hex.substr(2, 2), 16);
      const b = parseInt(hex.substr(4, 2), 16);

      // Calculate luminance to determine if the color is light or dark
      const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

      return luminance > 0.6;
    };

    // Determine text color based on background brightness
    const getTextColor = () => {
      if (isLightColor(backgroundColor)) {
        return '#374151'; // Dark text for light backgrounds
      } else {
        return '#FFFFFF'; // White text for dark backgrounds
      }
    };

    // Determine icon filter based on background brightness
    const getIconFilter = () => {
      if (isLightColor(backgroundColor)) {
        return 'brightness(0)'; // Dark icons for light backgrounds
      } else {
        return 'brightness(0) invert(1)'; // White icons for dark backgrounds
      }
    };

    // Get checkmark color based on background
    const getCheckmarkColor = () => {
      if (isLightColor(backgroundColor)) {
        return 'text-gray-800'; // Dark checkmark for light backgrounds
      } else {
        return 'text-white'; // White checkmark for dark backgrounds
      }
    };

    // Style for root cards
    if (isRoot) {
      // Create an object with explicit styles we need to enforce
      const cardStyle = {
        backgroundColor: backgroundColor,
        color: '#FFFFFF', // White text for root
        borderRadius: '0.5rem', // Ensure rounded corners (same as rounded-lg)
        overflow: 'hidden', // Clip content to rounded corners
      };

      return (
        <button
          className={`flex flex-col w-full rounded-lg transition-all overflow-hidden h-full relative
            ${
              isSelected ? 'ring-2 ring-capx-primary-green' : ''
            } hover:brightness-90 transform hover:scale-[1.01] transition-all`}
          onClick={() => handleCategorySelect(capacity)}
          style={cardStyle}
          tabIndex={0}
          onKeyDown={e => activateOnEnterSpace(e, () => handleCategorySelect(capacity))}
          aria-pressed={isSelected}
        >
          <div className="flex p-3 h-[80px] items-center justify-between">
            {capacity.icon && (
              <div className="relative w-[24px] h-[24px] flex-shrink-0 mr-2">
                <Image
                  src={capacity.icon}
                  alt={capacity.name}
                  width={24}
                  height={24}
                  style={{ filter: getIconFilter() }}
                />
              </div>
            )}
            <div className="flex-1 mx-2 overflow-hidden">
              <div className="flex items-center w-full">
                <span className="text-white font-bold text-base truncate overflow-hidden text-ellipsis whitespace-nowrap mr-1 max-w-[calc(100%-24px)]">
                  {capitalizeFirstLetter(capacity.name)}
                </span>
                <Link
                  href={`/feed?capacityId=${capacity.code}`}
                  onClick={e => e.stopPropagation()}
                  title={pageContent['capacity-selection-modal-hover-view-capacity-feed']}
                  className="inline-flex items-center hover:underline hover:text-blue-700 transition-colors cursor-pointer flex-shrink-0 min-w-[16px]"
                >
                  <Image
                    src={LinkIconWhite}
                    alt="External link icon"
                    width={16}
                    height={16}
                    className="inline-block"
                  />
                </Link>
              </div>
            </div>
            <div className="flex items-center">
              {/* Multi-selection indicator */}
              {allowMultipleSelection && isSelected && (
                <div className="w-6 h-6 rounded-full flex items-center justify-center mr-2">
                  <span className={`${getCheckmarkColor()} text-xs font-bold drop-shadow-lg`}>
                    ✓
                  </span>
                </div>
              )}

              <button
                onClick={e => toggleCapacityInfo(e, capacity)}
                className="p-1 flex-shrink-0 mr-1"
                aria-label={pageContent['alt-info'] || 'Information icon, view additional details'}
              >
                <div className="relative w-[20px] h-[20px]">
                  <Image
                    src={showInfo ? InfoFilledIcon : InfoIcon}
                    alt={pageContent['alt-info'] || 'Information icon, view additional details'}
                    width={20}
                    height={20}
                    style={{ filter: getIconFilter() }}
                  />
                </div>
              </button>
              {capacityHasChildren && (
                <button
                  onClick={e => handleCategoryExpand(e, capacity)}
                  className="pt-2 px-1 flex-shrink-0"
                  aria-label={pageContent['alt-expand'] || 'Expand to show more details'}
                >
                  <div className="relative w-[20px] h-[20px]">
                    <Image
                      src={ArrowDownIcon}
                      alt={pageContent['alt-expand'] || 'Expand to show more details'}
                      width={20}
                      height={20}
                      style={{ filter: getIconFilter() }}
                    />
                  </div>
                </button>
              )}
            </div>
          </div>

          {showInfo && description && (
            <div
              className="bg-white p-3 text-sm rounded-b-lg flex-grow"
              onClick={e => e.stopPropagation()}
              onKeyDown={e => e.stopPropagation()}
              role="presentation"
              tabIndex={-1}
            >
              <h3 className="text-capx-dark-box-bg text-[16px] font-bold mb-3">
                {capitalizeFirstLetter(capacity.name)}
              </h3>
              <p className="text-gray-700 text-xs leading-relaxed">
                {capitalizeFirstLetter(description)}
              </p>

              {/* Translation Contribution CTA */}
              {isUsingFallback && (
                <div onClick={e => e.stopPropagation()} onKeyDown={e => e.stopPropagation()} role="presentation" tabIndex={-1}>
                  <TranslationContributeCTA
                    capacityCode={capacity.code}
                    metabaseCode={metabaseCode}
                    compact={true}
                  />
                </div>
              )}

              {metabase_url && (
                <a
                  href={metabase_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:underline hover:text-blue-700 mt-2 inline-block text-xs transition-colors"
                  onClick={e => e.stopPropagation()}
                >
                  {pageContent['capacity-selection-modal-see-more-information']}
                </a>
              )}
            </div>
          )}
        </button>
      );
    }

    // Style for child cards - with level-based styling
    return (
      <button
        className={`flex flex-col w-full rounded-lg shadow-sm hover:shadow-lg transition-all overflow-hidden h-full relative
          ${
            isSelected ? 'ring-2 ring-capx-primary-green' : ''
          } hover:bg-opacity-90 transform hover:scale-[1.01] transition-all`}
        onClick={() => handleCategorySelect(capacity)}
        style={{
          backgroundColor: backgroundColor,
        }}
        tabIndex={0}
        onKeyDown={e => activateOnEnterSpace(e, () => handleCategorySelect(capacity))}
        aria-pressed={isSelected}
      >
        <div className="flex p-3 h-[80px] items-center justify-between">
          {capacity.icon && (
            <div className="relative w-[24px] h-[24px] flex-shrink-0 mr-2">
              <Image
                src={capacity.icon}
                alt={capacity.name}
                width={24}
                height={24}
                style={{ filter: getIconFilter() }}
              />
            </div>
          )}
          <div className="flex-1 mx-2 overflow-hidden">
            <div className="flex items-center w-full">
              <span
                className={`font-bold text-base truncate overflow-hidden text-ellipsis whitespace-nowrap mr-1 max-w-[calc(100%-24px)]`}
                style={{ color: getTextColor() }}
              >
                {capitalizeFirstLetter(capacity.name)}
              </span>
              <Link
                href={`/feed?capacityId=${capacity.code}`}
                onClick={e => e.stopPropagation()}
                title={pageContent['capacity-selection-modal-hover-view-capacity-feed']}
                className="inline-flex items-center hover:underline hover:text-blue-700 transition-colors cursor-pointer flex-shrink-0 min-w-[16px]"
              >
                <Image
                  src={LinkIconWhite}
                  alt={pageContent['alt-external-link'] || 'External link, opens in new tab'}
                  width={16}
                  height={16}
                  className="inline-block"
                />
              </Link>
            </div>
          </div>
          <div className="flex items-center">
            {/* Multi-selection indicator */}
            {allowMultipleSelection && isSelected && (
              <div className="w-6 h-6 rounded-full flex items-center justify-center mr-2">
                <span className={`${getCheckmarkColor()} text-xs font-bold drop-shadow-lg`}>✓</span>
              </div>
            )}

            <button
              onClick={e => toggleCapacityInfo(e, capacity)}
              className="p-1 flex-shrink-0 mr-1"
              aria-label={pageContent['alt-info'] || 'Information icon, view additional details'}
            >
              <div className="relative w-[20px] h-[20px]">
                <Image
                  src={showInfo ? InfoFilledIcon : InfoIcon}
                  alt={pageContent['alt-info'] || 'Information icon, view additional details'}
                  width={20}
                  height={20}
                  style={{ filter: getIconFilter() }}
                />
              </div>
            </button>
            {capacityHasChildren && (
              <button
                onClick={e => handleCategoryExpand(e, capacity)}
                className="p-1 flex-shrink-0"
                aria-label={pageContent['alt-expand'] || 'Expand to show more details'}
              >
                <div className="relative w-[20px] h-[20px]">
                  <Image
                    src={ArrowDownIcon}
                    alt={pageContent['alt-expand'] || 'Expand to show more details'}
                    width={20}
                    height={20}
                    style={{ filter: getIconFilter() }}
                  />
                </div>
              </button>
            )}
          </div>
        </div>

        {showInfo && description && (
          <div
            className="bg-white p-3 text-sm rounded-b-lg flex-grow"
            onClick={e => e.stopPropagation()}
            onKeyDown={e => e.stopPropagation()}
            role="presentation"
            tabIndex={-1}
          >
            <h3 className="text-capx-dark-box-bg text-base font-bold mb-3">
              {capitalizeFirstLetter(capacity.name)}
            </h3>
            <p className="text-gray-700 text-xs leading-relaxed">
              {capitalizeFirstLetter(description)}
            </p>

            {/* Translation Contribution CTA */}
            {isUsingFallback && (
              <div onClick={e => e.stopPropagation()} onKeyDown={e => e.stopPropagation()} role="presentation" tabIndex={-1}>
                <TranslationContributeCTA
                  capacityCode={capacity.code}
                  metabaseCode={metabaseCode}
                  compact={true}
                />
              </div>
            )}

            {metabase_url && (
              <a
                href={metabase_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:underline mt-2 inline-block text-xs"
                onClick={e => e.stopPropagation()}
              >
                {pageContent['capacity-selection-modal-see-more-information']}
              </a>
            )}
          </div>
        )}
      </button>
    );
  };

  return (
    <div className={`fixed inset-0 z-50 ${isOpen ? 'block' : 'hidden'}`}>
      {/* Overlay */}
      <button className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose} />

      {/* Modal */}
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <div
          className={`w-full max-w-lg md:max-w-3xl lg:max-w-4xl rounded-lg shadow-lg ${
            darkMode ? 'bg-gray-800' : 'bg-white'
          } p-4 md:p-6`}
        >
          {/* Header */}
          <div className="flex justify-between items-center mb-4">
            <div className="flex flex-col">
              <h2
                className={`text-lg md:text-xl font-semibold ${
                  darkMode ? 'text-white' : 'text-gray-900'
                }`}
              >
                {title}
              </h2>
            </div>
            <button
              onClick={onClose}
              className={`p-1 hover:bg-gray-100 rounded ${
                darkMode ? 'text-white hover:bg-gray-700' : 'text-gray-500'
              }`}
            >
              ✕
            </button>
          </div>

          {/* Enhanced Breadcrumb Navigation */}
          <div className="mb-4">
            {/* Back button for mobile/easier navigation */}
            {selectedPath.length > 0 && (
              <button
                onClick={() => setSelectedPath(prev => prev.slice(0, -1))}
                className={`flex items-center gap-2 mb-2 px-2 py-1 rounded-md transition-colors ${
                  darkMode
                    ? 'text-gray-300 hover:text-white hover:bg-gray-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M19 12H5M12 19l-7-7 7-7" />
                </svg>
                <span className="text-sm">{pageContent['capacity-selection-modal-back']}</span>
              </button>
            )}

            {/* Breadcrumb trail */}
            <div className="flex items-center gap-1 text-sm overflow-x-auto scrollbar-hide pb-1">
              {/* Home/Root */}
              <button
                onClick={() => setSelectedPath([])}
                className={`flex items-center gap-1 px-2 py-1 rounded-md transition-colors flex-shrink-0 ${getRootButtonClasses(selectedPath.length === 0, darkMode)}`}
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                  <polyline points="9,22 9,12 15,12 15,22" />
                </svg>
                <span className="hidden sm:inline">
                  {pageContent['capacity-selection-modal-root-capacities']}
                </span>
              </button>

              {/* Path segments */}
              {selectedPath.map((pathId, index) => {
                const capacity = findCapacityByCode(pathId);
                const isLast = index === selectedPath.length - 1;
                const capacityName =
                  capacity?.name ||
                  `${pageContent['capacity-selection-modal-select-capacity']} ${pathId}`;

                // Get icon from capacity or generate it based on code if not found
                const capacityIcon = capacity?.icon || getCapacityIcon(pathId);

                return (
                  <React.Fragment key={`path-${pathId}-${index}`}>
                    {/* Separator */}
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      className={`flex-shrink-0 ${getSeparatorClasses(darkMode)}`}
                    >
                      <polyline points="9,18 15,12 9,6" />
                    </svg>

                    {/* Breadcrumb item */}
                    <button
                      onClick={() => setSelectedPath(prev => prev.slice(0, index + 1))}
                      className={`flex items-center gap-1 px-2 py-1 rounded-md transition-colors flex-shrink-0 max-w-[150px] ${getBreadcrumbItemClasses(isLast, darkMode)}`}
                      title={capacityName}
                    >
                      {/* Capacity icon */}
                      {capacityIcon && (
                        <div className="relative w-[14px] h-[14px] flex-shrink-0">
                          <Image
                            src={capacityIcon}
                            alt={capacityName}
                            width={14}
                            height={14}
                            style={{
                              filter: darkMode ? 'brightness(0) invert(1)' : 'brightness(0)',
                            }}
                          />
                        </div>
                      )}
                      <span className="truncate block">{capacityName}</span>
                    </button>
                  </React.Fragment>
                );
              })}
            </div>
          </div>

          {/* Capacity list */}
          <div className="space-y-4 max-h-[60vh] md:max-h-[65vh] overflow-y-auto scrollbar-hide p-2 pb-4">
            {isLoadingTranslations ? (
              <div className={`text-center py-4 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                {pageContent['capacity-selection-modal-loading']}
              </div>
            ) : getCurrentCapacities().length > 0 ? (
              <div className="flex flex-col gap-2">
                {getCurrentCapacities().map((capacity, index) => {
                  const isRoot = selectedPath.length === 0;
                  const uniqueKey = `${capacity.code}-${selectedPath.join('-')}-${index}`;

                  // For root capacities, use the cached color
                  let rootStyle;
                  if (isRoot) {
                    rootStyle = { backgroundColor: getColor(capacity.code) };
                  }

                  return (
                    <div
                      key={uniqueKey}
                      className="transform-gpu"
                      style={isRoot ? rootStyle : undefined}
                    >
                      {renderCapacityCard(capacity, isRoot)}
                      {!allowMultipleSelection &&
                        selectedCapacities.length > 0 &&
                        selectedCapacities[0].code === capacity.code && (
                          <div
                            className={`text-sm mt-1 text-center ${
                              darkMode ? 'text-gray-400' : 'text-gray-500'
                            }`}
                          >
                            {pageContent['capacity-selection-modal-selected']}
                          </div>
                        )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className={`text-center py-4 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                {pageContent['capacity-selection-modal-no-capacities-found']}
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex w-full justify-between gap-2 mt-4">
            <BaseButton
              label={pageContent['capacity-selection-modal-select-capacity-button-cancel']}
              customClass={`bg-[#F6F6F6] w-1/2 md:w-1/3 rounded-[6px] !py-2 !px-4 font-extrabold text-[14px] text-capx-dark-bg border border-capx-dark-bg ${
                isMobile ? 'text-[14px]' : 'text-[16px]'
              }`}
              onClick={onClose}
            />
            <BaseButton
              label={
                allowMultipleSelection && selectedCapacities.length > 1
                  ? `${selectedCapacities.length} ${pageContent['capacity-selection-modal-select-capacity-button-multiple-capacities']} ${pageContent['capacity-selection-modal-select-capacity-button-multiple-selected']}`
                  : pageContent['capacity-selection-modal-select-capacity-button']
              }
              customClass={`bg-capx-secondary-purple rounded-[6px] !py-2 !px-4 font-extrabold text-white hover:bg-capx-primary-green w-1/2 md:w-1/3 ${
                selectedCapacities.length === 0 ? 'opacity-50 cursor-not-allowed' : ''
              }
              ${isMobile ? 'text-[14px]' : 'text-[16px]'}`}
              onClick={handleConfirm}
              disabled={selectedCapacities.length === 0}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
