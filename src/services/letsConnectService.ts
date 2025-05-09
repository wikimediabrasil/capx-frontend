import { LetsConnect } from "@/types/lets_connect";
import axios from "axios";

export interface LetsConnectServiceParams {
  letsConnect: Partial<LetsConnect>;
  token: string;
}

export class LetsConnectService {
  static async submitLetsConnectForm({
    letsConnect,
    token
  }: LetsConnectServiceParams): Promise<any> {
    try {
      const response = await axios.post(
        "/api/lets_connect",
        {
          full_name: letsConnect.full_name,
          email: letsConnect.email,
          role: letsConnect.role,
          area: Array.isArray(letsConnect.area)
            ? letsConnect.area.join(", ")
            : letsConnect.area,
          gender: letsConnect.gender,
          age: letsConnect.age
        },
        {
          headers: {
            Authorization: `Token ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("LetsConnectService response", response.data)
      console.log("LetsConnectService response data", response.data)
      return response.data;
    } catch (error) {
      console.error("Failed to send lets connect data:", error);
      throw error;
    }
  }

  static async getLetsConnect(token?: string): Promise<LetsConnect[]> {
    try {
      const response = await axios.get("/api/lets_connect", {
        headers: {
          Authorization: `Token ${token}`,
        "Content-Type": "application/json",
      },
    });
    return response.data;
    } catch (error) {
      console.error("Failed to get lets connect data:", error);
      throw error;
    }
  }
}
