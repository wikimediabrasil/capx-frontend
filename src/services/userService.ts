import axios from 'axios';
import { UserProfile } from '@/types/user';

export interface UserFilters {
  name?: string;
  username?: string;
  language?: string[];
  territory?: string[];
  affiliations?: string[];
  skills_available?: number[];
  skills_wanted?: number[];
  has_skills_wanted?: boolean;
  has_skills_available?: boolean;
}

export interface FetchAllUsersParams {
  token: string;
  limit?: number;
  offset?: number;
  filters?: UserFilters;
  ordering?: string;
}

export const userService = {
  async fetchUserProfile(userId: number, token: string): Promise<UserProfile | null> {
    if (!token || !userId) return null;

    try {
      const response = await axios.get(`/api/users/${userId}`, {
        headers: { Authorization: `Token ${token}` },
      });
      return response.data;
    } catch (error) {
      console.error(`Error fetching user profile with ID ${userId}:`, error);
      return null;
    }
  },
  async checkUserExists(username: string, token: string): Promise<boolean> {
    if (!token || !username || username.trim().length < 1) return false;

    try {
      const response = await axios.get(`/api/users/`, {
        params: { username },
        headers: { Authorization: `Token ${token}` },
      });
      return response.data.count > 0;
    } catch (error) {
      console.error(`Error checking if user exists with username ${username}:`, error);
      return false;
    }
  },
  async fetchAllUsers(queryParams: FetchAllUsersParams) {
    if (!queryParams.token) return { count: 0, results: [] };

    const params = new URLSearchParams();

    if (queryParams?.filters?.territory?.length) {
      queryParams.filters.territory.forEach(t => params.append('territory', t));
    }

    if (queryParams?.filters?.language?.length) {
      queryParams.filters.language.forEach(t => params.append('language', t));
    }

    if (queryParams?.filters?.affiliations?.length) {
      queryParams.filters.affiliations.forEach(a => params.append('affiliation', a));
    }

    if (queryParams?.filters?.skills_available?.length) {
      queryParams.filters.skills_available.forEach(c =>
        params.append('skills_available', c.toString())
      );
    }

    if (queryParams?.filters?.skills_wanted?.length) {
      queryParams.filters.skills_wanted.forEach(c => params.append('skills_wanted', c.toString()));
    }

    if (queryParams?.filters?.has_skills_available === true) {
      params.append('has_skills_available', 'true');
    }

    if (queryParams?.filters?.has_skills_wanted === true) {
      params.append('has_skills_wanted', 'true');
    }

    if (queryParams?.limit) {
      params.append('limit', queryParams.limit.toString());
    }

    if (queryParams?.offset) {
      params.append('offset', queryParams.offset.toString());
    }

    if (queryParams?.filters?.name) {
      params.append('name', queryParams.filters.name);
    }

    if (queryParams?.filters?.username) {
      params.append('username', queryParams.filters.username);
    }

    if (queryParams?.ordering) {
      params.append('ordering', queryParams.ordering);
    }

    try {
      const response = await axios.get(`/api/users/`, {
        params,
        headers: {
          Authorization: `Token ${queryParams.token}`,
        },
        paramsSerializer: {
          indexes: null, // Ensure arrays are serialized correctly
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching users:', error);
      return { count: 0, results: [] };
    }
  },
};
