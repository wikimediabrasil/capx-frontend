import { useState, useEffect } from 'react';
import { Languages, LanguageProficiency } from '@/types/language';
import { fetchLanguages, updateLanguageProficiency } from '@/services/languageService';

export const useLanguage = (token: string | undefined) => {
  const [languages, setLanguages] = useState<Languages>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadLanguages = async () => {
      if (!token) return;

      try {
        const data = await fetchLanguages(token);
        setLanguages(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load languages');
      } finally {
        setLoading(false);
      }
    };

    loadLanguages();
  }, [token]);

  const updateProficiency = async (userId: number, languages: LanguageProficiency[]) => {
    if (!token) return;

    try {
      await updateLanguageProficiency(token, userId, languages);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update language proficiency');
      throw err;
    }
  };

  return {
    languages,
    loading,
    error,
    updateProficiency,
  };
};
