'use client';
import { useTheme } from '@/contexts/ThemeContext';
import Image from 'next/image';
import DarkMode from '@/public/static/images/dark_mode.svg';
import LightMode from '@/public/static/images/light_mode.svg';

export default function DarkModeButton() {
  const { darkMode, setDarkMode } = useTheme();

  return (
    <button
      onClick={() => setDarkMode(!darkMode)}
      className="flex items-center cursor-pointer py-[8px]"
      aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      <Image
        src={darkMode ? LightMode : DarkMode}
        width={32}
        height={32}
        className="w-[28px] h-[28px]"
        alt={darkMode ? 'Light Mode' : 'Dark Mode'}
      />
    </button>
  );
}
