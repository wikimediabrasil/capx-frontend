'use client';

import { useEffect, useState } from 'react';
import setupAxiosInterceptor from '@/lib/axios-interceptor';

export default function AxiosInterceptorSetup() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);

    // Set the global axios interceptor only on the client side
    setupAxiosInterceptor();
  }, []);

  // This component doesn't render anything, it only sets up the interceptor
  return null;
}
