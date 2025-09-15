import axios from "axios";

export interface LetsConnectExistsResponse {
  exists: boolean;
}

export class LetsConnectExistsService {
  static async checkUserExists(username: string, token: string): Promise<LetsConnectExistsResponse> {
    try {
      const response = await axios.get(`/api/lets_connect/exists?username=${encodeURIComponent(username)}`, {
        headers: {
          Authorization: `Token ${token}`,
        },
      });

      return response.data;
    } catch (error) {
      console.error("Failed to check if user exists in LetsConnect:", error);
      throw error;
    }
  }
}
