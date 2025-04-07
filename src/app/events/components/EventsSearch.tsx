"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { useApp } from "@/contexts/AppContext";
import BaseInput from "@/components/BaseInput";
import EventCard from "./EventCard";
import SearchIcon from "@/public/static/images/search.svg";
import SearchIconWhite from "@/public/static/images/search_icon_white.svg";
import { useEvents } from "@/hooks/useEvents";
import LoadingState from "@/components/LoadingState";
import { useTheme } from "@/contexts/ThemeContext";
import { Event } from "@/types/event";

interface EventsSearchProps {
  onSearchStart?: () => void;
  onSearchEnd?: () => void;
}

// simple debounce
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
}: EventsSearchProps) {
  const { data: session } = useSession();
  const { language, isMobile, pageContent } = useApp();
  const { darkMode } = useTheme();
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  
  const {
    events,
    isLoading: isEventsLoading,
    error: eventsError,
  } = useEvents(session?.user?.token, 50, 0);
  // TODO: change pagination if necessary

  // Store the last search term to avoid duplicate requests
  const lastSearchRef = useRef<string>("");

  // Search function
  const search = useCallback(
    async (term: string) => {
      // If the search term is the same as the last search, do nothing
      if (term === lastSearchRef.current) {
        return;
      }

      if (term && events && events.length > 0) {
        setIsLoading(true);
        onSearchStart?.();
        
        // Filter events based on the search term
        const filtered = events.filter(event => 
          event.name.toLowerCase().includes(term.toLowerCase()) ||
          (event.type_of_location && event.type_of_location.toLowerCase().includes(term.toLowerCase()))
        );
        
        setFilteredEvents(filtered);
        
        // Store the current search term
        lastSearchRef.current = term;
        setIsLoading(false);
        onSearchEnd?.();
      } else {
        setFilteredEvents([]);
        onSearchEnd?.();
        // Clear the last search
        lastSearchRef.current = "";
      }
    },
    [events, onSearchStart, onSearchEnd]
  );

  // Use the custom debounce hook
  const { debouncedFunction: debouncedSearch, cancel } = useDebounce(
    search,
    300
  );

  // Effect to call the debounce function when the search term changes
  useEffect(() => {
    debouncedSearch(searchTerm);
  }, [searchTerm, debouncedSearch]);

  // Load all events when there is no search term
  useEffect(() => {
    if (!searchTerm && events) {
      setFilteredEvents(events);
    }
  }, [searchTerm, events]);

  return (
    <div className="w-full">
      <BaseInput
        type="text"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder={pageContent["events-search-placeholder"] || "Search for events..."}
        className={`w-full py-6 px-3 rounded-[16px] opacity-50 ${
          darkMode
            ? "text-white border-white"
            : "text-capx-dark-box-bg border-capx-dark-box-bg "
        } ${isMobile ? "text-[12px]" : "text-[24px]"}`}
        icon={darkMode ? SearchIconWhite : SearchIcon}
        iconPosition="right"
      />

      <div className="grid gap-4 mt-4">
        {isLoading || isEventsLoading ? (
          <LoadingState />
        ) : eventsError ? (
          <div className="text-red-500">
            {pageContent["events-search-error"] || "Error loading events. Please try again."}
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="text-center py-4">
            {searchTerm ? "Nenhum evento encontrado para sua busca." : "Nenhum evento disponível."}
          </div>
        ) : (
          filteredEvents.map((event) => (
            <div key={event.id} className="w-full">
              <EventCard event={event} />
            </div>
          ))
        )}
      </div>
    </div>
  );
}
