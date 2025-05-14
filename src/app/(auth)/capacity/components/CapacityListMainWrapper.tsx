"use client";

import { useState, useCallback, useRef } from "react";
import { useApp } from "@/contexts/AppContext";
import { CapacityCard } from "./CapacityCard";
import { CapacityBanner } from "./CapacityBanner";
import { CapacitySearch } from "./CapacitySearch";
import {
  useRootCapacities,
  useCapacitiesByParent,
  useCapacitySearch,
} from "@/hooks/useCapacitiesQuery";
import LoadingState from "@/components/LoadingState";
import { Capacity } from "@/types/capacity";
import CapacityCacheDebug from "@/components/CapacityCacheDebug";
import {
  useCapacityDescriptions,
  CapacityDescriptionProvider,
} from "@/contexts/CapacityContext";
import React from "react";

// Componente para descrições - separado para evitar ciclos de re-renderização
const DescriptionLoader = ({ capacityIds }: { capacityIds: number[] }) => {
  const { requestDescription, isRequested } = useCapacityDescriptions();
  const processedIdsRef = useRef<Set<number>>(new Set());

  // Move processing to useEffect to avoid updates during render
  React.useEffect(() => {
    // Process any IDs we haven't seen yet
    capacityIds.forEach((id) => {
      if (!processedIdsRef.current.has(id) && !isRequested(id)) {
        processedIdsRef.current.add(id);
        requestDescription(id);
      }
    });
  }, [capacityIds, isRequested, requestDescription]);

  return null;
};

