import axios from 'axios';
import { OrganizationDocument } from '@/types/document';

export const documentService = {
  async fetchAllDocuments(
    token: string,
    limit?: number,
    offset?: number
  ): Promise<OrganizationDocument[]> {
    const headers = { Authorization: `Token ${token}` };
    const params = { limit, offset };
    const response = await axios.get<OrganizationDocument[]>('/api/documents', {
      headers,
      params,
    });
    return response.data;
  },

  async fetchSingleDocument(token: string, id: number): Promise<OrganizationDocument> {
    const response = await axios.get<OrganizationDocument>(`/api/documents/${id}`, {
      headers: {
        Authorization: `Token ${token}`,
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  },

  async createDocument(
    token: string,
    document: Partial<OrganizationDocument>
  ): Promise<OrganizationDocument> {
    try {
      const response = await axios.post<OrganizationDocument>('/api/documents', document, {
        headers: {
          Authorization: `Token ${token}`,
          'Content-Type': 'application/json',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error details:', error.response?.data);
      throw error;
    }
  },

  async deleteDocument(token: string, id: number): Promise<void> {
    await axios.delete(`/api/documents/${id}`, {
      headers: {
        Authorization: `Token ${token}`,
        'Content-Type': 'application/json',
      },
    });
  },
};
