import { EventFilterState } from '@/app/events/types';
import { eventsService } from '@/services/eventService';
import { Event } from '@/types/event';
import { useEffect, useState } from 'react';

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
        type_of_location: data.type_of_location || 'virtual',
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
  const [count, setCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Stable string dep for capacities array to avoid refetching on reference changes
  const capacitiesDep = filters?.capacities?.map(c => c.code).join(',') ?? '';

  useEffect(() => {
    const fetchEvents = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await eventsService.getEvents(limit, offset, filters);
        const eventsData = Array.isArray(response) ? response : response.results || [];
        const totalCount = Array.isArray(response) ? eventsData.length : response.count || 0;

        setEvents(eventsData);
        setCount(totalCount);
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
    filters?.locationType,
    capacitiesDep,
    filters?.organizationId,
    filters?.dateRange?.startDate,
    filters?.dateRange?.endDate,
  ]);

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
