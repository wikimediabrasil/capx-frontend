import { useState, useEffect } from 'react';
import { useUserProfile } from './useUserProfile';

export function useManagerStatus() {
  const { userProfile, isLoading: profileLoading } = useUserProfile();
  const [managedOrganizations, setManagedOrganizations] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!profileLoading && userProfile) {
      setManagedOrganizations(userProfile.is_manager || []);
      setIsLoading(false);
    }
  }, [userProfile, profileLoading]);

  return { managedOrganizations, isLoading: isLoading || profileLoading };
}
