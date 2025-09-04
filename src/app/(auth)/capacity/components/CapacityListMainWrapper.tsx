'use client';

import CapacityCacheDebug from '@/components/CapacityCacheDebug';
import { LanguageChangeHandler } from '@/components/LanguageChangeHandler';
import LoadingState from '@/components/LoadingState';
import LoadingStateWithFallback from '@/components/LoadingStateWithFallback';
import { useApp } from '@/contexts/AppContext';
import { useCapacityCache } from '@/contexts/CapacityCacheContext';
import { useCapacitiesByParent, useRootCapacities } from '@/hooks/useCapacitiesQuery';
import { Capacity } from '@/types/capacity';
import ArrowBackIcon from '@/public/static/images/arrow_back_icon.svg';
import Image from 'next/image';
import React, { useCallback, useRef, useState } from 'react';
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

  const { getDescription, getWdCode, getMetabaseCode, getColor } = useCapacityCache();
  const { isMobile } = useApp();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  // Scroll functions for desktop navigation
  const scrollLeft = useCallback(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -320, behavior: 'smooth' });
    }
  }, []);

  const scrollRight = useCallback(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 320, behavior: 'smooth' });
    }
  }, []);

  // Update scroll button states
  const updateScrollButtonStates = useCallback(() => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      const canLeft = scrollLeft > 0;
      const canRight = scrollLeft < scrollWidth - clientWidth - 1;

      setCanScrollLeft(canLeft);
      setCanScrollRight(canRight);
    }
  }, []);

  // Effect to update scroll states when children change
  React.useEffect(() => {
    const container = scrollContainerRef.current;
    if (container) {
      updateScrollButtonStates();
      container.addEventListener('scroll', updateScrollButtonStates);
      return () => container.removeEventListener('scroll', updateScrollButtonStates);
    }
  }, [updateScrollButtonStates]);

  // Effect to update scroll states on container resize
  React.useEffect(() => {
    if (scrollContainerRef.current) {
      const resizeObserver = new ResizeObserver(updateScrollButtonStates);
      resizeObserver.observe(scrollContainerRef.current);
      return () => resizeObserver.disconnect();
    }
  }, [updateScrollButtonStates]);

  // Effect to initialize scroll states after content loads
  React.useEffect(() => {
    if (children.length > 0) {
      // Small delay to ensure DOM is fully rendered
      const timer = setTimeout(updateScrollButtonStates, 100);
      return () => clearTimeout(timer);
    }
  }, [children.length, updateScrollButtonStates]);

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
    // If this is a root capacity, get its color from cache
    const isRoot = rootCapacities.some(c => c.code.toString() === parentCode);
    if (isRoot) {
      return getColor(parseInt(parentCode, 10)) || parentCapacity.color;
    }

    // If this is a child capacity (has a parent that is root), use the parent's color from cache
    if (
      parentCapacity.parentCapacity &&
      rootCapacities.some(c => c.code === parentCapacity.parentCapacity?.code)
    ) {
      return getColor(parentCapacity.parentCapacity.code) || parentCapacity.parentCapacity.color;
    }

    // If we have a parent capacity with color, get it from cache first
    if (parentCapacity) {
      return getColor(parentCapacity.code) || parentCapacity.color;
    }

    // Default fallback
    return '';
  };

  const rootColor = findRootColor();

  // Children come from cache with all correct information
  const childrenWithParents = children; // No need to process, cache has everything

  return (
    <>
      {/* Mobile - sem setas de navegação */}
      {isMobile ? (
        <div className="mt-4 overflow-x-auto scrollbar-hide w-full">
          <div className="flex gap-2 pb-4 w-full min-w-full">
            {childrenWithParents.map((child, index) => (
              <div
                key={`${parentCode}-${child.code}-${index}`}
                className="mt-4 w-[280px] flex-shrink-0"
              >
                <CapacityCard
                  code={child.code}
                  name={child.name}
                  icon={child.icon}
                  color={child.color}
                  isExpanded={!!expandedCapacities[child.code]}
                  onExpand={() => onToggleExpand(child.code.toString())}
                  hasChildren={child.hasChildren}
                  isRoot={false}
                  parentCapacity={child.parentCapacity}
                  description={getDescription(child.code)}
                  wd_code={getWdCode(child.code)}
                  metabase_code={child.metabase_code || getMetabaseCode(child.code)}
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
      ) : (
        /* Desktop - com setas de navegação */
        <div className="relative mt-4">
          {/* Seta esquerda */}
          {canScrollLeft && (
            <button
              onClick={scrollLeft}
              className="absolute left-0 top-1/2 transform -translate-y-1/2 z-10 bg-white bg-opacity-80 hover:bg-opacity-100 rounded-full p-2 shadow-lg transition-all duration-200"
              aria-label="Scroll left"
            >
              <Image
                src={ArrowBackIcon}
                alt="Previous"
                width={24}
                height={24}
                className="text-gray-700"
              />
            </button>
          )}

          {/* Seta direita */}
          {canScrollRight && (
            <button
              onClick={scrollRight}
              className="absolute right-0 top-1/2 transform -translate-y-1/2 z-10 bg-white bg-opacity-80 hover:bg-opacity-100 rounded-full p-2 shadow-lg transition-all duration-200"
              aria-label="Scroll right"
            >
              <Image
                src={ArrowBackIcon}
                alt="Next"
                width={24}
                height={24}
                className="text-gray-700 rotate-180"
              />
            </button>
          )}

          {/* Container de scroll */}
          <div
            ref={scrollContainerRef}
            className="overflow-x-auto scrollbar-hide w-full"
            style={{ paddingLeft: '48px', paddingRight: '48px' }}
          >
            <div className="flex gap-4 pb-4 w-fit">
              {childrenWithParents.map((child, index) => (
                <div
                  key={`${parentCode}-${child.code}-${index}`}
                  className="mt-4 max-w-[992px] flex-shrink-0"
                >
                  <CapacityCard
                    code={child.code}
                    name={child.name}
                    icon={child.icon}
                    color={child.color}
                    isExpanded={!!expandedCapacities[child.code]}
                    onExpand={() => onToggleExpand(child.code.toString())}
                    hasChildren={child.hasChildren}
                    isRoot={false}
                    parentCapacity={child.parentCapacity}
                    description={getDescription(child.code)}
                    wd_code={getWdCode(child.code)}
                    metabase_code={child.metabase_code || getMetabaseCode(child.code)}
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
        </div>
      )}
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
  const {
    getName,
    getDescription,
    getWdCode,
    getMetabaseCode,
    getColor,
    getIcon,
    isLoaded,
    isLoadingTranslations,
    language: cacheLanguage,
  } = useCapacityCache();

  // Check if cache is ready for the current language
  const isCacheReady = isLoaded && !isLoadingTranslations && cacheLanguage === language;

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

  if (isLoadingRoot || !isCacheReady) {
    return (
      <div className="flex flex-col justify-center items-center h-[400px]">
        <LoadingState fullScreen={false} />
        {!isCacheReady && (
          <div className="mt-8 text-center">
            <p className={`text-lg font-medium ${isMobile ? 'text-sm' : 'text-lg'}`}>
              {isLoadingTranslations
                ? 'Loading translations...'
                : `Loading capacity data for ${language}...`}
            </p>
            <p className={`text-sm mt-2 ${isMobile ? 'text-xs' : 'text-sm'} opacity-70`}>
              Please wait while we prepare the content
            </p>
          </div>
        )}
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
          {rootCapacities.map((capacity, index) => {
            return (
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
                  hasChildren={capacity.hasChildren !== false} // Force true for root cards unless explicitly false
                  isRoot={true}
                  level={capacity.level || 1}
                  color={getColor(capacity.code) || capacity.color}
                  icon={getIcon(capacity.code) || capacity.icon}
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
            );
          })}
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
      <LanguageChangeHandler>
        <CapacityListContent />
      </LanguageChangeHandler>
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
