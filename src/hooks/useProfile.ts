import { Profile } from '@/types/profile';
import { profileService } from '@/services/profileService';
import { useQuery, useQueryClient } from '@tanstack/react-query';

export function useProfile(token: string | undefined, userId: number | undefined) {
  const queryClient = useQueryClient();

  const { data, isLoading, error, refetch, ...rest } = useQuery({
    queryKey: ['profile', token, userId],
    queryFn: async () => {
      if (!token || !userId) {
        throw new Error('Token or userId is missing');
      }

      const response = await profileService.fetchUserProfile({
        headers: {
          Authorization: `Token ${token}`,
        },
        params: {
          limit: 1,
          offset: 0,
        },
      });

      if (Array.isArray(response)) {
        let profile = response.find(p => p.user.id === userId && p.avatar !== null);

        if (!profile) {
          profile = response.find(p => p.user.id === userId);
        }

        return profile;
      }

      return response;
    },
    enabled: !!token && !!userId,
  });

  const updateProfile = async (profileData: Partial<Profile>) => {
    if (!token || !userId) {
      throw new Error('No token or userId available');
    }

    try {
      const response = await profileService.updateProfile(userId, profileData, {
        headers: {
          Authorization: `Token ${token}`,
        },
      });
      const updatedProfile = Array.isArray(response) ? response[response.length - 1] : response;

      // Invalidate and refetch the profile cache to ensure fresh data
      await queryClient.invalidateQueries({ queryKey: ['profile', token, userId] });

      // Also invalidate any user-related queries that might be cached
      await queryClient.invalidateQueries({ queryKey: ['users'] });
      await queryClient.invalidateQueries({ queryKey: ['userProfile'] });
      await queryClient.invalidateQueries({ queryKey: ['userProfile', userId, token] });

      // Optionally, update the cache immediately with the new data
      queryClient.setQueryData(['profile', token, userId], updatedProfile);

      return updatedProfile;
    } catch (err) {
      throw err;
    }
  };

  const deleteProfile = async () => {
    if (!token || !userId) {
      throw new Error('No token or userId available');
    }

    try {
      await profileService.deleteProfile(userId.toString(), token);
      // Invalidate profile cache after deletion
      await queryClient.invalidateQueries({ queryKey: ['profile', token, userId] });
    } catch (err) {
      throw err;
    }
  };

  return {
    profile: data,
    isLoading,
    error,
    refetch,
    ...rest,
    updateProfile,
    deleteProfile,
  };
}
