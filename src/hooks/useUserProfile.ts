import { useState, useEffect, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import { UserProfile } from '@/types/user';
import { UserFilters, userService } from '@/services/userService';
import { ProfileCapacityType } from '@/app/(auth)/feed/types';
import { FilterState } from '@/app/(auth)/feed/types';
import { useQuery } from '@tanstack/react-query';

export interface UseAllUsersParams {
  limit?: number;
  offset?: number;
  activeFilters?: FilterState;
  ordering?: string;
}

export function useUserProfile() {
  const { data: session } = useSession();
  const {
    data: userProfile,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['userProfile', session?.user?.id, session?.user?.token],
    queryFn: async () => {
      if (!session?.user?.id || !session?.user?.token) {
        throw new Error('Session data is missing');
      }

      const data = await userService.fetchUserProfile(
        parseInt(session.user.id),
        session.user.token
      );
      return data;
    },
    enabled: !!session?.user?.id && !!session?.user?.token,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  return { userProfile, isLoading, error };
}

export function useUserByUsername(username?: string) {
  const { data: session } = useSession();
  const [userByUsername, setUserByUsername] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAllUsers = async () => {
      if (session?.user?.id && session?.user?.token && username) {
        try {
          const data = await userService.fetchAllUsers({
            token: session.user.token,
            offset: 0,
            filters: {
              username,
            },
          });
          // return only one user
          setUserByUsername(data.results[0]);
        } catch (error) {
          console.error('Error fetching user by user name:', error);
          setError(error.message);
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchAllUsers();
  }, [session, username]);

  return { userByUsername, isLoading, error };
}

export function useAllUsers(params: UseAllUsersParams) {
  const { data: session } = useSession();
  const [allUsers, setAllUsers] = useState<UserProfile[] | null>(null);
  const [count, setCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const capacitiesCodes = useMemo(
    () => params.activeFilters?.capacities?.map(cap => cap.code) || [],
    [params.activeFilters?.capacities]
  );

  const territories = useMemo(
    () => params.activeFilters?.territories || [],
    [params.activeFilters?.territories]
  );

  const languages = useMemo(
    () => params.activeFilters?.languages || [],
    [params.activeFilters?.languages]
  );

  const username = useMemo(() => params.activeFilters?.username, [params.activeFilters?.username]);

  const affiliations = useMemo(
    () => params.activeFilters?.affiliations || [],
    [params.activeFilters?.affiliations]
  );

  const profileCapacityTypes = useMemo(
    () => params.activeFilters?.profileCapacityTypes || [],
    [params.activeFilters?.profileCapacityTypes]
  );

  const hasSharer = useMemo(
    () => profileCapacityTypes.includes(ProfileCapacityType.Sharer),
    [profileCapacityTypes]
  );

  const hasLearner = useMemo(
    () => profileCapacityTypes.includes(ProfileCapacityType.Learner),
    [profileCapacityTypes]
  );

  useEffect(() => {
    const fetchAllUsers = async () => {
      if (!session?.user?.token) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        const filters: UserFilters = {
          ...(capacitiesCodes.length > 0 && {
            skills_available: hasSharer ? capacitiesCodes : undefined,
            skills_wanted: hasLearner ? capacitiesCodes : undefined,
          }),
          ...(territories.length > 0 && {
            territory: territories,
          }),
          ...(languages.length > 0 && {
            language: languages,
          }),
          ...(username && { username }),
          ...(affiliations.length > 0 && { affiliations }),
          has_skills_available: hasSharer || undefined,
          has_skills_wanted: hasLearner || undefined,
        };

        const data = await userService.fetchAllUsers({
          token: session.user.token,
          limit: params.limit,
          offset: params.offset,
          filters,
          ordering: params.ordering,
        });
        setAllUsers(data.results);
        setCount(data.count);
      } catch (error) {
        console.error('Error fetching user by user name:', error);
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllUsers();
  }, [
    session?.user?.token,
    params.limit,
    params.offset,
    params.ordering,
    capacitiesCodes,
    territories,
    languages,
    username,
    affiliations,
    hasSharer,
    hasLearner,
  ]);

  return { allUsers, isLoading, error, count };
}
