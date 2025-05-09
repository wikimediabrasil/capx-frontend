import { useState, useEffect, useCallback } from "react";
import { Event } from "@/types/event";
import { eventsService } from "@/services/eventService";

export function useOrganizationEvents(
  organizationId: number | string,
  token?: string
) {
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const organizationIdNum = Number(organizationId);

  // Load events from organization
  const fetchOrganizationEvents = useCallback(async () => {
    setIsLoading(true);
    try {
      // Search all events
      const response = await eventsService.getEvents();

      // Verify if we got valid data
      if (!response) {
        console.error("Empty response from events API");
        return [];
      }

      // Extract events list from response
      const allEvents = response.results || [];

      // Ensure allEvents is an array before using filter
      if (!Array.isArray(allEvents)) {
        console.error("Events data is not an array:", allEvents);
        return [];
      }

      // Filter only events related to this organization
      const organizationEvents = allEvents.filter(
        (event) =>
          event &&
          (event.organization === organizationIdNum ||
            Number(event.organization) === organizationIdNum)
      );

      setEvents(organizationEvents);
      setError(null);
      return organizationEvents;
    } catch (err) {
      const errorMessage = "Falha ao carregar eventos da organização";
      setError(err instanceof Error ? err : new Error(errorMessage));
      console.error(errorMessage, err);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [token, organizationId, organizationIdNum]);

  // Load events by specific IDs
  const fetchEventsByIds = useCallback(
    async (eventIds: number[]) => {
      if (!token || !eventIds.length) return [];

      setIsLoading(true);
      try {
        // Create promises for each event
        const eventPromises = eventIds.map((id) => {
          // For each ID, create a promise that tries to search the event, but does not fail the entire promise
          return eventsService
            .getEventById(id, token)
            .then((event) => {
              return event;
            })
            .catch((error) => {
              console.error(`Error loading event ID ${id}:`, error);
              return null; // Return null in case of error to not interrupt the others
            });
        });

        // Wait for all promises, even the ones that failed
        const results = await Promise.all(eventPromises);

        // Filter nulls and events without relation to the organization
        const loadedEvents = results
          .filter((event): event is Event => {
            if (!event) {
              return false;
            }
            return true;
          })
          .filter((event) => {
            // Verify if the event belongs to the organization by the organization or organizations field

            const matchesOrganization =
              event.organization === organizationIdNum ||
              Number(event.organization) === organizationIdNum;

            if (!matchesOrganization) {
              console.warn(
                `Event ID ${event.id} does not belong to organization ${organizationIdNum}`,
                {
                  organization: event.organization,
                }
              );
            }

            return matchesOrganization;
          });

        setEvents(loadedEvents);
        return loadedEvents;
      } catch (err) {
        const errorMessage = "Falha ao carregar eventos por IDs";
        setError(err instanceof Error ? err : new Error(errorMessage));
        console.error(errorMessage, err);
        return [];
      } finally {
        setIsLoading(false);
      }
    },
    [token, organizationIdNum]
  );

  // Create a new event for the organization
  const createEvent = useCallback(
    async (eventData: Partial<Event>) => {
      if (!token) {
        throw new Error("Token not available to create event");
      }

      setIsLoading(true);
      try {
        // Ensure organization is configured correctly
        const preparedData = {
          ...eventData,
          organization: organizationIdNum, // Use mainly the organization field
        };

        // Keep organizations for compatibility with legacy code
        if (!preparedData.organization) {
          preparedData.organization = organizationIdNum;
        }

        const createdEvent = await eventsService.createEvent(
          preparedData,
          token
        );

        // Verify if the event was created correctly with the organization
        if (createdEvent.organization !== organizationIdNum) {
          console.warn(
            "WARNING: The event was created, but with the wrong organization",
            {
              eventId: createdEvent.id,
              organizationId: organizationIdNum,
              eventOrganization: createdEvent.organization,
            }
          );
        }

        // Update the events list
        setEvents((prevEvents) => [...prevEvents, createdEvent]);

        return createdEvent;
      } catch (err) {
        const errorMessage = "Failed to create event";
        setError(err instanceof Error ? err : new Error(errorMessage));
        console.error(errorMessage, err);
        // Detailed error log
        if (err.response) {
          console.error("API error details:", {
            status: err.response.status,
            data: err.response.data,
          });
        }
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [token, organizationIdNum]
  );

  // Update an existing event
  const updateEvent = useCallback(
    async (eventId: number, eventData: Partial<Event>) => {
      if (!token) {
        throw new Error("Token not available to update event");
      }

      setIsLoading(true);
      try {
        // Ensure organization is defined correctly
        const preparedData = {
          ...eventData,
          organization: organizationIdNum,
        };

        const updatedEvent = await eventsService.updateEvent(
          eventId,
          preparedData,
          token
        );

        // Verify if the event was updated correctly
        if (updatedEvent.organization !== organizationIdNum) {
          console.warn(
            "WARNING: The event was updated, but with the wrong organization",
            {
              eventId: updatedEvent.id,
              organizationId: organizationIdNum,
              eventOrganization: updatedEvent.organization,
            }
          );
        }

        // Update the events list
        setEvents((prevEvents) =>
          prevEvents.map((event) =>
            event.id === eventId ? updatedEvent : event
          )
        );

        return updatedEvent;
      } catch (err) {
        const errorMessage = "Failed to update event";
        setError(err instanceof Error ? err : new Error(errorMessage));
        console.error(errorMessage, err);
        // Detailed error log
        if (err.response) {
          console.error("API error details:", {
            status: err.response.status,
            data: err.response.data,
          });
        }
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [token, organizationIdNum]
  );

  // Delete an event
  const deleteEvent = useCallback(
    async (eventId: number) => {
      if (!token) {
        throw new Error("Token not available to delete event");
      }

      setIsLoading(true);
      try {
        await eventsService.deleteEvent(eventId, token);

        // Remove the event from the list
        setEvents((prevEvents) =>
          prevEvents.filter((event) => event.id !== eventId)
        );

        return true;
      } catch (err) {
        const errorMessage = "Failed to delete event";
        setError(err instanceof Error ? err : new Error(errorMessage));
        console.error(errorMessage, err);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [token]
  );

  // Load events automatically when initializing
  useEffect(() => {
    fetchOrganizationEvents();
  }, [fetchOrganizationEvents]);

  return {
    events,
    isLoading,
    error,
    fetchOrganizationEvents,
    fetchEventsByIds,
    createEvent,
    updateEvent,
    deleteEvent,
  };
}
