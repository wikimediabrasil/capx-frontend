'use client';

import CapacityCacheDebug from '@/components/CapacityCacheDebug';
import LoadingState from '@/components/LoadingState';
import LoadingStateWithFallback from '@/components/LoadingStateWithFallback';
import { AppProvider, useApp } from '@/contexts/AppContext';
import { CapacityDescriptionProvider, useCapacityDescriptions } from '@/contexts/CapacityContext';
import {
  useCapacitiesByParent,
  useCapacitySearch,
  useRootCapacities,
} from '@/hooks/useCapacitiesQuery';
import { Capacity } from '@/types/capacity';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { CapacityBanner } from './CapacityBanner';
import { CapacityCard } from './CapacityCard';
import { CapacitySearch } from './CapacitySearch';

// Component for descriptions - separated to avoid re-render cycles
const DescriptionLoader = ({ capacityIds }: { capacityIds: number[] }) => {
  const { requestDescription, isRequested } = useCapacityDescriptions();
  const processedIdsRef = useRef<Set<number>>(new Set());

  // Move processing to useEffect to avoid updates during render
  useEffect(() => {
    // Process any IDs we haven't seen yet
    capacityIds.forEach(id => {
      if (!processedIdsRef.current.has(id) && !isRequested(id)) {
        processedIdsRef.current.add(id);
        requestDescription(id);
      }
    });
  }, [capacityIds, isRequested, requestDescription]);

  return null;
};

