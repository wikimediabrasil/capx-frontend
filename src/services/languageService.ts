import axios from 'axios';
import { Language, Languages, LanguageProficiency } from '@/types/language';

export const fetchLanguages = async (token: string): Promise<Languages> => {
  const response = await axios.get<Languages>(`/api/list/language/`, {
    headers: {
      Authorization: `Token ${token}`,
    },
  });

  return response.data;
};

export const updateLanguageProficiency = async (
  token: string,
  userId: number,
  languages: LanguageProficiency[]
): Promise<void> => {
  const response = await axios.put(`/api/profile/${userId}/`, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Token ${token}`,
    },
    body: JSON.stringify({ language: languages }),
  });

  return response.data;
};
