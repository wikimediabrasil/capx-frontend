import axios from 'axios';
import { Territories } from '@/types/territory';

export const fetchTerritories = async (token?: string): Promise<Territories> => {
  const headers: Record<string, string> = {};
  if (token) {
    headers.Authorization = `Token ${token}`;
  }

  const response = await axios.get<Territories>(`/api/list/territory/`, {
    headers,
  });

  return response.data;
};
