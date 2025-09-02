'use client';

import CapacityCacheDebug from '@/components/CapacityCacheDebug';
import { LanguageChangeHandler } from '@/components/LanguageChangeHandler';
import LoadingState from '@/components/LoadingState';
import LoadingStateWithFallback from '@/components/LoadingStateWithFallback';
import { AppProvider, useApp } from '@/contexts/AppContext';
import { useCapacityCache } from '@/contexts/CapacityCacheContext';
import { useCapacityDescriptions } from '@/contexts/CapacityContext';
import { useCapacitiesByParent, useRootCapacities } from '@/hooks/useCapacitiesQuery';
import { Capacity } from '@/types/capacity';
import React, { useCallback, useState } from 'react';
import { CapacityBanner } from './CapacityBanner';
import { CapacityCard } from './CapacityCard';
import { CapacitySearch } from './CapacitySearch';

// This component is no longer needed as descriptions are handled by the consolidated cache

// Component for child capacities
const ChildCapacities = ({
  parentCode,
  expandedCapacities,
  onToggleExpand,
  language,
}: {
  parentCode: string;
  expandedCapacities: Record<string, boolean>;
  onToggleExpand: (code: string) => void;
  language: string;
}) => {
  const { data: children = [], isLoading: isLoadingChildren } = useCapacitiesByParent(
    parentCode,
    language
  );

  const { data: rootCapacities = [] } = useRootCapacities(language);

  const { getDescription, getWdCode, getMetabaseCode } = useCapacityCache();
  const { getName } = useCapacityDescriptions();
  const { isMobile } = useApp();

  if (isLoadingChildren) {
    return <LoadingState />;
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
      metabase_code: '',
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
      // Ensure metabase_code is available, using the context as fallback
      metabase_code: child.metabase_code || getMetabaseCode(child.code),
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
      <div className={`mt-4 overflow-x-auto scrollbar-hide ${isMobile ? 'w-full' : 'w-full'}`}>
        <div
          className={`flex ${isMobile ? 'gap-2' : 'gap-4'} pb-4 ${isMobile ? 'w-full min-w-full' : 'w-fit'} ${isMobile ? 'w-full' : 'max-w-screen-xl'}`}
        >
          {childrenWithParents.map((child, index) => (
            <div
              key={`${parentCode}-${child.code}-${index}`}
              className={`mt-4 ${isMobile ? 'w-[280px] flex-shrink-0' : 'max-w-[992px]'}`}
            >
              <CapacityCard
                code={child.code}
                name={getName(child.code) || child.name}
                icon={child.icon}
                color={child.color}
                isExpanded={!!expandedCapacities[child.code]}
                onExpand={() => onToggleExpand(child.code.toString())}
                hasChildren={child.hasChildren}
                isRoot={false}
                parentCapacity={child.parentCapacity}
                description={getDescription(child.code)}
                wd_code={getWdCode(child.code)}
                metabase_code={(() => {
                  const getMetabaseResult = getMetabaseCode(child.code);
                  const metabaseCode = child.metabase_code || getMetabaseResult;

                  // Debug for level 2 cards
                  if (child.level === 2) {
                    console.log(`🎯 Final metabase_code for level 2 card ${child.code}:`, {
                      child_metabase_code: child.metabase_code,
                      getMetabaseCode_result: getMetabaseResult,
                      final_metabase_code: metabaseCode,
                      child_name: child.name,
                    });
                  }

                  return metabaseCode;
                })()}
                rootColor={rootColor}
                level={child.level}
              />
              {expandedCapacities[child.code] && (
                <ChildCapacities
                  parentCode={child.code.toString()}
                  expandedCapacities={expandedCapacities}
                  onToggleExpand={onToggleExpand}
                  language={language}
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
  const { language, isMobile } = useApp();

  // Basic UI hooks
  const [expandedCapacities, setExpandedCapacities] = useState<Record<string, boolean>>({});
  const [searchTerm, setSearchTerm] = useState('');

  // Data hooks
  const { data: rootCapacities = [], isLoading: isLoadingRoot } = useRootCapacities(language);

  // Use consolidated cache for all capacity data
  const { getDescription, getWdCode, getMetabaseCode } = useCapacityCache();
  const { getName } = useCapacityDescriptions();

  // Toggle expanded
  const handleToggleExpand = useCallback((code: string) => {
    setExpandedCapacities(prev => ({
      ...prev,
      [code]: !prev[code],
    }));
  }, []);

  const handleSearchEnd = useCallback(() => {
    setSearchTerm('');
  }, []);

  const handleSearch = useCallback(
    (term: string) => {
      // Prevenção de ciclo infinito: verifica se o termo já é o atual
      if (term === searchTerm) return;

      setSearchTerm(term);
    },
    [searchTerm]
  );

  if (isLoadingRoot) {
    return (
      <div className="flex justify-center items-center h-[200px]">
        <LoadingState fullScreen={false} />
      </div>
    );
  }

  return (
    <section
      className={`flex flex-col ${isMobile ? 'w-full' : 'max-w-screen-xl mx-auto'} py-8 px-4 lg:px-12 gap-[40px]`}
    >
      <CapacityBanner />
      <CapacitySearch onSearchEnd={handleSearchEnd} onSearch={handleSearch} />

      {/* Quando não estiver em modo de busca, mostrar as capacidades raiz */}
      {!searchTerm && (
        <div className="grid gap-[40px] w-full">
          {rootCapacities.map((capacity, index) => (
            <div
              key={`root-${capacity.code}-${index}`}
              className={
                isMobile
                  ? 'w-full overflow-hidden'
                  : `xs:min-w-[453px] xs:max-w-[592px] sm:max-w-[720px] md:min-w-[690px] md:max-w-[944px] lg:min-w-[913px] lg:max-w-[1168px] xl:max-w-[1184px]`
              }
            >
              <CapacityCard
                {...capacity}
                name={getName(capacity.code) || capacity.name}
                isExpanded={!!expandedCapacities[capacity.code]}
                onExpand={() => handleToggleExpand(capacity.code.toString())}
                hasChildren={capacity.hasChildren}
                isRoot={true}
                level={capacity.level || 1}
                color={capacity.color}
                icon={capacity.icon}
                description={getDescription(capacity.code)}
                wd_code={getWdCode(capacity.code)}
                metabase_code={capacity.metabase_code || getMetabaseCode(capacity.code)}
              />
              {expandedCapacities[capacity.code] && (
                <ChildCapacities
                  parentCode={capacity.code.toString()}
                  expandedCapacities={expandedCapacities}
                  onToggleExpand={handleToggleExpand}
                  language={language}
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
        <LanguageChangeHandler>
          <CapacityListContent />
        </LanguageChangeHandler>
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
