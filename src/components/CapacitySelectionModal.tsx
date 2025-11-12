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
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly onSelect: (capacities: Capacity[]) => void;
  readonly title: string;
  readonly allowMultipleSelection?: boolean;
  readonly initialCapacityId?: number;
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

// Extracted CapacityCard component to reduce cognitive complexity
// Shared UI components to reduce duplication
interface CapacityIconProps {
  capacity: Capacity;
  getIconFilter: () => string;
}

const CapacityIcon: React.FC<CapacityIconProps> = ({ capacity, getIconFilter }) => {
  if (!capacity.icon) return null;

  return (
    <div className="relative w-[24px] h-[24px] flex-shrink-0 mr-2">
      <Image
        src={capacity.icon}
        alt={capacity.name}
        width={24}
        height={24}
        style={{ filter: getIconFilter() }}
      />
    </div>
  );
};

interface CapacityNameAndLinkProps {
  capacity: Capacity;
  pageContent: any;
  capitalizeFirstLetter: (text?: string) => string;
  isRoot?: boolean;
  getTextColor?: () => string;
}

const CapacityNameAndLink: React.FC<CapacityNameAndLinkProps> = ({
  capacity,
  pageContent,
  capitalizeFirstLetter,
  isRoot = false,
  getTextColor,
}) => {
  const textColorStyle = isRoot ? {} : { color: getTextColor?.() };
  const textClassName = isRoot
    ? 'text-white font-bold text-base truncate overflow-hidden text-ellipsis whitespace-nowrap mr-1 max-w-[calc(100%-24px)]'
    : 'font-bold text-base truncate overflow-hidden text-ellipsis whitespace-nowrap mr-1 max-w-[calc(100%-24px)]';

  return (
    <div className="flex items-center w-full">
      <span className={textClassName} style={textColorStyle}>
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
  );
};

interface CapacityActionsProps {
  capacity: Capacity;
  allowMultipleSelection: boolean;
  isSelected: boolean;
  showInfo: boolean;
  capacityHasChildren: boolean;
  getCheckmarkColor: () => string;
  getIconFilter: () => string;
  toggleCapacityInfo: (e: React.MouseEvent | React.KeyboardEvent, capacity: Capacity) => void;
  handleCategoryExpand: (e: React.MouseEvent | React.KeyboardEvent, capacity: Capacity) => void;
  activateOnEnterSpace: (e: React.KeyboardEvent, action: () => void) => void;
  pageContent: any;
  isRoot?: boolean;
}

const CapacityActions: React.FC<CapacityActionsProps> = ({
  capacity,
  allowMultipleSelection,
  isSelected,
  showInfo,
  capacityHasChildren,
  getCheckmarkColor,
  getIconFilter,
  toggleCapacityInfo,
  handleCategoryExpand,
  activateOnEnterSpace,
  pageContent,
  isRoot = false,
}) => {
  const expandButtonClassName = isRoot
    ? 'pt-2 px-1 flex-shrink-0 cursor-pointer bg-transparent border-none'
    : 'p-1 flex-shrink-0 cursor-pointer bg-transparent border-none';

  return (
    <div className="flex items-center">
      {allowMultipleSelection && isSelected && (
        <div className="w-6 h-6 rounded-full flex items-center justify-center mr-2">
          <span className={`${getCheckmarkColor()} text-xs font-bold drop-shadow-lg`}>✓</span>
        </div>
      )}

      <button
        type="button"
        onClick={e => toggleCapacityInfo(e, capacity)}
        className="p-1 flex-shrink-0 mr-1 cursor-pointer bg-transparent border-none"
        aria-label={pageContent['alt-info'] || 'Information icon, view additional details'}
        onKeyDown={e => activateOnEnterSpace(e, () => toggleCapacityInfo(e, capacity))}
        tabIndex={0}
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
          type="button"
          onClick={e => handleCategoryExpand(e, capacity)}
          className={expandButtonClassName}
          aria-label={pageContent['alt-expand'] || 'Expand to show more details'}
          onKeyDown={e => activateOnEnterSpace(e, () => handleCategoryExpand(e, capacity))}
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
  );
};

