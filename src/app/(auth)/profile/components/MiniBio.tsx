import MiniBioTextarea from '@/components/MiniBioTextarea';
import PersonBookIcon from '@/public/static/images/person_book.svg';
import PersonBookIconWhite from '@/public/static/images/person_book_white.svg';
import { useDarkMode, useIsMobile, usePageContent } from '@/stores';
import Image from 'next/image';
import { CSSProperties, ReactNode } from 'react';
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

function getMiniBioLanguageName(
  aboutLanguage: number | null | undefined,
  languages: Record<string, string> | undefined,
  pageContent: any
): string {
  const notSpecified = pageContent['profile-mini-bio-language-not-specified'] || 'Not specified';
  if (!aboutLanguage || !languages) return notSpecified;
  return languages[aboutLanguage.toString()] || notSpecified;
}

function renderMiniBioText(text: string, pageContent: any): ReactNode {
  if (!text) return pageContent['edit-profile-mini-bio-placeholder'];

  const lines = text.split('\n');
  return lines.map((line, index) => (
    <span key={index}>
      {line}
      {index < lines.length - 1 && <br />}
    </span>
  ));
}

function MiniBioHeader({
  darkMode,
  pageContent,
  iconWrapperClassName,
  iconWrapperStyle,
  titleClassName,
}: {
  darkMode: boolean;
  pageContent: any;
  iconWrapperClassName: string;
  iconWrapperStyle?: CSSProperties;
  titleClassName: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <div className={iconWrapperClassName} style={iconWrapperStyle}>
        <Image
          src={darkMode ? PersonBookIconWhite : PersonBookIcon}
          alt={pageContent['edit-profile-mini-bio'] || 'Mini bio'}
          fill
          className="object-contain"
        />
      </div>
      <h2
        className={`${titleClassName} font-[Montserrat] font-bold ${
          darkMode ? 'text-capx-light-bg' : 'text-capx-dark-box-bg'
        }`}
      >
        {pageContent['edit-profile-mini-bio']}
      </h2>
    </div>
  );
}

interface MiniBioLanguageInfoProps {
  isEditing: boolean;
  languages?: Record<string, string>;
  onAboutLanguageChange?: (value: number | null) => void;
  aboutLanguage?: number | null;
  sortedLanguages: [string, string][];
  pageContent: any;
  darkMode: boolean;
  labelClassName: string;
}

function MiniBioLanguageInfo({
  isEditing,
  languages,
  onAboutLanguageChange,
  aboutLanguage,
  sortedLanguages,
  pageContent,
  darkMode,
  labelClassName,
}: MiniBioLanguageInfoProps) {
  return (
    <>
      {!isEditing && (
        <p
          className={`${labelClassName} font-[Montserrat] font-normal ${
            darkMode ? 'text-capx-light-bg opacity-80' : 'text-capx-dark-box-bg opacity-70'
          }`}
        >
          {pageContent['profile-mini-bio-language-label'] || 'Language:'}{' '}
          {getMiniBioLanguageName(aboutLanguage, languages, pageContent)}
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
    </>
  );
}

interface MiniBioTextProps {
  isEditing: boolean;
  about: string;
  onAboutChange?: (value: string) => void;
  maxLength: number;
  pageContent: any;
  textareaClassName: string;
  textClassName: string;
  textColorClassName: string;
}

function MiniBioText({
  isEditing,
  about,
  onAboutChange,
  maxLength,
  pageContent,
  textareaClassName,
  textClassName,
  textColorClassName,
}: MiniBioTextProps) {
  if (isEditing) {
    return (
      <MiniBioTextarea
        value={about}
        onChange={onAboutChange || (() => {})}
        placeholder={pageContent['edit-profile-mini-bio-placeholder']}
        maxLength={maxLength}
        className={textareaClassName}
      />
    );
  }

  return (
    <div className={`w-full max-w-full overflow-hidden ${textColorClassName}`}>
      <p
        className={`${textClassName} font-[Montserrat] leading-relaxed break-words hyphens-auto overflow-wrap-anywhere ${textColorClassName}`}
        style={{
          wordBreak: 'break-word',
          overflowWrap: 'break-word',
          hyphens: 'auto',
          maxWidth: '100%',
        }}
      >
        {renderMiniBioText(about, pageContent)}
      </p>
    </div>
  );
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
  const sortedLanguages: [string, string][] = languages
    ? Object.entries(languages).sort((a, b) => a[1].localeCompare(b[1]))
    : [];

  const languageInfoProps = {
    isEditing,
    languages,
    onAboutLanguageChange,
    aboutLanguage,
    sortedLanguages,
    pageContent,
    darkMode,
  };

  if (isMobile) {
    return (
      <div className={`flex flex-col gap-4 w-full ${textColor}`}>
        <MiniBioHeader
          darkMode={darkMode}
          pageContent={pageContent}
          iconWrapperClassName="relative w-5 h-5"
          titleClassName="text-[14px]"
        />
        <MiniBioLanguageInfo {...languageInfoProps} labelClassName="text-[12px]" />
        <MiniBioText
          isEditing={isEditing}
          about={about}
          onAboutChange={onAboutChange}
          maxLength={maxLength}
          pageContent={pageContent}
          textareaClassName="text-[14px] leading-relaxed"
          textClassName="text-[14px]"
          textColorClassName={textColor}
        />
      </div>
    );
  }

  return (
    <div className={`flex flex-col gap-4 w-full ${textColor}`}>
      <MiniBioHeader
        darkMode={darkMode}
        pageContent={pageContent}
        iconWrapperClassName="relative"
        iconWrapperStyle={{ width: iconSize, height: iconSize }}
        titleClassName="text-[24px]"
      />
      <MiniBioLanguageInfo {...languageInfoProps} labelClassName="text-[18px]" />
      <MiniBioText
        isEditing={isEditing}
        about={about}
        onAboutChange={onAboutChange}
        maxLength={maxLength}
        pageContent={pageContent}
        textareaClassName={`${fontSize} leading-relaxed`}
        textClassName={fontSize}
        textColorClassName={textColor}
      />

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
