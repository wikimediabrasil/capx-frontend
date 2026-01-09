/**
 * Utility constants for ProfileEditView components
 * Centralizes common constants to reduce code duplication
 */

/**
 * Capacity border colors by type
 */
export const CAPACITY_BORDER_COLORS = {
  known: '#0070B9',
  available: '#05A300',
  wanted: '#D43831',
} as const;

/**
 * Gets the border color style string for capacity type
 */
export const getCapacityBorderStyle = (type: 'known' | 'available' | 'wanted') => {
  return `border-[${CAPACITY_BORDER_COLORS[type]}]`;
};

/**
 * Common responsive text sizes
 */
export const RESPONSIVE_TEXT_SIZES = {
  small: 'text-[12px] md:text-[20px]',
  medium: 'text-[12px] md:text-[24px]',
  large: 'text-[14px] md:text-[24px]',
} as const;

/**
 * Common responsive padding sizes
 */
export const RESPONSIVE_PADDING = {
  small: 'px-[4px] py-[6px] md:px-3 md:py-6',
  medium: 'px-[13px] py-[6px] md:px-8 md:py-4',
} as const;

/**
 * Common responsive border radius
 */
export const RESPONSIVE_BORDER_RADIUS = {
  small: 'rounded-[4px] md:rounded-[16px]',
  button: 'rounded-md',
} as const;

/**
 * Common responsive icon sizes
 */
export const ICON_SIZES = {
  mobile: 20,
  desktop: 30,
  mobileLarge: 24,
  desktopLarge: 48,
} as const;

/**
 * Theme-based color classes
 */
export const THEME_COLORS = {
  titleLight: 'text-[#053749]',
  titleDark: 'text-white',
  bgLight: 'bg-white text-[#053749]',
  bgDark: 'bg-[#053749] text-white',
  textLight: 'text-[#053749]',
  textDark: 'text-white',
  borderLight: 'border-[#053749]',
  borderDark: 'border-white',
  placeholderLight: 'text-[#829BA4]',
  placeholderDark: 'text-white opacity-50 placeholder-gray-400',
} as const;

/**
 * Common responsive margin/spacing
 */
export const RESPONSIVE_SPACING = {
  topMarginMobile: 'mt-[80px]',
  topMarginDesktop: 'mt-[64px]',
  contentMarginDesktop: 'mx-[80px]',
} as const;
