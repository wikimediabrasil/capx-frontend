/**
 * Utility functions and constants for ProfileEditView components
 * Centralizes common logic to reduce code duplication
 */

/**
 * Gets the appropriate icon based on dark mode
 */
export const getThemedIcon = (lightIcon: string, darkIcon: string, darkMode: boolean) => {
  return darkMode ? darkIcon : lightIcon;
};

/**
 * Gets responsive size based on mobile state
 */
export const getResponsiveSize = (mobileSize: number, desktopSize: number, isMobile: boolean) => {
  return isMobile ? mobileSize : desktopSize;
};

/**
 * Gets text color classes based on dark mode
 */
export const getTextColorClass = (darkMode: boolean) => {
  return darkMode ? 'text-white' : 'text-[#053749]';
};

/**
 * Gets background color classes based on dark mode
 */
export const getBgColorClass = (darkMode: boolean) => {
  return darkMode ? 'bg-[#04222F]' : 'bg-[#EFEFEF]';
};

/**
 * Gets button background and text color classes based on dark mode
 */
export const getButtonColorClasses = (darkMode: boolean) => {
  return darkMode ? 'bg-capx-light-box-bg text-[#04222F]' : 'bg-[#053749] text-white';
};

/**
 * Gets border button color classes based on dark mode
 */
export const getBorderButtonClasses = (darkMode: boolean) => {
  return darkMode
    ? 'bg-transparent text-[#F6F6F6] border-[#F6F6F6] border-[2px]'
    : 'bg-[#F6F6F6] border-[#053749] text-[#053749]';
};

/**
 * Gets select input style object based on dark mode
 */
export const getSelectStyles = (darkMode: boolean) => {
  return {
    backgroundColor: darkMode ? '#053749' : 'white',
    color: darkMode ? 'white' : '#053749',
  };
};

/**
 * Capacity border colors by type
 */
export const CAPACITY_BORDER_COLORS = {
  known: '#0070B9',
  available: '#05A300',
  wanted: '#D43831',
} as const;

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
