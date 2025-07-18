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

  // Wrapper function to log setDarkMode calls
  const setDarkModeWithLog = (value: boolean) => {
    console.log('=== ThemeContext setDarkMode called ===');
    console.log('Setting darkMode to:', value);
    console.log('Previous darkMode:', darkMode);
    setDarkMode(value);
  };

  useEffect(() => {
    // Only execute on the client
    if (typeof window === 'undefined') return;

    try {
      const savedTheme = localStorage.getItem('theme');
      console.log('=== ThemeContext initialization ===');
      console.log('savedTheme:', savedTheme);
      
      if (savedTheme) {
        const shouldBeDark = savedTheme === 'dark';
        console.log('Setting darkMode to:', shouldBeDark);
        setDarkMode(shouldBeDark);
      } else {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        console.log('Using system preference:', prefersDark);
        setDarkMode(prefersDark);
      }
    } catch (error) {
      console.error('Error accessing localStorage:', error);
    }

    setMounted(true);
  }, []);

  // Listen for system theme changes
  useEffect(() => {
    if (!mounted || typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleSystemThemeChange = (e: MediaQueryListEvent) => {
      console.log('=== ThemeContext: System theme changed ===');
      console.log('New system theme:', e.matches ? 'dark' : 'light');
      
      // Only update if no theme is saved in localStorage
      const savedTheme = localStorage.getItem('theme');
      if (!savedTheme) {
        console.log('No saved theme, updating to system preference');
        setDarkMode(e.matches);
      }
    };

    mediaQuery.addEventListener('change', handleSystemThemeChange);
    
    return () => {
      mediaQuery.removeEventListener('change', handleSystemThemeChange);
    };
  }, [mounted, setDarkMode]);

  useEffect(() => {
    if (!mounted || typeof window === 'undefined') return;

    console.log('=== ThemeContext applying theme ===');
    console.log('darkMode:', darkMode);
    console.log('mounted:', mounted);

    try {
      document.documentElement.classList.toggle('dark', darkMode);
      localStorage.setItem('theme', darkMode ? 'dark' : 'light');
      console.log('Theme applied successfully');
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
    <ThemeContext.Provider value={{ darkMode, setDarkMode: setDarkModeWithLog }}>{children}</ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
