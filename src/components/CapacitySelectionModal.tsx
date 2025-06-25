import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useTheme } from "@/contexts/ThemeContext";
import { Capacity, CapacityResponse } from "@/types/capacity";
import React from "react";
import BaseButton from "@/components/BaseButton";
import { useApp } from "@/contexts/AppContext";
import Image from "next/image";
import ArrowDownIcon from "@/public/static/images/keyboard_arrow_down.svg";
import {
  getHueRotate,
  getCapacityIcon,
  getCapacityColor,
} from "@/lib/utils/capacitiesUtils";
import InfoIcon from "@/public/static/images/info.svg";
import InfoFilledIcon from "@/public/static/images/info_filled.svg";
import Link from "next/link";
import LinkIcon from "@/public/static/images/link_icon.svg";
import LinkIconWhite from "@/public/static/images/link_icon_white.svg";
import { useCapacities } from "@/hooks/useCapacities";
import { useCapacityCache } from "@/contexts/CapacityCacheContext";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { CAPACITY_CACHE_KEYS } from "@/hooks/useCapacities";
import { capacityService } from "@/services/capacityService";

interface CapacitySelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (capacity: Capacity) => void;
  title: string;
}

// Helper function to get a color based on capacity code
// Maps numeric codes to color names (e.g., "50" -> "learning")
const getColorForCapacity = (code: number | string): string => {
  const codeStr = String(code);
  if (codeStr.startsWith("10")) return "organizational";
  if (codeStr.startsWith("36")) return "communication";
  if (codeStr.startsWith("50")) return "learning";
  if (codeStr.startsWith("56")) return "community";
  if (codeStr.startsWith("65")) return "social";
  if (codeStr.startsWith("74")) return "strategic";
  if (codeStr.startsWith("106")) return "technology";
  return "gray-200";
};

