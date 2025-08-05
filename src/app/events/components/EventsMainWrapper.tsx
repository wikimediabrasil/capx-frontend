'use client';

import { EventsSearch } from './EventsSearch';
import { useSession } from 'next-auth/react';
import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { PaginationButtons } from '@/components/PaginationButtons';
import { useEvents } from '@/hooks/useEvents';
import EventsList from './EventsList';
import Banner from '@/components/Banner';
import LoadingState from '@/components/LoadingState';
import { useApp } from '@/contexts/AppContext';
import { EventFilterState, EventFilterType, EventLocationType, EventSkill } from '../types';
import { EventsFilters } from './EventsFilters';
import { useTheme } from '@/contexts/ThemeContext';
import Image from 'next/image';
import FilterIcon from '@/public/static/images/filter_icon.svg';
import FilterIconWhite from '@/public/static/images/filter_icon_white.svg';
import CloseIcon from '@/public/static/images/close_mobile_menu_icon_light_mode.svg';
import CloseIconWhite from '@/public/static/images/close_mobile_menu_icon_dark_mode.svg';
import CapacitySelectionModal from '@/components/CapacitySelectionModal';
import { Capacity } from '@/types/capacity';
import { useRouter } from 'next/navigation';
import CapxPersonEvent from '@/public/static/images/capx_person_events.svg';

