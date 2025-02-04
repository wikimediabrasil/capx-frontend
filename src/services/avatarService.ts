import axios from "axios";

export interface Avatar {
  id: number;
  avatar_url: string;
}

export const avatarService = {
  fetchAvatars: async (config?: any): Promise<Avatar[]> => {
    const headers = {
      ...config?.headers,
      "Content-Type": "application/json",
    };

    const response = await axios.get("/api/avatar", {
      ...config,
      headers,
      withCredentials: true,
    });
    return response.data;
  },

  fetchAvatarById: async (id: number, config?: any): Promise<Avatar> => {
    const headers = {
      ...config?.headers,
      "Content-Type": "application/json",
    };

    const response = await axios.get(`/api/avatar/${id}`, {
      ...config,
      headers,
      withCredentials: true,
    });
    return response.data;
  },
};
