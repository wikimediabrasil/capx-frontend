'use client';
import { useTheme } from '@/contexts/ThemeContext';
import { useApp } from '@/contexts/AppContext';
import Image from 'next/image';
import DarkMode from '@/public/static/images/dark_mode.svg';
import LightMode from '@/public/static/images/light_mode.svg';

export default function DarkModeButton() {
  const { darkMode, setDarkMode } = useTheme();
  const { pageContent } = useApp();

  const handleThemeToggle = () => {
    setDarkMode(!darkMode);
  };

  return (
    <button
      onClick={handleThemeToggle}
      className="flex items-center cursor-pointer py-[8px]"
      aria-label={darkMode ? pageContent['alt-light-mode'] || 'Switch to light mode' : pageContent['alt-dark-mode'] || 'Switch to dark mode'}
    >
      <Image
        src={darkMode ? LightMode : DarkMode}
        width={32}
        height={32}
        className="w-[28px] h-[28px]"
        alt={darkMode ? pageContent['alt-light-mode'] || 'Switch to light mode' : pageContent['alt-dark-mode'] || 'Switch to dark mode'}
      />
    </button>
  );
}
