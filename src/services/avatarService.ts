import axios from 'axios';
import { Avatar } from '@/types/avatar';

export const avatarService = {
  fetchAvatars: async (config?: any): Promise<Avatar[]> => {
    const headers = {
      ...config?.headers,
      'Content-Type': 'application/json',
    };

    const searchParams = config?.params;
    const limit = searchParams?.limit;
    const offset = searchParams?.offset;

    const response = await axios.get('/api/avatar', {
      ...config,
      headers,
      withCredentials: true,
      params: { limit, offset },
    });

    // Filter out avatar 0 from the list of results, because it's reserved for Wikidata images
    return response.data.filter((avatar: Avatar) => avatar.id !== 0);
  },

  fetchAvatarById: async (id: number, config?: any): Promise<Avatar> => {
    const headers = {
      ...config?.headers,
      'Content-Type': 'application/json',
    };

    const response = await axios.get(`/api/avatar/${id}`, {
      ...config,
      headers,
      withCredentials: true,
    });
    return response.data;
  },
};
