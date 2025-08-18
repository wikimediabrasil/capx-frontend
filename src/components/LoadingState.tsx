import { useApp } from '@/contexts/AppContext';
import { useTheme } from '@/contexts/ThemeContext';
import CapxLogo from '@/public/static/images/capx_detailed_logo.svg';
import CapxLogoWhite from '@/public/static/images/capx_detailed_logo_white.svg';
import Image from 'next/image';
import { ErrorBoundary } from 'react-error-boundary';
import SimpleLoading from './SimpleLoading';

// The core loading component that requires ThemeContext
function ThemeAwareLoading({ fullScreen = false }) {
  const { darkMode } = useTheme();
  const { isMobile } = useApp();

  // Calculate proper height considering mobile header
  const heightClass = fullScreen
    ? isMobile
      ? 'min-h-screen pt-20' // Add padding-top for mobile header (80px height)
      : 'min-h-screen'
    : 'h-[150px]';

  return (
    <div
      className={`flex items-center justify-center ${heightClass} ${
        darkMode ? 'bg-capx-dark-box-bg' : 'bg-capx-light-bg'
      }`}
      role="status"
      data-testid="loading-state"
      aria-label="Loading"
    >
      <div className="relative w-16 h-16">
        <Image
          src={darkMode ? CapxLogoWhite : CapxLogo}
          alt="CAPX Logo"
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

// Wrapper component with fallback via ErrorBoundary
export default function LoadingState({ fullScreen = false }) {
  return (
    <ErrorBoundary fallback={<SimpleLoading fullScreen={fullScreen} />}>
      <ThemeAwareLoading fullScreen={fullScreen} />
    </ErrorBoundary>
  );
}
