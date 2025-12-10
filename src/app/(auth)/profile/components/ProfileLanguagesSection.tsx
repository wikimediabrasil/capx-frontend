'use client';

import ProfileFieldSection from './ProfileFieldSection';
import LanguageIcon from '@/public/static/images/language.svg';
import LanguageIconWhite from '@/public/static/images/language_white.svg';
import { useTheme } from '@/contexts/ThemeContext';
import { useApp } from '@/contexts/AppContext';
import { LanguageProficiency } from '@/types/language';

interface ProfileLanguagesSectionProps {
  languages: LanguageProficiency[];
  languagesMap: { [key: number]: string };
  getProficiencyLabel: (proficiency: string) => string;
}

export default function ProfileLanguagesSection({
  languages,
  languagesMap,
  getProficiencyLabel,
}: ProfileLanguagesSectionProps) {
  const { darkMode } = useTheme();
  const { isMobile, pageContent } = useApp();
  const textSize = isMobile ? 'text-[14px]' : 'text-[24px]';

  return (
    <ProfileFieldSection
      icon={darkMode ? LanguageIconWhite : LanguageIcon}
      iconAlt="Language icon"
      title={pageContent['body-profile-languages-title']}
    >
      {languages && languages.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {languages.map((lang, index) => (
            <div
              key={index}
              className={`rounded-[4px] px-[4px] py-[6px] ${
                darkMode ? 'bg-capx-dark-bg' : 'bg-[#EFEFEF]'
              }`}
            >
              <span
                className={`font-[Montserrat] ${textSize} ${darkMode ? 'text-white' : 'text-[#053749]'}`}
              >
                {languagesMap[lang.id]} - {getProficiencyLabel(lang.proficiency)}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <span
          className={`font-[Montserrat] ${textSize} ${darkMode ? 'text-white' : 'text-[#053749]'}`}
        >
          {pageContent['empty-field']}
        </span>
      )}
    </ProfileFieldSection>
  );
}
