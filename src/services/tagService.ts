import axios from 'axios';
import { QueryData } from '@/types/capacity';

interface TagResponse {
  data: {
    code: string;
    name: string;
    users: any[];
  };
}

export const tagService = {
  async fetchTagById(id: string, category: string, queryData: QueryData): Promise<TagResponse> {
    try {
      const response = await axios.get(`/api/tag`, {
        params: { id, category, ...queryData.params },
        headers: queryData.headers,
      });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch tag:', error);
      throw error;
    }
  },

  async fetchTagsByCategory(
    category: string,
    queryData: QueryData
  ): Promise<Record<string, string>> {
    try {
      const response = await axios.get(`/api/list/${category}`, {
        params: queryData.params,
        headers: queryData.headers,
      });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch tags by category:', error);
      throw error;
    }
  },
};
