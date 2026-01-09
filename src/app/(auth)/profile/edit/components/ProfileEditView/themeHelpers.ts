/**
 * Theme-based helper functions for ProfileEditView
 * Consolidates icon and class selection logic based on theme and responsive state
 */

import type { StaticImageData } from 'next/image';

import AccountCircleIcon from '@/public/static/images/account_circle.svg';
import AccountCircleIconWhite from '@/public/static/images/account_circle_white.svg';
import AffiliationIcon from '@/public/static/images/affiliation.svg';
import AffiliationIconWhite from '@/public/static/images/affiliation_white.svg';
import BarCodeIcon from '@/public/static/images/barcode.svg';
import BarCodeIconWhite from '@/public/static/images/barcode_white.svg';
import CheckBoxFilledIcon from '@/public/static/images/check_box.svg';
import CheckBoxFilledIconWhite from '@/public/static/images/check_box_light.svg';
import CheckIcon from '@/public/static/images/check_box_outline_blank.svg';
import CheckIconWhite from '@/public/static/images/check_box_outline_blank_light.svg';
import LetsConectBanner from '@/public/static/images/lets_connect.svg';
import LetsConect from '@/public/static/images/lets_connect_desktop.svg';
import LetsConectTextDesktop from '@/public/static/images/lets_connect_text_desktop.svg';
import LetsConectText from '@/public/static/images/lets_connect_text_img.svg';
import LetsConectTitle from '@/public/static/images/lets_connect_title.svg';
import LetsConectTitleLight from '@/public/static/images/lets_connect_title_light.svg';
import TerritoryIcon from '@/public/static/images/territory.svg';
import TerritoryIconWhite from '@/public/static/images/territory_white.svg';
import UserCheckIcon from '@/public/static/images/user_check.svg';
import UserCheckIconDark from '@/public/static/images/user_check_dark.svg';
import WikiIcon from '@/public/static/images/wikimedia_logo_black.svg';
import WikiIconWhite from '@/public/static/images/wikimedia_logo_white.svg';

/**
 * Returns the appropriate checkbox icon based on selection state and theme
 * @param isSelected - Whether the checkbox is selected
 * @param darkMode - Whether dark mode is active
 * @returns The appropriate checkbox icon
 */
export const getCheckboxIcon = (isSelected: boolean, darkMode: boolean): StaticImageData => {
  if (isSelected) {
    return darkMode ? CheckBoxFilledIconWhite : CheckBoxFilledIcon;
  }
  return darkMode ? CheckIconWhite : CheckIcon;
};

/**
 * Returns the appropriate account circle icon based on theme
 * @param darkMode - Whether dark mode is active
 * @returns The appropriate account icon
 */
export const getAccountIcon = (darkMode: boolean): StaticImageData => {
  return darkMode ? AccountCircleIconWhite : AccountCircleIcon;
};

/**
 * Returns the appropriate Wikimedia icon based on theme
 * @param darkMode - Whether dark mode is active
 * @returns The appropriate wiki icon
 */
export const getWikiIcon = (darkMode: boolean): StaticImageData => {
  return darkMode ? WikiIconWhite : WikiIcon;
};

/**
 * Returns the appropriate barcode icon based on theme
 * @param darkMode - Whether dark mode is active
 * @returns The appropriate barcode icon
 */
export const getBarcodeIcon = (darkMode: boolean): StaticImageData => {
  return darkMode ? BarCodeIconWhite : BarCodeIcon;
};

/**
 * Returns the appropriate user check icon based on theme
 * @param darkMode - Whether dark mode is active
 * @returns The appropriate user check icon
 */
export const getUserCheckIcon = (darkMode: boolean): StaticImageData => {
  return darkMode ? UserCheckIconDark : UserCheckIcon;
};

/**
 * Returns the appropriate affiliation icon based on theme
 * @param darkMode - Whether dark mode is active
 * @returns The appropriate affiliation icon
 */
export const getAffiliationIcon = (darkMode: boolean): StaticImageData => {
  return darkMode ? AffiliationIconWhite : AffiliationIcon;
};

/**
 * Returns the appropriate territory icon based on theme
 * @param darkMode - Whether dark mode is active
 * @returns The appropriate territory icon
 */
export const getTerritoryIcon = (darkMode: boolean): StaticImageData => {
  return darkMode ? TerritoryIconWhite : TerritoryIcon;
};

/**
 * Configuration object for Let's Connect section styling and images
 */
export interface LetsConnectConfig {
  banner: string;
  titleImage: StaticImageData;
  titleImageMobile: StaticImageData;
  titleImageDesktop: StaticImageData;
  bgClass: string;
  buttonClass: string;
  textColor: string;
}

/**
 * Returns complete Let's Connect configuration based on responsive and theme state
 * @param isMobile - Whether the device is mobile
 * @param darkMode - Whether dark mode is active
 * @returns Configuration object with all Let's Connect styling and images
 */
export const getLetsConnectConfig = (isMobile: boolean, darkMode: boolean): LetsConnectConfig => {
  const bannerImage = isMobile ? LetsConectBanner : LetsConect;
  return {
    banner: bannerImage.src,
    titleImage: darkMode ? LetsConectTitleLight : LetsConectTitle,
    titleImageMobile: LetsConectText,
    titleImageDesktop: LetsConectTextDesktop,
    bgClass: isMobile ? 'bg-[#EFEFEF] pb-[6px] rounded-2 mb-4' : '',
    buttonClass: darkMode ? 'bg-capx-light-box-bg text-[#04222F]' : 'bg-[#053749] text-white',
    textColor: darkMode ? 'text-white' : 'text-[#053749]',
  };
};
