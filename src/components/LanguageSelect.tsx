import { useEffect, useState } from 'react';
import { setCookie } from '@/app/actions';
import BaseSelect from './BaseSelect';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguageSelection } from '@/hooks/useLanguageSelection';
import { useApp } from '@/contexts/AppContext';

interface LanguageSelectProps {
  language: string;
  setLanguage: (language: string) => void;
  isMobile: boolean;
  className?: string;
}

interface LanguageOption {
  value: string;
  label: string;
}

export default function LanguageSelect({
  language,
  setLanguage,
  isMobile,
  className = 'w-max',
}: LanguageSelectProps) {
  const { darkMode } = useTheme();
  const { setMobileMenuStatus } = useApp();
  const { fetchLanguages, fetchTranslations } = useLanguageSelection();
  const [options, setOptions] = useState<LanguageOption[]>([]);
  const [isClient, setIsClient] = useState(false);
  const { pageContent, setPageContent } = useApp();

  // Ensure language is never undefined
  const currentLanguage = language || 'en';

  useEffect(() => {
    async function loadLanguages() {
      const languageOptions = await fetchLanguages();
      setOptions(languageOptions);
    }
    loadLanguages();
    setIsClient(true);
  }, [fetchLanguages]);

  useEffect(() => {
    async function loadTranslations() {
      const translations = await fetchTranslations(currentLanguage);
      setPageContent(translations);
    }
    loadTranslations();
  }, [currentLanguage, setPageContent, fetchTranslations]);

  const handleSelection = async (selectedOption: any) => {
    if (selectedOption && selectedOption.value) {
      setLanguage(selectedOption.value);
      await setCookie({
        name: 'language',
        value: selectedOption.value,
        options: { path: '/' },
      });
    }
  };

  if (!isClient) return null;

  return (
    <BaseSelect
      name="language"
      options={options}
      value={{ value: currentLanguage, label: currentLanguage }}
      onChange={handleSelection}
      ariaLabel={pageContent?.['aria-language-input']}
      isMobile={isMobile}
      darkMode={darkMode}
      className={`${className} flex items-center`}
      onMenuOpen={() => {
        if (isMobile) {
          setMobileMenuStatus(false);
        }
      }}
    />
  );
}
