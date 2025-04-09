"use client";

import { EventsSearch } from "./EventsSearch";
import { useSession } from "next-auth/react";
import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from 'next/navigation';
import { PaginationButtons } from "@/components/PaginationButtons";   
import { useEvents } from "@/hooks/useEvents";
import EventsList from "./EventsList";
import { EventsBanner } from "./EventsBanner";
import LoadingState from "@/components/LoadingState";
import { useApp } from "@/contexts/AppContext";

export default function EventsMainWrapper() {
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const organizationId = searchParams.get('organization');
  const { pageContent } = useApp();
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6; // Number of events per page
  
  // Search mode state
  const [isSearchMode, setIsSearchMode] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  
  // Calculate offset based on current page
  const offset = (currentPage - 1) * itemsPerPage;
  
  // Search events from API with pagination - only used when NOT in search mode
  const {
    events,
    count: eventsCount,
    isLoading: isEventsLoading,
    error: eventsError,
  } = useEvents(
    session?.user?.token, 
    itemsPerPage, // Limit the quantity per page
    offset, // Use offset for pagination with the server
    organizationId ? Number(organizationId) : undefined
  );
  
  // Calculate events to display and total pages
  const displayedEvents = isSearchMode 
    ? searchResults.slice(offset, offset + itemsPerPage) 
    : events || [];
    
  const totalItems = isSearchMode 
    ? searchResults.length 
    : eventsCount || 0;
    
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  
  // Reset to the first page when changing mode or filters
  useEffect(() => {
    setCurrentPage(1);
  }, [isSearchMode, organizationId]);
  
  // Functions to control the search
  const handleSearchStart = useCallback(() => {
    setIsSearching(true);
  }, []);
  
  const handleSearchEnd = useCallback(() => {
    setIsSearching(false);
  }, []);
  
  const handleSearchResults = useCallback((results) => {
    
    setSearchResults(results || []);
    setCurrentPage(1); // Return to the first page when receiving search results
  }, []);
  
  const handleSearchStatusChange = useCallback((isActive) => {
    setIsSearchMode(isActive);
    
    if (!isActive) {
      setSearchResults([]); // Clear search results when leaving search mode
    }
  }, []);
  
  const handlePageChange = useCallback((newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      window.scrollTo(0, 0); // Scroll to the top
    }
  }, [totalPages]);
  
  // Render the component
  return (
    <>
      <EventsBanner />
      <div className="flex flex-col min-h-screen">
        <div className="w-full max-w-screen-xl mx-auto p-4">
          <div className="mb-6">
            <EventsSearch 
              onSearchStart={handleSearchStart}
              onSearchEnd={handleSearchEnd}
              onSearchResults={handleSearchResults}
              onSearchStatusChange={handleSearchStatusChange}
              organizationId={organizationId ? Number(organizationId) : undefined}
            />
          </div>
          
          {isSearchMode && (
            <div className="mb-4 p-3 bg-blue-50 rounded-md">
              <p>
                {pageContent["events-search-results"]} {searchResults.length} {searchResults.length === 1 
                  ? pageContent["events-search-results-singular"] 
                  : pageContent["events-search-results-plural"]}
              </p>
            </div>
          )}
          
          {(isEventsLoading && !isSearchMode) || isSearching ? (
            <div className="flex justify-center items-center py-10">
              <LoadingState />
            </div>
          ) 
          
          : (eventsError && !isSearchMode) ? (
            <div className="text-center py-8 text-red-500">{pageContent["events-search-results-error"]}</div>
          ) 
          
          : displayedEvents.length === 0 ? (
            <div className="text-center py-8">
              {isSearchMode ? pageContent["events-search-results-no-results"] : pageContent["events-search-results-error"]}
            </div>
          ) 
          
          : (
            <>
              <EventsList 
                key={`events-list-page-${currentPage}-${isSearchMode ? 'search' : 'normal'}`} 
                events={displayedEvents} 
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
    </>
  );
}
