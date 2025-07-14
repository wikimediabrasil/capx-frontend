import Image from 'next/image';
import CapxLogo from '@/public/static/images/capx_detailed_logo.svg';
import { useApp } from "@/contexts/AppContext";

// Simple loading component without theme dependency
export default function SimpleLoading({ fullScreen = false }: { fullScreen?: boolean }) {
  const { pageContent } = useApp();

  return (
    <div
      className={`flex items-center justify-center ${
        fullScreen ? 'min-h-screen' : 'h-[150px]'
      } bg-white`}
      role="status"
      data-testid="simple-loading"
      aria-label={pageContent["aria-label-loading"] || "Content is loading"}
    >
      <div className="relative w-16 h-16">
        <Image
          src={CapxLogo}
          alt={pageContent["alt-logo-loading"] || "CapX - Capacity Exchange logo, page is loading"}
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