interface CapacityInfoSectionProps {
  showInfo: boolean;
  description: string;
  isUsingFallback: boolean;
  capacity: Capacity;
  metabaseCode: string;
  metabase_url: string;
  capitalizeFirstLetter: (text?: string) => string;
  pageContent: any;
}

const CapacityInfoSection: React.FC<CapacityInfoSectionProps> = ({
  showInfo,
  description,
  isUsingFallback,
  capacity,
  metabaseCode,
  metabase_url,
  capitalizeFirstLetter,
  pageContent,
}) => {
  if (!showInfo || !description) return null;

  return (
    <div
      className="bg-white p-3 text-sm rounded-b-lg flex-grow"
      onClick={e => e.stopPropagation()}
      onKeyDown={e => e.stopPropagation()}
    >
      <p className="text-gray-700 text-xs leading-relaxed text-left">
        {capitalizeFirstLetter(description)}
      </p>
      {isUsingFallback && (
        <div onClick={e => e.stopPropagation()} onKeyDown={e => e.stopPropagation()}>
          <TranslationContributeCTA
            capacityCode={capacity.code}
            metabaseCode={metabaseCode}
            compact={true}
          />
        </div>
      )}
      <div className="text-start">
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
    </div>
  );
};

interface CapacityCardProps {
  capacity: Capacity;
  isRoot: boolean;
  isSelected: boolean;
  showInfo: boolean;
  description: string;
  metabaseCode: string;
  metabase_url: string;
  isUsingFallback: boolean;
  allowMultipleSelection: boolean;
  handleCategorySelect: (capacity: Capacity) => void;
  toggleCapacityInfo: (e: React.MouseEvent | React.KeyboardEvent, capacity: Capacity) => void;
  handleCategoryExpand: (e: React.MouseEvent | React.KeyboardEvent, capacity: Capacity) => void;
  activateOnEnterSpace: (e: React.KeyboardEvent, action: () => void) => void;
  capacityHasChildren: boolean;
  getIconFilter: () => string;
  getCheckmarkColor: () => string;
  getTextColor: () => string;
  capitalizeFirstLetter: (text?: string) => string;
  pageContent: any;
  selectedPath: number[];
  findCapacityByCode: (code: number) => Capacity | undefined;
  getColor: (code: number) => string;
  darkMode: boolean;
}

const CapacityCard: React.FC<CapacityCardProps> = ({
  capacity,
  isRoot,
  isSelected,
  showInfo,
  description,
  metabaseCode,
  metabase_url,
  isUsingFallback,
  allowMultipleSelection,
  handleCategorySelect,
  toggleCapacityInfo,
  handleCategoryExpand,
  activateOnEnterSpace,
  capacityHasChildren,
  getIconFilter,
  getCheckmarkColor,
  getTextColor,
  capitalizeFirstLetter,
  pageContent,
}) => {
  const cardStyle = isRoot
    ? {
        backgroundColor: capacity.color,
        color: '#FFFFFF',
        borderRadius: '0.5rem',
        overflow: 'hidden',
      }
    : {
        backgroundColor: capacity.color,
      };

  const cardClassName = isRoot
    ? `flex flex-col w-full rounded-lg transition-all overflow-hidden h-full relative
       ${isSelected ? 'ring-2 ring-capx-primary-green' : ''}
       hover:brightness-90 transform hover:scale-[1.01] transition-all`
    : `flex flex-col w-full rounded-lg shadow-sm hover:shadow-lg transition-all overflow-hidden h-full relative
       ${isSelected ? 'ring-2 ring-capx-primary-green' : ''}
       hover:bg-opacity-90 transform hover:scale-[1.01] transition-all`;

  return (
    <button
      className={cardClassName}
      onClick={() => handleCategorySelect(capacity)}
      style={cardStyle}
      tabIndex={0}
      onKeyDown={e => activateOnEnterSpace(e, () => handleCategorySelect(capacity))}
      aria-pressed={isSelected}
    >
      <div className="flex p-3 h-[80px] items-center justify-between">
        <CapacityIcon capacity={capacity} getIconFilter={getIconFilter} />

        <div className="flex-1 mx-2 overflow-hidden">
          <CapacityNameAndLink
            capacity={capacity}
            pageContent={pageContent}
            capitalizeFirstLetter={capitalizeFirstLetter}
            isRoot={isRoot}
            getTextColor={getTextColor}
          />
        </div>

        <CapacityActions
          capacity={capacity}
          allowMultipleSelection={allowMultipleSelection}
          isSelected={isSelected}
          showInfo={showInfo}
          capacityHasChildren={capacityHasChildren}
          getCheckmarkColor={getCheckmarkColor}
          getIconFilter={getIconFilter}
          toggleCapacityInfo={toggleCapacityInfo}
          handleCategoryExpand={handleCategoryExpand}
          activateOnEnterSpace={activateOnEnterSpace}
          pageContent={pageContent}
          isRoot={isRoot}
        />
      </div>

      <CapacityInfoSection
        showInfo={showInfo}
        description={description}
        isUsingFallback={isUsingFallback}
        capacity={capacity}
        metabaseCode={metabaseCode}
        metabase_url={metabase_url}
        capitalizeFirstLetter={capitalizeFirstLetter}
        pageContent={pageContent}
      />
    </button>
  );
};