// Helper function to convert API response to Capacity object
const convertToCapacity = (item: any): Capacity => {
  // We need to handle any type here since the API response doesn't match our type definition exactly
  const code =
    typeof item.code === "string" ? parseInt(item.code, 10) : item.code;
  const baseCode = parseInt(String(code).split(".")[0], 10); // Get the integer part for icon lookup
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
    skill_wikidata_item: "",
    // Add other fields with defaults
    level: 1,
    parentCapacity: undefined,
    description: "",
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
}: CapacitySelectionModalProps) {
  const { darkMode } = useTheme();
  const { data: session } = useSession();
  const { pageContent, isMobile } = useApp();
  const [selectedPath, setSelectedPath] = useState<number[]>([]);
  const [selectedCapacity, setSelectedCapacity] = useState<Capacity | null>(
    null
  );
  const [showInfoMap, setShowInfoMap] = useState<Record<number, boolean>>({});
  const [capacityDescriptions, setCapacityDescriptions] = useState<
    Record<string, string>
  >({});
  const [isLoading, setIsLoading] = useState<Record<string, boolean>>({
    root: false,
  });
  const [rootCapacities, setRootCapacities] = useState<Capacity[]>([]);
  const [childrenCapacities, setChildrenCapacities] = useState<
    Record<string, Capacity[]>
  >({});

  // For tracking which capacity descriptions have been requested
  const [requestedDescriptions, setRequestedDescriptions] = useState<
    Set<number>
  >(new Set());

  // For tracking which capacity we're currently trying to expand
  const [expandingCapacityId, setExpandingCapacityId] = useState<string | null>(
    null
  );

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
    queryKey: CAPACITY_CACHE_KEYS.children(expandingCapacityId || ""),
    queryFn: async () => {
      if (!session?.user?.token || !expandingCapacityId) return [];

      try {
        setIsLoading((prev) => ({ ...prev, [expandingCapacityId]: true }));

        // Get data from API
        const response = await capacityService.fetchCapacitiesByType(
          expandingCapacityId,
          { headers: { Authorization: `Token ${session.user.token}` } }
        );

        // Format the response
        const capacityData = Object.entries(response).map(([code, name]) => {
          // Find the parent capacity for proper color/icon inheritance
          const parentCapacity = findCapacityByCode(
            Number(expandingCapacityId)
          );

          // Determine the level
          const level = selectedPath.length + 1;

          // Get the appropriate color name based on the code
          const colorName = getColorForCapacity(code);

          return {
            code: Number(code),
            name: typeof name === "string" ? name : String(name),
            color: colorName,
            icon: parentCapacity?.icon || "",
            hasChildren: true, // Assume may have children until proven otherwise
            skill_type: Number(expandingCapacityId),
            skill_wikidata_item: "",
            parentCapacity: parentCapacity,
            level: level,
          } as Capacity;
        });

        return capacityData;
      } catch (error) {
        console.error(
          `Error fetching children for ${expandingCapacityId}:`,
          error
        );
        return [];
      } finally {
        setIsLoading((prev) => ({ ...prev, [expandingCapacityId]: false }));
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
    queryKey: ["capacityDescription", ...Array.from(requestedDescriptions)],
    queryFn: async () => {
      // If no descriptions requested, don't fetch
      if (requestedDescriptions.size === 0 || !session?.user?.token)
        return null;

      // Get the last requested description ID
      const capacityId = Array.from(requestedDescriptions).pop();
      if (!capacityId) return null;

      try {
        const response = await capacityService.fetchCapacityDescription(
          capacityId
        );
        return {
          id: capacityId,
          description: response?.description || "",
          wdCode: response?.wdCode || "",
        };
      } catch (error) {
        console.error(
          `Error fetching description for capacity ${capacityId}:`,
          error
        );
        return null;
      }
    },
    enabled: requestedDescriptions.size > 0 && !!session?.user?.token,
  });

  // Process description data when it changes
  useEffect(() => {
    if (descriptionData?.id && descriptionData?.description) {
      // Only update if the value is different from the current one
      setCapacityDescriptions((prev) => {
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
      const processedCapacities = rootCapacitiesData.map((capacity) => {
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
      setChildrenCapacities((prev) => ({
        ...prev,
        [expandingCapacityId]: childCapacitiesData,
      }));

      // Update the selected path if necessary
      if (!selectedPath.includes(Number(expandingCapacityId))) {
        setSelectedPath((prev) => [...prev, Number(expandingCapacityId)]);
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
      setSelectedCapacity(null);
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

      // Always set the selected capacity
      setSelectedCapacity(category);

      // If this category is already in the path, we don't need to do anything
      const currentPathIndex = selectedPath.indexOf(categoryId);
      if (currentPathIndex !== -1) {
        return;
      }
    } catch (err) {
      console.error("Error selecting category:", err);
    }
  };

  // Function to handle expansion separately
  const handleCategoryExpand = async (
    e: React.MouseEvent,
    category: Capacity
  ) => {
    e.stopPropagation(); // Prevent the selection when expanding

    try {
      const categoryId = category.code;
      const currentPathIndex = selectedPath.indexOf(categoryId);

      if (currentPathIndex !== -1) {
        // If it's already in the path, collapse
        setSelectedPath((prev) => prev.slice(0, currentPathIndex + 1));
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
        setSelectedPath((prev) => [...prev, categoryId]);
      }
    } catch (err) {
      console.error("Error expanding category:", err);
    }
  };

  const handleConfirm = () => {
    if (selectedCapacity) {
      const capacityToReturn: Capacity = {
        ...selectedCapacity,
        skill_type:
          selectedPath.length > 0
            ? selectedPath[selectedPath.length - 1]
            : selectedCapacity.code,
      };
      onSelect(capacityToReturn);
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
    if (!text) return "";
    return text.charAt(0).toUpperCase() + text.slice(1);
  };

  // Function to toggle the display of the capacity description
  const toggleCapacityInfo = async (
    e: React.MouseEvent,
    capacity: Capacity
  ) => {
    e.stopPropagation(); // Prevent the click event from propagating to the card

    try {
      const capacityCode = capacity.code;

      // If we already have the description in local cache, just toggle visibility
      if (capacityDescriptions[capacityCode]) {
        setShowInfoMap((prev) => ({
          ...prev,
          [capacityCode]: !prev[capacityCode],
        }));
        return;
      }

      // If we don't have the description, request it
      setRequestedDescriptions((prev) => {
        const newSet = new Set(prev);
        newSet.add(capacityCode);
        return newSet;
      });

      // Toggle the display of the description regardless of fetch success
      setShowInfoMap((prev) => ({
        ...prev,
        [capacityCode]: !prev[capacityCode],
      }));
    } catch (error) {
      console.error("Error toggling capacity info:", error);
    }
  };

  // Function to render a custom capacity card for the modal
  const renderCapacityCard = (capacity: Capacity, isRoot: boolean) => {
    const isSelected = selectedCapacity?.code === capacity.code;
    const showInfo = showInfoMap[capacity.code] || false;
    const description =
      capacityDescriptions[capacity.code] || capacity.description || "";
    const wd_code = capacity.skill_wikidata_item || "";

    // Get the parent capacity to color the icons of the child cards
    const parentCapacity = isRoot
      ? undefined
      : selectedPath.length > 0
      ? findCapacityByCode(selectedPath[selectedPath.length - 1])
      : undefined;

    // Check if capacity has children using the cache
    const capacityHasChildren = hasChildren(capacity.code);

    // Determine the level of this capacity in the hierarchy
    const level = isRoot
      ? 1
      : parentCapacity?.parentCapacity ||
        (parentCapacity && parentCapacity.skill_type !== parentCapacity.code)
      ? 3
      : 2;

    // Determine text color based on level
    const getTextColor = () => {
      if (level === 3) return "#FFFFFF"; // White text for third level
      if (isRoot) return "#FFFFFF"; // White text for root level
      return "#4B5563"; // Gray text for second level
    };

    // Determine icon filter based on level
    const getIconFilter = () => {
      if (level === 3 || isRoot) return "brightness(0) invert(1)"; // White icons for root and third level
      if (parentCapacity?.color) return getHueRotate(parentCapacity.color);
      return "brightness(0)"; // Black icons default
    };

    // Get background color for capacity
    const getBackgroundColor = () => {
      if (isRoot) {
        // For root capacities, get hex color directly
        const hexColor = getHexColorFromCode(capacity.code);

        return hexColor;
      } else if (level === 3) {
        // For third level, use black
        return "#507380";
      } else {
        // For second level, use light background
        return "#F8F9FA";
      }
    };

    // Calculate the background color once
    const backgroundColor = getBackgroundColor();

    // Style for root cards
    if (isRoot) {
      // Get the hex color directly based on capacity code
      const bgHexColor = getHexColorFromCode(capacity.code);

      // Create an object with explicit styles we need to enforce
      const cardStyle = {
        backgroundColor: bgHexColor,
        color: "#FFFFFF", // White text for root
      };

      return (
        <div
          className={`flex flex-col w-full rounded-lg shadow-sm hover:shadow-lg transition-all overflow-hidden h-full
            ${
              isSelected ? "ring-2 ring-capx-primary-green" : ""
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
                  style={{ filter: "brightness(0) invert(1)" }}
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
                  onClick={(e) => e.stopPropagation()}
                  title={
                    pageContent[
                      "capacity-selection-modal-hover-view-capacity-feed"
                    ]
                  }
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
              <button
                onClick={(e) => toggleCapacityInfo(e, capacity)}
                className="p-1 flex-shrink-0 mr-1"
                aria-label="Info"
              >
                <div className="relative w-[20px] h-[20px]">
                  <Image
                    src={showInfo ? InfoFilledIcon : InfoIcon}
                    alt="Info"
                    width={20}
                    height={20}
                    style={{ filter: "brightness(0) invert(1)" }}
                  />
                </div>
              </button>
              {capacityHasChildren && (
                <button
                  onClick={(e) => handleCategoryExpand(e, capacity)}
                  className="pt-2 px-1 flex-shrink-0"
                  aria-label="Expand"
                >
                  <div className="relative w-[20px] h-[20px]">
                    <Image
                      src={ArrowDownIcon}
                      alt="Expand"
                      width={20}
                      height={20}
                      style={{ filter: "brightness(0) invert(1)" }}
                    />
                  </div>
                </button>
              )}
            </div>
          </div>

          {showInfo && description && (
            <div
              className="bg-white p-3 text-sm rounded-b-lg flex-grow"
              onClick={(e) => e.stopPropagation()}
            >
              <p className="text-gray-700 text-xs leading-relaxed">
                {capitalizeFirstLetter(description)}
              </p>
              {wd_code && (
                <a
                  href={wd_code}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:underline hover:text-blue-700 mt-2 inline-block text-xs transition-colors"
                  onClick={(e) => e.stopPropagation()}
                >
                  {pageContent["capacity-selection-modal-see-more-information"]}
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
        className={`flex flex-col w-full rounded-lg shadow-sm hover:shadow-lg transition-all overflow-hidden h-full
          ${
            isSelected ? "ring-2 ring-capx-primary-green" : ""
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
                onClick={(e) => e.stopPropagation()}
                title={
                  pageContent[
                    "capacity-selection-modal-hover-view-capacity-feed"
                  ]
                }
                className="inline-flex items-center hover:underline hover:text-blue-700 transition-colors cursor-pointer flex-shrink-0 min-w-[16px]"
              >
                <Image
                  src={level === 3 ? LinkIconWhite : LinkIcon}
                  alt="External link icon"
                  width={16}
                  height={16}
                  className="inline-block"
                />
              </Link>
            </div>
          </div>
          <div className="flex items-center">
            <button
              onClick={(e) => toggleCapacityInfo(e, capacity)}
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
                onClick={(e) => handleCategoryExpand(e, capacity)}
                className="p-1 flex-shrink-0"
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
            onClick={(e) => e.stopPropagation()}
          >
            <p className="text-gray-700 text-xs leading-relaxed">
              {capitalizeFirstLetter(description)}
            </p>
            {wd_code && (
              <a
                href={wd_code}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:underline mt-2 inline-block text-xs"
                onClick={(e) => e.stopPropagation()}
              >
                {pageContent["capacity-selection-modal-see-more-information"]}
              </a>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={`fixed inset-0 z-50 ${isOpen ? "block" : "hidden"}`}>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose} />

      {/* Modal */}
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <div
          className={`w-full max-w-lg md:max-w-3xl lg:max-w-4xl rounded-lg shadow-lg ${
            darkMode ? "bg-gray-800" : "bg-white"
          } p-4 md:p-6`}
        >
          {/* Header */}
          <div className="flex justify-between items-center mb-4">
            <h2
              className={`text-lg md:text-xl font-semibold ${
                darkMode ? "text-white" : "text-gray-900"
              }`}
            >
              {title}
            </h2>
            <button
              onClick={onClose}
              className={`p-1 hover:bg-gray-100 rounded ${
                darkMode ? "text-white hover:bg-gray-700" : "text-gray-500"
              }`}
            >
              ✕
            </button>
          </div>

          {/* Breadcrumb */}
          <div className="flex items-center gap-2 mb-4 text-sm md:text-base overflow-x-auto whitespace-nowrap pb-2">
            <span
              className={`cursor-pointer hover:text-blue-500 ${
                darkMode ? "text-gray-300" : "text-gray-600"
              }`}
              onClick={() => setSelectedPath([])}
            >
              {pageContent["capacity-selection-modal-root-capacities"]}
            </span>
            {selectedPath.map((pathId, index) => {
              const capacity = findCapacityByCode(pathId);

              return (
                <React.Fragment key={`path-${pathId}-${index}`}>
                  <span
                    className={darkMode ? "text-gray-400" : "text-gray-500"}
                  >
                    /
                  </span>
                  <span
                    className={`cursor-pointer hover:text-blue-500 ${
                      darkMode ? "text-gray-300" : "text-gray-600"
                    }`}
                    onClick={() =>
                      setSelectedPath((prev) => prev.slice(0, index + 1))
                    }
                  >
                    {capacity?.name ||
                      `${pageContent["capacity-selection-modal-select-capacity"]} ${pathId}`}
                  </span>
                </React.Fragment>
              );
            })}
          </div>

          {/* Capacity list */}
          <div className="space-y-4 max-h-[60vh] md:max-h-[65vh] overflow-y-auto scrollbar-hide p-2 pb-4">
            {isLoading?.root ? (
              <div
                className={`text-center py-4 ${
                  darkMode ? "text-gray-400" : "text-gray-500"
                }`}
              >
                {pageContent["capacity-selection-modal-loading"]}
              </div>
            ) : getCurrentCapacities().length > 0 ? (
              <div className="flex flex-col gap-2">
                {getCurrentCapacities().map((capacity, index) => {
                  const isRoot = selectedPath.length === 0;
                  const uniqueKey = `${capacity.code}-${selectedPath.join(
                    "-"
                  )}-${index}`;

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
                      {selectedCapacity?.code === capacity.code && (
                        <div
                          className={`text-sm mt-1 text-center ${
                            darkMode ? "text-gray-400" : "text-gray-500"
                          }`}
                        >
                          {pageContent["capacity-selection-modal-selected"]}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div
                className={`text-center py-4 ${
                  darkMode ? "text-gray-400" : "text-gray-500"
                }`}
              >
                {pageContent["capacity-selection-modal-no-capacities-found"]}
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex w-full justify-between gap-2 mt-4">
            <BaseButton
              label={
                pageContent[
                  "capacity-selection-modal-select-capacity-button-cancel"
                ]
              }
              customClass={`bg-[#F6F6F6] w-1/2 md:w-1/3 rounded-[6px] !py-2 !px-4 font-extrabold text-[14px] text-capx-dark-bg border border-capx-dark-bg ${
                isMobile ? "text-[14px]" : "text-[16px]"
              }`}
              onClick={onClose}
            />
            <BaseButton
              label={
                pageContent["capacity-selection-modal-select-capacity-button"]
              }
              customClass={`bg-capx-secondary-purple rounded-[6px] !py-2 !px-4 font-extrabold text-white hover:bg-capx-primary-green w-1/2 md:w-1/3 ${
                !selectedCapacity ? "opacity-50 cursor-not-allowed" : ""
              }
              ${isMobile ? "text-[14px]" : "text-[16px]"}`}
              onClick={handleConfirm}
              disabled={!selectedCapacity}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
