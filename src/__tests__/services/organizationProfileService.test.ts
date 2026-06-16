import axios from 'axios';
import { organizationProfileService } from '@/services/organizationProfileService';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('organizationProfileService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getOrganizations', () => {
    it('should GET /api/organizations/ with no params when filters are empty', async () => {
      mockedAxios.get.mockResolvedValueOnce({ data: { count: 0, results: [] } });

      const result = await organizationProfileService.getOrganizations({});

      expect(mockedAxios.get).toHaveBeenCalledWith(
        '/api/organizations/',
        expect.objectContaining({ params: expect.any(URLSearchParams) })
      );
      expect(result).toEqual({ count: 0, results: [] });
    });

    it('should append territory params when provided', async () => {
      mockedAxios.get.mockResolvedValueOnce({ data: { count: 1, results: [{ id: 1 }] } });

      await organizationProfileService.getOrganizations({ territory: ['NWE', 'LAC'] });

      const [, config] = mockedAxios.get.mock.calls[0];
      const params = config?.params as URLSearchParams;
      expect(params.getAll('territory')).toEqual(['NWE', 'LAC']);
    });

    it('should append available_capacities params when provided', async () => {
      mockedAxios.get.mockResolvedValueOnce({ data: { count: 1, results: [] } });

      await organizationProfileService.getOrganizations({ available_capacities: [10, 20] });

      const params = mockedAxios.get.mock.calls[0][1]?.params as URLSearchParams;
      expect(params.getAll('available_capacities')).toEqual(['10', '20']);
    });

    it('should append wanted_capacities params when provided', async () => {
      mockedAxios.get.mockResolvedValueOnce({ data: { count: 1, results: [] } });

      await organizationProfileService.getOrganizations({ wanted_capacities: [5, 15] });

      const params = mockedAxios.get.mock.calls[0][1]?.params as URLSearchParams;
      expect(params.getAll('wanted_capacities')).toEqual(['5', '15']);
    });

    it('should append has_capacities_wanted=true when flag is set', async () => {
      mockedAxios.get.mockResolvedValueOnce({ data: { count: 0, results: [] } });

      await organizationProfileService.getOrganizations({ has_capacities_wanted: true });

      const params = mockedAxios.get.mock.calls[0][1]?.params as URLSearchParams;
      expect(params.get('has_capacities_wanted')).toBe('true');
    });

    it('should NOT append has_capacities_wanted when flag is false', async () => {
      mockedAxios.get.mockResolvedValueOnce({ data: { count: 0, results: [] } });

      await organizationProfileService.getOrganizations({ has_capacities_wanted: false });

      const params = mockedAxios.get.mock.calls[0][1]?.params as URLSearchParams;
      expect(params.get('has_capacities_wanted')).toBeNull();
    });

    it('should append limit and offset when provided', async () => {
      mockedAxios.get.mockResolvedValueOnce({ data: { count: 10, results: [] } });

      await organizationProfileService.getOrganizations({ limit: 10, offset: 20 });

      const params = mockedAxios.get.mock.calls[0][1]?.params as URLSearchParams;
      expect(params.get('limit')).toBe('10');
      expect(params.get('offset')).toBe('20');
    });

    it('should return {count: 0, results: []} on error', async () => {
      mockedAxios.get.mockRejectedValueOnce(new Error('Network error'));

      const result = await organizationProfileService.getOrganizations({});

      expect(result).toEqual({ count: 0, results: [] });
    });
  });

  describe('getOrganizationById', () => {
    it('should GET /api/organizations/{id}/ with auth header', async () => {
      const mockOrg = { id: 1, name: 'Wikimedia Foundation' };
      mockedAxios.get.mockResolvedValueOnce({ data: mockOrg });

      const result = await organizationProfileService.getOrganizationById('test-token', 1);

      expect(mockedAxios.get).toHaveBeenCalledWith('/api/organizations/1/', {
        headers: { Authorization: 'Token test-token' },
      });
      expect(result).toEqual(mockOrg);
    });

    it('should throw on error', async () => {
      mockedAxios.get.mockRejectedValueOnce(new Error('Not found'));

      await expect(organizationProfileService.getOrganizationById('token', 999)).rejects.toThrow(
        'Not found'
      );
    });
  });

  describe('getUserProfile', () => {
    it('should GET /api/profile/ and return first element', async () => {
      const mockProfile = { id: 5, username: 'alice' };
      mockedAxios.get.mockResolvedValueOnce({ data: [mockProfile, { id: 6 }] });

      const result = await organizationProfileService.getUserProfile('test-token');

      expect(mockedAxios.get).toHaveBeenCalledWith('/api/profile/', {
        headers: { Authorization: 'Token test-token' },
      });
      expect(result).toEqual(mockProfile);
    });

    it('should return undefined when profile list is empty', async () => {
      mockedAxios.get.mockResolvedValueOnce({ data: [] });

      const result = await organizationProfileService.getUserProfile('token');

      expect(result).toBeUndefined();
    });

    it('should throw on error', async () => {
      mockedAxios.get.mockRejectedValueOnce(new Error('Unauthorized'));

      await expect(organizationProfileService.getUserProfile('bad-token')).rejects.toThrow(
        'Unauthorized'
      );
    });
  });

  describe('updateOrganizationProfile', () => {
    const token = 'test-token';
    const orgId = 1;
    const currentOrg = {
      id: orgId,
      name: 'Old Name',
      events: [{ id: 10 }, { id: 11 }],
      choose_events: [{ id: 20 }],
    };

    it('should first GET current org, then PUT merged data', async () => {
      mockedAxios.get.mockResolvedValueOnce({ data: currentOrg });
      mockedAxios.put.mockResolvedValueOnce({ data: { ...currentOrg, name: 'New Name' } });

      await organizationProfileService.updateOrganizationProfile(token, orgId, {
        name: 'New Name',
      });

      expect(mockedAxios.get).toHaveBeenCalledWith(`/api/organizations/${orgId}/`, {
        headers: { Authorization: `Token ${token}` },
      });
      expect(mockedAxios.put).toHaveBeenCalledWith(
        `/api/organizations/${orgId}/`,
        expect.objectContaining({ name: 'New Name' }),
        expect.objectContaining({
          headers: expect.objectContaining({ Authorization: `Token ${token}` }),
        })
      );
    });

    it('should convert event objects to ids in events field', async () => {
      mockedAxios.get.mockResolvedValueOnce({ data: currentOrg });
      mockedAxios.put.mockResolvedValueOnce({ data: {} });

      await organizationProfileService.updateOrganizationProfile(token, orgId, {
        events: [{ id: 30 }, { id: 31 }] as any,
      });

      const sentBody = mockedAxios.put.mock.calls[0][1] as any;
      expect(sentBody.events).toEqual([30, 31]);
    });

    it('should convert event objects to ids in choose_events field', async () => {
      mockedAxios.get.mockResolvedValueOnce({ data: currentOrg });
      mockedAxios.put.mockResolvedValueOnce({ data: {} });

      await organizationProfileService.updateOrganizationProfile(token, orgId, {
        choose_events: [{ id: 50 }] as any,
      });

      const sentBody = mockedAxios.put.mock.calls[0][1] as any;
      expect(sentBody.choose_events).toEqual([50]);
    });

    it('should pass through numeric event ids unchanged', async () => {
      mockedAxios.get.mockResolvedValueOnce({ data: currentOrg });
      mockedAxios.put.mockResolvedValueOnce({ data: {} });

      await organizationProfileService.updateOrganizationProfile(token, orgId, {
        events: [100, 200] as any,
      });

      const sentBody = mockedAxios.put.mock.calls[0][1] as any;
      expect(sentBody.events).toEqual([100, 200]);
    });

    it('should fall back to currentOrg events when data.events is not provided', async () => {
      mockedAxios.get.mockResolvedValueOnce({ data: currentOrg });
      mockedAxios.put.mockResolvedValueOnce({ data: {} });

      await organizationProfileService.updateOrganizationProfile(token, orgId, { name: 'X' });

      const sentBody = mockedAxios.put.mock.calls[0][1] as any;
      expect(sentBody.events).toEqual([{ id: 10 }, { id: 11 }]);
    });

    it('should return the updated organization data', async () => {
      const updatedOrg = { ...currentOrg, name: 'Updated' };
      mockedAxios.get.mockResolvedValueOnce({ data: currentOrg });
      mockedAxios.put.mockResolvedValueOnce({ data: updatedOrg });

      const result = await organizationProfileService.updateOrganizationProfile(token, orgId, {
        name: 'Updated',
      });

      expect(result).toEqual(updatedOrg);
    });

    it('should throw on PUT error', async () => {
      mockedAxios.get.mockResolvedValueOnce({ data: currentOrg });
      mockedAxios.put.mockRejectedValueOnce(new Error('Update failed'));

      await expect(
        organizationProfileService.updateOrganizationProfile(token, orgId, { name: 'X' })
      ).rejects.toThrow('Update failed');
    });
  });
});
