'use client';

import { useDarkMode } from '@/stores';

interface SkeletonBaseProps {
  className?: string;
}

export default function SkeletonBase({ className = '' }: SkeletonBaseProps) {
  const darkMode = useDarkMode();
  return (
    <div
      className={`animate-pulse rounded ${darkMode ? 'bg-gray-700' : 'bg-gray-200'} ${className}`}
    />
  );
}
