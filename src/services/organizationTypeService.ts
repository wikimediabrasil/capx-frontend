import axios from 'axios';
import { OrganizationType } from '@/types/organizationType';

export const OrganizationTypeService = {
  async getOrganizationType(
    token: string,
    limit?: number,
    offset?: number
  ): Promise<OrganizationType[]> {
    const response = await axios.get('/api/organization_type/', {
      headers: { Authorization: `Token ${token}` },
      params: { limit, offset },
    });
    return response.data;
  },

  async getOrganizationTypeById(token: string, id: number) {
    const response = await axios.get(`api/organization_type/${id}`, {
      headers: { Authorization: `Token ${token}` },
    });
    return response.data;
  },
};
