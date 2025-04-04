import { Event } from "@/types/event";
import axios from "axios";

export const eventsService = {
  async getEvents(
    token: string,
    limit?: number,
    offset?: number
  ): Promise<Event[]> {
    const headers = { Authorization: `Token ${token}` };
    const params = { limit, offset };

    try {
      const response = await axios.get("/api/events/", {
        headers,
        params,
      });

      return response.data;
    } catch (error) {
      console.error("Erro ao buscar eventos:", error);
      throw error;
    }
  },

  async getEventById(eventId: number, token: string): Promise<Event> {
    try {
      const response = await axios.get(`/api/events/${eventId}`, {
        headers: {
          Authorization: token,
        },
      });
      return response.data;
    } catch (error) {
      console.error(`Erro ao buscar evento ${eventId}:`, error);
      throw error;
    }
  },

  async createEvent(event: Partial<Event>, token: string): Promise<Event> {
    try {
      const response = await axios.post("/api/events/", event, {
        headers: { Authorization: token },
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

    const response = await axios.put(`/api/events/${eventId}/`, payload, {
      headers: {
        Authorization: token,
        "Content-Type": "application/json",
      },
    });
    return response.data;
  },

  async deleteEvent(eventId: number, token: string): Promise<void> {
    try {
      await axios.delete(`/api/events/${eventId}/`, {
        headers: { Authorization: token },
      });
    } catch (error) {
      console.error("Error deleting event:", error);
      throw error;
    }
  },
};
