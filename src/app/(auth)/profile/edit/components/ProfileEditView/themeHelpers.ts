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
import TerritoryIcon from '@/public/static/images/territory.svg';
import TerritoryIconWhite from '@/public/static/images/territory_white.svg';
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
