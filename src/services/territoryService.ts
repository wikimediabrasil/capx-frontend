import axios from 'axios';
import { Territories } from '@/types/territory';

export const fetchTerritories = async (token: string): Promise<Territories> => {
  const response = await axios.get<Territories>(`/api/list/territory/`, {
    headers: {
      Authorization: `Token ${token}`,
    },
  });

  return response.data;
};
