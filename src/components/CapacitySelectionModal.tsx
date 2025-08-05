import { useEffect, useState, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useTheme } from '@/contexts/ThemeContext';
import { Capacity, CapacityResponse } from '@/types/capacity';
import React from 'react';
import BaseButton from '@/components/BaseButton';
import { useApp } from '@/contexts/AppContext';
import Image from 'next/image';
import ArrowDownIcon from '@/public/static/images/keyboard_arrow_down.svg';
import { getHueRotate, getCapacityIcon, getCapacityColor } from '@/lib/utils/capacitiesUtils';
import InfoIcon from '@/public/static/images/info.svg';
import InfoFilledIcon from '@/public/static/images/info_filled.svg';
import Link from 'next/link';
import LinkIcon from '@/public/static/images/link_icon.svg';
import LinkIconWhite from '@/public/static/images/link_icon_white.svg';
import { useCapacities } from '@/hooks/useCapacities';
import { useCapacityCache } from '@/contexts/CapacityCacheContext';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { CAPACITY_CACHE_KEYS } from '@/hooks/useCapacities';
import { capacityService } from '@/services/capacityService';

interface CapacitySelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (capacities: Capacity[]) => void;
  title: string;
  allowMultipleSelection?: boolean;
}

// Helper function to get a color based on capacity code
// Maps numeric codes to color names (e.g., "50" -> "learning")
const getColorForCapacity = (code: number | string): string => {
  const codeStr = String(code);
  if (codeStr.startsWith('10')) return 'organizational';
  if (codeStr.startsWith('36')) return 'communication';
  if (codeStr.startsWith('50')) return 'learning';
  if (codeStr.startsWith('56')) return 'community';
  if (codeStr.startsWith('65')) return 'social';
  if (codeStr.startsWith('74')) return 'strategic';
  if (codeStr.startsWith('106')) return 'technology';
  return 'gray-200';
};

// Helper function to convert API response to Capacity object
const convertToCapacity = (item: any): Capacity => {
  // We need to handle any type here since the API response doesn't match our type definition exactly
  const code = typeof item.code === 'string' ? parseInt(item.code, 10) : item.code;
  const baseCode = parseInt(String(code).split('.')[0], 10); // Get the integer part for icon lookup
  const codeStr = String(code); // Convert to string for color determination

  // Get the proper color name based on the capacity code
  const color = getColorForCapacity(codeStr);

  return {
    code,
    name: item.name,
    color: color, // Use the color name, not the code
    icon: getCapacityIcon(baseCode),
    hasChildren: true,
    skill_type: code,
    skill_wikidata_item: '',
    // Add other fields with defaults
    level: 1,
    parentCapacity: undefined,
    description: '',
  };
};

