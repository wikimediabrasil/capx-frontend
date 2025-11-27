import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { OrganizationName, OrganizationNameResponse } from '@/types/organization';

interface UseOrganizationNamesOptions {
  organizationId?: number;
  token?: string;
}

export function useOrganizationNames({ organizationId, token }: UseOrganizationNamesOptions = {}) {
  const [names, setNames] = useState<OrganizationName[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchNames = useCallback(async () => {
    if (!organizationId || !token) {
      setNames([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await axios.get<OrganizationNameResponse>('/api/organization_name/', {
        headers: {
          Authorization: `Token ${token}`,
        },
        params: {
          organization: organizationId,
        },
      });

      setNames(response.data.results || []);
    } catch (err: any) {
      console.error('Error fetching organization names:', err);
      setError(err.response?.data?.error || 'Failed to fetch organization names');
      setNames([]);
    } finally {
      setIsLoading(false);
    }
  }, [organizationId, token]);

  useEffect(() => {
    fetchNames();
  }, [fetchNames]);

  const createName = useCallback(
    async (languageCode: string, name: string) => {
      if (!organizationId || !token) {
        throw new Error('Organization ID and token are required');
      }

      try {
        const response = await axios.post<OrganizationName>(
          '/api/organization_name/',
          {
            organization: organizationId,
            language_code: languageCode,
            name: name,
          },
          {
            headers: {
              Authorization: `Token ${token}`,
            },
          }
        );

        setNames(prev => [...prev, response.data]);
        return response.data;
      } catch (err: any) {
        console.error('Error creating organization name:', err);
        throw new Error(err.response?.data?.error || 'Failed to create organization name');
      }
    },
    [organizationId, token]
  );

  const updateName = useCallback(
    async (id: number, languageCode: string, name: string) => {
      if (!token) {
        throw new Error('Token is required');
      }

      try {
        const response = await axios.put<OrganizationName>(
          `/api/organization_name/${id}/`,
          {
            organization: organizationId,
            language_code: languageCode,
            name: name,
          },
          {
            headers: {
              Authorization: `Token ${token}`,
            },
          }
        );

        setNames(prev => prev.map(n => (n.id === id ? response.data : n)));
        return response.data;
      } catch (err: any) {
        console.error('Error updating organization name:', err);
        throw new Error(err.response?.data?.error || 'Failed to update organization name');
      }
    },
    [organizationId, token]
  );

  const deleteName = useCallback(
    async (id: number) => {
      if (!token) {
        throw new Error('Token is required');
      }

      try {
        await axios.delete(`/api/organization_name/${id}/`, {
          headers: {
            Authorization: `Token ${token}`,
          },
        });

        setNames(prev => prev.filter(n => n.id !== id));
      } catch (err: any) {
        console.error('Error deleting organization name:', err);
        throw new Error(err.response?.data?.error || 'Failed to delete organization name');
      }
    },
    [token]
  );

  return {
    names,
    isLoading,
    error,
    fetchNames,
    createName,
    updateName,
    deleteName,
  };
}

