'use client';

import { useEffect, useState } from 'react';
import SimpleLoading from '@/components/SimpleLoading';

export function Providers({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Delay mounting slightly to ensure smooth initialization
    const timer = setTimeout(() => {
      setMounted(true);
    }, 50);

    return () => clearTimeout(timer);
  }, []);

  if (!mounted) {
    return <SimpleLoading />;
  }

  return children;
}
