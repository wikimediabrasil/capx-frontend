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
    if (!token || !organizationId) return [];

    setIsLoading(true);
    try {
      // Search all events
      const response = await eventsService.getEvents(token);

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
            Number(event.organization) === organizationIdNum ||
            (event.organizations &&
              Array.isArray(event.organizations) &&
              event.organizations.includes(organizationIdNum)))
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
        console.log(
          `Iniciando carregamento de ${eventIds.length} eventos por IDs:`,
          eventIds
        );

        // Create promises for each event
        const eventPromises = eventIds.map((id) => {
          // For each ID, create a promise that tries to search the event, but does not fail the entire promise
          console.log(`Trying to load event ID ${id}`);
          return eventsService
            .getEventById(id, token)
            .then((event) => {
              console.log(
                `Evento ID ${id} carregado com sucesso:`,
                event
                  ? `${event.name} (organizations: ${event.organizations})`
                  : "Resposta nula"
              );
              return event;
            })
            .catch((error) => {
              console.error(`Error loading event ID ${id}:`, error);
              return null; // Return null in case of error to not interrupt the others
            });
        });

        // Wait for all promises, even the ones that failed
        const results = await Promise.all(eventPromises);
        console.log(
          `Raw results of ${results.length} events: `,
          results.map((e) => (e ? `ID ${e.id} (OK)` : "failed"))
        );

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
            const hasOldOrganizations =
              Array.isArray(event.organizations) &&
              event.organizations.includes(organizationIdNum);

            const matchesOrganization =
              event.organization === organizationIdNum ||
              Number(event.organization) === organizationIdNum;

            if (!matchesOrganization && !hasOldOrganizations) {
              console.warn(
                `Event ID ${event.id} does not belong to organization ${organizationIdNum}`,
                {
                  organization: event.organization,
                  organizations: event.organizations,
                }
              );
            }

            // Event belongs to the organization if organization is equal or organizations includes the ID
            return matchesOrganization || hasOldOrganizations;
          });

        console.log("Events loaded successfully:", loadedEvents.length);
        console.log(
          "Details of loaded events:",
          loadedEvents.map((e) => ({
            id: e.id,
            name: e.name,
            organizations: e.organizations,
          }))
        );

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
        console.log("useOrganizationEvents - Initial event data:", eventData);

        // Ensure organization is configured correctly
        const preparedData = {
          ...eventData,
          organization: organizationIdNum, // Use mainly the organization field
        };

        // Keep organizations for compatibility with legacy code
        if (
          !preparedData.organizations ||
          !Array.isArray(preparedData.organizations)
        ) {
          preparedData.organizations = [];
        }

        // Ensure organizationId is in organizations for compatibility
        if (!preparedData.organizations.includes(organizationIdNum)) {
          preparedData.organizations.push(organizationIdNum);
        }

        console.log("useOrganizationEvents - Processed event data:", {
          organizationIdNum,
          organization: preparedData.organization,
          organizations: preparedData.organizations,
          prepared: preparedData,
        });

        const createdEvent = await eventsService.createEvent(
          preparedData,
          token
        );

        console.log("useOrganizationEvents - Event created:", createdEvent);

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
        console.log("useOrganizationEvents - Updating event:", {
          eventId,
          data: eventData,
        });

        // Ensure organization is defined correctly
        const preparedData = {
          ...eventData,
          organization: organizationIdNum,
        };

        // Keep organizations for compatibility
        if (
          !preparedData.organizations ||
          !Array.isArray(preparedData.organizations)
        ) {
          preparedData.organizations = [];
        }

        // Ensure organizationId is in organizations for compatibility
        if (!preparedData.organizations.includes(organizationIdNum)) {
          preparedData.organizations.push(organizationIdNum);
        }

        console.log("useOrganizationEvents - Processed data for update:", {
          organizationIdNum,
          organization: preparedData.organization,
          organizations: preparedData.organizations,
          prepared: preparedData,
        });

        const updatedEvent = await eventsService.updateEvent(
          eventId,
          preparedData,
          token
        );

        console.log("useOrganizationEvents - Event updated:", updatedEvent);

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
