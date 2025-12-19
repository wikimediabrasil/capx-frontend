import { useTheme } from '@/contexts/ThemeContext';
import { useApp } from '@/contexts/AppContext';
import Image from 'next/image';
import LanguageIcon from '@/public/static/images/language.svg';
import LanguageIconWhite from '@/public/static/images/language_white.svg';
import CloseIconWhite from '@/public/static/images/close_mobile_menu_icon_dark_mode.svg';
import CloseIcon from '@/public/static/images/close_mobile_menu_icon_light_mode.svg';
import ArrowDownIcon from '@/public/static/images/arrow_drop_down_circle.svg';
import ArrowDownIconWhite from '@/public/static/images/arrow_drop_down_circle_white.svg';
import { Profile } from '@/types/profile';
import { FormSelect } from './FormSelect';
import { ResponsiveIcon } from './ResponsiveIcon';
import { getSelectStyles, RESPONSIVE_TEXT_SIZES, RESPONSIVE_BORDER_RADIUS } from './utils';

interface LanguageSectionProps {
  readonly formData: Partial<Profile>;
  readonly setFormData: (data: Partial<Profile>) => void;
  readonly languages: Record<string, string>;
  readonly handleRemoveLanguage: (index: number) => void;
  readonly addLanguageToFormData: (
    formData: Partial<Profile>,
    languageId: number,
    proficiency: string,
    languageName: string
  ) => Partial<Profile>;
}

const PROFICIENCY_LEVELS = [
  { value: '0', key: 'profiency-level-not-proficient' },
  { value: '1', key: 'profiency-level-basic' },
  { value: '2', key: 'profiency-level-intermediate' },
  { value: '3', key: 'profiency-level-advanced' },
  { value: '4', key: 'profiency-level-almost-native' },
  { value: '5', key: 'profiency-level-professional' },
  { value: 'n', key: 'profiency-level-native' },
];

export function LanguageSection({
  formData,
  setFormData,
  languages,
  handleRemoveLanguage,
  addLanguageToFormData,
}: LanguageSectionProps) {
  const { darkMode } = useTheme();
  const { isMobile, pageContent } = useApp();
  const selectStyles = getSelectStyles(darkMode);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <ResponsiveIcon
          lightIcon={LanguageIcon}
          darkIcon={LanguageIconWhite}
          alt="Language icon"
          mobileSize={20}
          desktopSize={48}
        />
        <h2
          className={`font-[Montserrat] ${RESPONSIVE_TEXT_SIZES.large} font-bold ${
            darkMode ? 'text-white' : 'text-[#053749]'
          }`}
        >
          {pageContent['body-profile-languages-title']}
        </h2>
      </div>

      {/* Language List */}
      <div className="flex flex-wrap gap-2">
        {formData.language?.map((lang, index) => (
          <div
            key={`language-${lang.id}-${index}`}
            className={`flex items-center gap-2 p-2 rounded ${
              darkMode ? 'bg-capx-dark-bg' : 'bg-[#EFEFEF]'
            }`}
          >
            <span className={`font-[Montserrat] ${RESPONSIVE_TEXT_SIZES.medium}`}>
              {languages[lang.id]}
            </span>
            <select
              value={lang.proficiency}
              onChange={e => {
                const newLanguages = [...(formData.language || [])];
                newLanguages[index] = {
                  ...newLanguages[index],
                  proficiency: e.target.value,
                };
                setFormData({
                  ...formData,
                  language: newLanguages,
                });
              }}
              className={`ml-2 p-1 rounded border ${RESPONSIVE_TEXT_SIZES.medium} ${
                darkMode
                  ? 'bg-transparent border-white text-white'
                  : 'border-[#053749] text-[#829BA4]'
              }`}
              style={selectStyles}
            >
              {PROFICIENCY_LEVELS.map(level => (
                <option key={level.value} value={level.value} style={selectStyles}>
                  {pageContent[level.key]}
                </option>
              ))}
            </select>
            <button onClick={() => handleRemoveLanguage(index)} className="ml-2">
              <Image
                src={darkMode ? CloseIconWhite : CloseIcon}
                alt="Remove language"
                width={isMobile ? 16 : 24}
                height={isMobile ? 16 : 24}
              />
            </button>
          </div>
        ))}
      </div>

      {/* Add Language Select */}
      <div className="relative">
        <select
          value=""
          onChange={e => {
            if (e.target.value) {
              const languageId = Number(e.target.value);
              const languageName = languages[e.target.value];
              setFormData(addLanguageToFormData(formData, languageId, '3', languageName));
            }
          }}
          className={`w-full px-4 py-2 ${RESPONSIVE_BORDER_RADIUS.small} font-[Montserrat] ${RESPONSIVE_TEXT_SIZES.medium} appearance-none ${
            darkMode
              ? 'bg-transparent border-white text-white opacity-50'
              : 'border-[#053749] text-[#829BA4]'
          } border`}
          style={selectStyles}
        >
          <option value="">{pageContent['edit-profile-add-language']}</option>
          {Object.entries(languages).map(([id, name]) => (
            <option key={id} value={id} style={selectStyles}>
              {name}
            </option>
          ))}
        </select>
        <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
          <ResponsiveIcon
            lightIcon={ArrowDownIcon}
            darkIcon={ArrowDownIconWhite}
            alt="Select"
            mobileSize={20}
            desktopSize={24}
          />
        </div>
      </div>
    </div>
  );
}
