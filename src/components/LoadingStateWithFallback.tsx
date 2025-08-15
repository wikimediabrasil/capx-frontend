'use client';

import { useTheme } from '@/contexts/ThemeContext';
import CapxLogo from '@/public/static/images/capx_detailed_logo.svg';
import CapxLogoWhite from '@/public/static/images/capx_detailed_logo_white.svg';
import Image from 'next/image';
import { useEffect, useState } from 'react';

// Default version that can occupy the entire screen
export default function LoadingStateWithFallback({ fullScreen = false }: { fullScreen?: boolean }) {
  const [mounted, setMounted] = useState(false);
  let darkMode = false;

  try {
    // Only use the hook if we're in a client component
    // This is safer than using it in useEffect
    const theme = useTheme();
    darkMode = theme?.darkMode || false;
  } catch (error) {
    // If ThemeContext is not available, use default theme
    darkMode = false;
  }

  // Handle mounting to avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // Only render with styles after mounting to avoid hydration issues
  if (!mounted) {
    return (
      <div
        className={`flex items-center justify-center ${fullScreen ? 'min-h-screen' : 'h-[150px]'}`}
        role="status"
      />
    );
  }

  return (
    <div
      className={`flex items-center justify-center ${
        fullScreen ? 'min-h-screen' : 'h-[150px]'
      } ${darkMode ? 'bg-capx-dark-box-bg' : 'bg-capx-light-bg'}`}
      role="status"
      data-testid="loading-state"
      aria-label="Loading"
    >
      <div className="relative w-16 h-16">
        <Image
          src={darkMode ? CapxLogoWhite : CapxLogo}
          alt="CAPX Logo"
          className="animate-pulse-fade object-contain"
          style={{ width: 'auto', height: 'auto' }}
          priority
        />
        <style jsx global>{`
          @keyframes pulseFade {
            0% {
              opacity: 0.3;
            }
            50% {
              opacity: 1;
            }
            100% {
              opacity: 0.3;
            }
          }
          .animate-pulse-fade {
            animation: pulseFade 2s ease-in-out infinite;
          }
        `}</style>
      </div>
    </div>
  );
}

// Compact version for use in smaller components
export function CompactLoading() {
  const [mounted, setMounted] = useState(false);
  let darkMode = false;

  try {
    // Only use the hook if we're in a client component
    const theme = useTheme();
    darkMode = theme?.darkMode || false;
  } catch (error) {
    // Silently fail and use default theme
    darkMode = false;
  }

  // Handle mounting to avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // Only render with styles after mounting
  if (!mounted) {
    return <div className="flex items-center justify-center py-4" />;
  }

  return (
    <div className="flex items-center justify-center py-4">
      <div
        className="animate-spin h-8 w-8 rounded-full border-4 border-l-gray-300 border-r-gray-300 border-b-gray-300 border-t-capx-primary-blue"
        data-testid="loading-spinner"
      ></div>
    </div>
  );
}
