import { useState, useEffect } from "react";
import { Event } from "@/types/event";
import { eventsService } from "@/services/eventService";
import { EventFilterState } from "@/app/events/types";

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
        setError(
          err instanceof Error ? err : new Error("Failed to fetch event")
        );
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
        throw new Error("Invalid event response from server");
      }
      setEvent(response);
      return response;
    } catch (error) {
      setError(
        error instanceof Error ? error : new Error("Failed to create event")
      );
      throw error;
    }
  };

  const updateEvent = async (eventId: number, data: Partial<Event>) => {
    if (!token || !eventId) return;
    try {
      const eventData = {
        ...data,
      };

      const response = await eventsService.updateEvent(
        eventId,
        eventData,
        token
      );
      if (!response || !response.id) {
        throw new Error("Invalid event response from server");
      }
      setEvent(response);
      return response;
    } catch (error) {
      setError(
        error instanceof Error ? error : new Error("Failed to update event")
      );
      throw error;
    }
  };

  const deleteEvent = async (eventId: number) => {
    if (!token || !eventId) return;
    try {
      await eventsService.deleteEvent(eventId, token);
      setEvent(null);
    } catch (error) {
      setError(
        error instanceof Error ? error : new Error("Failed to delete event")
      );
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

  useEffect(() => {
    const fetchEvents = async () => {
      setIsLoading(true);
      try {
        const response = await eventsService.getEvents(limit, offset, filters);

        const eventsData = Array.isArray(response)
          ? response
          : response.results || [];
        const totalCount = Array.isArray(response)
          ? eventsData.length
          : response.count !== undefined
          ? response.count
          : eventsData.length;

        // Update total count
        setCount(totalCount);
        setEvents(eventsData);

        setError(null);
      } catch (err) {
        console.error("Error fetching events:", err);
        setError(
          err instanceof Error ? err : new Error("Failed to fetch events")
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvents();
  }, [token, limit, offset, organizationId, filters]);

  const fetchEventsByIds = async (eventIds: number[]) => {
    if (!token || !eventIds.length) {
      return [];
    }

    setIsLoading(true);
    try {
      const eventPromises = eventIds.map((id) =>
        eventsService.getEventById(id, token)
      );

      const results = await Promise.allSettled(eventPromises);

      const loadedEvents = results
        .filter(
          (result): result is PromiseFulfilledResult<Event> =>
            result.status === "fulfilled"
        )
        .map((result) => result.value);

      return loadedEvents;
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error("Failed to fetch events by IDs")
      );
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
