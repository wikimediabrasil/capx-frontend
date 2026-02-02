import Image from 'next/image';
import PersonBookIcon from '@/public/static/images/person_book.svg';
import PersonBookIconWhite from '@/public/static/images/person_book_white.svg';
import { useTheme } from '@/contexts/ThemeContext';
import { useApp } from '@/contexts/AppContext';
import MiniBioTextarea from '@/components/MiniBioTextarea';

interface MiniBioProps {
  about: string;
  onAboutChange?: (value: string) => void;
  isEditing?: boolean;
  maxLength?: number;
  showTooltip?: boolean;
}

export default function MiniBio({
  about,
  onAboutChange,
  isEditing = false,
  maxLength = 2000,
  showTooltip = false,
}: MiniBioProps) {
  const { darkMode } = useTheme();
  const { isMobile, pageContent } = useApp();

  const iconSize = isMobile ? 20 : 42;
  const fontSize = isMobile ? 'text-[14px]' : 'text-[24px]';
  const tooltipSize = isMobile ? 'text-[12px] leading-[15px]' : 'text-[20px] leading-normal';
  const textColor = darkMode ? 'text-capx-light-bg' : 'text-capx-dark-box-bg';

  const renderText = (text: string) => {
    if (!text) return pageContent['edit-profile-mini-bio-placeholder'];

    const lines = text.split('\n');
    return lines.map((line, index) => (
      <span key={index}>
        {line}
        {index < lines.length - 1 && <br />}
      </span>
    ));
  };

  return (
    <div className={`flex flex-col gap-4 w-full ${textColor}`}>
      <div className="flex items-center gap-2">
        <Image
          src={darkMode ? PersonBookIconWhite : PersonBookIcon}
          alt={pageContent['edit-profile-mini-bio'] || 'Mini bio'}
          width={iconSize}
          height={iconSize}
        />
        <h2 className={`${fontSize} font-[Montserrat] font-bold ${textColor}`}>
          {pageContent['edit-profile-mini-bio']}
        </h2>
      </div>

      {isEditing ? (
        <MiniBioTextarea
          value={about}
          onChange={onAboutChange || (() => {})}
          placeholder={pageContent['edit-profile-mini-bio-placeholder']}
          maxLength={maxLength}
          className={`${fontSize} leading-relaxed`}
        />
      ) : (
        <div className={`w-full max-w-full overflow-hidden ${textColor}`}>
          <p
            className={`${fontSize} font-[Montserrat] leading-relaxed break-words hyphens-auto overflow-wrap-anywhere ${textColor}`}
            style={{
              wordBreak: 'break-word',
              overflowWrap: 'break-word',
              hyphens: 'auto',
              maxWidth: '100%',
            }}
          >
            {renderText(about)}
          </p>
        </div>
      )}

      {showTooltip && (
        <span
          className={`font-[Montserrat] ${tooltipSize} not-italic font-normal ${
            darkMode ? 'text-white' : 'text-[#053749]'
          }`}
        >
          {pageContent['edit-profile-mini-bio-tooltip']}
        </span>
      )}
    </div>
  );
}
