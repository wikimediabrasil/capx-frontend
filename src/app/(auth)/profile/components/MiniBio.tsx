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

  const renderText = (text: string) => {
    if (!text) return pageContent['edit-profile-mini-bio-placeholder'];

    // Preserve line breaks and spaces
    return text.split('\n').map((line, index) => (
      <span key={index}>
        {line}
        {index < text.split('\n').length - 1 && <br />}
      </span>
    ));
  };

  if (isMobile) {
    return (
      <div
        className={`flex flex-col gap-4 w-full ${
          darkMode ? 'text-capx-light-bg' : 'text-capx-dark-box-bg'
        }`}
      >
        <div className="flex items-center gap-2">
          <Image
            src={darkMode ? PersonBookIconWhite : PersonBookIcon}
            alt={pageContent['edit-profile-mini-bio'] || 'Mini bio'}
            width={20}
            height={20}
          />
          <h2
            className={`text-[14px] font-[Montserrat] font-bold ${
              darkMode ? 'text-capx-light-bg' : 'text-capx-dark-box-bg'
            }`}
          >
            {pageContent['edit-profile-mini-bio']}
          </h2>
        </div>

        {isEditing ? (
          <MiniBioTextarea
            value={about}
            onChange={onAboutChange || (() => {})}
            placeholder={pageContent['edit-profile-mini-bio-placeholder']}
            maxLength={maxLength}
            className="text-[14px] leading-relaxed"
          />
        ) : (
          <div
            className={`w-full max-w-full overflow-hidden ${
              darkMode ? 'text-capx-light-bg' : 'text-capx-dark-box-bg'
            }`}
          >
            <p
              className={`text-[14px] font-[Montserrat] leading-relaxed break-words hyphens-auto overflow-wrap-anywhere ${
                darkMode ? 'text-capx-light-bg' : 'text-capx-dark-box-bg'
              }`}
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
            className={`font-[Montserrat] text-[12px] not-italic font-normal leading-[15px] ${
              darkMode ? 'text-white' : 'text-[#053749]'
            }`}
          >
            {pageContent['edit-profile-mini-bio-tooltip']}
          </span>
        )}
      </div>
    );
  }

  return (
    <div
      className={`flex flex-col gap-4 w-full ${darkMode ? 'text-capx-light-bg' : 'text-capx-dark-box-bg'}`}
    >
      <div className="flex items-center gap-2">
        <Image
          src={darkMode ? PersonBookIconWhite : PersonBookIcon}
          alt={pageContent['edit-profile-mini-bio'] || 'Mini bio'}
          width={42}
          height={42}
        />
        <h2
          className={`text-[24px] font-[Montserrat] font-bold ${
            darkMode ? 'text-capx-light-bg' : 'text-capx-dark-box-bg'
          }`}
        >
          {pageContent['edit-profile-mini-bio']}
        </h2>
      </div>

      {isEditing ? (
        <MiniBioTextarea
          value={about}
          onChange={onAboutChange || (() => {})}
          placeholder={pageContent['edit-profile-mini-bio-placeholder']}
          maxLength={maxLength}
          className="text-[24px] leading-relaxed"
        />
      ) : (
        <div
          className={`w-full max-w-full overflow-hidden ${
            darkMode ? 'text-capx-light-bg' : 'text-capx-dark-box-bg'
          }`}
        >
          <p
            className={`text-[24px] font-[Montserrat] leading-relaxed break-words hyphens-auto overflow-wrap-anywhere ${
              darkMode ? 'text-capx-light-bg' : 'text-capx-dark-box-bg'
            }`}
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
          className={`font-[Montserrat] text-[20px] not-italic font-normal leading-normal ${
            darkMode ? 'text-white' : 'text-[#053749]'
          }`}
        >
          {pageContent['edit-profile-mini-bio-tooltip']}
        </span>
      )}
    </div>
  );
}