// Direct helper to get hex color from capacity code
// Maps numeric codes directly to hex colors (e.g., "50" -> "#00965A")
const getHexColorFromCode = (code: number | string): string => {
  const colorName = getColorForCapacity(code);
  return getCapacityColor(colorName);
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
  const { pageContent, isMobile } = useApp();
  const [selectedPath, setSelectedPath] = useState<number[]>([]);
  const [selectedCapacities, setSelectedCapacities] = useState<Capacity[]>([]);
  const [showInfoMap, setShowInfoMap] = useState<Record<number, boolean>>({});
  const [capacityDescriptions, setCapacityDescriptions] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState<Record<string, boolean>>({
    root: false,
  });
  const [rootCapacities, setRootCapacities] = useState<Capacity[]>([]);
  const [childrenCapacities, setChildrenCapacities] = useState<Record<string, Capacity[]>>({});

  // For tracking which capacity descriptions have been requested
  const [requestedDescriptions, setRequestedDescriptions] = useState<Set<number>>(new Set());

  // For tracking which capacity we're currently trying to expand
  const [expandingCapacityId, setExpandingCapacityId] = useState<string | null>(null);

  // Get the query client for manual data operations
  const queryClient = useQueryClient();

  // Get capacity data from the global cache system
  const { getCapacity, hasChildren, preloadCapacities } = useCapacityCache();
  const { getCapacityById } = useCapacities();

  // Use React Query directly for root capacities
  const { data: rootCapacitiesData, isLoading: isLoadingRoots } = useQuery({
    queryKey: CAPACITY_CACHE_KEYS.root,
    queryFn: async () => {
      if (!session?.user?.token) return [] as Capacity[];

      const response = await capacityService.fetchCapacities({
        headers: { Authorization: `Token ${session.user.token}` },
      });

      // Transform the response using our helper function
      return response.map(convertToCapacity);
    },
    enabled: isOpen && !!session?.user?.token,
  });

  // Query for child capacities - it will only run when expandingCapacityId changes
  const { data: childCapacitiesData } = useQuery<Capacity[]>({
    queryKey: CAPACITY_CACHE_KEYS.children(expandingCapacityId || ''),
    queryFn: async () => {
      if (!session?.user?.token || !expandingCapacityId) return [];

      try {
        setIsLoading(prev => ({ ...prev, [expandingCapacityId]: true }));

        // Get data from API
        const response = await capacityService.fetchCapacitiesByType(expandingCapacityId, {
          headers: { Authorization: `Token ${session.user.token}` },
        });

        // Format the response
        const capacityData = Object.entries(response).map(([code, name]) => {
          // Find the parent capacity for proper color/icon inheritance
          const parentCapacity = findCapacityByCode(Number(expandingCapacityId));

          // Determine the level
          const level = selectedPath.length + 1;

          // Get the appropriate color name based on the code
          const colorName = getColorForCapacity(code);

          return {
            code: Number(code),
            name: typeof name === 'string' ? name : String(name),
            color: colorName,
            icon: parentCapacity?.icon || '',
            hasChildren: true, // Assume may have children until proven otherwise
            skill_type: Number(expandingCapacityId),
            skill_wikidata_item: '',
            parentCapacity: parentCapacity,
            level: level,
          } as Capacity;
        });

        return capacityData;
      } catch (error) {
        console.error(`Error fetching children for ${expandingCapacityId}:`, error);
        return [];
      } finally {
        setIsLoading(prev => ({ ...prev, [expandingCapacityId]: false }));
      }
    },
    enabled: !!expandingCapacityId && !!session?.user?.token,
  });

  // Query for capacity descriptions
  const { data: descriptionData } = useQuery<{
    id: number;
    description: string;
    wdCode: string;
  } | null>({
    queryKey: ['capacityDescription', ...Array.from(requestedDescriptions)],
    queryFn: async () => {
      // If no descriptions requested, don't fetch
      if (requestedDescriptions.size === 0 || !session?.user?.token) return null;

      // Get the last requested description ID
      const capacityId = Array.from(requestedDescriptions).pop();
      if (!capacityId) return null;

      try {
        const response = await capacityService.fetchCapacityDescription(capacityId);
        return {
          id: capacityId,
          description: response?.description || '',
          wdCode: response?.wdCode || '',
        };
      } catch (error) {
        console.error(`Error fetching description for capacity ${capacityId}:`, error);
        return null;
      }
    },
    enabled: requestedDescriptions.size > 0 && !!session?.user?.token,
  });

  // Process description data when it changes
  useEffect(() => {
    if (descriptionData?.id && descriptionData?.description) {
      // Only update if the value is different from the current one
      setCapacityDescriptions(prev => {
        if (prev[descriptionData.id] === descriptionData.description) {
          return prev;
        }
        return {
          ...prev,
          [descriptionData.id]: descriptionData.description,
        };
      });
    }
  }, [descriptionData?.id, descriptionData?.description]);

  // Load root capacities when data is available
  useEffect(() => {
    if (rootCapacitiesData && Array.isArray(rootCapacitiesData) && rootCapacitiesData.length > 0) {
      // Make sure each capacity has the right color name before setting in state
      const processedCapacities = rootCapacitiesData.map(capacity => {
        // Ensure color is a valid color name, not a numeric code
        const colorName = getColorForCapacity(capacity.code);
        return {
          ...capacity,
          color: colorName,
        };
      });
      setRootCapacities(processedCapacities);
    }
  }, [rootCapacitiesData]);

  // Process child capacities data when it changes
  useEffect(() => {
    if (
      childCapacitiesData &&
      Array.isArray(childCapacitiesData) &&
      childCapacitiesData.length > 0 &&
      expandingCapacityId
    ) {
      // Update the child capacities
      setChildrenCapacities(prev => ({
        ...prev,
        [expandingCapacityId]: childCapacitiesData,
      }));

      // Update the selected path if necessary
      if (!selectedPath.includes(Number(expandingCapacityId))) {
        setSelectedPath(prev => [...prev, Number(expandingCapacityId)]);
      }

      // Reset the expanding capacity ID
      setExpandingCapacityId(null);
    }
  }, [childCapacitiesData, expandingCapacityId, selectedPath]);

  // Initialize data when modal opens
  useEffect(() => {
    if (isOpen && session?.user?.token) {
      // Clear old cache data
      queryClient.invalidateQueries({ queryKey: CAPACITY_CACHE_KEYS.root });

      // Ensure the cache is loaded
      preloadCapacities();

      // Reset the state when the modal opens
      setSelectedPath([]);
      setSelectedCapacities([]);
      setShowInfoMap({});
      setCapacityDescriptions({});
      setRequestedDescriptions(new Set());
      setExpandingCapacityId(null);
      setIsLoading({ root: false });
    }
  }, [isOpen, session?.user?.token, preloadCapacities, queryClient]);

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

      // Check if we need to fetch the children
      if (!childrenCapacities[categoryId.toString()]) {
        // Set the expanding capacity ID to trigger the query
        setExpandingCapacityId(categoryId.toString());
        return;
      }

      // If there are already children loaded, expand
      if (childrenCapacities[categoryId.toString()]?.length > 0) {
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
        skill_type:
          selectedPath.length > 0 ? selectedPath[selectedPath.length - 1] : capacity.code,
      }));
      onSelect(capacitiesToReturn);
      onClose();
    }
  };

  const getCurrentCapacities = useCallback(() => {
    if (selectedPath.length === 0) {
      return rootCapacities;
    }

    const currentParentId = selectedPath[selectedPath.length - 1];
    const currentCapacities = childrenCapacities[currentParentId.toString()];

    if (!currentCapacities) {
      return [];
    }

    return currentCapacities;
  }, [selectedPath, childrenCapacities, rootCapacities]);

  // Function to find the capacity by code using the global cache
  const findCapacityByCode = useCallback(
    (code: number): Capacity | undefined => {
      return getCapacity(code) || getCapacityById(code);
    },
    [getCapacity, getCapacityById]
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

      // If we already have the description in local cache, just toggle visibility
      if (capacityDescriptions[capacityCode]) {
        setShowInfoMap(prev => ({
          ...prev,
          [capacityCode]: !prev[capacityCode],
        }));
        return;
      }

      // If we don't have the description, request it
      setRequestedDescriptions(prev => {
        const newSet = new Set(prev);
        newSet.add(capacityCode);
        return newSet;
      });

      // Toggle the display of the description regardless of fetch success
      setShowInfoMap(prev => ({
        ...prev,
        [capacityCode]: !prev[capacityCode],
      }));
    } catch (error) {
      console.error('Error toggling capacity info:', error);
    }
  };



  // Function to render a custom capacity card for the modal
  const renderCapacityCard = (capacity: Capacity, isRoot: boolean) => {
    const isSelected = selectedCapacities.some(cap => cap.code === capacity.code);
    const showInfo = showInfoMap[capacity.code] || false;
    const description = capacityDescriptions[capacity.code] || capacity.description || '';
    const wd_code = capacity.skill_wikidata_item || '';

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







    // Get background color for capacity
    const getBackgroundColor = () => {
      if (isRoot) {
        // For root capacities, get hex color directly
        const hexColor = getHexColorFromCode(capacity.code);
        return hexColor;
      } else {
        // For child capacities, use the exact same color as root
        const rootHexColor = rootCapacity 
          ? getHexColorFromCode(rootCapacity.code)
          : getHexColorFromCode(capacity.code);
        
        // Use exact same color for all levels
        return rootHexColor;
      }
    };

    // Calculate the background color once
    const backgroundColor = getBackgroundColor();

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
      // Get the hex color directly based on capacity code
      const bgHexColor = getHexColorFromCode(capacity.code);

      // Create an object with explicit styles we need to enforce
      const cardStyle = {
        backgroundColor: bgHexColor,
        color: '#FFFFFF', // White text for root
        borderRadius: '0.5rem', // Ensure rounded corners (same as rounded-lg)
        overflow: 'hidden', // Clip content to rounded corners
      };

      return (
        <div
          className={`flex flex-col w-full rounded-lg transition-all overflow-hidden h-full relative
            ${
              isSelected ? 'ring-2 ring-capx-primary-green' : ''
            } hover:brightness-90 transform hover:scale-[1.01] transition-all`}
          onClick={() => handleCategorySelect(capacity)}
          style={cardStyle}
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
                  <span className={`${getCheckmarkColor()} text-xs font-bold drop-shadow-lg`}>✓</span>
                </div>
              )}
              
              <button
                onClick={e => toggleCapacityInfo(e, capacity)}
                className="p-1 flex-shrink-0 mr-1"
                aria-label="Info"
              >
                <div className="relative w-[20px] h-[20px]">
                  <Image
                    src={showInfo ? InfoFilledIcon : InfoIcon}
                    alt="Info"
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
                  aria-label="Expand"
                >
                  <div className="relative w-[20px] h-[20px]">
                    <Image
                      src={ArrowDownIcon}
                      alt="Expand"
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
            >
              <h3 className="text-capx-dark-box-bg text-[16px] font-bold mb-3">
                {capitalizeFirstLetter(capacity.name)}
              </h3>
              <p className="text-gray-700 text-xs leading-relaxed">
                {capitalizeFirstLetter(description)}
              </p>
              {wd_code && (
                <a
                  href={wd_code}
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
        </div>
      );
    }

    // Style for child cards - with level-based styling
    return (
      <div
        className={`flex flex-col w-full rounded-lg shadow-sm hover:shadow-lg transition-all overflow-hidden h-full relative
          ${
            isSelected ? 'ring-2 ring-capx-primary-green' : ''
          } hover:bg-opacity-90 transform hover:scale-[1.01] transition-all`}
        onClick={() => handleCategorySelect(capacity)}
        style={{
          backgroundColor: backgroundColor,
        }}
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
                <span className={`${getCheckmarkColor()} text-xs font-bold drop-shadow-lg`}>✓</span>
              </div>
            )}
            
            <button
              onClick={e => toggleCapacityInfo(e, capacity)}
              className="p-1 flex-shrink-0 mr-1"
              aria-label="Info"
            >
              <div className="relative w-[20px] h-[20px]">
                <Image
                  src={showInfo ? InfoFilledIcon : InfoIcon}
                  alt="Info"
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
                aria-label="Expand"
              >
                <div className="relative w-[20px] h-[20px]">
                  <Image
                    src={ArrowDownIcon}
                    alt="Expand"
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
          >
            <h3 className="text-capx-dark-box-bg text-base font-bold mb-3">
              {capitalizeFirstLetter(capacity.name)}
            </h3>
            <p className="text-gray-700 text-xs leading-relaxed">
              {capitalizeFirstLetter(description)}
            </p>
            {wd_code && (
              <a
                href={wd_code}
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
      </div>
    );
  };

  return (
    <div className={`fixed inset-0 z-50 ${isOpen ? 'block' : 'hidden'}`}>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose} />

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
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M19 12H5M12 19l-7-7 7-7"/>
                </svg>
                <span className="text-sm">{pageContent['capacity-selection-modal-back']}</span>
              </button>
            )}
            
            {/* Breadcrumb trail */}
            <div className="flex items-center gap-1 text-sm overflow-x-auto scrollbar-hide pb-1">
              {/* Home/Root */}
              <button
                onClick={() => setSelectedPath([])}
                className={`flex items-center gap-1 px-2 py-1 rounded-md transition-colors flex-shrink-0 ${
                  selectedPath.length === 0
                    ? darkMode 
                      ? 'bg-gray-700 text-white' 
                      : 'bg-gray-100 text-gray-900'
                    : darkMode 
                      ? 'text-gray-300 hover:text-white hover:bg-gray-700' 
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                  <polyline points="9,22 9,12 15,12 15,22"/>
                </svg>
                <span className="hidden sm:inline">
                  {pageContent['capacity-selection-modal-root-capacities']}
                </span>
              </button>

              {/* Path segments */}
              {selectedPath.map((pathId, index) => {
                const capacity = findCapacityByCode(pathId);
                const isLast = index === selectedPath.length - 1;
                const capacityName = capacity?.name || `${pageContent['capacity-selection-modal-select-capacity']} ${pathId}`;
                
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
                      className={`flex-shrink-0 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}
                    >
                      <polyline points="9,18 15,12 9,6"/>
                    </svg>
                    
                    {/* Breadcrumb item */}
                    <button
                      onClick={() => setSelectedPath(prev => prev.slice(0, index + 1))}
                      className={`flex items-center gap-1 px-2 py-1 rounded-md transition-colors flex-shrink-0 max-w-[150px] ${
                        isLast
                          ? darkMode 
                            ? 'bg-gray-700 text-white' 
                            : 'bg-gray-100 text-gray-900'
                          : darkMode 
                            ? 'text-gray-300 hover:text-white hover:bg-gray-700' 
                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                      }`}
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
                              filter: darkMode 
                                ? 'brightness(0) invert(1)' 
                                : 'brightness(0)' 
                            }}
                          />
                        </div>
                      )}
                      <span className="truncate block">
                        {capacityName}
                      </span>
                    </button>
                  </React.Fragment>
                );
              })}
            </div>
            
          </div>

          {/* Capacity list */}
          <div className="space-y-4 max-h-[60vh] md:max-h-[65vh] overflow-y-auto scrollbar-hide p-2 pb-4">
            {isLoading?.root ? (
              <div className={`text-center py-4 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                {pageContent['capacity-selection-modal-loading']}
              </div>
            ) : getCurrentCapacities().length > 0 ? (
              <div className="flex flex-col gap-2">
                {getCurrentCapacities().map((capacity, index) => {
                  const isRoot = selectedPath.length === 0;
                  const uniqueKey = `${capacity.code}-${selectedPath.join('-')}-${index}`;

                  // For root capacities, get the hex color directly
                  let rootStyle;
                  if (isRoot) {
                    const hexColor = getHexColorFromCode(capacity.code);
                    rootStyle = { backgroundColor: hexColor };
                  }

                  return (
                    <div
                      key={uniqueKey}
                      className="transform-gpu"
                      style={isRoot ? rootStyle : undefined}
                    >
                      {renderCapacityCard(capacity, isRoot)}
                      {!allowMultipleSelection && selectedCapacities.length > 0 && selectedCapacities[0].code === capacity.code && (
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
                  ?  `${selectedCapacities.length} ${pageContent['capacity-selection-modal-select-capacity-button-multiple-capacities']} ${pageContent['capacity-selection-modal-select-capacity-button-multiple-selected']}`
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
