import axios from 'axios';
import { Affiliations } from '@/types/affiliation';

interface QueryData {
  params?: {
    userId?: number;
    username?: string;
    language?: string;
  };
  headers: {
    Authorization: string;
  };
}

export const fetchAffiliations = async (queryData: QueryData): Promise<Affiliations> => {
  try {
    const response = await axios.get(`/api/list/affiliation/`, {
      params: queryData.params,
      headers: queryData.headers,
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching affiliations:', error);
    throw error;
  }
};
