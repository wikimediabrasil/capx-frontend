import axios from 'axios';
import { Organization } from '@/types/organization';

export interface OrganizationFilters {
  territory?: string[];
  available_capacities?: number[];
  wanted_capacities?: number[];
  limit?: number;
  offset?: number;
  has_capacities_wanted?: boolean;
  has_capacities_available?: boolean;
}

export const organizationProfileService = {
  async getOrganizations(filters: OrganizationFilters) {
    const params = new URLSearchParams();

    if (filters.territory?.length) {
      filters.territory.forEach(t => params.append('territory', t));
    }

    if (filters.available_capacities?.length) {
      filters.available_capacities.forEach(c =>
        params.append('available_capacities', c.toString())
      );
    }

    if (filters.wanted_capacities?.length) {
      filters.wanted_capacities.forEach(c => params.append('wanted_capacities', c.toString()));
    }

    if (filters.has_capacities_wanted === true) {
      params.append('has_capacities_wanted', 'true');
    }

    if (filters.has_capacities_available === true) {
      params.append('has_capacities_available', 'true');
    }

    if (filters.limit) {
      params.append('limit', filters.limit.toString());
    }

    if (filters.offset) {
      params.append('offset', filters.offset.toString());
    }

    try {
      const response = await axios.get('/api/organizations/', {
        params,
        paramsSerializer: {
          indexes: null, // Ensure arrays are serialized correctly
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching organizations:', error);
      return { count: 0, results: [] };
    }
  },

  async getOrganizationById(token: string, id: number) {
    const response = await axios.get(`/api/organizations/${id}/`, {
      headers: { Authorization: `Token ${token}` },
    });
    return response.data;
  },

  async getUserProfile(token: string) {
    const response = await axios.get('/api/profile/', {
      headers: { Authorization: `Token ${token}` },
    });
    // return one user
    return response.data[0];
  },

  async updateOrganizationProfile(token: string, id: number, data: Partial<Organization>) {
    // First, get the current organization data to ensure required fields are included
    const currentOrg = await this.getOrganizationById(token, id);

    const sanitizedData = {
      ...currentOrg, // Include all current data as base
      ...data, // Override with new data
      events: Array.isArray(data.events)
        ? data.events.map((event: any) => (typeof event === 'object' ? event.id : event))
        : currentOrg.events || [],
      choose_events: Array.isArray(data.choose_events)
        ? data.choose_events.map((event: any) => (typeof event === 'object' ? event.id : event))
        : currentOrg.choose_events || [],
    };

    const response = await axios.put(`/api/organizations/${id}/`, sanitizedData, {
      headers: {
        Authorization: `Token ${token}`,
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    });

    return response.data;
  },
};
