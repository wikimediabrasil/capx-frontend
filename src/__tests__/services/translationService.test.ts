import { translationService } from '@/services/translationService';
import axios from 'axios';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('translationService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('loadCapacities', () => {
    const mockResults = [
      {
        qid: 'Q1',
        metabase_id: '1',
        lang: 'pt',
        label: 'Rótulo',
        description: 'Descrição',
        fallback_label: 'Label',
        fallback_description: 'Description',
      },
    ];

    it('returns results array from response', async () => {
      mockedAxios.get.mockResolvedValueOnce({ data: { results: mockResults } });

      const result = await translationService.loadCapacities('pt', 'en', 'my-token');

      expect(mockedAxios.get).toHaveBeenCalledWith('/api/translating/', {
        headers: { Authorization: 'Token my-token' },
        params: { lang: 'pt', fallback: 'en' },
      });
      expect(result).toEqual(mockResults);
    });

    it('omits auth header when no token given', async () => {
      mockedAxios.get.mockResolvedValueOnce({ data: { results: [] } });

      await translationService.loadCapacities('pt');

      expect(mockedAxios.get).toHaveBeenCalledWith('/api/translating/', {
        params: { lang: 'pt', fallback: 'en' },
      });
    });

    it('uses provided fallback language', async () => {
      mockedAxios.get.mockResolvedValueOnce({ data: { results: [] } });

      await translationService.loadCapacities('es', 'fr', 'tok');

      expect(mockedAxios.get).toHaveBeenCalledWith(
        '/api/translating/',
        expect.objectContaining({ params: { lang: 'es', fallback: 'fr' } })
      );
    });

    it('propagates axios errors', async () => {
      mockedAxios.get.mockRejectedValueOnce(new Error('Network error'));

      await expect(translationService.loadCapacities('pt', 'en', 'tok')).rejects.toThrow(
        'Network error'
      );
    });
  });

  describe('saveTranslation', () => {
    const mockResponse = { status: 'ok', changed: ['label'], metabase_id: '42' };

    it('sends label and description when both provided', async () => {
      mockedAxios.post.mockResolvedValueOnce({ data: mockResponse });

      const result = await translationService.saveTranslation(
        'Q42',
        'pt',
        'Meu rótulo',
        'Minha descrição',
        'tok'
      );

      expect(mockedAxios.post).toHaveBeenCalledWith(
        '/api/translating/',
        { qid: 'Q42', lang: 'pt', label: 'Meu rótulo', description: 'Minha descrição' },
        { headers: { Authorization: 'Token tok' } }
      );
      expect(result).toEqual(mockResponse);
    });

    it('omits label from payload when undefined', async () => {
      mockedAxios.post.mockResolvedValueOnce({ data: mockResponse });

      await translationService.saveTranslation('Q1', 'pt', undefined, 'desc', 'tok');

      const payload = mockedAxios.post.mock.calls[0][1] as Record<string, unknown>;
      expect(payload).not.toHaveProperty('label');
      expect(payload).toHaveProperty('description', 'desc');
    });

    it('omits description from payload when undefined', async () => {
      mockedAxios.post.mockResolvedValueOnce({ data: mockResponse });

      await translationService.saveTranslation('Q1', 'pt', 'lbl', undefined, 'tok');

      const payload = mockedAxios.post.mock.calls[0][1] as Record<string, unknown>;
      expect(payload).toHaveProperty('label', 'lbl');
      expect(payload).not.toHaveProperty('description');
    });

    it('propagates axios errors', async () => {
      mockedAxios.post.mockRejectedValueOnce(new Error('Save failed'));

      await expect(
        translationService.saveTranslation('Q1', 'pt', 'lbl', 'desc', 'tok')
      ).rejects.toThrow('Save failed');
    });
  });

  describe('beginOAuth', () => {
    it('returns authorization_url and state', async () => {
      const mockData = { authorization_url: 'https://meta.example/oauth', state: 'abc123' };
      mockedAxios.post.mockResolvedValueOnce({ data: mockData });

      const result = await translationService.beginOAuth('tok');

      expect(mockedAxios.post).toHaveBeenCalledWith(
        '/api/translating_oauth/begin/',
        {},
        { headers: { Authorization: 'Token tok' } }
      );
      expect(result).toEqual(mockData);
    });

    it('works without a token', async () => {
      mockedAxios.post.mockResolvedValueOnce({
        data: { authorization_url: 'https://example.com', state: 'x' },
      });

      await translationService.beginOAuth();

      expect(mockedAxios.post).toHaveBeenCalledWith('/api/translating_oauth/begin/', {}, {});
    });

    it('propagates errors', async () => {
      mockedAxios.post.mockRejectedValueOnce(new Error('begin failed'));

      await expect(translationService.beginOAuth('tok')).rejects.toThrow('begin failed');
    });
  });

  describe('getOAuthStatus', () => {
    it('returns connected status with username', async () => {
      const mockData = { connected: true, username: 'wikimediuser' };
      mockedAxios.get.mockResolvedValueOnce({ data: mockData });

      const result = await translationService.getOAuthStatus('tok');

      expect(mockedAxios.get).toHaveBeenCalledWith('/api/translating_oauth/status/', {
        headers: { Authorization: 'Token tok' },
      });
      expect(result).toEqual(mockData);
    });

    it('returns disconnected status', async () => {
      mockedAxios.get.mockResolvedValueOnce({ data: { connected: false, username: '' } });

      const result = await translationService.getOAuthStatus('tok');

      expect(result.connected).toBe(false);
    });

    it('propagates errors', async () => {
      mockedAxios.get.mockRejectedValueOnce(new Error('status failed'));

      await expect(translationService.getOAuthStatus('tok')).rejects.toThrow('status failed');
    });
  });

  describe('disconnectOAuth', () => {
    it('returns true when status is ok', async () => {
      mockedAxios.delete.mockResolvedValueOnce({ data: { status: 'ok' } });

      const result = await translationService.disconnectOAuth('tok');

      expect(mockedAxios.delete).toHaveBeenCalledWith('/api/translating_oauth/disconnect/', {
        headers: { Authorization: 'Token tok' },
      });
      expect(result).toBe(true);
    });

    it('returns false when status is not ok', async () => {
      mockedAxios.delete.mockResolvedValueOnce({ data: { status: 'error' } });

      const result = await translationService.disconnectOAuth('tok');

      expect(result).toBe(false);
    });

    it('propagates errors', async () => {
      mockedAxios.delete.mockRejectedValueOnce(new Error('disconnect failed'));

      await expect(translationService.disconnectOAuth('tok')).rejects.toThrow('disconnect failed');
    });
  });
});
