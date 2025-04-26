import axios from "axios";
import { SavedItem } from "@/types/saved_item";

export interface SavedItemFilters {
  limit?: number;
  offset?: number;
}

export interface SavedItemCreate {
  relation: string;
  entity: string;
  entity_id: number;
}

export const savedItemService = {
  async getSavedItems(token: string, filters: SavedItemFilters) {
    if (!token) return { count: 0, results: [] };

    const params = new URLSearchParams();

    if (filters.limit) {
      params.append('limit', filters.limit.toString());
    }

    if (filters.offset) {
      params.append('offset', filters.offset.toString());
    }

    try {
      const response = await axios.get("/api/saved_item/", {
        params,
        headers: { Authorization: `Token ${token}` },
        paramsSerializer: {
          indexes: null // Ensure arrays are serialized correctly
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching saved items:', error);
      return { count: 0, results: [] };
    }
  },

  async deleteSavedItem(token: string, itemId: number): Promise<boolean> {
    if (!token || !itemId) return false;

    try {
      await axios.delete(`/api/saved_item/${itemId}/`, {
        headers: { Authorization: `Token ${token}` },
      });
      return true;
    } catch (error) {
      console.error(`Error deleting saved item with ID ${itemId}:`, error);
      return false;
    }
  },

  async createSavedItem(token: string, item: SavedItemCreate): Promise<SavedItem | null> {
    if (!token || !item.entity_id) return null;

    try {
      const response = await axios.post("/api/saved_item/", item, {
        headers: { Authorization: `Token ${token}` },
      });
      return response.data;
    } catch (error) {
      console.error(`Error creating saved item:`, error);
      return null;
    }
  }
};
