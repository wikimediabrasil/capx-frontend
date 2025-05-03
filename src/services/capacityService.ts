import axios, { AxiosRequestConfig } from "axios";
import { Capacity, CapacityResponse, QueryData } from "@/types/capacity";

export const capacityService = {
  async fetchCapacities(queryData: QueryData): Promise<CapacityResponse[]> {
    try {
      const response = await axios.get("/api/capacity", {
        params: queryData.params,
        headers: queryData.headers,
      });
      return response.data;
    } catch (error) {
      console.error("Failed to fetch capacities:", error);
      throw error;
    }
  },

  async fetchCapacitiesByType(
    type: string,
    config?: AxiosRequestConfig
  ): Promise<CapacityResponse[]> {
    try {
      const response = await axios.get(`/api/capacity/type/${type}`, config);
      return response.data;
    } catch (error) {
      console.error("Service - Error:", error);
      throw error;
    }
  },

  async fetchCapacityDescription(
    code: number,
    config?: AxiosRequestConfig
  ): Promise<{ description: string; wdCode: string }> {
    try {
      const response = await axios.get(`/api/capacity/${code}`, config);
      return {
        description: response.data.description || "",
        wdCode: response.data.wd_code || "",
      };
    } catch (error) {
      console.error("Failed to fetch capacity description:", error);
      throw error;
    }
  },

  async fetchCapacityById(
    id: string,
    queryData: QueryData
  ): Promise<CapacityResponse> {
    try {
      const response = await axios.get(`/api/capacity/${id}`, {
        params: queryData.params,
        headers: queryData.headers,
      });

      // Ensure the response has a valid name field
      if (!response.data.name || response.data.name === `Capacity ${id}`) {
        console.warn(
          `⚠️ Capacity ${id} returned generic name or no name:`,
          response.data.name
        );
      }

      return response.data;
    } catch (error) {
      console.error(`💥 Failed to fetch capacity ${id}:`, error);
      throw error;
    }
  },

  async updateCapacities(
    data: Partial<Capacity>,
    queryData: QueryData
  ): Promise<void> {
    try {
      await axios.put(`/api/capacity`, data, {
        headers: queryData.headers,
        params: queryData.params,
      });
    } catch (error) {
      console.error("Failed to update capacities:", error);
      throw error;
    }
  },

  async searchCapacities(
    search: string,
    config?: AxiosRequestConfig
  ): Promise<CapacityResponse[]> {
    try {
      const response = await axios.get(`/api/capacity/search`, {
        params: { q: search },
        headers: config?.headers,
      });
      return response.data;
    } catch (error) {
      console.error("Failed to search capacities:", error);
      throw error;
    }
  },
};
