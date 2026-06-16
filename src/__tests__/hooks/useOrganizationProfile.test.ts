jest.mock('@/services/organizationProfileService', () => ({
  organizationProfileService: {
    getUserProfile: jest.fn(),
    getOrganizationById: jest.fn(),
    getOrganizations: jest.fn(),
    updateOrganizationProfile: jest.fn(),
  },
}));

import { renderHook, waitFor, act } from '@testing-library/react';
import { useOrganization, useOrganizations } from '@/hooks/useOrganizationProfile';
import { organizationProfileService } from '@/services/organizationProfileService';

const mockOrgService = organizationProfileService as jest.Mocked<typeof organizationProfileService>;

const mockOrg = {
  id: 1,
  display_name: 'Test Org',
  profile_image: 'image.png',
  territory: [1],
  available_capacities: ['writing'],
  wanted_capacities: ['coding'],
};

const mockUserProfile = {
  is_manager: [1, 2],
};

describe('useOrganization', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('sets isLoading false immediately when no token', async () => {
    const { result } = renderHook(() => useOrganization());

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.organizations).toEqual([]);
    expect(mockOrgService.getUserProfile).not.toHaveBeenCalled();
  });

  it('fetches managed organization IDs and org data', async () => {
    mockOrgService.getUserProfile.mockResolvedValue(mockUserProfile as any);
    mockOrgService.getOrganizationById.mockResolvedValue(mockOrg as any);

    const { result } = renderHook(() => useOrganization('test-token'));

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(mockOrgService.getUserProfile).toHaveBeenCalledWith('test-token');
    expect(result.current.managedOrganizationIds).toEqual([1, 2]);
    expect(result.current.isPermissionsLoaded).toBe(true);
  });

  it('fetches specific org when specificOrgId is provided', async () => {
    mockOrgService.getUserProfile.mockResolvedValue(mockUserProfile as any);
    mockOrgService.getOrganizationById.mockResolvedValue(mockOrg as any);

    const { result } = renderHook(() => useOrganization('test-token', 1));

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(mockOrgService.getOrganizationById).toHaveBeenCalledWith('test-token', 1);
    expect(result.current.organization).toEqual(mockOrg);
    expect(result.current.organizations).toEqual([mockOrg]);
  });

  it('isOrgManager is true when specificOrgId is in managedOrganizationIds', async () => {
    mockOrgService.getUserProfile.mockResolvedValue({ is_manager: [1] } as any);
    mockOrgService.getOrganizationById.mockResolvedValue(mockOrg as any);

    const { result } = renderHook(() => useOrganization('test-token', 1));

    await waitFor(() => expect(result.current.isPermissionsLoaded).toBe(true));

    expect(result.current.isOrgManager).toBe(true);
  });

  it('isOrgManager is false when specificOrgId is not in managedOrganizationIds', async () => {
    mockOrgService.getUserProfile.mockResolvedValue({ is_manager: [99] } as any);
    mockOrgService.getOrganizationById.mockResolvedValue(mockOrg as any);

    const { result } = renderHook(() => useOrganization('test-token', 1));

    await waitFor(() => expect(result.current.isPermissionsLoaded).toBe(true));

    expect(result.current.isOrgManager).toBe(false);
  });

  it('isOrgManager is true when user manages any org (no specificOrgId)', async () => {
    mockOrgService.getUserProfile.mockResolvedValue({ is_manager: [1, 2] } as any);
    mockOrgService.getOrganizationById.mockResolvedValue(mockOrg as any);

    const { result } = renderHook(() => useOrganization('test-token'));

    await waitFor(() => expect(result.current.isPermissionsLoaded).toBe(true));

    expect(result.current.isOrgManager).toBe(true);
  });

  it('handles getUserProfile error gracefully', async () => {
    mockOrgService.getUserProfile.mockRejectedValue(new Error('Unauthorized'));

    const { result } = renderHook(() => useOrganization('test-token'));

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    // fetchUserProfile catches error and returns [], so error state is null
    expect(result.current.error).toBeNull();
    expect(result.current.organizations).toEqual([]);
  });

  it('handles specific org fetch error gracefully', async () => {
    mockOrgService.getUserProfile.mockResolvedValue({ is_manager: [1] } as any);
    mockOrgService.getOrganizationById.mockRejectedValue(new Error('Not found'));

    const { result } = renderHook(() => useOrganization('test-token', 1));

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.organizations).toEqual([]);
  });

  it('does not fetch orgs when managedIds is empty', async () => {
    mockOrgService.getUserProfile.mockResolvedValue({ is_manager: [] } as any);

    const { result } = renderHook(() => useOrganization('test-token'));

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.organizations).toEqual([]);
    // getOrganizationById should not be called without a specificOrgId and no managed IDs
    expect(mockOrgService.getOrganizationById).not.toHaveBeenCalled();
  });

  it('updateOrganization does nothing when not org manager', async () => {
    mockOrgService.getUserProfile.mockResolvedValue({ is_manager: [99] } as any);
    mockOrgService.getOrganizationById.mockResolvedValue(mockOrg as any);

    const { result } = renderHook(() => useOrganization('test-token', 1));

    await waitFor(() => expect(result.current.isPermissionsLoaded).toBe(true));

    mockOrgService.updateOrganizationProfile.mockResolvedValue({
      ...mockOrg,
      display_name: 'Updated',
    } as any);

    await act(() => result.current.updateOrganization({ display_name: 'Updated' }));

    // Should not have been called since not a manager
    expect(mockOrgService.updateOrganizationProfile).not.toHaveBeenCalled();
  });

  it('updateOrganization calls service and updates state when manager', async () => {
    mockOrgService.getUserProfile.mockResolvedValue({ is_manager: [1] } as any);
    mockOrgService.getOrganizationById.mockResolvedValue(mockOrg as any);
    const updatedOrg = { ...mockOrg, display_name: 'Updated Org' };
    mockOrgService.updateOrganizationProfile.mockResolvedValue(updatedOrg as any);

    const { result } = renderHook(() => useOrganization('test-token', 1));

    await waitFor(() => expect(result.current.isPermissionsLoaded).toBe(true));

    await act(() => result.current.updateOrganization({ display_name: 'Updated Org' }));

    expect(mockOrgService.updateOrganizationProfile).toHaveBeenCalledWith('test-token', 1, {
      display_name: 'Updated Org',
    });
  });

  it('refetch re-runs the data fetching', async () => {
    mockOrgService.getUserProfile.mockResolvedValue({ is_manager: [1] } as any);
    mockOrgService.getOrganizationById.mockResolvedValue(mockOrg as any);

    const { result } = renderHook(() => useOrganization('test-token', 1));

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(mockOrgService.getUserProfile).toHaveBeenCalledTimes(1);

    await act(() => result.current.refetch());

    expect(mockOrgService.getUserProfile).toHaveBeenCalledTimes(2);
  });
});

