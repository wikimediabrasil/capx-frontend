import { useState, useEffect } from 'react';
import { Event } from '@/types/event';
import { eventsService } from '@/services/eventService';
import { EventFilterState, EventLocationType } from '@/app/events/types';

export function useEvent(eventId?: number, token?: string) {
  const [event, setEvent] = useState<Event | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchEvent = async () => {
      if (!token || !eventId) return;

      setIsLoading(true);
      try {
        const eventData = await eventsService.getEventById(eventId, token);
        setEvent(eventData);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch event'));
        setEvent(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvent();
  }, [eventId, token]);

  const createEvent = async (data: Partial<Event>) => {
    if (!token) return;
    try {
      const eventData = {
        ...data,
        organization: data.organization,
      };

      const response = await eventsService.createEvent(eventData, token);
      if (!response || !response.id) {
        throw new Error('Invalid event response from server');
      }
      setEvent(response);
      return response;
    } catch (error) {
      setError(error instanceof Error ? error : new Error('Failed to create event'));
      throw error;
    }
  };

  const updateEvent = async (eventId: number, data: Partial<Event>) => {
    if (!token || !eventId) return;
    try {
      const eventData = {
        ...data,
      };

      const response = await eventsService.updateEvent(eventId, eventData, token);
      if (!response || !response.id) {
        throw new Error('Invalid event response from server');
      }
      setEvent(response);
      return response;
    } catch (error) {
      setError(error instanceof Error ? error : new Error('Failed to update event'));
      throw error;
    }
  };

  const deleteEvent = async (eventId: number) => {
    if (!token || !eventId) return;
    try {
      await eventsService.deleteEvent(eventId, token);
      setEvent(null);
    } catch (error) {
      setError(error instanceof Error ? error : new Error('Failed to delete event'));
    }
  };

  return {
    event,
    isLoading,
    error,
    createEvent,
    updateEvent,
    deleteEvent,
  };
}

export function useEvents(
  token?: string,
  limit?: number,
  offset?: number,
  organizationId?: number,
  filters?: EventFilterState
) {
  const [events, setEvents] = useState<Event[]>([]);
  const [allEvents, setAllEvents] = useState<Event[]>([]);
  const [count, setCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const filterEventsLocally = (eventsToFilter: Event[], currentFilters?: EventFilterState) => {
    if (!currentFilters) return eventsToFilter;

    const frontendToBackendLocationMap = {
      [EventLocationType.Online]: 'virtual',
      [EventLocationType.InPerson]: 'in_person',
      [EventLocationType.Hybrid]: 'hybrid',
      [EventLocationType.All]: 'all',
    };

    // Filter events based on all criteria
    return eventsToFilter.filter(event => {
      // 1. Capacities filter
      let passedCapacitiesFilter = true;
      if (currentFilters.capacities && currentFilters.capacities.length > 0) {
        // If the event doesn't have related_skills, fail the filter
        if (
          !event.related_skills ||
          !Array.isArray(event.related_skills) ||
          event.related_skills.length === 0
        ) {
          passedCapacitiesFilter = false;
        } else {
          // Extract capacity codes from the filter and ensure they are numbers
          const filterCapacityCodes = currentFilters.capacities.map(cap => Number(cap.code));

          // Ensure the event's related_skills are numbers
          const eventSkillCodes = event.related_skills.map(skill =>
            typeof skill === 'number' ? skill : Number(skill)
          );

          // Check intersection between event capacities and filter capacities
          const eventHasMatchingCapacity = filterCapacityCodes.some(code =>
            eventSkillCodes.includes(code)
          );

          passedCapacitiesFilter = eventHasMatchingCapacity;
        }
      }

      // 2. Location type filter
      let passedLocationFilter = true;
      if (currentFilters.locationType && currentFilters.locationType !== EventLocationType.All) {
        // Get the value that the backend uses for this filter
        const expectedLocationValue = frontendToBackendLocationMap[currentFilters.locationType];

        // Handle special cases for 'hybrid' and 'in_person'
        if (currentFilters.locationType === EventLocationType.InPerson) {
          // For InPerson filter, ensure it's ONLY in_person (not hybrid)
          passedLocationFilter = event.type_of_location === 'in_person';
        } else if (currentFilters.locationType === EventLocationType.Hybrid) {
          // For Hybrid filter, ensure it's ONLY hybrid
          passedLocationFilter = event.type_of_location === 'hybrid';
        } else {
          // For other types (like Online/virtual), use normal equality check
          passedLocationFilter = event.type_of_location === expectedLocationValue;
        }
      }

      // 3. Organization filter
      let passedOrganizationFilter = true;
      if (currentFilters.organizationId) {
        passedOrganizationFilter = event.organization === currentFilters.organizationId;
      }

      // 4. Date filter
      let passedDateFilter = true;
      if (currentFilters.dateRange) {
        const eventDate = new Date(event.time_begin);

        // Filter by start date
        if (currentFilters.dateRange.startDate) {
          const startDate = new Date(currentFilters.dateRange.startDate);
          if (eventDate < startDate) {
            passedDateFilter = false;
          }
        }

        // Filter by end date
        if (currentFilters.dateRange.endDate) {
          const endDate = new Date(currentFilters.dateRange.endDate);
          endDate.setHours(23, 59, 59); // End of day
          if (eventDate > endDate) {
            passedDateFilter = false;
          }
        }
      }

      return (
        passedCapacitiesFilter &&
        passedLocationFilter &&
        passedOrganizationFilter &&
        passedDateFilter
      );
    });
  };

  // Helper function to filter all criteria except location
  const filterEventsWithoutLocation = (
    eventsToFilter: Event[],
    currentFilters?: EventFilterState
  ) => {
    if (!currentFilters) return eventsToFilter;

    return eventsToFilter.filter(event => {
      let passedCapacitiesFilter = true;
      let passedOrganizationFilter = true;
      let passedDateFilter = true;

      // Filter by capacities
      if (currentFilters.capacities && currentFilters.capacities.length > 0) {
        if (
          !event.related_skills ||
          !Array.isArray(event.related_skills) ||
          event.related_skills.length === 0
        ) {
          passedCapacitiesFilter = false;
        } else {
          const filterCapacityCodes = currentFilters.capacities.map(cap => cap.code);
          const hasMatchingCapacity = event.related_skills.some(skillId =>
            filterCapacityCodes.includes(skillId)
          );

          if (!hasMatchingCapacity) {
            passedCapacitiesFilter = false;
          }
        }
      }

      // Filter by organization
      if (currentFilters.organizationId) {
        if (event.organization !== currentFilters.organizationId) {
          passedOrganizationFilter = false;
        }
      }

      // Filter by date
      if (currentFilters.dateRange) {
        const eventBeginDate = new Date(event.time_begin);

        // Filter by start date
        if (currentFilters.dateRange.startDate) {
          const startDate = new Date(currentFilters.dateRange.startDate);
          if (eventBeginDate < startDate) {
            passedDateFilter = false;
          }
        }

        // Filter by end date
        if (currentFilters.dateRange.endDate) {
          const endDate = new Date(currentFilters.dateRange.endDate);
          endDate.setHours(23, 59, 59);
          if (eventBeginDate > endDate) {
            passedDateFilter = false;
          }
        }
      }

      return passedCapacitiesFilter && passedOrganizationFilter && passedDateFilter;
    });
  };

  useEffect(() => {
    const fetchEvents = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Fetch ALL events without limit/offset to ensure we have the complete set for filtering
        // We'll handle pagination after filtering
        const response = await eventsService.getEvents(undefined, undefined, filters);
        const eventsData = Array.isArray(response) ? response : response.results || [];

        // Store all unfiltered events
        setAllEvents(eventsData);

        // Apply all filters locally
        const filteredEvents = filterEventsLocally(eventsData, filters);

        // Update count based on filtered events
        setCount(filteredEvents.length);

        // Apply pagination after filtering - only needed when limit and offset are provided
        if (limit !== undefined && offset !== undefined) {
          const paginatedEvents = filteredEvents.slice(offset, offset + limit);
          setEvents(paginatedEvents);
        } else {
          setEvents(filteredEvents);
        }
      } catch (err) {
        console.error('Error fetching events:', err);
        setError(err instanceof Error ? err : new Error('Failed to fetch events'));
        setEvents([]);
        setCount(0);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvents();
  }, [
    token,
    limit,
    offset,
    // Refetch when these filters change
    filters?.locationType,
    filters?.capacities,
    filters?.organizationId,
    filters?.dateRange?.startDate,
    filters?.dateRange?.endDate,
  ]);

  // Re-apply filters locally when filters change
  useEffect(() => {
    if (allEvents.length > 0 && filters) {
      try {
        const filteredEvents = filterEventsLocally(allEvents, filters);
        setCount(filteredEvents.length);

        // Apply pagination locally
        if (limit !== undefined && offset !== undefined) {
          const paginatedEvents = filteredEvents.slice(offset, offset + limit);
          setEvents(paginatedEvents);
        } else {
          setEvents(filteredEvents);
        }
      } catch (err) {
        console.error('Error applying filters:', err);
        setError(err instanceof Error ? err : new Error('Error filtering events'));
      }
    }
  }, [filters, allEvents, limit, offset]);

  const fetchEventsByIds = async (eventIds: number[]) => {
    if (!token || !eventIds.length) {
      return [];
    }

    setIsLoading(true);
    try {
      const eventPromises = eventIds.map(id => eventsService.getEventById(id, token));

      const results = await Promise.allSettled(eventPromises);

      const loadedEvents = results
        .filter((result): result is PromiseFulfilledResult<Event> => result.status === 'fulfilled')
        .map(result => result.value);

      return loadedEvents;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch events by IDs'));
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  return {
    events,
    count,
    isLoading,
    error,
    fetchEventsByIds,
  };
}
