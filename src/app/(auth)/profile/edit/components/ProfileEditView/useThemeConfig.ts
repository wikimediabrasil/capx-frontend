/**
 * Custom hook to consolidate theme-dependent configuration for ProfileEditView
 * Reduces complexity by centralizing all theme and responsive calculations
 */

import type { StaticImageData } from 'next/image';
import { useTheme } from '@/contexts/ThemeContext';
import { useApp } from '@/contexts/AppContext';
import { getAccountIcon, getLetsConnectConfig, type LetsConnectConfig } from './themeHelpers';
import { ICON_SIZES, RESPONSIVE_SPACING, THEME_COLORS } from './utils';

/**
 * Theme configuration object returned by the hook
 */
export interface ThemeConfig {
  // Layout classes
  bgColor: string;
  topMargin: string;
  contentMargin: string;
  titleColor: string;

  // Icons
  accountIcon: StaticImageData;
  iconSize: number;

  // Let's Connect configuration
  letsConnect: LetsConnectConfig;

  // Theme state
  darkMode: boolean;
  isMobile: boolean;
}

/**
 * Hook that provides all theme-dependent configuration for ProfileEditView
 *
 * Consolidates theme and responsive state into a single configuration object,
 * reducing the cognitive load in the main component.
 *
 * @returns Theme configuration object with all styling and icon selections
 *
 * @example
 * ```tsx
 * function ProfileEditView() {
 *   const { bgColor, accountIcon, iconSize, letsConnect } = useThemeConfig();
 *
 *   return (
 *     <div className={bgColor}>
 *       <Image src={accountIcon} width={iconSize} height={iconSize} />
 *       <Image src={letsConnect.banner} alt="Let's Connect" />
 *     </div>
 *   );
 * }
 * ```
 */
export function useThemeConfig(): ThemeConfig {
  const { darkMode } = useTheme();
  const { isMobile } = useApp();

  return {
    // Layout classes
    bgColor: darkMode ? THEME_COLORS.bgDark : THEME_COLORS.bgLight,
    topMargin: isMobile ? RESPONSIVE_SPACING.topMarginMobile : RESPONSIVE_SPACING.topMarginDesktop,
    contentMargin: isMobile ? '' : RESPONSIVE_SPACING.contentMarginDesktop,
    titleColor: darkMode ? THEME_COLORS.titleDark : THEME_COLORS.titleLight,

    // Icons
    accountIcon: getAccountIcon(darkMode),
    iconSize: isMobile ? ICON_SIZES.mobile : ICON_SIZES.desktop,

    // Let's Connect configuration
    letsConnect: getLetsConnectConfig(isMobile, darkMode),

    // Theme state (exposed for conditional rendering)
    darkMode,
    isMobile,
  };
}
