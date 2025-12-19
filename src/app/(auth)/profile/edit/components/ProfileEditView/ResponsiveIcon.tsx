import Image from 'next/image';
import { useTheme } from '@/contexts/ThemeContext';
import { useApp } from '@/contexts/AppContext';

interface ResponsiveIconProps {
  lightIcon: string;
  darkIcon: string;
  alt: string;
  mobileSize: number;
  desktopSize: number;
}

/**
 * Responsive icon component that handles dark mode and size variations
 * Reduces duplication of icon rendering logic across components
 */
export function ResponsiveIcon({
  lightIcon,
  darkIcon,
  alt,
  mobileSize,
  desktopSize,
}: ResponsiveIconProps) {
  const { darkMode } = useTheme();
  const { isMobile } = useApp();

  const icon = darkMode ? darkIcon : lightIcon;
  const size = isMobile ? mobileSize : desktopSize;

  return <Image src={icon} alt={alt} width={size} height={size} />;
}