export default function EventsMainWrapper() {
  const { data: session } = useSession();
  const { darkMode } = useTheme();
  const searchParams = useSearchParams();
  const organizationId = searchParams.get('organization');
  const capacityCode = searchParams.get('capacityId');
  const { pageContent } = useApp();
  const router = useRouter();

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6; // Number of events per page

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
  const [showSkillModal, setShowSkillModal] = useState(false);

  // Log when activeFilters change
  useEffect(() => {
    // No need to log active filters
  }, [activeFilters]);

  // Calculate offset based on current page
  const offset = (currentPage - 1) * itemsPerPage;

  // Search events from API with pagination - only used when NOT in search mode
  const {
    events,
    count: eventsCount,
    isLoading: isEventsLoading,
    error: eventsError,
  } = useEvents(
    session?.user?.token || '',
    itemsPerPage, // Limit the quantity per page
    offset, // Use offset for pagination with the server
    organizationId ? Number(organizationId) : undefined,
    activeFilters // Passar os filtros para a API
  );

  // Calculate events to display and total pages
  const displayedEvents = isSearchMode
    ? searchResults.slice(offset, offset + itemsPerPage)
    : events || [];

  const totalItems = isSearchMode ? searchResults.length : eventsCount || 0;

  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;

  // Reset to the first page when changing mode or filters
  useEffect(() => {
    setCurrentPage(1);
  }, [isSearchMode, organizationId, activeFilters]);

  // Initialize organizationId in filters when URL param changes
  useEffect(() => {
    setActiveFilters(prev => ({
      ...prev,
      organizationId: organizationId ? Number(organizationId) : undefined,
    }));
  }, [organizationId]);

  // Helper function to add unique capacities
  const addUniqueCapacities = (existingCapacities: Array<{code: number; name: string}>, newCapacities: Capacity[]) => {
    const result = [...existingCapacities];
    
    newCapacities.forEach(capacity => {
      const capacityExists = result.some(cap => cap.code === capacity.code);
      if (!capacityExists) {
        result.push({
          code: capacity.code,
          name: capacity.name,
        });
      }
    });
    
    return result;
  };

  const handleCapacitySelect = (capacities: Capacity[]) => {
    setActiveFilters(prev => ({
      ...prev,
      capacities: addUniqueCapacities(prev.capacities, capacities),
    }));
  };

  const handleRemoveCapacity = (capacityCode: number) => {
    setActiveFilters(prev => ({
      ...prev,
      capacities: prev.capacities.filter(cap => cap.code !== capacityCode),
    }));

    const urlCapacityId = searchParams.get('capacityId');

    // If the capacity removed is the same as the URL, update the URL
    if (urlCapacityId && urlCapacityId.toString() === capacityCode.toString()) {
      router.replace('/events', { scroll: false });
    }
  };

  // Functions to control the search
  const handleSearchStart = useCallback(() => {
    setIsSearching(true);
  }, []);

  const handleSearchEnd = useCallback(() => {
    setIsSearching(false);
  }, []);

  const handleSearchResults = useCallback(results => {
    setSearchResults(results || []);
    setCurrentPage(1); // Return to the first page when receiving search results
  }, []);

  const handleSearchStatusChange = useCallback(isActive => {
    setIsSearchMode(isActive);

    if (!isActive) {
      setSearchResults([]); // Clear search results when leaving search mode
    }
  }, []);

  const handlePageChange = useCallback(
    newPage => {
      if (newPage >= 1 && newPage <= totalPages) {
        setCurrentPage(newPage);
        window.scrollTo(0, 0); // Scroll to the top
      }
    },
    [totalPages]
  );

  const handleApplyFilters = (newFilters: EventFilterState) => {
    setActiveFilters(newFilters);
    setShowFilters(false);
  };

  // Render the component
  return (
    <section className="w-full flex flex-col min-h-screen pt-24 md:pt-8 gap-4 mx-auto md:max-w-[1200px]">
      <Banner
        image={CapxPersonEvent}
        title={pageContent['events-banner-title']}
        alt={pageContent['events-banner-alt']}
      />
      <div className="flex flex-col min-h-screen">
        <div className="w-full max-w-screen-xl mx-auto p-4">
          {/* Search and Filters Container */}
          <div className="flex gap-2 mb-6">
            <div className="flex-1">
              <EventsSearch
                onSearchStart={handleSearchStart}
                onSearchEnd={handleSearchEnd}
                onSearchResults={handleSearchResults}
                onSearchStatusChange={handleSearchStatusChange}
                organizationId={organizationId ? Number(organizationId) : undefined}
              />
            </div>

            {/* Filters Button */}
            <button
              onClick={() => setShowFilters(true)}
              className={`
                w-16 h-16 flex-shrink-0 rounded-lg flex items-center justify-center
                ${
                  darkMode
                    ? 'bg-capx-dark-box-bg text-white hover:bg-gray-700'
                    : 'bg-white border border-gray-300 hover:bg-gray-50'
                }
              `}
              aria-label="Open filters"
            >
              <Image
                src={darkMode ? FilterIconWhite : FilterIcon}
                alt={pageContent['filters-icon'] || 'Filters'}
                width={24}
                height={24}
              />
            </button>
          </div>

          {/* Filter chips */}
          {activeFilters.capacities.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4 items-center">
              {activeFilters.capacities.map((capacity, index) => (
                <span
                  key={index}
                  className={`
                    inline-flex items-center gap-1 px-2 py-1 rounded-md text-sm max-w-[200px]
                    ${darkMode ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-800'}
                  `}
                >
                  <span className="truncate">{capacity.name}</span>
                  <button
                    onClick={() => handleRemoveCapacity(capacity.code)}
                    className="hover:opacity-80 flex-shrink-0"
                  >
                    <Image
                      src={darkMode ? CloseIconWhite : CloseIcon}
                      alt={pageContent['filters-remove-item-alt-icon'] || 'Remove'}
                      width={16}
                      height={16}
                    />
                  </button>
                </span>
              ))}
            </div>
          )}

          <CapacitySelectionModal
            isOpen={showSkillModal}
            onClose={() => setShowSkillModal(false)}
            onSelect={handleCapacitySelect}
            title={pageContent['select-capacity'] || 'Selecionar capacidade'}
          />

          {/* Applied filters summary */}
          {(activeFilters.locationType !== EventLocationType.All ||
            activeFilters.dateRange?.startDate ||
            activeFilters.dateRange?.endDate ||
            activeFilters.organizationId) && (
            <div className="mb-4 p-3 bg-blue-50 rounded-md">
              <p className="text-blue-800 font-medium">
                {pageContent['events-filters-applied'] || 'Filters applied:'}
                {activeFilters.locationType !== EventLocationType.All && (
                  <span className="ml-2 inline-block">
                    {activeFilters.locationType === EventLocationType.Online
                      ? pageContent['filters-location-online'] || 'Online'
                      : activeFilters.locationType === EventLocationType.InPerson
                        ? pageContent['filters-location-in-person'] || 'In-person'
                        : pageContent['filters-location-hybrid'] || 'Hybrid'}
                  </span>
                )}
                {activeFilters.dateRange?.startDate && (
                  <span className="ml-2 inline-block">
                    {pageContent['filters-from-date'] || 'From:'}{' '}
                    {activeFilters.dateRange.startDate}
                  </span>
                )}
                {activeFilters.dateRange?.endDate && (
                  <span className="ml-2 inline-block">
                    {pageContent['filters-to-date'] || 'To:'} {activeFilters.dateRange.endDate}
                  </span>
                )}
              </p>
            </div>
          )}

          {isSearchMode && (
            <div className="mb-4 p-3 bg-blue-50 rounded-md">
              <p>
                {pageContent['events-search-results'] || 'Showing search results:'}{' '}
                {searchResults.length}{' '}
                {searchResults.length === 1
                  ? pageContent['events-search-results-singular'] || 'event found'
                  : pageContent['events-search-results-plural'] || 'events found'}
              </p>
            </div>
          )}

          {(isEventsLoading && !isSearchMode) || isSearching ? (
            <div className="flex justify-center items-center py-10">
              <LoadingState />
            </div>
          ) : eventsError && !isSearchMode ? (
            <div className="text-center py-8">
              <div className="text-red-500 mb-2">
                {pageContent['events-search-results-error'] || 'Error loading events'}
              </div>
              <div className="text-gray-600">{eventsError.message || 'Try again later'}</div>
              <button
                onClick={() => window.location.reload()}
                className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                {pageContent['events-main-wrapper-try-again'] || 'Try again'}
              </button>
            </div>
          ) : displayedEvents.length === 0 ? (
            <div className="text-center py-8">
              {isSearchMode
                ? pageContent['events-search-results-no-results'] || 'No events found'
                : Object.keys(activeFilters).some(
                      key =>
                        (key === 'capacities' && activeFilters.capacities.length > 0) ||
                        (key === 'locationType' &&
                          activeFilters.locationType !== EventLocationType.All) ||
                        (key === 'dateRange' &&
                          (activeFilters.dateRange?.startDate ||
                            activeFilters.dateRange?.endDate)) ||
                        (key === 'organizationId' && activeFilters.organizationId)
                    )
                  ? pageContent['events-no-results-with-filters'] ||
                    'No events correspond to the selected filters. Try removing some filters.'
                  : pageContent['events-no-results'] || 'No events available'}
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
