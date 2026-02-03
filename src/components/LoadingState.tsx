import { useApp } from '@/contexts/AppContext';
import { useTheme } from '@/contexts/ThemeContext';
import CapxLogo from '@/public/static/images/capx_detailed_logo.svg';
import CapxLogoWhite from '@/public/static/images/capx_detailed_logo_white.svg';
import Image from 'next/image';
import ErrorBoundary from './ErrorBoundary';
import SimpleLoading from './SimpleLoading';

// The core loading component that requires ThemeContext.
// Uses CSS media queries (md:) for fullScreen height so layout is correct from first paint
// on mobile, with no shift when isMobile updates after hydration.
function ThemeAwareLoading({ fullScreen = false }) {
  const { darkMode } = useTheme();
  const { pageContent } = useApp();

  const wrapperClass = fullScreen
    ? 'min-h-screen pt-20 md:pt-0'
    : 'h-[150px]';
  const innerClass = fullScreen
    ? 'min-h-[calc(100vh-5rem)] md:min-h-screen flex items-center justify-center'
    : 'h-full flex items-center justify-center';
  const bgClass = darkMode ? 'bg-capx-dark-box-bg' : 'bg-capx-light-bg';

  return (
    <div
      className={`${wrapperClass} ${bgClass}`}
      role="status"
      data-testid="loading-state"
      aria-label={pageContent['aria-label-loading'] || 'Content is loading'}
    >
      <div className={`${innerClass} flex items-center justify-center w-full`}>
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
        </div>
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
