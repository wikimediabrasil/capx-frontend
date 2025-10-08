import axios from 'axios';
import type { Affiliations } from '@/types/affiliation';

export const affiliationsListService = {
  /** Server-side: fetch affiliation id->name map from backend (uses BASE_URL) */
  async fetchAll(token: string): Promise<Affiliations> {
    if (!token) return {};
    const resp = await axios.get<Affiliations>(`${process.env.BASE_URL}/list/affiliation/`, {
      headers: { Authorization: `Token ${token}` },
    });
    return resp.data || {};
  },
};
