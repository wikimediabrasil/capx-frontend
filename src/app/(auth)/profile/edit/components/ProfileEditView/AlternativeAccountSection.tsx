/**
 * Alternative Wikimedia Account Section Component
 * Allows users to specify an alternative Wikimedia username
 */

import { useTheme } from '@/contexts/ThemeContext';
import { useApp } from '@/contexts/AppContext';
import Image from 'next/image';
import { getWikiIcon } from './themeHelpers';
import { ICON_SIZES, RESPONSIVE_BORDER_RADIUS, RESPONSIVE_TEXT_SIZES } from './utils';

interface AlternativeAccountSectionProps {
  readonly wikiAlt: string | undefined;
  readonly onChange: (value: string) => void;
}

/**
 * Component for managing alternative Wikimedia account username
 *
 * @param wikiAlt - Current alternative wiki account value
 * @param onChange - Callback when the value changes
 */
export function AlternativeAccountSection({ wikiAlt, onChange }: AlternativeAccountSectionProps) {
  const { darkMode } = useTheme();
  const { isMobile, pageContent } = useApp();

  const wikiIcon = getWikiIcon(darkMode);
  const iconSize = isMobile ? ICON_SIZES.mobile : ICON_SIZES.desktopLarge;

  const titleClass = `font-[Montserrat] text-[12px] md:text-[24px] font-bold ${
    darkMode ? 'text-white' : 'text-[#053749]'
  }`;

  const inputClass = `w-full px-4 py-2 ${RESPONSIVE_BORDER_RADIUS.small} font-[Montserrat] ${RESPONSIVE_TEXT_SIZES.medium} ${
    darkMode
      ? 'bg-transparent border-white text-white opacity-50 placeholder-gray-400'
      : 'border-[#053749] text-[#829BA4]'
  } border`;

  const helpTextClass = `${RESPONSIVE_TEXT_SIZES.small} font-[Montserrat] not-italic font-normal leading-[15px] md:leading-normal ${
    darkMode ? 'text-white' : 'text-[#053749]'
  }`;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <Image src={wikiIcon} alt="Alternative account icon" width={iconSize} height={iconSize} />
        <h2 className={titleClass}>{pageContent['body-profile-box-title-alt-wiki-acc']}</h2>
      </div>
      <input
        type="text"
        placeholder={pageContent['edit-profile-insert-item']}
        value={wikiAlt || ''}
        onChange={e => onChange(e.target.value)}
        className={inputClass}
      />
      <span className={helpTextClass}>{pageContent['edit-profile-share-username']}</span>
    </div>
  );
}