// Component for child capacities
const ChildCapacities = ({
  parentCode,
  expandedCapacities,
  onToggleExpand,
}: {
  parentCode: string;
  expandedCapacities: Record<string, boolean>;
  onToggleExpand: (code: string) => void;
}) => {
  const { data: children = [], isLoading: isLoadingChildren } = useCapacitiesByParent(parentCode);

  const { data: rootCapacities = [] } = useRootCapacities();

  const { getDescription, getWdCode, requestDescription } = useCapacityDescriptions();

  const { pageContent } = useApp();
  // Get IDs for loader component instead of loading in this component
  const capacityIds = children.map(child => child.code).filter(Boolean) as number[];

  if (isLoadingChildren) {
    return <div className="mt-4">{pageContent['loading']}</div>;
  }

  // First, find the actual parent capacity from root capacities or existing children
  // This is essential for proper color inheritance
  const findParentCapacity = () => {
    // Try to find the parent in root capacities
    const rootParent = rootCapacities.find(c => c.code.toString() === parentCode);
    if (rootParent) {
      return rootParent;
    }

    // If not found in root, check if any child already has a parent reference
    const childWithParent = children.find(
      child => child.parentCapacity && child.parentCapacity.code.toString() === parentCode
    );

    if (childWithParent?.parentCapacity) {
      return childWithParent.parentCapacity;
    }

    // If not found anywhere, construct a minimal parent
    return {
      code: parseInt(parentCode, 10),
      name: '',
      color: '', // Will be determined by code in formatCapacity
      icon: '',
      hasChildren: true,
      skill_type: parseInt(parentCode, 10),
      skill_wikidata_item: '',
      description: '',
      wd_code: '',
    } as Capacity;
  };

  const parentCapacity = findParentCapacity();

  // Find the root color to pass down to grandchildren
  const findRootColor = () => {
    // If this is a root capacity, use its color
    const isRoot = rootCapacities.some(c => c.code.toString() === parentCode);
    if (isRoot && parentCapacity.color) {
      return parentCapacity.color;
    }

    // If this is a child capacity (has a parent that is root), use the parent's color
    if (
      parentCapacity.parentCapacity &&
      rootCapacities.some(c => c.code === parentCapacity.parentCapacity?.code)
    ) {
      return parentCapacity.parentCapacity.color;
    }

    // If we have a parent capacity with color, use that
    if (parentCapacity.color) {
      return parentCapacity.color;
    }

    // Default fallback
    return '';
  };

  const rootColor = findRootColor();

  // Ensure each child has correct parent reference
  const childrenWithParents = children.map(child => {
    // Explicitly check if child is expanded to determine hasChildren
    const isExpanded = !!expandedCapacities[child.code];
    // Force hasChildren to true if it has children based on expansion or original value
    const childHasChildren = child.hasChildren === true || isExpanded;

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
      // Add explicit level property - if parentCapacity has a parentCapacity or is not a root, this is level 3
      level: parentCapacity?.parentCapacity
        ? 3
        : rootCapacities.some(c => c.code.toString() === parentCode)
          ? 2
          : 3,
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
            <div key={`${parentCode}-${child.code}-${index}`} className="mt-4 max-w-[992px]">
              <CapacityCard
                {...child}
                isExpanded={!!expandedCapacities[child.code]}
                onExpand={() => onToggleExpand(child.code.toString())}
                hasChildren={child.hasChildren}
                isRoot={false}
                parentCapacity={child.parentCapacity}
                description={getDescription(child.code)}
                wd_code={getWdCode(child.code)}
                rootColor={rootColor}
                onInfoClick={async code => {
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

// Main component with content
function CapacityListContent() {
  const { language } = useApp();

  // Basic UI hooks
  const [expandedCapacities, setExpandedCapacities] = useState<Record<string, boolean>>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<Capacity[]>([]);

  // Data hooks
  const { data: rootCapacities = [], isLoading: isLoadingRoot } = useRootCapacities(language);
  const { data: querySearchResults = [] } = useCapacitySearch(searchTerm);

  // Descriptions context - only for display
  const { getDescription, getWdCode, requestDescription } = useCapacityDescriptions();

  // Collect all capacity IDs that need descriptions
  const rootCapacityIds = rootCapacities.map(c => c.code).filter(Boolean) as number[];
  const searchCapacityIds = searchResults.map(c => c.code).filter(Boolean) as number[];

  // Toggle expanded
  const handleToggleExpand = useCallback((code: string) => {
    setExpandedCapacities(prev => ({
      ...prev,
      [code]: !prev[code],
    }));
  }, []);

  const handleSearchEnd = useCallback(() => {
    setSearchTerm('');
    setSearchResults([]);
  }, []);

  const handleSearch = useCallback(
    (term: string) => {
      // Prevenção de ciclo infinito: verifica se o termo já é o atual
      if (term === searchTerm) return;

      setSearchTerm(term);
      if (term && querySearchResults.length > 0) {
        // Process query results to ensure proper level assignments
        const processedResults = querySearchResults.map(capacity => {
          // Determine level based on parent structure
          let level = 1;
          if (capacity.parentCapacity) {
            if (capacity.parentCapacity.parentCapacity) {
              // Third level - has a grandparent
              level = 3;
            } else {
              // Second level - has only a parent
              level = 2;
            }
          } else {
            // Root level - no parent
          }

          // Always override with explicit level if already set
          if (capacity.level) {
            level = capacity.level;
          }

          // Force third-level capacities to have black color
          let color = capacity.color;
          if (level === 3) {
            color = '#507380';
          }

          return {
            ...capacity,
            level,
            color,
          };
        });

        setSearchResults(processedResults);
      } else if (!term) {
        setSearchResults([]);
      }
    },
    [querySearchResults, searchTerm]
  );

  if (isLoadingRoot) {
    return (
      <div className="flex justify-center items-center h-[200px]">
        <LoadingState fullScreen={false} />
      </div>
    );
  }

  return (
    <section className="flex flex-col max-w-screen-xl mx-auto py-8 px-4 lg:px-12 gap-[40px]">
      {/* Separate loader components for descriptions */}
      <DescriptionLoader capacityIds={rootCapacityIds} />
      <DescriptionLoader capacityIds={searchCapacityIds} />

      <CapacityBanner />
      <CapacitySearch onSearchEnd={handleSearchEnd} onSearch={handleSearch} />

      {/* Quando não estiver em modo de busca, mostrar as capacidades raiz */}
      {!searchTerm && (
        <div className="grid gap-[40px] w-full">
          {rootCapacities.map((capacity, index) => (
            <div
              key={`root-${capacity.code}-${index}`}
              className={`xs:min-w-[453px] xs:max-w-[592px] sm:max-w-[720px] md:min-w-[690px] md:max-w-[944px] lg:min-w-[913px] lg:max-w-[1168px] xl:max-w-[1184px]`}
            >
              <CapacityCard
                {...capacity}
                isExpanded={!!expandedCapacities[capacity.code]}
                onExpand={() => handleToggleExpand(capacity.code.toString())}
                hasChildren={capacity.hasChildren}
                isRoot={true}
                level={capacity.level || 1}
                color={capacity.color}
                icon={capacity.icon}
                description={getDescription(capacity.code)}
                wd_code={getWdCode(capacity.code)}
                onInfoClick={async code => {
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

      {/* Debug component in development mode */}
      {process.env.NODE_ENV === 'development' && <CapacityCacheDebug />}
    </section>
  );
}

// Wrapper component with provider
export default function CapacityListMainWrapper() {
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    // Small delay to ensure context is properly initialized
    const timer = setTimeout(() => {
      setMounted(true);
    }, 50);

    return () => clearTimeout(timer);
  }, []);

  if (!mounted) {
    return <LoadingStateWithFallback fullScreen={true} />;
  }

  return (
    <CapacityErrorBoundary>
      <AppProvider>
        <CapacityDescriptionProvider>
          <CapacityListContent />
        </CapacityDescriptionProvider>
      </AppProvider>
    </CapacityErrorBoundary>
  );
}

// Simple error boundary component to catch context errors
class CapacityErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('Error in CapacityList component:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center p-8 mx-auto my-12 max-w-md border border-gray-300 rounded-md bg-white">
          <h2 className="text-xl font-bold mb-4 text-red-600">Something went wrong</h2>
          <p className="mb-4">An error occurred while loading the capacities.</p>
          <p className="text-gray-700 text-sm mb-4">
            {this.state.error?.message || 'Context error'}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Try again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
