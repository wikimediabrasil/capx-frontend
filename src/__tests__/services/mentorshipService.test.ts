import axios from 'axios';
import { mentorshipService } from '@/services/mentorshipService';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('mentorshipService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getPartners', () => {
    it('should GET /api/partners/ and return an array', async () => {
      const mockPartners = [{ id: 1, name: 'Partner A' }, { id: 2, name: 'Partner B' }];
      mockedAxios.get.mockResolvedValueOnce({ data: mockPartners });

      const result = await mentorshipService.getPartners();

      expect(mockedAxios.get).toHaveBeenCalledWith('/api/partners/');
      expect(result).toEqual(mockPartners);
    });

    it('should unwrap {results: []} format from getPartners', async () => {
      const mockPartners = [{ id: 1, name: 'Partner A' }];
      mockedAxios.get.mockResolvedValueOnce({ data: { results: mockPartners } });

      const result = await mentorshipService.getPartners();

      expect(result).toEqual(mockPartners);
    });

    it('should return empty array when data is empty object', async () => {
      mockedAxios.get.mockResolvedValueOnce({ data: {} });

      const result = await mentorshipService.getPartners();

      expect(result).toEqual([]);
    });
  });

  describe('getMentorshipSettings', () => {
    it('should GET /api/partner_mentorship_settings/ and return array', async () => {
      const mockSettings = [{ id: 1, partner: 1 }];
      mockedAxios.get.mockResolvedValueOnce({ data: mockSettings });

      const result = await mentorshipService.getMentorshipSettings();

      expect(mockedAxios.get).toHaveBeenCalledWith('/api/partner_mentorship_settings/');
      expect(result).toEqual(mockSettings);
    });

    it('should unwrap {results: []} format from getMentorshipSettings', async () => {
      const mockSettings = [{ id: 1, partner: 2 }];
      mockedAxios.get.mockResolvedValueOnce({ data: { results: mockSettings } });

      const result = await mentorshipService.getMentorshipSettings();

      expect(result).toEqual(mockSettings);
    });

    it('should return empty array when no settings exist', async () => {
      mockedAxios.get.mockResolvedValueOnce({ data: { results: [] } });

      const result = await mentorshipService.getMentorshipSettings();

      expect(result).toEqual([]);
    });
  });

  describe('getMentorForms', () => {
    it('should GET /api/mentorship_form_mentor/ and return array', async () => {
      const mockForms = [{ id: 1, title: 'Mentor Form' }];
      mockedAxios.get.mockResolvedValueOnce({ data: mockForms });

      const result = await mentorshipService.getMentorForms();

      expect(mockedAxios.get).toHaveBeenCalledWith('/api/mentorship_form_mentor/');
      expect(result).toEqual(mockForms);
    });

    it('should unwrap {results: []} format from getMentorForms', async () => {
      const mockForms = [{ id: 10, title: 'Form X' }];
      mockedAxios.get.mockResolvedValueOnce({ data: { results: mockForms } });

      const result = await mentorshipService.getMentorForms();

      expect(result).toEqual(mockForms);
    });
  });

  describe('getMenteeForms', () => {
    it('should GET /api/mentorship_form_mentee/ and return array', async () => {
      const mockForms = [{ id: 2, title: 'Mentee Form' }];
      mockedAxios.get.mockResolvedValueOnce({ data: mockForms });

      const result = await mentorshipService.getMenteeForms();

      expect(mockedAxios.get).toHaveBeenCalledWith('/api/mentorship_form_mentee/');
      expect(result).toEqual(mockForms);
    });

    it('should unwrap {results: []} format from getMenteeForms', async () => {
      const mockForms = [{ id: 20, title: 'Form Y' }];
      mockedAxios.get.mockResolvedValueOnce({ data: { results: mockForms } });

      const result = await mentorshipService.getMenteeForms();

      expect(result).toEqual(mockForms);
    });
  });

  describe('submitMentorResponse', () => {
    const token = 'test-token';
    const formId = 5;
    const data = { question1: 'answer1', score: 8 };

    it('should POST to /api/mentorship_form_mentor_response/ with stringified data', async () => {
      mockedAxios.post.mockResolvedValueOnce({ data: { id: 1 } });

      await mentorshipService.submitMentorResponse(formId, data, token);

      expect(mockedAxios.post).toHaveBeenCalledWith(
        '/api/mentorship_form_mentor_response/',
        { form: formId, data: JSON.stringify(data) },
        { headers: { Authorization: 'Token test-token' } }
      );
    });

    it('should pass string data as-is without re-stringifying', async () => {
      mockedAxios.post.mockResolvedValueOnce({ data: { id: 1 } });

      const stringData = '{"already":"stringified"}';
      await mentorshipService.submitMentorResponse(formId, stringData as any, token);

      const sentBody = mockedAxios.post.mock.calls[0][1] as any;
      expect(sentBody.data).toBe(stringData);
    });

    it('should return response data on success', async () => {
      const mockResult = { id: 99, form: formId };
      mockedAxios.post.mockResolvedValueOnce({ data: mockResult });

      const result = await mentorshipService.submitMentorResponse(formId, data, token);

      expect(result).toEqual(mockResult);
    });

    it('should throw on network error', async () => {
      mockedAxios.post.mockRejectedValueOnce(new Error('Network error'));

      await expect(mentorshipService.submitMentorResponse(formId, data, token)).rejects.toThrow(
        'Network error'
      );
    });
  });

  describe('submitMenteeResponse', () => {
    const token = 'test-token';
    const formId = 7;
    const data = { answer: 'yes', detail: 'some detail' };

    it('should POST to /api/mentorship_form_mentee_response/ with data as object', async () => {
      mockedAxios.post.mockResolvedValueOnce({ data: { id: 2 } });

      await mentorshipService.submitMenteeResponse(formId, data, token);

      expect(mockedAxios.post).toHaveBeenCalledWith(
        '/api/mentorship_form_mentee_response/',
        { form: formId, data },
        { headers: { Authorization: 'Token test-token' } }
      );
    });

    it('should NOT stringify data for mentee response', async () => {
      mockedAxios.post.mockResolvedValueOnce({ data: { id: 2 } });

      await mentorshipService.submitMenteeResponse(formId, data, token);

      const sentBody = mockedAxios.post.mock.calls[0][1] as any;
      expect(typeof sentBody.data).toBe('object');
      expect(sentBody.data).toEqual(data);
    });

    it('should return response data on success', async () => {
      const mockResult = { id: 55, form: formId };
      mockedAxios.post.mockResolvedValueOnce({ data: mockResult });

      const result = await mentorshipService.submitMenteeResponse(formId, data, token);

      expect(result).toEqual(mockResult);
    });

    it('should throw on network error', async () => {
      mockedAxios.post.mockRejectedValueOnce(new Error('Server down'));

      await expect(mentorshipService.submitMenteeResponse(formId, data, token)).rejects.toThrow(
        'Server down'
      );
    });
  });
});
