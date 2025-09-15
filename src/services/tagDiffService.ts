import { tagDiff } from '@/types/tagDiff';
import axios from 'axios';

export const tagDiffService = {
  async fetchSingleNews(token: string, id: number): Promise<tagDiff> {
    const response = await axios.get<tagDiff>(`/api/tag_diff/${id}/`, {
      headers: { Authorization: `Token ${token}` },
    });
    return response.data;
  },
  async fetchAllNews(token: string, limit?: number, offset?: number): Promise<tagDiff[]> {
    const response = await axios.get<tagDiff[]>('/api/tag_diff/', {
      headers: { Authorization: `Token ${token}` },
      params: { limit, offset },
    });
    return response.data;
  },
  async createTag(tag: Partial<tagDiff>, token: string): Promise<tagDiff> {
    const response = await axios.post('/api/tag_diff/', tag, {
      headers: {
        Authorization: `Token ${token}`,
        'Content-Type': 'application/json',
      },
    });
    if (!response.data) {
      throw new Error('Empty response from server');
    }
    return response.data;
  },
  async deleteNews(token: string, id: number): Promise<void> {
    await axios.delete(`/api/tag_diff/${id}/`, {
      headers: { Authorization: `Token ${token}` },
    });
  },
};
