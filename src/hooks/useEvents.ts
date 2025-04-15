import { useState, useEffect } from "react";
import { Event } from "@/types/event";
import { eventsService } from "@/services/eventService";
import { EventFilterState } from "@/app/events/types";

export function useEvent(
  eventId?: number,
  token: string,
  limit?: number,
  offset?: number
) {
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
      // Ensure the organizations field is correctly initialized
      const eventData = {
        ...data,
        organizations: data.organizations || [],
      };

      // If there is no explicit organization_id, but there is an organization, use this value
      if (
        !eventData.organizations.includes(Number(data.organization)) &&
        data.organization
      ) {
        eventData.organizations = [
          ...eventData.organizations,
          Number(data.organization),
        ];
      }

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
      // Ensure the organizations field is correctly maintained
      const eventData = {
        ...data,
      };

      // If there is no explicit organization_id, but there is an organization, use this value
      if (
        data.organization &&
        data.organizations &&
        !data.organizations.includes(Number(data.organization))
      ) {
        eventData.organizations = [
          ...data.organizations,
          Number(data.organization),
        ];
      }

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
  token: string,
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
      if (!token) {
        console.error("Token not available, cannot search for events");
        return;
      }

      setIsLoading(true);
      try {
        const response = await eventsService.getEvents(
          token,
          limit,
          offset,
          filters
        );

        // The API should return { results: Event[], count: number }
        const eventsData = Array.isArray(response)
          ? response
          : response.results || [];
        const totalCount =
          !Array.isArray(response) && response.count
            ? response.count
            : eventsData.length;

        // Update total count
        setCount(totalCount);

        // If an organizationId was provided, filter events belonging to that organization
        if (organizationId) {
          const organizationEvents = eventsData.filter(
            (event) =>
              event.organizations &&
              event.organizations.includes(organizationId)
          );
          setEvents(organizationEvents);
        } else {
          setEvents(eventsData);
        }

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

  // Method specific to search events by IDs
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
