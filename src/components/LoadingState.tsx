import Image from "next/image";
import { useTheme } from "@/contexts/ThemeContext";
import CapxLogo from "@/public/static/images/capx_detailed_logo.svg";
import CapxLogoWhite from "@/public/static/images/capx_detailed_logo_white.svg";
import SimpleLoading from "./SimpleLoading";
import { ErrorBoundary } from "react-error-boundary";

// The core loading component that requires ThemeContext
function ThemeAwareLoading({ fullScreen = false }) {
  const { darkMode } = useTheme();

  return (
    <div
      className={`flex items-center justify-center ${
        fullScreen ? "min-h-screen" : "h-[150px]"
      } ${darkMode ? "bg-capx-dark-box-bg" : "bg-capx-light-bg"}`}
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
          style={{ width: "auto", height: "auto" }}
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
