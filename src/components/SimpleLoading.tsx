import { useApp } from '@/contexts/AppContext';
import CapxLogo from '@/public/static/images/capx_detailed_logo.svg';
import Image from 'next/image';

// Simple loading component without theme dependency
export default function SimpleLoading({ fullScreen = false }: { fullScreen?: boolean }) {
  let isMobile = false;

  // Try to get mobile status safely
  try {
    const app = useApp();
    isMobile = app.isMobile;
  } catch {
    // Context not available, use default
    isMobile = false;
  }

  // Calculate proper height considering mobile header
  const heightClass = fullScreen
    ? isMobile
      ? 'min-h-screen pt-20' // Add padding-top for mobile header (80px height)
      : 'min-h-screen'
    : 'h-[150px]';

  return (
    <div
      className={`flex items-center justify-center ${heightClass} bg-white`}
      role="status"
      data-testid="simple-loading"
      aria-label={"Content is loading"}
    >
      <div className="relative w-16 h-16">
        <Image
          src={CapxLogo}
          alt={"CapX - Capacity Exchange logo, page is loading"}
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
