import { Event } from "@/types/event";
import axios from "axios";
import { EventFilterState, EventLocationType } from "@/app/events/types";

interface EventsResponse {
  results: Event[];
  count: number;
}

export const eventsService = {
  async getEvents(
    limit?: number,
    offset?: number,
    filters?: EventFilterState
  ): Promise<EventsResponse> {
    const params: any = { limit, offset };

    // Add filters if present
    if (filters) {
      // Add capacities as query string
      if (filters.capacities && filters.capacities.length > 0) {
        params.capacities = filters.capacities.map((cap) => cap.code).join(",");
      }

      // Add territories
      if (filters.territories && filters.territories.length > 0) {
        params.territories = filters.territories.join(",");
      }

      // Add location type filter (online, physical, hybrid)
      if (
        filters.locationType &&
        filters.locationType !== EventLocationType.All
      ) {
        params.location_type = filters.locationType;
      }

      // Add start date filter
      if (filters.dateRange?.startDate) {
        params.start_date = filters.dateRange.startDate;
      }

      // Add end date filter
      if (filters.dateRange?.endDate) {
        params.end_date = filters.dateRange.endDate;
      }

      // Add organization filter
      if (filters.organizationId) {
        params.organization_id = filters.organizationId;
      }
    }

    try {
      const response = await axios.get("/api/events/", {
        params,
      });

      // If the response is already in the format { results, count }, return it directly
      if (
        response.data &&
        typeof response.data === "object" &&
        "results" in response.data
      ) {
        return response.data;
      }

      // Otherwise, format the response to the expected format
      return {
        results: Array.isArray(response.data) ? response.data : [],
        count: response.headers["x-total-count"]
          ? parseInt(response.headers["x-total-count"])
          : Array.isArray(response.data)
          ? response.data.length
          : 0,
      };
    } catch (error) {
      console.error("Erro ao buscar eventos:", error);
      throw error;
    }
  },

  async getEventById(eventId: number, token: string): Promise<Event> {
    const headers = { Authorization: `Token ${token}` };

    try {
      const response = await axios.get(`/api/events/${eventId}`, {
        headers,
      });

      // Check if the response is valid
      if (!response.data) {
        console.warn(`eventService: response for event ${eventId} is empty`);
        throw new Error(`Empty response when searching for event ${eventId}`);
      }

      // Check if the response contains the expected fields
      if (!response.data.id) {
        console.warn(
          `eventService: event ${eventId} does not contain ID in the response`,
          response.data
        );
      }

      // Check if the organization field exists
      if (
        response.data.organization === undefined ||
        response.data.organization === null
      ) {
        console.warn(
          `eventService: event ${eventId} does not have organization field`,
          response.data
        );
      }

      // Manter a compatibilidade com código que ainda espera organizations
      if (
        !response.data.organizations ||
        !Array.isArray(response.data.organizations)
      ) {
        console.warn(
          `eventService: event ${eventId} does not have organizations field, creating compatible array`,
          response.data
        );
        // Create an empty array if the organizations field does not exist or is not an array
        response.data.organizations = [];

        // If we have organization, add it to the organizations array to maintain compatibility
        if (response.data.organization) {
          response.data.organizations.push(Number(response.data.organization));
        }
      }

      return response.data;
    } catch (error) {
      console.error(`Error searching for event ${eventId}:`, error);
      if (error.response) {
        console.error(`Details of error for event ${eventId}:`, {
          status: error.response.status,
          data: error.response.data,
        });
      }
      throw error;
    }
  },

  async createEvent(event: Partial<Event>, token: string): Promise<Event> {
    const headers = { Authorization: `Token ${token}` };
    try {
      const response = await axios.post("/api/events/", event, {
        headers,
      });
      return response.data;
    } catch (error) {
      console.error("Error creating event:", error);
      throw error;
    }
  },

  async updateEvent(
    eventId: number,
    event: Partial<Event>,
    token: string
  ): Promise<Event> {
    const payload = {
      ...event,
    };

    const headers = { Authorization: `Token ${token}` };

    const response = await axios.put(`/api/events/${eventId}/`, payload, {
      headers,
    });
    return response.data;
  },

  async deleteEvent(eventId: number, token: string): Promise<void> {
    const headers = { Authorization: `Token ${token}` };

    try {
      await axios.delete(`/api/events/${eventId}/`, {
        headers,
      });
    } catch (error) {
      console.error("Error deleting event:", error);
      throw error;
    }
  },
};
