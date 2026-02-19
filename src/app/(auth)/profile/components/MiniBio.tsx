import MiniBioTextarea from '@/components/MiniBioTextarea';
import PersonBookIcon from '@/public/static/images/person_book.svg';
import PersonBookIconWhite from '@/public/static/images/person_book_white.svg';
import { useDarkMode, useIsMobile, usePageContent } from '@/stores';
import Image from 'next/image';
import { FormSelect } from '../edit/components/ProfileEditView/FormSelect';
import { RESPONSIVE_TEXT_SIZES } from '../edit/components/ProfileEditView/utils';

interface MiniBioProps {
  about: string;
  onAboutChange?: (value: string) => void;
  isEditing?: boolean;
  maxLength?: number;
  showTooltip?: boolean;
  aboutLanguage?: number | null;
  languages?: Record<string, string>;
  onAboutLanguageChange?: (value: number | null) => void;
}

export default function MiniBio({
  about,
  onAboutChange,
  isEditing = false,
  maxLength = 2000,
  showTooltip = false,
  aboutLanguage,
  languages,
  onAboutLanguageChange,
}: MiniBioProps) {
  const darkMode = useDarkMode();
  const isMobile = useIsMobile();
  const pageContent = usePageContent();

  const iconSize = isMobile ? 20 : 42;
  const fontSize = isMobile ? 'text-[14px]' : 'text-[24px]';
  const tooltipSize = isMobile ? 'text-[12px] leading-[15px]' : 'text-[20px] leading-normal';
  const textColor = darkMode ? 'text-capx-light-bg' : 'text-capx-dark-box-bg';

  // Sort languages alphabetically
  const sortedLanguages = languages
    ? Object.entries(languages).sort((a, b) => a[1].localeCompare(b[1]))
    : [];

  const getLanguageName = () => {
    if (!aboutLanguage || !languages) {
      return pageContent['profile-mini-bio-language-not-specified'] || 'Not specified';
    }
    return (
      languages[aboutLanguage.toString()] ||
      pageContent['profile-mini-bio-language-not-specified'] ||
      'Not specified'
    );
  };

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

  if (isMobile) {
    return (
      <div
        className={`flex flex-col gap-4 w-full ${
          darkMode ? 'text-capx-light-bg' : 'text-capx-dark-box-bg'
        }`}
      >
        <div className="flex items-center gap-2">
          <div className="relative w-5 h-5">
            <Image
              src={darkMode ? PersonBookIconWhite : PersonBookIcon}
              alt={pageContent['edit-profile-mini-bio'] || 'Mini bio'}
              fill
              className="object-contain"
            />
          </div>
          <h2
            className={`text-[14px] font-[Montserrat] font-bold ${
              darkMode ? 'text-capx-light-bg' : 'text-capx-dark-box-bg'
            }`}
          >
            {pageContent['edit-profile-mini-bio']}
          </h2>
        </div>

        {!isEditing && (
          <p
            className={`text-[12px] font-[Montserrat] font-normal ${
              darkMode ? 'text-capx-light-bg opacity-80' : 'text-capx-dark-box-bg opacity-70'
            }`}
          >
            {pageContent['profile-mini-bio-language-label'] || 'Language:'} {getLanguageName()}
          </p>
        )}

        {isEditing && languages && onAboutLanguageChange && (
          <>
            <FormSelect
              value={aboutLanguage?.toString() || ''}
              onChange={value => onAboutLanguageChange(value === '' ? null : Number(value))}
              options={Object.fromEntries(sortedLanguages)}
              placeholder={
                pageContent['edit-profile-mini-bio-language-not-specified'] || 'Not specified'
              }
            />
            <span
              className={`${RESPONSIVE_TEXT_SIZES.small} font-[Montserrat] not-italic font-normal leading-[15px] md:leading-normal ${
                darkMode ? 'text-white' : 'text-[#053749]'
              }`}
            >
              {pageContent['edit-profile-mini-bio-language-tooltip'] ||
                pageContent['edit-profile-mini-bio-language'] ||
                'Select the language of your mini-bio'}
            </span>
          </>
        )}

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
      </div>
    );
  }

  return (
    <div className={`flex flex-col gap-4 w-full ${textColor}`}>
      <div className="flex items-center gap-2">
        <div className="relative" style={{ width: iconSize, height: iconSize }}>
          <Image
            src={darkMode ? PersonBookIconWhite : PersonBookIcon}
            alt={pageContent['edit-profile-mini-bio'] || 'Mini bio'}
            fill
            className="object-contain"
          />
        </div>
        <h2
          className={`text-[24px] font-[Montserrat] font-bold ${
            darkMode ? 'text-capx-light-bg' : 'text-capx-dark-box-bg'
          }`}
        >
          {pageContent['edit-profile-mini-bio']}
        </h2>
      </div>

      {!isEditing && (
        <p
          className={`text-[18px] font-[Montserrat] font-normal ${
            darkMode ? 'text-capx-light-bg opacity-80' : 'text-capx-dark-box-bg opacity-70'
          }`}
        >
          {pageContent['profile-mini-bio-language-label'] || 'Language:'} {getLanguageName()}
        </p>
      )}

      {isEditing && languages && onAboutLanguageChange && (
        <>
          <FormSelect
            value={aboutLanguage?.toString() || ''}
            onChange={value => onAboutLanguageChange(value === '' ? null : Number(value))}
            options={Object.fromEntries(sortedLanguages)}
            placeholder={
              pageContent['edit-profile-mini-bio-language-not-specified'] || 'Not specified'
            }
          />
          <span
            className={`${RESPONSIVE_TEXT_SIZES.small} font-[Montserrat] not-italic font-normal leading-[15px] md:leading-normal ${
              darkMode ? 'text-white' : 'text-[#053749]'
            }`}
          >
            {pageContent['edit-profile-mini-bio-language-tooltip'] ||
              pageContent['edit-profile-mini-bio-language'] ||
              'Select the language of your mini-bio'}
          </span>
        </>
      )}

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
