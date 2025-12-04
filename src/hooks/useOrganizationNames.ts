import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { OrganizationName, OrganizationNameResponse } from '@/types/organization';

interface UseOrganizationNamesOptions {
  organizationId?: number;
  token?: string;
}

export function useOrganizationNames({ organizationId, token }: UseOrganizationNamesOptions = {}) {
  const queryClient = useQueryClient();

  // Use React Query for fetching names with automatic caching
  const { data, isLoading, error } = useQuery<OrganizationName[], Error>({
    queryKey: ['organizationNames', organizationId, token],
    queryFn: async () => {
      if (!organizationId || !token) {
        return [];
      }

      try {
        const response = await axios.get<OrganizationNameResponse>('/api/organization_name/', {
          headers: {
            Authorization: `Token ${token}`,
          },
          params: {
            organization: organizationId,
          },
        });

        return response.data.results || [];
      } catch (err: any) {
        console.error('Error fetching organization names:', err);
        throw new Error(err.response?.data?.error || 'Failed to fetch organization names');
      }
    },
    enabled: !!organizationId && !!token,
    staleTime: 1000 * 60 * 10, // Cache for 10 minutes
    gcTime: 1000 * 60 * 30, // Keep in cache for 30 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: false, // Don't refetch if data is already in cache
  });

  const createName = useMutation({
    mutationFn: async ({ languageCode, name }: { languageCode: string; name: string }) => {
      if (!organizationId || !token) {
        throw new Error('Organization ID and token are required');
      }

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

      return response.data;
    },
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['organizationNames', organizationId, token] });
    },
  });

  const updateName = useMutation({
    mutationFn: async ({
      id,
      languageCode,
      name,
    }: {
      id: number;
      languageCode: string;
      name: string;
    }) => {
      if (!token) {
        throw new Error('Token is required');
      }

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

      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organizationNames', organizationId, token] });
    },
  });

  const deleteName = useMutation({
    mutationFn: async (id: number) => {
      if (!token) {
        throw new Error('Token is required');
      }

      const response = await axios.delete(`/api/organization_name/${id}/`, {
        headers: {
          Authorization: `Token ${token}`,
        },
      });
      
      return response.data;
    },
    onSuccess: () => {
      // Invalidate and refetch to update the UI immediately
      queryClient.invalidateQueries({ queryKey: ['organizationNames', organizationId, token] });
    },
    onError: (error: any) => {
      // Even if there's an error, try to invalidate to refresh the list
      // This handles the case where the backend deleted but returned an error
      queryClient.invalidateQueries({ queryKey: ['organizationNames', organizationId, token] });
      throw error;
    },
  });

  return {
    names: data || [],
    isLoading,
    error: error?.message || null,
    fetchNames: () =>
      queryClient.invalidateQueries({ queryKey: ['organizationNames', organizationId, token] }),
    createName: createName.mutateAsync,
    updateName: updateName.mutateAsync,
    deleteName: deleteName.mutateAsync,
  };
}
