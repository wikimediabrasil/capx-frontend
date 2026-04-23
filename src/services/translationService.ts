import axios from 'axios';
import type {
  CapacityItem,
  CapacityListResponse,
  OAuthBeginResponse,
  OAuthStatusResponse,
  TranslationSubmitResponse,
} from '@/types/translation';

const API_BASE = '/api';

function authConfig(token?: string) {
  return token ? { headers: { Authorization: `Token ${token}` } } : {};
}

export const translationService = {
  async loadCapacities(lang: string, fallback = 'en', token?: string): Promise<CapacityItem[]> {
    const response = await axios.get<CapacityListResponse>(`${API_BASE}/translating/`, {
      ...authConfig(token),
      params: { lang, fallback },
    });
    return response.data.results;
  },

  async saveTranslation(
    qid: string,
    lang: string,
    label?: string,
    description?: string,
    token?: string
  ): Promise<TranslationSubmitResponse> {
    const payload: Record<string, unknown> = { qid, lang };
    if (label !== undefined) payload.label = label;
    if (description !== undefined) payload.description = description;
    const response = await axios.post<TranslationSubmitResponse>(
      `${API_BASE}/translating/`,
      payload,
      authConfig(token)
    );
    return response.data;
  },

  async beginOAuth(token?: string): Promise<OAuthBeginResponse> {
    const response = await axios.post<OAuthBeginResponse>(
      `${API_BASE}/translating_oauth/begin/`,
      {},
      authConfig(token)
    );
    return response.data;
  },

  async getOAuthStatus(token?: string): Promise<OAuthStatusResponse> {
    const response = await axios.get<OAuthStatusResponse>(
      `${API_BASE}/translating_oauth/status/`,
      authConfig(token)
    );
    return response.data;
  },

  async disconnectOAuth(token?: string): Promise<boolean> {
    const response = await axios.delete<{ status: string }>(
      `${API_BASE}/translating_oauth/disconnect/`,
      authConfig(token)
    );
    return response.data.status === 'ok';
  },
};
