import { Profile } from "@/types/profile";
import { profileService } from "@/services/profileService";
import { useQuery } from "@tanstack/react-query";

export function useProfile(
  token: string | undefined,
  userId: number | undefined
) {
  const { data, isLoading, error, refetch, ...rest } = useQuery({
    queryKey: ["profile", token, userId],
    queryFn: async () => {
      if (!token || !userId) {
        throw new Error("Token or userId is missing");
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
        let profile = response.find(
          (p) => p.user.id === userId && p.avatar !== null
        );

        if (!profile) {
          profile = response.find((p) => p.user.id === userId);
        }

        return profile;
      }

      return response;
    },
    enabled: !!token && !!userId,
  });

  const updateProfile = async (profileData: Partial<Profile>) => {
    if (!token || !userId) {
      throw new Error("No token or userId available");
    }

    try {
      const response = await profileService.updateProfile(userId, profileData, {
        headers: {
          Authorization: `Token ${token}`,
        },
      });
      const updatedProfile = Array.isArray(response)
        ? response[response.length - 1]
        : response;
      return updatedProfile;
    } catch (err) {
      throw err;
    }
  };

  const deleteProfile = async () => {
    if (!token || !userId) {
      throw new Error("No token or userId available");
    }

    try {
      await profileService.deleteProfile(userId.toString(), token);
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
