import axios from 'axios';
import {
  PartnerApi,
  MentorshipFormMentorApi,
  MentorshipFormMenteeApi,
} from '@/types/mentorship';

const API_BASE = '/api';

function getAuthConfig(token: string | undefined) {
  return token ? { headers: { Authorization: `Token ${token}` } } : {};
}

function unwrapList<T>(data: T[] | { results: T[] }): T[] {
  if (Array.isArray(data)) return data;
  if (data && typeof data === 'object' && 'results' in data) return (data as { results: T[] }).results;
  return [];
}

export const mentorshipService = {
  async getPartners(): Promise<PartnerApi[]> {
    const response = await axios.get<PartnerApi[] | { results: PartnerApi[] }>(
      `${API_BASE}/partners/`
    );
    return unwrapList(response.data);
  },

  async getMentorForms(): Promise<MentorshipFormMentorApi[]> {
    const response = await axios.get<MentorshipFormMentorApi[] | { results: MentorshipFormMentorApi[] }>(
      `${API_BASE}/mentorship_form_mentor/`
    );
    return unwrapList(response.data);
  },

  async getMenteeForms(): Promise<MentorshipFormMenteeApi[]> {
    const response = await axios.get<MentorshipFormMenteeApi[] | { results: MentorshipFormMenteeApi[] }>(
      `${API_BASE}/mentorship_form_mentee/`
    );
    return unwrapList(response.data);
  },

  async submitMentorResponse(
    formId: number,
    data: Record<string, unknown>,
    token: string
  ): Promise<unknown> {
    // Backend expects data as TextField (string); mentee uses JSONField (object).
    const dataPayload = typeof data === 'string' ? data : JSON.stringify(data);
    const response = await axios.post(
      `${API_BASE}/mentorship_form_mentor_response/`,
      { form: formId, data: dataPayload },
      getAuthConfig(token)
    );
    return response.data;
  },

  async submitMenteeResponse(
    formId: number,
    data: Record<string, unknown>,
    token: string
  ): Promise<unknown> {
    const response = await axios.post(
      `${API_BASE}/mentorship_form_mentee_response/`,
      { form: formId, data },
      getAuthConfig(token)
    );
    return response.data;
  },
};
