import axios from 'axios';

interface QueryData {
  headers: {
    Authorization: string;
  };
  limit?: number;
  offset?: number;
}

export const skillService = {
  async fetchSkills(queryData: QueryData) {
    try {
      const response = await axios.get('api/skill', {
        headers: queryData.headers,
        params: {
          limit: queryData.limit,
          offset: queryData.offset,
        },
      });

      return response.data;
    } catch (error) {
      console.error('Failed to fetch skills:', error);
      throw error;
    }
  },
  async fetchSkillById(id: string, queryData: QueryData) {
    try {
      const response = await axios.get(`/api/skill/${id}`, {
        headers: queryData.headers,
      });
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch skill ${id}:`, error);
      throw error;
    }
  },
};
