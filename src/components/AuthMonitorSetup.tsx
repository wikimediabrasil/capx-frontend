'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { startAuthMonitoring, stopAuthMonitoring } from '@/lib/auth-monitor';

export default function AuthMonitorSetup() {
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === 'authenticated' && session?.user?.token) {
      // Start monitoring when the user is authenticated
      startAuthMonitoring({
        isAuthenticated: true,
        token: session.user.token,
      });
    } else {
      // Stop monitoring when the user is not authenticated
      stopAuthMonitoring();
    }

    // Cleanup: stop monitoring when the component is unmounted
    return () => {
      stopAuthMonitoring();
    };
  }, [status, session?.user?.token]);

  // This component doesn't render anything visually
  return null;
}
