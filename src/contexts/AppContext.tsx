"use client";
import { createContext, useContext, useState, useEffect, useMemo } from "react";

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

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [mobileMenuStatus, setMobileMenuStatus] = useState(false);
  
  // Check language on localStorage. If not found, use "en" as default
  const initialLanguage = typeof window !== "undefined" ? localStorage.getItem("language") : "en";
  const [language, setLanguage] = useState(initialLanguage || "en");

  const [pageContent, setPageContent] = useState({});
  const [session, setSession] = useState(null);

  // Check and load language from localStorage on mount,
  // handle initial mobile detection and window resize
  useEffect(() => {
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
    setMounted(true);

    // Add resize listener
    window.addEventListener("resize", checkIsMobile);

    return () => {
      window.removeEventListener("resize", checkIsMobile);
    };
  }, []);

  // Save language to localStorage when it changes
  useEffect(() => {
    if (language) {
      localStorage.setItem("language", language);
    }
  }, [language]);

  // Memoize value object
  const value = useMemo(() => ({
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
  }), [isMobile, darkMode, mobileMenuStatus, language, pageContent, session]);

  // Don't render anything before mount to avoid hydration mismatch
  if (!mounted) {
    return null;
  }

  return (
    <AppContext.Provider value={value}>
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
