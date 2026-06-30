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
  skills_known?: number[];
  has_skills_wanted?: boolean;
  has_skills_available?: boolean;
  has_skills_known?: boolean;
  /** Backend: at least one of wanted / available / known */
  has_any_skills?: boolean;
}

export interface FetchAllUsersParams {
  token: string;
  limit?: number;
  offset?: number;
  filters?: UserFilters;
  ordering?: string;
}

// Translate a fetchAllUsers query into URL search params
function buildUsersSearchParams(queryParams: FetchAllUsersParams): URLSearchParams {
  const params = new URLSearchParams();
  const filters = queryParams?.filters;

  filters?.territory?.forEach(t => params.append('territory', t));
  filters?.language?.forEach(t => params.append('language', t));
  filters?.affiliations?.forEach(a => params.append('affiliation', a));
  filters?.skills_available?.forEach(c => params.append('skills_available', c.toString()));
  filters?.skills_wanted?.forEach(c => params.append('skills_wanted', c.toString()));
  filters?.skills_known?.forEach(c => params.append('skills_known', c.toString()));

  if (filters?.has_skills_available === true) params.append('has_skills_available', 'true');
  if (filters?.has_skills_wanted === true) params.append('has_skills_wanted', 'true');
  if (filters?.has_skills_known === true) params.append('has_skills_known', 'true');
  if (filters?.has_any_skills === true) params.append('has_any_skills', 'true');

  if (queryParams?.limit) params.append('limit', queryParams.limit.toString());
  if (queryParams?.offset) params.append('offset', queryParams.offset.toString());
  if (filters?.name) params.append('name', filters.name);
  if (filters?.username) params.append('username', filters.username);
  if (queryParams?.ordering) params.append('ordering', queryParams.ordering);

  return params;
}

export const userService = {
  async fetchUserProfile(userId: number, token: string): Promise<UserProfile | null> {
    if (!token || !userId) return null;

    try {
      const response = await axios.get(`/api/users/${userId}`, {
        headers: { Authorization: `Token ${token}` },
      });
      return response.data;
    } catch (error: unknown) {
      const status = axios.isAxiosError(error) ? error.response?.status : undefined;
      console.warn(
        `[userService.fetchUserProfile] userId=${userId}${status != null ? ` http=${status}` : ''}`
      );
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

    const params = buildUsersSearchParams(queryParams);

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
