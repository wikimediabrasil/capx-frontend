import { useQuery } from '@tanstack/react-query';
import { LetsConnectExistsService } from '@/services/letsConnectExistsService';
import { useSession } from 'next-auth/react';

export function useLetsConnectExists() {
  const { data: session } = useSession();
  const username = session?.user?.name;
  const token = session?.user?.token;
  // todo apagar
  console.log('username', username);

  const {
    data: existsData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['letsConnectExists', username],
    queryFn: () => LetsConnectExistsService.checkUserExists(username || '', token || ''),
    enabled: !!username,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    retry: 2,
  });

   // todo apagar
  console.log('existsData', existsData);

  return {
    hasLetsConnectAccount: existsData?.exists || false,
    isLoading,
    error,
    refetch,
  };
}
