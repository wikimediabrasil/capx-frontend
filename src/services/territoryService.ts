import axios from 'axios';
import { Territory, TerritoriesResponse } from '@/types/territory';

export const fetchTerritories = async (token?: string): Promise<Territory[]> => {
  const headers: Record<string, string> = {};
  if (token) {
    headers.Authorization = `Token ${token}`;
  }

  const results: Territory[] = [];
  let nextQuery: string | null = null;

  do {
    const url = nextQuery ? `/api/territory/?${nextQuery}` : `/api/territory/`;

    const response = await axios.get<TerritoriesResponse>(url, { headers });
    results.push(...response.data.results);

    // Extract only the query string from the absolute next URL so we can proxy it correctly
    if (response.data.next) {
      try {
        nextQuery = new URL(response.data.next).search.replace(/^\?/, '');
      } catch {
        nextQuery = null;
      }
    } else {
      nextQuery = null;
    }
  } while (nextQuery);

  return results;
};