// Componente para capacidades filhas
const ChildCapacities = ({
  parentCode,
  expandedCapacities,
  onToggleExpand,
}: {
  parentCode: string;
  expandedCapacities: Record<string, boolean>;
  onToggleExpand: (code: string) => void;
}) => {
  const { data: children = [], isLoading: isLoadingChildren } =
    useCapacitiesByParent(parentCode);

  const { data: rootCapacities = [] } = useRootCapacities();

  const { getDescription, getWdCode, requestDescription } =
    useCapacityDescriptions();

  // Get IDs for loader component instead of loading in this component
  const capacityIds = children
    .map((child) => child.code)
    .filter(Boolean) as number[];

  if (isLoadingChildren) {
    return <div className="mt-4">Loading children...</div>;
  }

  // First, find the actual parent capacity from root capacities or existing children
  // This is essential for proper color inheritance
  const findParentCapacity = () => {
    // Try to find the parent in root capacities
    const rootParent = rootCapacities.find(
      (c) => c.code.toString() === parentCode
    );
    if (rootParent) {
      return rootParent;
    }

    // If not found in root, check if any child already has a parent reference
    const childWithParent = children.find(
      (child) =>
        child.parentCapacity &&
        child.parentCapacity.code.toString() === parentCode
    );

    if (childWithParent?.parentCapacity) {
      return childWithParent.parentCapacity;
    }

    // If not found anywhere, construct a minimal parent
    return {
      code: parseInt(parentCode, 10),
      name: "",
      color: "", // Will be determined by code in formatCapacity
      icon: "",
      hasChildren: true,
      skill_type: parseInt(parentCode, 10),
      skill_wikidata_item: "",
      description: "",
      wd_code: "",
    } as Capacity;
  };

  const parentCapacity = findParentCapacity();

  // Log if we're dealing with grandchildren (3rd level)
  const isThirdLevel = parentCapacity?.parentCapacity !== undefined;
  if (isThirdLevel) {
    console.log(
      `Handling grandchild capacities - parent: ${parentCode}, with ${children.length} children`
    );
  }

  // Ensure each child has correct parent reference
  const childrenWithParents = children.map((child) => {
    // Explicitly check if child is expanded to determine hasChildren
    const isExpanded = !!expandedCapacities[child.code];
    // Force hasChildren to true if it has children based on expansion or original value
    const childHasChildren = child.hasChildren === true || isExpanded;

    // For third level (grandchildren), log to help debugging
    if (isThirdLevel) {
      console.log(
        `Grandchild ${child.code} hasChildren:`,
        childHasChildren,
        "original:",
        child.hasChildren
      );
    }

    // Create a complete child with proper parent reference
    const enhancedChild = {
      ...child,
      // Ensure hasChildren is explicitly true when needed
      hasChildren: childHasChildren,
      // Always set the parent capacity to ensure proper inheritance
      parentCapacity: parentCapacity,
      // Keep child's own color if parent has no color
      color: child.color || parentCapacity.color || child.color,
      // Keep child's own icon if parent has no icon
      icon: child.icon || parentCapacity.icon || child.icon,
    };

    return enhancedChild;
  });

  return (
    <>
      {/* Loader component handles description fetching */}
      <DescriptionLoader capacityIds={capacityIds} />

      <div className="mt-4 overflow-x-auto scrollbar-hide w-full">
        <div className="flex gap-4 pb-4 w-fit max-w-screen-xl">
          {childrenWithParents.map((child, index) => (
            <div
              key={`${parentCode}-${child.code}-${index}`}
              className="mt-4 max-w-[992px]"
            >
              <CapacityCard
                {...child}
                isExpanded={!!expandedCapacities[child.code]}
                onExpand={() => onToggleExpand(child.code.toString())}
                hasChildren={child.hasChildren}
                isRoot={false}
                parentCapacity={child.parentCapacity}
                description={getDescription(child.code)}
                wd_code={getWdCode(child.code)}
                onInfoClick={async (code) => {
                  // Ensure description is loaded for this capacity
                  if (!getDescription(code)) {
                    await requestDescription(code);
                  }
                  return getDescription(code);
                }}
              />
              {expandedCapacities[child.code] && (
                <ChildCapacities
                  parentCode={child.code.toString()}
                  expandedCapacities={expandedCapacities}
                  onToggleExpand={onToggleExpand}
                />
              )}
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

// Componente principal com o conteúdo
function CapacityListContent() {
  const { language } = useApp();

  // Hooks de UI básica
  const [expandedCapacities, setExpandedCapacities] = useState<
    Record<string, boolean>
  >({});
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<Capacity[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Hooks para dados
  const { data: rootCapacities = [], isLoading: isLoadingRoot } =
    useRootCapacities(language);
  const { data: querySearchResults = [], isLoading: isLoadingSearch } =
    useCapacitySearch(searchTerm);

  // Context para descrições - apenas para exibição
  const { getDescription, getWdCode, requestDescription } =
    useCapacityDescriptions();

  // Collect all capacity IDs that need descriptions
  const rootCapacityIds = rootCapacities
    .map((c) => c.code)
    .filter(Boolean) as number[];
  const searchCapacityIds = searchResults
    .map((c) => c.code)
    .filter(Boolean) as number[];

  // Handlers simples sem useEffect
  const handleSearchChange = useCallback((results: Capacity[]) => {
    setSearchResults(results);
  }, []);

  // Toggle expandido
  const handleToggleExpand = useCallback((code: string) => {
    setExpandedCapacities((prev) => ({
      ...prev,
      [code]: !prev[code],
    }));
  }, []);

  // Handlers de busca
  const handleSearchStart = useCallback(() => {
    setIsSearching(true);
  }, []);

  const handleSearchEnd = useCallback(() => {
    setIsSearching(false);
    setSearchTerm("");
    setSearchResults([]);
  }, []);

  const handleSearch = useCallback(
    (term: string) => {
      setSearchTerm(term);
      if (term && querySearchResults.length > 0) {
        setSearchResults(querySearchResults);
      } else if (!term) {
        setSearchResults([]);
      }
    },
    [querySearchResults]
  );

  if (isLoadingRoot) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <LoadingState />
      </div>
    );
  }

  return (
    <section className="flex flex-col max-w-screen-xl mx-auto py-8 px-4 md:px-8 lg:px-12 gap-[40px]">
      {/* Separate loader components for descriptions */}
      <DescriptionLoader capacityIds={rootCapacityIds} />
      <DescriptionLoader capacityIds={searchCapacityIds} />

      <CapacityBanner />
      <CapacitySearch
        onSearchStart={handleSearchStart}
        onSearchEnd={handleSearchEnd}
        onSearch={handleSearch}
      />

      {searchResults.length > 0 || (isSearching && isLoadingSearch) ? (
        <div className="grid gap-4 w-full">
          {isLoadingSearch ? (
            <div className="flex justify-center">
              <LoadingState />
            </div>
          ) : (
            searchResults.map((capacity, index) => (
              <div
                key={`search-${capacity.code}-${index}`}
                className="max-w-screen-xl mx-auto"
              >
                <CapacityCard
                  {...capacity}
                  isExpanded={!!expandedCapacities[capacity.code]}
                  onExpand={() => handleToggleExpand(capacity.code.toString())}
                  hasChildren={capacity.hasChildren}
                  isRoot={false}
                  parentCapacity={capacity.parentCapacity}
                  code={capacity.code}
                  name={capacity.name}
                  color={capacity.color}
                  icon={capacity.icon}
                  description={
                    getDescription(capacity.code) || capacity.description || ""
                  }
                  wd_code={getWdCode(capacity.code) || capacity.wd_code || ""}
                  onInfoClick={async (code) => {
                    // Ensure description is loaded for this capacity
                    if (!getDescription(code)) {
                      await requestDescription(code);
                    }
                    return getDescription(code);
                  }}
                />
                {expandedCapacities[capacity.code] && (
                  <ChildCapacities
                    parentCode={capacity.code.toString()}
                    expandedCapacities={expandedCapacities}
                    onToggleExpand={handleToggleExpand}
                  />
                )}
              </div>
            ))
          )}
        </div>
      ) : (
        /* Capacidades root quando não há resultados de busca */
        <div className="grid gap-[40px] w-full">
          {rootCapacities.map((capacity, index) => (
            <div
              key={`root-${capacity.code}-${index}`}
              className={`w-screen max-w-[1190px]`}
            >
              <CapacityCard
                {...capacity}
                isExpanded={!!expandedCapacities[capacity.code]}
                onExpand={() => handleToggleExpand(capacity.code.toString())}
                hasChildren={capacity.hasChildren}
                isRoot={true}
                color={capacity.color}
                icon={capacity.icon}
                description={getDescription(capacity.code)}
                wd_code={getWdCode(capacity.code)}
                onInfoClick={async (code) => {
                  // Ensure description is loaded for this capacity
                  if (!getDescription(code)) {
                    await requestDescription(code);
                  }
                  return getDescription(code);
                }}
              />
              {expandedCapacities[capacity.code] && (
                <ChildCapacities
                  parentCode={capacity.code.toString()}
                  expandedCapacities={expandedCapacities}
                  onToggleExpand={handleToggleExpand}
                />
              )}
            </div>
          ))}
        </div>
      )}

      {/* Add debug component in development mode */}
      {process.env.NODE_ENV === "development" && <CapacityCacheDebug />}
    </section>
  );
}

// Componente wrapper com o provider
export default function CapacityListMainWrapper() {
  return (
    <CapacityDescriptionProvider>
      <CapacityListContent />
    </CapacityDescriptionProvider>
  );
}
