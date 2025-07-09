import { SelectList } from './Selector';
import LanguageIcon from '@/public/static/images/language.svg';
import LanguageIconWhite from '@/public/static/images/language_white.svg';
import { useApp } from '@/contexts/AppContext';
interface LanguageSelectorProps {
  languages: Record<string, string>;
  selectedLanguages: string[];
  onSelectLanguage: (languageId: string) => void;
  placeholder?: string;
}

export function LanguageSelector({
  languages,
  selectedLanguages,
  onSelectLanguage,
  placeholder,
}: LanguageSelectorProps) {
  const { pageContent } = useApp();

  const languagesList = Object.entries(languages)
    .map(([id, name]) => ({
      id,
      name,
    }))
    .sort((a, b) => a.name.localeCompare(b.name));

  return (
    <SelectList
      icon={LanguageIcon}
      iconDark={LanguageIconWhite}
      title={pageContent['form-profile-languages']}
      items={languagesList}
      selectedItems={selectedLanguages}
      onSelect={onSelectLanguage}
      placeholder={placeholder}
      multiple
    />
  );
}
