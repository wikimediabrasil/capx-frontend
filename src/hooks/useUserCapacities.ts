import { useMemo } from 'react';
import { UserProfile } from '@/types/user';

export function useUserCapacities(userProfile: UserProfile | null | undefined) {
  const userKnownCapacities = useMemo(() => {
    if (!userProfile) return [];
    return (userProfile.skills_known || [])
      .map(c => (typeof c === 'string' ? parseInt(c, 10) : c))
      .filter(c => !isNaN(c)) as number[];
  }, [userProfile]);

  const userAvailableCapacities = useMemo(() => {
    if (!userProfile) return [];
    return (userProfile.skills_available || [])
      .map(c => (typeof c === 'string' ? parseInt(c, 10) : c))
      .filter(c => !isNaN(c)) as number[];
  }, [userProfile]);

  const userWantedCapacities = useMemo(() => {
    if (!userProfile) return [];
    return (userProfile.skills_wanted || [])
      .map(c => (typeof c === 'string' ? parseInt(c, 10) : c))
      .filter(c => !isNaN(c)) as number[];
  }, [userProfile]);

  return { userKnownCapacities, userAvailableCapacities, userWantedCapacities };
}
