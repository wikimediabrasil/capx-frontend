'use client';

import { useTheme } from '@/contexts/ThemeContext';
import { useApp } from '@/contexts/AppContext';
import CapxLogo from '@/public/static/images/capx_detailed_logo.svg';
import CapxLogoWhite from '@/public/static/images/capx_detailed_logo_white.svg';
import Image from 'next/image';
import { useEffect, useState } from 'react';

// Default version that can occupy the entire screen
export default function LoadingStateWithFallback({ fullScreen = false }: { fullScreen?: boolean }) {
  const [mounted, setMounted] = useState(false);
  const theme = useTheme();
  const app = useApp();

  const darkMode = theme?.darkMode || false;
  const pageContent = app?.pageContent || {};

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
      aria-label={pageContent['aria-label-loading'] || 'Content is loading'}
    >
      <div className="relative w-16 h-16">
        <Image
          src={darkMode ? CapxLogoWhite : CapxLogo}
          alt={pageContent['alt-logo-loading'] || 'CapX - Capacity Exchange logo, page is loading'}
          className="animate-pulse-fade object-contain"
          width={64}
          height={64}
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
  let _darkMode = false;

  try {
    // Only use the hook if we're in a client component
    const theme = useTheme();
    _darkMode = theme?.darkMode || false;
  } catch (_error) {
    // Silently fail and use default theme
    _darkMode = false;
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
