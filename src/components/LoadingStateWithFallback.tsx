import Image from "next/image";
import { useTheme } from "@/contexts/ThemeContext";
import CapxLogo from "@/public/static/images/capx_detailed_logo.svg";
import CapxLogoWhite from "@/public/static/images/capx_detailed_logo_white.svg";
import { useState, useEffect } from "react";

// Default version that can occupy the entire screen
export default function LoadingStateWithFallback({
  fullScreen = false,
}: {
  fullScreen?: boolean;
}) {
  const [hasTheme, setHasTheme] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Try to use ThemeContext safely
  useEffect(() => {
    try {
      // Attempt to get theme context
      const { darkMode } = useTheme();
      setIsDarkMode(darkMode);
      setHasTheme(true);
    } catch (error) {
      // If ThemeContext is not available, fallback to default light theme
      setHasTheme(false);
      console.warn(
        "ThemeContext not available in LoadingStateWithFallback:",
        error
      );
    }
  }, []);

  return (
    <div
      className={`flex items-center justify-center ${
        fullScreen ? "min-h-screen" : "h-[150px]"
      } ${hasTheme && isDarkMode ? "bg-capx-dark-box-bg" : "bg-capx-light-bg"}`}
      role="status"
      data-testid="loading-state"
      aria-label="Loading"
    >
      <div className="relative w-16 h-16">
        <Image
          src={hasTheme && isDarkMode ? CapxLogoWhite : CapxLogo}
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

// Compact version for use in smaller components
export function CompactLoading() {
  const [hasTheme, setHasTheme] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    try {
      const { darkMode } = useTheme();
      setIsDarkMode(darkMode);
      setHasTheme(true);
    } catch (error) {
      setHasTheme(false);
    }
  }, []);

  return (
    <div className="flex items-center justify-center py-4">
      <div className="animate-spin h-8 w-8 rounded-full border-4 border-l-gray-300 border-r-gray-300 border-b-gray-300 border-t-capx-primary-blue"></div>
    </div>
  );
}
