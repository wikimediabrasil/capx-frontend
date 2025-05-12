"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { useApp } from "@/contexts/AppContext";
import BaseInput from "@/components/BaseInput";
import SearchIcon from "@/public/static/images/search.svg";
import SearchIconWhite from "@/public/static/images/search_icon_white.svg";
import { useEvents } from "@/hooks/useEvents";
import LoadingState from "@/components/LoadingState";
import { useTheme } from "@/contexts/ThemeContext";
import { Event } from "@/types/event";

interface EventsSearchProps {
  onSearchStart?: () => void;
  onSearchEnd?: () => void;
  onSearchResults?: (results: Event[]) => void;
  onSearchStatusChange?: (isActive: boolean) => void;
  organizationId?: number;
}

function useDebounce<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
) {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const debouncedFunction = useCallback(
    (...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        callback(...args);
      }, delay);
    },
    [callback, delay]
  );

  // Function to cancel the debounce
  const cancel = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  // Clear the timeout when the component is unmounted
  useEffect(() => {
    return () => {
      cancel();
    };
  }, [cancel]);

  return { debouncedFunction, cancel };
}

export function EventsSearch({
  onSearchStart,
  onSearchEnd,
  onSearchResults,
  onSearchStatusChange,
  organizationId,
}: EventsSearchProps) {
  const { data: session } = useSession();
  const { isMobile, pageContent } = useApp();
  const { darkMode } = useTheme();
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  // Search all events to enable search
  const {
    events,
    isLoading: isEventsLoading,
    error: eventsError,
  } = useEvents(session?.user?.token, 100, 0, organizationId);

  // Store the last search term to avoid duplicate requests
  const lastSearchRef = useRef<string>("");

  // Search function
  const search = useCallback(
    async (term: string) => {      
      // Notify search status
      onSearchStatusChange?.(!!term);
      
      // If the search term is the same as the last search, do nothing
      if (term === lastSearchRef.current) {
        return;
      }
      
      // Store the current search term
      lastSearchRef.current = term;

      if (!term) {
        // No search term, clear results
        onSearchResults?.([]);
        onSearchEnd?.();
        return;
      }
      
      if (!events || events.length === 0) {
        onSearchResults?.([]);
        onSearchEnd?.();
        return;
      }
      
      setIsLoading(true);
      onSearchStart?.();
      
      try {
        // Safely check for null/undefined values during filtering
        const filtered = events.filter(event => {
          const name = (event.name || '').toLowerCase();
          const desc = (event.description || '').toLowerCase();
          const loc = (event.type_of_location || '').toLowerCase();
          const termLower = term.toLowerCase();
          
          return name.includes(termLower) || 
                 desc.includes(termLower) || 
                 loc.includes(termLower);
        });
                
        // Send results to parent component (even if empty)
        onSearchResults?.(filtered);
      } catch (error) {
        console.error('🔍 Error:', error);
        onSearchResults?.([]);
      } finally {
        setIsLoading(false);
        onSearchEnd?.();
      }
    },
    [events, onSearchStart, onSearchEnd, onSearchResults, onSearchStatusChange]
  );

  // Use the custom debounce hook
  const { debouncedFunction: debouncedSearch } = useDebounce(
    search,
    300
  );

  // Effect to call the debounce function when the search term changes
  useEffect(() => {
    debouncedSearch(searchTerm);
  }, [searchTerm, debouncedSearch]);

  // When component unmounts or search is cleared, reset search state
  useEffect(() => {
    return () => {
      onSearchStatusChange?.(false);
    };
  }, [onSearchStatusChange]);

  return (
    <div className="w-full">
      <BaseInput
        type="text"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder={pageContent?.["events-search-placeholder"] || "Search for events..."}
        className={`w-full h-16 py-6 px-3 rounded-[16px] opacity-50 ${
          darkMode
            ? "text-white border-white"
            : "text-capx-dark-box-bg border-capx-dark-box-bg "
        } ${isMobile ? "text-[12px]" : "text-[24px]"}`}
        icon={darkMode ? SearchIconWhite : SearchIcon}
        iconPosition="right"
      />
      
      {(isLoading || isEventsLoading) && (
        <div className="flex justify-center py-2 mt-2">
          <LoadingState />
        </div>
      )}
    </div>
  );
}
