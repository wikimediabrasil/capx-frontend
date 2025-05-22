import axios from "axios";
import { BadgesResponse } from "@/types/badge";

export class BadgeService {
  static async getBadges(token?: string): Promise<BadgesResponse> {
    try {
      const response = await axios.get("/api/badges", {
        headers: {
          Authorization: `Token ${token}`,
          "Content-Type": "application/json",
        },
      });
      return response.data;
    } catch (error) {
      console.error("Failed to get badges:", error);
      throw error;
    }
  }

  static async getBadgeById(badgeId: string, token?: string): Promise<BadgesResponse> {
    try {
      const response = await axios.get(`/api/badges?badgeId=${badgeId}`, {
        headers: {
          Authorization: `Token ${token}`,
          "Content-Type": "application/json",
        },
      });
      return response.data;
    } catch (error) {
      console.error("Failed to get badge by id:", error);
      throw error;
    }
  }
}
