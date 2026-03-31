import CapxLogo from '@/public/static/images/capx_detailed_logo.svg';
import Image from 'next/image';

// Simple loading component without theme dependency.
// Uses only CSS media queries (md:) for fullScreen so the logo stays below the mobile header
// from first paint, with no layout shift when context updates after hydration.
export default function SimpleLoading({ fullScreen = false }: Readonly<{ fullScreen?: boolean }>) {
  const wrapperClass = fullScreen ? 'min-h-screen pt-20 md:pt-0 bg-white' : 'h-[150px] bg-white';
  const innerClass = fullScreen
    ? 'min-h-[calc(100vh-5rem)] md:min-h-screen flex items-center justify-center'
    : 'h-full flex items-center justify-center';

  return (
    <output className={wrapperClass} data-testid="simple-loading" aria-label={'Content is loading'}>
      <div className={innerClass}>
        <div className="relative w-16 h-16">
          <Image
            src={CapxLogo}
            alt={'CapX - Capacity Exchange logo, page is loading'}
            fill
            className="animate-pulse-fade object-contain"
            priority
          />
        </div>
      </div>
    </output>
  );
}
