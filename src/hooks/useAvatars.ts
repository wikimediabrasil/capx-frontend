import { useQuery, useQueryClient, UseQueryOptions } from '@tanstack/react-query';
import { avatarService } from '@/services/avatarService';
import { useSession } from 'next-auth/react';
import { Avatar } from '@/types/avatar';

export function useAvatars(limit?: number, offset?: number) {
  const { data: session } = useSession();
  const token = session?.user?.token;
  const queryClient = useQueryClient();

  const {
    data: avatars,
    isLoading,
    error,
    refetch,
  } = useQuery<Avatar[], Error>({
    queryKey: ['avatars', token, limit, offset],
    queryFn: () =>
      avatarService.fetchAvatars({
        headers: {
          Authorization: `Token ${token}`,
        },
        params: { limit, offset },
      }),
    enabled: !!token,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    retry: 2,
  } as UseQueryOptions<Avatar[], Error>);

  const getAvatarById = async (id: number | null): Promise<Avatar | null> => {
    if (!token || !id) return null;

    // Try to get from cache first
    const cachedAvatar = avatars?.find(avatar => avatar.id === id);
    if (cachedAvatar) return cachedAvatar;

    try {
      const avatar = await avatarService.fetchAvatarById(id, {
        headers: {
          Authorization: `Token ${token}`,
        },
      });

      // Update the cache
      queryClient.setQueryData<Avatar[]>(['avatars', token, limit, offset], old =>
        old ? [...old, avatar] : [avatar]
      );

      return avatar;
    } catch (error) {
      console.error('Error fetching avatar by id:', error);
      return null;
    }
  };

  return {
    avatars: avatars || [],
    isLoading,
    error,
    getAvatarById,
    refetch,
  };
}