export default function CapacitySelectionModal({
  isOpen,
  onClose,
  onSelect,
  title,
  allowMultipleSelection = true,
  initialCapacityId,
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

  // Function to find the path to a capacity in the hierarchy (from root to parent of target)
  const findPathToCapacity = useCallback((targetCapacityId: number): number[] => {
    const path: number[] = [];
    let currentCapacity = getCapacity(targetCapacityId);
    
    if (!currentCapacity) return path;

    // Build path by following parent chain from target to root
    const visited = new Set<number>();
    const reversePath: number[] = [];
    
    while (currentCapacity) {
      if (visited.has(currentCapacity.code)) break; // Prevent infinite loop
      visited.add(currentCapacity.code);
      
      // Get parent from skill_type
      const parentId = currentCapacity.skill_type;
      
      // If this capacity has a valid parent (and it's not itself), add parent to path
      if (parentId && parentId !== currentCapacity.code) {
        reversePath.push(parentId);
        currentCapacity = getCapacity(parentId);
      } else {
        // Reached root or no parent
        break;
      }
    }
    
    // Reverse to get path from root to parent of target
    return reversePath.reverse();
  }, [getCapacity]);

  useEffect(() => {
    if (isOpen && session?.user?.token) {
      updateLanguage(language).then(() => {
        // If there's an initial capacity, navigate to it
        if (initialCapacityId) {
          const path = findPathToCapacity(initialCapacityId);
          setSelectedPath(path);
          
          // Select the initial capacity
          const capacity = getCapacity(initialCapacityId);
          if (capacity) {
            const convertedCapacity = convertCachedToCapacity(capacity);
            setSelectedCapacities([convertedCapacity]);
          }
        } else {
          setSelectedPath([]);
          setSelectedCapacities([]);
        }
        setShowInfoMap({});
      });
    }
  }, [isOpen, session?.user?.token, language, updateLanguage, initialCapacityId, findPathToCapacity, getCapacity]);

  const handleCategorySelect = async (category: Capacity) => {
    try {
      const categoryId = category.code;
      if (allowMultipleSelection) {
        setSelectedCapacities(prev => {
          const isAlreadySelected = prev.some(cap => cap.code === categoryId);
          if (isAlreadySelected) {
            return prev.filter(cap => cap.code !== categoryId);
          } else {
            return [...prev, category];
          }
        });
      } else {
        setSelectedCapacities([category]);
      }
      const currentPathIndex = selectedPath.indexOf(categoryId);
      if (currentPathIndex !== -1) {
        return;
      }
    } catch (err) {
      console.error('Error selecting category:', err);
    }
  };

  const handleCategoryExpand = async (
    e: React.MouseEvent | React.KeyboardEvent,
    category: Capacity
  ) => {
    e.stopPropagation();
    try {
      const categoryId = category.code;
      const currentPathIndex = selectedPath.indexOf(categoryId);
      if (currentPathIndex !== -1) {
        setSelectedPath(prev => prev.slice(0, currentPathIndex + 1));
        return;
      }
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
      return getRootCapacities().map(convertCachedToCapacity);
    }
    const currentParentId = selectedPath[selectedPath.length - 1];
    return getChildren(currentParentId).map(convertCachedToCapacity);
  }, [selectedPath, getRootCapacities, getChildren]);

  const findCapacityByCode = useCallback(
    (code: number): Capacity | undefined => {
      const cachedCapacity = getCapacity(code);
      return cachedCapacity ? convertCachedToCapacity(cachedCapacity) : undefined;
    },
    [getCapacity]
  );

  const capitalizeFirstLetter = (text?: string) => {
    if (!text) return '';
    return text.charAt(0).toUpperCase() + text.slice(1);
  };

  const toggleCapacityInfo = async (
    e: React.MouseEvent | React.KeyboardEvent,
    capacity: Capacity
  ) => {
    e.stopPropagation();
    try {
      const capacityCode = capacity.code;
      setShowInfoMap(prev => ({
        ...prev,
        [capacityCode]: !prev[capacityCode],
      }));
    } catch (error) {
      console.error('Error toggling capacity info:', error);
    }
  };

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

  // Helper functions for CapacityCard
  const isLightColor = (hexColor: string): boolean => {
    const hex = hexColor.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.6;
  };

  const getTextColor = (color: string) => {
    return isLightColor(color) ? '#374151' : '#FFFFFF';
  };

  const getIconFilter = (color: string) => {
    return isLightColor(color) ? 'brightness(0)' : 'brightness(0) invert(1)';
  };

  const getCheckmarkColor = (color: string) => {
    return isLightColor(color) ? 'text-gray-800' : 'text-white';
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
            {(() => {
              if (isLoadingTranslations) {
                return (
                  <div
                    className={`text-center py-4 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}
                  >
                    {pageContent['capacity-selection-modal-loading']}
                  </div>
                );
              }

              if (getCurrentCapacities().length > 0) {
                return (
                  <div className="flex flex-col gap-2">
                    {getCurrentCapacities().map((capacity, index) => {
                      const isRoot = selectedPath.length === 0;
                      const uniqueKey = `${capacity.code}-${selectedPath.join('-')}-${index}`;

                      // For root capacities, use the cached color
                      let rootStyle: React.CSSProperties | undefined;
                      if (isRoot) {
                        rootStyle = { backgroundColor: getColor(capacity.code) };
                      }

                      return (
                        <div
                          key={uniqueKey}
                          className="transform-gpu"
                          style={isRoot ? rootStyle : undefined}
                        >
                          <CapacityCard
                            capacity={capacity}
                            isRoot={isRoot}
                            isSelected={selectedCapacities.some(cap => cap.code === capacity.code)}
                            showInfo={showInfoMap[capacity.code] || false}
                            description={
                              getDescription(capacity.code) || capacity.description || ''
                            }
                            metabaseCode={getMetabaseCode(capacity.code)}
                            metabase_url={
                              getMetabaseCode(capacity.code)
                                ? `https://metabase.wikibase.cloud/wiki/Item:${getMetabaseCode(capacity.code)}`
                                : ''
                            }
                            isUsingFallback={isFallbackTranslation(capacity.code)}
                            allowMultipleSelection={allowMultipleSelection}
                            handleCategorySelect={handleCategorySelect}
                            toggleCapacityInfo={toggleCapacityInfo}
                            handleCategoryExpand={handleCategoryExpand}
                            activateOnEnterSpace={activateOnEnterSpace}
                            capacityHasChildren={hasChildren(capacity.code)}
                            getIconFilter={() => getIconFilter(getColor(capacity.code))}
                            getCheckmarkColor={() => getCheckmarkColor(getColor(capacity.code))}
                            getTextColor={() => getTextColor(getColor(capacity.code))}
                            capitalizeFirstLetter={capitalizeFirstLetter}
                            pageContent={pageContent}
                            selectedPath={selectedPath}
                            findCapacityByCode={findCapacityByCode}
                            getColor={getColor}
                            darkMode={darkMode}
                          />
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
                );
              }

              return (
                <div className={`text-center py-4 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  {pageContent['capacity-selection-modal-no-capacities-found']}
                </div>
              );
            })()}
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
