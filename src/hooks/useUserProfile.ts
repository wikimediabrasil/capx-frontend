import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { UserProfile } from "@/types/user";
import { UserFilters, userService } from "@/services/userService";
import { ProfileCapacityType } from "@/app/(auth)/feed/types";
import { FilterState } from "@/app/(auth)/feed/types";

export interface UseAllUsersParams {
  limit?: number;
  offset?: number;
  activeFilters?: FilterState;
}

export function useUserProfile() {
  const { data: session } = useSession();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (session?.user?.id && session?.user?.token) {
        try {
          const data = await userService.fetchUserProfile(
            session.user.id,
            session.user.token
          );
          setUserProfile(data);
        } catch (error) {
          console.error("Error fetching user profile:", error);
          setError(error.message);
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchUserProfile();
  }, [session]);

  return { userProfile, isLoading, error };
}

export function useUserByUsername(username?: string) {
  const { data: session } = useSession();
  const [userByUsername, setUserByUsername] = useState<UserProfile | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    const fetchAllUsers = async () => {
      if (session?.user?.id && session?.user?.token) {
        try {
          const data = await userService.fetchAllUsers({
            token: session.user.token,
            offset: 0,
            filters: {
              username
            }
          });
          // return only one user
          setUserByUsername(data.results[0]);
        } catch (error) {
          console.error("Error fetching user by user name:", error);
          setError(error.message);
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchAllUsers();
  }, [session]);

  return { userByUsername, isLoading, error };
}

export function useAllUsers(params: UseAllUsersParams) {
  const { data: session } = useSession();
  const [allUsers, setAllUsers] = useState<UserProfile[] | null>(null);
  const [count, setCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    const fetchAllUsers = async () => {
      if (!session?.user?.token) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        const filters: UserFilters = {
          ...(params.activeFilters?.capacities?.length && {
            skills_available: params.activeFilters?.profileCapacityTypes.includes(ProfileCapacityType.Sharer) 
              ? params.activeFilters?.capacities.map(cap => cap.code)
              : undefined,
            skills_wanted: params.activeFilters?.profileCapacityTypes.includes(ProfileCapacityType.Learner) 
              ? params.activeFilters?.capacities.map(cap => cap.code)
              : undefined,
          }),
          ...(params.activeFilters?.territories?.length && {
            territory: params.activeFilters?.territories
          }),
          ...(params.activeFilters?.languages?.length && {
            language: params.activeFilters?.languages
          }),
          has_skills_available: params.activeFilters?.profileCapacityTypes.includes(ProfileCapacityType.Sharer) ?? undefined,
          has_skills_wanted: params.activeFilters?.profileCapacityTypes?.includes(ProfileCapacityType.Learner) ?? undefined,
        };

        const data = await userService.fetchAllUsers({
          token: session.user.token,
          limit: params.limit,
          offset: params.offset,
          filters
        });
        setAllUsers(data.results);
        setCount(data.count);
      } catch (error) {
        console.error("Error fetching user by user name:", error);
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllUsers();
  }, [session?.user?.token, params.limit, params.offset,
    JSON.stringify(params.activeFilters?.capacities),
    JSON.stringify(params.activeFilters?.territories),
    JSON.stringify(params.activeFilters?.profileCapacityTypes),
    JSON.stringify(params.activeFilters?.languages)
  ]);

  return { allUsers, isLoading, error, count };
}
