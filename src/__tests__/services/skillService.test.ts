import axios from 'axios';
import { skillService } from '@/services/skillService';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('skillService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('fetchSkills', () => {
    const queryData = {
      headers: { Authorization: 'Token test-token' },
      limit: 20,
      offset: 0,
    };

    it('should GET api/skill with auth header and pagination params', async () => {
      const mockSkills = [
        { id: 1, name: 'JavaScript' },
        { id: 2, name: 'Python' },
      ];
      mockedAxios.get.mockResolvedValueOnce({ data: mockSkills });

      const result = await skillService.fetchSkills(queryData);

      expect(mockedAxios.get).toHaveBeenCalledWith('api/skill', {
        headers: { Authorization: 'Token test-token' },
        params: { limit: 20, offset: 0 },
      });
      expect(result).toEqual(mockSkills);
    });

    it('should pass undefined limit and offset when not provided', async () => {
      mockedAxios.get.mockResolvedValueOnce({ data: [] });

      await skillService.fetchSkills({ headers: { Authorization: 'Token test-token' } });

      expect(mockedAxios.get).toHaveBeenCalledWith('api/skill', {
        headers: { Authorization: 'Token test-token' },
        params: { limit: undefined, offset: undefined },
      });
    });

    it('should return skills data on success', async () => {
      const mockData = [{ id: 5, name: 'TypeScript' }];
      mockedAxios.get.mockResolvedValueOnce({ data: mockData });

      const result = await skillService.fetchSkills(queryData);

      expect(result).toEqual(mockData);
    });

    it('should return an empty array when API returns empty', async () => {
      mockedAxios.get.mockResolvedValueOnce({ data: [] });

      const result = await skillService.fetchSkills(queryData);

      expect(result).toEqual([]);
    });

    it('should throw on network error', async () => {
      mockedAxios.get.mockRejectedValueOnce(new Error('Network error'));

      await expect(skillService.fetchSkills(queryData)).rejects.toThrow('Network error');
    });

    it('should throw on 401 unauthorized', async () => {
      const error = { response: { status: 401 } };
      mockedAxios.get.mockRejectedValueOnce(error);

      await expect(skillService.fetchSkills(queryData)).rejects.toEqual(error);
    });
  });

  describe('fetchSkillById', () => {
    const queryData = { headers: { Authorization: 'Token test-token' } };

    it('should GET /api/skill/{id} with auth header', async () => {
      const mockSkill = { id: 3, name: 'React' };
      mockedAxios.get.mockResolvedValueOnce({ data: mockSkill });

      const result = await skillService.fetchSkillById('3', queryData);

      expect(mockedAxios.get).toHaveBeenCalledWith('/api/skill/3', {
        headers: { Authorization: 'Token test-token' },
      });
      expect(result).toEqual(mockSkill);
    });

    it('should return the skill data on success', async () => {
      const mockSkill = { id: 7, name: 'Node.js' };
      mockedAxios.get.mockResolvedValueOnce({ data: mockSkill });

      const result = await skillService.fetchSkillById('7', queryData);

      expect(result).toEqual(mockSkill);
    });

    it('should throw on 404 not found', async () => {
      const error = { response: { status: 404, data: { detail: 'Not found.' } } };
      mockedAxios.get.mockRejectedValueOnce(error);

      await expect(skillService.fetchSkillById('999', queryData)).rejects.toEqual(error);
    });

    it('should throw on network error', async () => {
      mockedAxios.get.mockRejectedValueOnce(new Error('Network error'));

      await expect(skillService.fetchSkillById('1', queryData)).rejects.toThrow('Network error');
    });
  });
});
