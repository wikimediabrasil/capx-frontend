import { Event } from "@/types/event";
import axios from "axios";

interface EventsResponse {
  results: Event[];
  count: number;
}

export const eventsService = {
  async getEvents(
    token: string,
    limit?: number,
    offset?: number
  ): Promise<EventsResponse> {
    const headers = { Authorization: `Token ${token}` };
    const params = { limit, offset };

    try {
      const response = await axios.get("/api/events/", {
        headers,
        params,
      });

      // Se a resposta já estiver no formato { results, count }, retorná-la diretamente
      if (
        response.data &&
        typeof response.data === "object" &&
        "results" in response.data
      ) {
        return response.data;
      }

      // Caso contrário, formatar a resposta para o formato esperado
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
      return response.data;
    } catch (error) {
      console.error(`Erro ao buscar evento ${eventId}:`, error);
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
