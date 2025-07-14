'use client';

import { useEffect, useCallback } from 'react';
import { signOut, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export const useTokenExpiration = () => {
  const { data: session, status } = useSession();
  const router = useRouter();

  const handleTokenExpiration = useCallback(async () => {
    if (status === 'authenticated') {
      console.warn('Token expired detected. Performing logout...');

      try {
        await signOut({
          redirect: false, // Don't redirect automatically to control manually
        });

        // Manually redirect to the home page
        router.push('/');
      } catch (error) {
        console.error('Erro durante logout automático:', error);
        // If there's an error, force redirect
        window.location.href = '/';
      }
    }
  }, [status, router]);

  const checkTokenValidity = useCallback(
    async (response: any) => {
      if (response?.status === 401 && response?.data?.detail === 'Invalid token.') {
        await handleTokenExpiration();
        return false;
      }
      return true;
    },
    [handleTokenExpiration]
  );

  return {
    handleTokenExpiration,
    checkTokenValidity,
    isAuthenticated: status === 'authenticated',
    token: session?.user?.token,
  };
};
