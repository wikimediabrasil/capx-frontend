import { Event } from "@/types/event";
import axios from "axios";

export const eventsService = {
  async getEventById(
    eventId: number,
    token: string,
    limit?: number,
    offset?: number
  ): Promise<Event> {
    try {
      const response = await axios.get(`/api/events/${eventId}`, {
        headers: {
          Authorization: `Token ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching event:", error);
      throw error;
    }
  },

  async createEvent(event: Partial<Event>, token: string): Promise<Event> {
    try {
      const response = await axios.post("/api/events/", event, {
        headers: { Authorization: `Token ${token}` },
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
      type_of_location: event.type_of_location || "virtual",
    };

    const response = await axios.put(`/api/events/${eventId}/`, payload, {
      headers: {
        Authorization: `Token ${token}`,
        "Content-Type": "application/json",
      },
    });
    return response.data;
  },

  async deleteEvent(eventId: number, token: string): Promise<void> {
    await axios.delete(`/api/events/${eventId}/`, {
      headers: { Authorization: `Token ${token}` },
    });
  },
};
