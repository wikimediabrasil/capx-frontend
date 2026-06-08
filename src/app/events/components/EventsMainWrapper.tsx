'use client';

import Banner from '@/components/Banner';
import { PaginationButtons } from '@/components/PaginationButtons';
import { EventCardSkeleton } from '@/components/skeletons';
import { useEvents } from '@/hooks/useEvents';
import CapxPersonEvent from '@/public/static/images/capx_person_events.svg';
import CloseIconWhite from '@/public/static/images/close_mobile_menu_icon_dark_mode.svg';
import CloseIcon from '@/public/static/images/close_mobile_menu_icon_light_mode.svg';
import FilterIcon from '@/public/static/images/filter_icon.svg';
import FilterIconWhite from '@/public/static/images/filter_icon_white.svg';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { EventFilterState, EventFilterType, EventLocationType, EventSkill } from '../types';
import { EventsFilters } from './EventsFilters';
import EventsList from './EventsList';
import { EventsSearch } from './EventsSearch';

import { useDarkMode, usePageContent } from '@/stores';
export default function EventsMainWrapper() {
  const { data: session } = useSession();
  const darkMode = useDarkMode();
  const searchParams = useSearchParams();
  const organizationId = searchParams?.get('organization');
  const pageContent = usePageContent();
  const router = useRouter();

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Search mode state
  const [isSearchMode, setIsSearchMode] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  // Filter states
  const [showFilters, setShowFilters] = useState(false);
  const [activeFilters, setActiveFilters] = useState<EventFilterState>({
    capacities: [] as EventSkill[],
    territories: [] as string[],
    eventType: EventFilterType.All,
    locationType: EventLocationType.All,
    dateRange: undefined,
    organizationId: organizationId ? Number(organizationId) : undefined,
  });

  const offset = (currentPage - 1) * itemsPerPage;

  const {
    events,
    count: eventsCount,
    isLoading: isEventsLoading,
    error: eventsError,
  } = useEvents(
    session?.user?.token || '',
    itemsPerPage,
    offset,
    organizationId ? Number(organizationId) : undefined,
    activeFilters
  );

  const displayedEvents = isSearchMode
    ? searchResults.slice(offset, offset + itemsPerPage)
    : events || [];

  const totalItems = isSearchMode ? searchResults.length : eventsCount || 0;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;

  useEffect(() => {
    setCurrentPage(1);
  }, [isSearchMode, organizationId, activeFilters]);

  useEffect(() => {
    setActiveFilters(prev => ({
      ...prev,
      organizationId: organizationId ? Number(organizationId) : undefined,
    }));
  }, [organizationId]);

  const handleRemoveCapacity = (capacityCode: number) => {
    setActiveFilters(prev => ({
      ...prev,
      capacities: prev.capacities.filter(cap => cap.code !== capacityCode),
    }));

    const urlCapacityId = searchParams?.get('capacityId');
    if (urlCapacityId && urlCapacityId.toString() === capacityCode.toString()) {
      router.replace('/events', { scroll: false });
    }
  };

  const handleSearchStart = useCallback(() => {
    setIsSearching(true);
  }, []);

  const handleSearchEnd = useCallback(() => {
    setIsSearching(false);
  }, []);

  const handleSearchResults = useCallback(results => {
    setSearchResults(results || []);
    setCurrentPage(1);
  }, []);

  const handleSearchStatusChange = useCallback(isActive => {
    setIsSearchMode(isActive);
    if (!isActive) {
      setSearchResults([]);
    }
  }, []);

  const handlePageChange = useCallback(
    newPage => {
      if (newPage >= 1 && newPage <= totalPages) {
        setCurrentPage(newPage);
        window.scrollTo(0, 0);
      }
    },
    [totalPages]
  );

  const handleApplyFilters = (newFilters: EventFilterState) => {
    setActiveFilters(newFilters);
    setShowFilters(false);
  };

  const hasActiveFilters =
    activeFilters.capacities.length > 0 ||
    activeFilters.locationType !== EventLocationType.All ||
    activeFilters.dateRange?.startDate ||
    activeFilters.dateRange?.endDate;

  const activeFilterCount =
    activeFilters.capacities.length +
    (activeFilters.locationType !== EventLocationType.All ? 1 : 0) +
    (activeFilters.dateRange?.startDate ? 1 : 0) +
    (activeFilters.dateRange?.endDate ? 1 : 0);

  const isInitialLoading = isEventsLoading && !isSearchMode && displayedEvents.length === 0;

  if (isInitialLoading) {
    return (
      <section className="w-full flex flex-col min-h-screen pt-24 md:pt-8 gap-4 mx-auto md:max-w-[1200px]">
        <EventCardSkeleton />
      </section>
    );
  }

  return (
    <section className="w-full flex flex-col min-h-screen pt-24 md:pt-8 gap-4 mx-auto md:max-w-[1200px]">
      <Banner
        image={CapxPersonEvent}
        title={pageContent['events-banner-title']}
        alt={pageContent['events-banner-alt']}
      />

      <div className="flex flex-col flex-1">
        <div className="w-full max-w-screen-xl mx-auto px-4">
          {/* Search + Filter bar */}
          <div className="flex gap-2 items-stretch mb-4">
            <div className="flex-1">
              <EventsSearch
                onSearchStart={handleSearchStart}
                onSearchEnd={handleSearchEnd}
                onSearchResults={handleSearchResults}
                onSearchStatusChange={handleSearchStatusChange}
                organizationId={organizationId ? Number(organizationId) : undefined}
              />
            </div>

            <button
              onClick={() => setShowFilters(true)}
              className={`
                relative w-14 h-14 flex-shrink-0 rounded-xl flex items-center justify-center
                transition-colors duration-150
                ${
                  darkMode
                    ? 'bg-capx-dark-box-bg border border-white/10 hover:border-white/20'
                    : 'bg-white border border-capx-dark-box-bg/10 hover:border-capx-dark-box-bg/20'
                }
              `}
              aria-label="Open filters"
            >
              <Image
                src={darkMode ? FilterIconWhite : FilterIcon}
                alt={pageContent['filters-icon'] || 'Filters'}
                width={20}
                height={20}
              />
              {activeFilterCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-capx-secondary-purple text-white text-[10px] font-bold flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
            </button>
          </div>

          {/* Active filter chips */}
          {(hasActiveFilters || isSearchMode) && (
            <div className="flex flex-wrap gap-2 mb-4 items-center">
              {/* Location type chip */}
              {activeFilters.locationType !== EventLocationType.All && (
                <span
                  className={`
                    inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium
                    bg-capx-secondary-purple/10 text-capx-secondary-purple
                  `}
                >
                  {activeFilters.locationType === EventLocationType.Online
                    ? pageContent['filters-location-online'] || 'Online'
                    : activeFilters.locationType === EventLocationType.InPerson
                      ? pageContent['filters-location-in-person'] || 'In-person'
                      : pageContent['filters-location-hybrid'] || 'Hybrid'}
                </span>
              )}

              {/* Capacity chips */}
              {activeFilters.capacities.map((capacity, index) => (
                <span
                  key={capacity.code + index}
                  className={`
                    inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium max-w-[200px]
                    ${
                      darkMode
                        ? 'bg-white/10 text-white/80'
                        : 'bg-capx-dark-box-bg/5 text-capx-dark-box-bg'
                    }
                  `}
                >
                  <span className="truncate">{capacity.name}</span>
                  <button
                    onClick={() => handleRemoveCapacity(capacity.code)}
                    className="hover:opacity-60 flex-shrink-0 transition-opacity"
                  >
                    <Image
                      src={darkMode ? CloseIconWhite : CloseIcon}
                      alt={pageContent['filters-remove-item-alt-icon'] || 'Remove'}
                      width={14}
                      height={14}
                    />
                  </button>
                </span>
              ))}

              {/* Search results count */}
              {isSearchMode && (
                <span
                  className={`text-xs font-medium ${
                    darkMode ? 'text-white/50' : 'text-capx-dark-box-bg/50'
                  }`}
                >
                  {searchResults.length}{' '}
                  {searchResults.length === 1
                    ? pageContent['events-search-results-singular'] || 'event found'
                    : pageContent['events-search-results-plural'] || 'events found'}
                </span>
              )}
            </div>
          )}

          {/* Content area */}
          {isSearching ? (
            <div className="flex flex-col gap-4">
              <EventCardSkeleton />
            </div>
          ) : eventsError && !isSearchMode ? (
            <div
              className={`flex flex-col items-center justify-center py-16 rounded-2xl ${
                darkMode ? 'bg-white/[0.02]' : 'bg-capx-dark-box-bg/[0.02]'
              }`}
            >
              <p
                className={`text-sm font-medium mb-1 ${darkMode ? 'text-red-400' : 'text-red-600'}`}
              >
                {pageContent['events-search-results-error'] || 'Error loading events'}
              </p>
              <p
                className={`text-xs mb-4 ${
                  darkMode ? 'text-white/40' : 'text-capx-dark-box-bg/40'
                }`}
              >
                {eventsError.message || 'Try again later'}
              </p>
              <button
                onClick={() => window.location.reload()}
                className="px-5 py-2 bg-capx-secondary-purple text-white text-sm font-bold rounded-lg hover:bg-capx-primary-green hover:text-black transition-colors duration-150"
              >
                {pageContent['events-main-wrapper-try-again'] || 'Try again'}
              </button>
            </div>
          ) : displayedEvents.length === 0 ? (
            <div
              className={`flex flex-col items-center justify-center py-16 rounded-2xl ${
                darkMode ? 'bg-white/[0.02]' : 'bg-capx-dark-box-bg/[0.02]'
              }`}
            >
              <p className={`text-sm ${darkMode ? 'text-white/40' : 'text-capx-dark-box-bg/40'}`}>
                {isSearchMode
                  ? pageContent['events-search-results-no-results'] || 'No events found'
                  : hasActiveFilters
                    ? pageContent['events-no-results-with-filters'] ||
                      'No events correspond to the selected filters. Try removing some filters.'
                    : pageContent['events-no-results'] || 'No events available'}
              </p>
            </div>
          ) : (
            <>
              <EventsList
                key={`events-list-page-${currentPage}-${isSearchMode ? 'search' : 'normal'}`}
                events={displayedEvents}
                isHorizontalScroll={false}
              />

              <div className="mt-6 flex justify-center">
                <PaginationButtons
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                />
              </div>
            </>
          )}
        </div>
      </div>

      {/* Filters Modal */}
      {showFilters && (
        <EventsFilters
          onClose={() => setShowFilters(false)}
          onApplyFilters={handleApplyFilters}
          initialFilters={activeFilters}
        />
      )}
    </section>
  );
}
