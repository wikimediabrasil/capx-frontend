/**
 * Wikidata Item Section Component
 * Allows users to consent to using their Wikidata item for profile information
 */

import { useTheme } from '@/contexts/ThemeContext';
import { useApp } from '@/contexts/AppContext';
import Image from 'next/image';
import BaseButton from '@/components/BaseButton';
import { getBarcodeIcon, getCheckboxIcon } from './themeHelpers';
import { ICON_SIZES, RESPONSIVE_BORDER_RADIUS, RESPONSIVE_TEXT_SIZES } from './utils';
import { renderTextWithLink } from './textHelpers';

interface WikidataItemSectionProps {
  readonly isWikidataSelected: boolean;
  readonly handleWikidataClick: (selected: boolean) => void;
}

/**
 * Component for managing Wikidata item consent checkbox
 *
 * @param isWikidataSelected - Whether the Wikidata checkbox is checked
 * @param handleWikidataClick - Callback when checkbox state changes
 */
export function WikidataItemSection({
  isWikidataSelected,
  handleWikidataClick,
}: WikidataItemSectionProps) {
  const { darkMode } = useTheme();
  const { isMobile, pageContent } = useApp();

  const barcodeIcon = getBarcodeIcon(darkMode);
  const checkboxIcon = getCheckboxIcon(isWikidataSelected, darkMode);
  const iconSize = isMobile ? ICON_SIZES.mobile : ICON_SIZES.mobileLarge;

  const titleClass = `font-[Montserrat] text-[14px] md:text-[24px] font-bold ${
    darkMode ? 'text-white' : 'text-[#053749]'
  }`;

  const buttonClass = `w-full flex justify-between items-center px-[13px] py-[6px] ${RESPONSIVE_BORDER_RADIUS.small} font-[Montserrat] ${RESPONSIVE_TEXT_SIZES.medium} appearance-none mb-0 pb-[6px] ${
    darkMode
      ? 'bg-transparent border-white text-white opacity-50 placeholder-gray-400'
      : 'border-[#053749] text-[#829BA4]'
  } border`;

  const helpTextClass = `${RESPONSIVE_TEXT_SIZES.small} font-[Montserrat] not-italic font-normal leading-[15px] md:leading-normal ${
    darkMode ? 'text-white' : 'text-[#053749]'
  }`;

  const consentText = pageContent['edit-profile-consent-wikidata-item-before-link'];
  const linkText = pageContent['edit-profile-consent-wikidata-link'];
  const linkHref = 'https://www.wikidata.org/wiki/Wikidata:Notability';

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <Image src={barcodeIcon} alt="Wikidata item icon" width={iconSize} height={iconSize} />
        <h2 className={titleClass}>{pageContent['edit-profile-wikidata-item']}</h2>
      </div>
      <div className="flex items-center gap-2 py-[6px]">
        <BaseButton
          onClick={() => handleWikidataClick(!isWikidataSelected)}
          label={pageContent['edit-profile-use-wikidata-item']}
          customClass={buttonClass}
          imageUrl={checkboxIcon.src}
          imageAlt="Check icon"
          imageWidth={isMobile ? 20 : 24}
          imageHeight={isMobile ? 20 : 24}
        />
      </div>
      <span className={helpTextClass}>
        {renderTextWithLink(consentText, linkText, linkHref, darkMode)}
      </span>
    </div>
  );
}