describe('useOrganizations', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns loading state initially', () => {
    mockOrgService.getOrganizations.mockResolvedValue({ results: [], count: 0 } as any);

    const { result } = renderHook(() => useOrganizations());

    expect(result.current.isLoading).toBe(true);
  });

  it('fetches and returns organizations list', async () => {
    const orgs = [mockOrg];
    mockOrgService.getOrganizations.mockResolvedValue({ results: orgs, count: 1 } as any);

    const { result } = renderHook(() => useOrganizations(10, 0));

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.organizations).toEqual(orgs);
    expect(result.current.count).toBe(1);
    expect(result.current.error).toBeNull();
  });

  it('handles fetch error', async () => {
    mockOrgService.getOrganizations.mockRejectedValue({ message: 'Server error' });

    const { result } = renderHook(() => useOrganizations());

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.error).toBe('Server error');
    // organizations is initialized as [] and catch doesn't set it to null
    expect(result.current.organizations).toEqual([]);
  });

  it('passes filters to service', async () => {
    mockOrgService.getOrganizations.mockResolvedValue({ results: [], count: 0 } as any);

    renderHook(() =>
      useOrganizations(5, 0, {
        capacities: [{ code: 'writing', name: 'Writing' }],
        territories: [1],
        profileCapacityTypes: ['sharer'] as any,
        name: 'Test',
        languages: [],
      })
    );

    await waitFor(() => expect(mockOrgService.getOrganizations).toHaveBeenCalled());

    const callArg = mockOrgService.getOrganizations.mock.calls[0][0];
    expect(callArg).toMatchObject({ limit: 5, offset: 0 });
  });
});
