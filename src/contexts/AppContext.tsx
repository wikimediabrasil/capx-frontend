"use client";
import { createContext, useContext, useState, useEffect } from "react";

interface AppContextType {
  isMobile: boolean;
  darkMode: boolean;
  setDarkMode: (value: boolean) => void;
  mobileMenuStatus: boolean;
  setMobileMenuStatus: (value: boolean) => void;
  language: string;
  setLanguage: (value: string) => void;
  pageContent: any;
  setPageContent: (value: any) => void;
  session: any;
  setSession: (value: any) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const isClient = typeof window !== "undefined";

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [mobileMenuStatus, setMobileMenuStatus] = useState(false);

  // Check language on localStorage. If not found, use "en" as default
  const initialLanguage = isClient
    ? localStorage.getItem("language") || "en"
    : "en";
  const [language, setLanguage] = useState(initialLanguage);

  const [pageContent, setPageContent] = useState({
    "capacity-card-explore-capacity": "Explore capacity",
    "capacity-card-expand-capacity": "Expand",
    "capacity-card-info": "Information",
    "capacity-banner-title": "Exchange Everything",
    "capacity-search-no-results": "No results found",
  });
  const [session, setSession] = useState(null);

  // Check and load language from localStorage on mount,
  // handle initial mobile detection and window resize
  useEffect(() => {
    if (!isClient) return;

    try {
      const savedLanguage = localStorage.getItem("language");

      if (savedLanguage && savedLanguage !== language) {
        setLanguage(savedLanguage); // Update state if language is different
      }

      const checkIsMobile = () => {
        const isMobileView = window.innerWidth <= 768;
        setIsMobile(isMobileView);
        if (!isMobileView) {
          setMobileMenuStatus(false);
        }
      };

      // Check on mount
      checkIsMobile();

      // Add resize listener
      window.addEventListener("resize", checkIsMobile);

      setMounted(true);

      return () => {
        window.removeEventListener("resize", checkIsMobile);
      };
    } catch (error) {
      console.error("Error initializing AppContext:", error);
      setMounted(true); // Ensure we still render the app even if there's an error
    }
  }, []);

  // Save language to localStorage when it changes
  useEffect(() => {
    if (!isClient || !mounted) return;

    try {
      if (language) {
        localStorage.setItem("language", language);
      }
    } catch (error) {
      console.error("Error saving language to localStorage:", error);
    }
  }, [language, mounted]);

  // To avoid hydration errors, we render the children directly
  // before mounting
  if (!mounted) {
    return <>{children}</>;
  }

  return (
    <AppContext.Provider
      value={{
        isMobile,
        darkMode,
        setDarkMode,
        mobileMenuStatus,
        setMobileMenuStatus,
        language,
        setLanguage,
        pageContent,
        setPageContent,
        session,
        setSession,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
}
