import { EventFilterState, EventLocationType } from '@/app/events/types';
import { Event } from '@/types/event';
import axios from 'axios';

interface EventsResponse {
  results: Event[];
  count: number;
}

const locationTypeToAPIMapping: Record<string, string> = {
  [EventLocationType.Online]: 'virtual',
  [EventLocationType.InPerson]: 'in_person',
  [EventLocationType.Hybrid]: 'hybrid',
  [EventLocationType.All]: 'all',
};

export const eventsService = {
  async getEvents(
    limit?: number,
    offset?: number,
    filters?: EventFilterState
  ): Promise<EventsResponse> {
    const params: any = {};

    // Adicionar parâmetros de paginação
    if (limit !== undefined) params.limit = limit;
    if (offset !== undefined) params.offset = offset;

    // Add filters if present
    if (filters) {
      // Add capacities as query string
      if (filters.capacities && filters.capacities.length > 0) {
        // Convert codes to string for the API
        const capacityCodes = filters.capacities.map(cap => cap.code.toString()).join(',');
        params.capacities = capacityCodes;
      }

      // Add territories
      if (filters.territories && filters.territories.length > 0) {
        params.territories = filters.territories.join(',');
      }

      // Add location type filter (online, physical, hybrid)
      if (filters.locationType && filters.locationType !== EventLocationType.All) {
        // Convert frontend to API format
        const locationValue =
          locationTypeToAPIMapping[filters.locationType] || filters.locationType;

        // For specific types, use specific values for backend
        if (filters.locationType === EventLocationType.InPerson) {
          params.location_type = 'in_person';
        } else if (filters.locationType === EventLocationType.Hybrid) {
          params.location_type = 'hybrid';
        } else if (filters.locationType === EventLocationType.Online) {
          params.location_type = 'virtual';
        } else {
          params.location_type = locationValue;
        }
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
      const response = await axios.get('/api/events/', {
        params,
      });

      // If the response is already in the format { results, count }, return it directly
      if (response.data && typeof response.data === 'object' && 'results' in response.data) {
        return response.data;
      }

      // Otherwise, format the response to the expected format
      return {
        results: Array.isArray(response.data) ? response.data : [],
        count: response.headers['x-total-count']
          ? parseInt(response.headers['x-total-count'])
          : Array.isArray(response.data)
            ? response.data.length
            : 0,
      };
    } catch (error) {
      console.error('Erro ao buscar eventos:', error);
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
      if (response.data.organization === undefined || response.data.organization === null) {
        console.warn(
          `eventService: event ${eventId} does not have organization field`,
          response.data
        );
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
    const payload = {
      ...event,
      type_of_location: event.type_of_location || 'virtual',
    };
    try {
      const response = await axios.post('/api/events/', payload, {
        headers,
      });
      return response.data;
    } catch (error) {
      console.error('Error creating event:', error);
      throw error;
    }
  },

  async updateEvent(eventId: number, event: Partial<Event>, token: string): Promise<Event> {
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
      console.error('Error deleting event:', error);
      throw error;
    }
  },
};
