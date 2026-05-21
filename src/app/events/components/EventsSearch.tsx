'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import BaseInput from '@/components/BaseInput';
import SearchIcon from '@/public/static/images/search.svg';
import SearchIconWhite from '@/public/static/images/search_icon_white.svg';
import { useEvents } from '@/hooks/useEvents';
import { Event } from '@/types/event';

import { useDarkMode, useIsMobile, usePageContent } from '@/stores';
interface EventsSearchProps {
  onSearchStart?: () => void;
  onSearchEnd?: () => void;
  onSearchResults?: (results: Event[]) => void;
  onSearchStatusChange?: (isActive: boolean) => void;
  organizationId?: number;
}

function useDebounce<T extends (...args: any[]) => any>(callback: T, delay: number) {
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

  const cancel = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

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
  const isMobile = useIsMobile();

  const pageContent = usePageContent();
  const darkMode = useDarkMode();
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const {
    events,
    isLoading: isEventsLoading,
    error: _eventsError,
  } = useEvents(session?.user?.token, 100, 0, organizationId);

  const lastSearchRef = useRef<string>('');

  const search = useCallback(
    async (term: string) => {
      onSearchStatusChange?.(!!term);

      if (term === lastSearchRef.current) {
        return;
      }

      lastSearchRef.current = term;

      if (!term) {
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
        const filtered = events.filter(event => {
          const name = (event.name || '').toLowerCase();
          const desc = (event.description || '').toLowerCase();
          const loc = (event.type_of_location || '').toLowerCase();
          const termLower = term.toLowerCase();

          const matchesLocationType =
            loc === termLower ||
            (termLower === 'in-person' && loc === 'in_person') ||
            (termLower === 'on-site' && loc === 'in_person') ||
            loc.includes(termLower);

          return name.includes(termLower) || desc.includes(termLower) || matchesLocationType;
        });

        onSearchResults?.(filtered);
      } catch (error) {
        console.error('Error:', error);
        onSearchResults?.([]);
      } finally {
        setIsLoading(false);
        onSearchEnd?.();
      }
    },
    [events, onSearchStart, onSearchEnd, onSearchResults, onSearchStatusChange]
  );

  const { debouncedFunction: debouncedSearch } = useDebounce(search, 300);

  useEffect(() => {
    debouncedSearch(searchTerm);
  }, [searchTerm, debouncedSearch]);

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
        onChange={e => setSearchTerm(e.target.value)}
        placeholder={pageContent?.['events-search-placeholder'] || 'Search for events...'}
        className={`w-full h-14 py-4 px-4 rounded-xl border transition-colors duration-150 ${
          darkMode
            ? 'text-white border-white/10 focus:border-white/20 bg-capx-dark-box-bg placeholder-white/30'
            : 'text-capx-dark-box-bg border-capx-dark-box-bg/10 focus:border-capx-dark-box-bg/20 bg-white placeholder-capx-dark-box-bg/30'
        } ${isMobile ? 'text-sm' : 'text-base'}`}
        icon={darkMode ? SearchIconWhite : SearchIcon}
        iconPosition="right"
      />
    </div>
  );
}
