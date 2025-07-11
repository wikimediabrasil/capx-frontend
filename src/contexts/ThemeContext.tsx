'use client';
import { createContext, useContext, useState, useEffect } from 'react';

type ThemeContextType = {
  darkMode: boolean;
  setDarkMode: (value: boolean) => void;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    // Only execute on the client
    if (typeof window === 'undefined') return;

    try {
      const savedTheme = localStorage.getItem('theme');
      if (savedTheme) {
        setDarkMode(savedTheme === 'dark');
      } else {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        setDarkMode(prefersDark);
      }
    } catch (error) {
      console.error('Error accessing localStorage:', error);
    }

    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || typeof window === 'undefined') return;

    try {
      document.documentElement.classList.toggle('dark', darkMode);
      localStorage.setItem('theme', darkMode ? 'dark' : 'light');
    } catch (error) {
      console.error('Error setting theme:', error);
    }
  }, [darkMode, mounted]);

  // Render a placeholder during hydration on the client
  // to avoid hydration differences
  if (!mounted) {
    return <>{children}</>;
  }

  return (
    <ThemeContext.Provider value={{ darkMode, setDarkMode }}>{children}</ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
