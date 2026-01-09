/**
 * Image constants used throughout the application
 */

export const DEFAULT_AVATAR = '/static/images/person.svg';
export const DEFAULT_AVATAR_WHITE = '/static/images/person_white.svg';
export const DEFAULT_ORGANIZATION_LOGO = '/static/images/person.svg';
export const DEFAULT_ORGANIZATION_LOGO_WHITE = '/static/images/person_white.svg';

/**
 * Returns the default avatar based on dark mode
 */
export const getDefaultAvatar = (): string => {
  return DEFAULT_AVATAR;
};

/**
 * Returns the default organization logo based on dark mode
 */
export const getDefaultOrganizationLogo = (darkMode: boolean = false): string => {
  return darkMode ? DEFAULT_ORGANIZATION_LOGO_WHITE : DEFAULT_ORGANIZATION_LOGO;
};
