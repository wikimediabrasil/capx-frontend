import axios from 'axios';
import { useCallback, useState } from 'react';

interface LanguageOption {
  value: string;
  label: string;
}

export function useLanguageSelection() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchLanguages = useCallback(async (): Promise<LanguageOption[]> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.get('/api/language');
      const languages = response.data;
      return languages.map((lang: string) => ({
        value: lang,
        label: lang,
      }));
    } catch (err) {
      setError('Failed to fetch languages, error: ' + err);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchTranslations = useCallback(async (lang: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.get('/api/language', {
        params: { lang },
      });
      return response.data;
    } catch (err) {
      setError('Failed to fetch translations, error: ' + err);
      return {};
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    fetchLanguages,
    fetchTranslations,
    isLoading,
    error,
  };
}
