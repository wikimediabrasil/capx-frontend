import axios from 'axios';
import { OrganizationTypeService } from '@/services/organizationTypeService';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('OrganizationTypeService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getOrganizationType', () => {
    const token = 'test-token';

    it('should GET /api/organization_type/ with auth header', async () => {
      const mockTypes = [
        { id: 1, name: 'Affiliate' },
        { id: 2, name: 'Chapter' },
      ];
      mockedAxios.get.mockResolvedValueOnce({ data: mockTypes });

      const result = await OrganizationTypeService.getOrganizationType(token);

      expect(mockedAxios.get).toHaveBeenCalledWith('/api/organization_type/', {
        headers: { Authorization: `Token ${token}` },
        params: { limit: undefined, offset: undefined },
      });
      expect(result).toEqual(mockTypes);
    });

    it('should pass limit and offset params when provided', async () => {
      mockedAxios.get.mockResolvedValueOnce({ data: [] });

      await OrganizationTypeService.getOrganizationType(token, 10, 20);

      expect(mockedAxios.get).toHaveBeenCalledWith('/api/organization_type/', {
        headers: { Authorization: `Token ${token}` },
        params: { limit: 10, offset: 20 },
      });
    });

    it('should return an empty array when there are no organization types', async () => {
      mockedAxios.get.mockResolvedValueOnce({ data: [] });

      const result = await OrganizationTypeService.getOrganizationType(token);

      expect(result).toEqual([]);
    });

    it('should throw on network error', async () => {
      mockedAxios.get.mockRejectedValueOnce(new Error('Network error'));

      await expect(OrganizationTypeService.getOrganizationType(token)).rejects.toThrow(
        'Network error'
      );
    });

    it('should throw on 401 unauthorized', async () => {
      const error = { response: { status: 401, data: { detail: 'Unauthorized' } } };
      mockedAxios.get.mockRejectedValueOnce(error);

      await expect(OrganizationTypeService.getOrganizationType('bad-token')).rejects.toEqual(
        error
      );
    });
  });

  describe('getOrganizationTypeById', () => {
    const token = 'test-token';

    it('should GET api/organization_type/{id} with auth header', async () => {
      const mockType = { id: 3, name: 'User Group' };
      mockedAxios.get.mockResolvedValueOnce({ data: mockType });

      const result = await OrganizationTypeService.getOrganizationTypeById(token, 3);

      expect(mockedAxios.get).toHaveBeenCalledWith('api/organization_type/3', {
        headers: { Authorization: `Token ${token}` },
      });
      expect(result).toEqual(mockType);
    });

    it('should return the organization type data on success', async () => {
      const mockType = { id: 5, name: 'Thematic Organization' };
      mockedAxios.get.mockResolvedValueOnce({ data: mockType });

      const result = await OrganizationTypeService.getOrganizationTypeById(token, 5);

      expect(result).toEqual(mockType);
    });

    it('should throw on 404 not found', async () => {
      const error = { response: { status: 404, data: { detail: 'Not found.' } } };
      mockedAxios.get.mockRejectedValueOnce(error);

      await expect(OrganizationTypeService.getOrganizationTypeById(token, 999)).rejects.toEqual(
        error
      );
    });

    it('should throw on network error', async () => {
      mockedAxios.get.mockRejectedValueOnce(new Error('Network failure'));

      await expect(OrganizationTypeService.getOrganizationTypeById(token, 1)).rejects.toThrow(
        'Network failure'
      );
    });
  });
});
