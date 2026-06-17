jest.mock('@/services/organizationTypeService', () => ({
  OrganizationTypeService: {
    getOrganizationType: jest.fn(),
    getOrganizationTypeById: jest.fn(),
  },
}));

import { renderHook, act } from '@testing-library/react';
import { useOrganizationType } from '@/hooks/useOrganizationType';
import { OrganizationTypeService } from '@/services/organizationTypeService';

const mockGetType = OrganizationTypeService.getOrganizationType as jest.Mock;
const mockGetTypeById = OrganizationTypeService.getOrganizationTypeById as jest.Mock;

describe('useOrganizationType', () => {
  beforeEach(() => jest.clearAllMocks());

  it('returns initial state', () => {
    const { result } = renderHook(() => useOrganizationType('token', 1));
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.organizationType).toBeUndefined();
  });

  it('fetchOrganizationType fetches data', async () => {
    const mockData = [{ id: 1, name: 'NGO' }];
    mockGetType.mockResolvedValue(mockData);

    const { result } = renderHook(() => useOrganizationType('token', 1));

    await act(async () => {
      await result.current.fetchOrganizationType();
    });

    expect(result.current.organizationType).toEqual(mockData);
    expect(result.current.isLoading).toBe(false);
  });

  it('fetchOrganizationType does nothing without token', async () => {
    const { result } = renderHook(() => useOrganizationType(null, 1));

    await act(async () => {
      await result.current.fetchOrganizationType();
    });

    expect(mockGetType).not.toHaveBeenCalled();
  });

  it('fetchOrganizationType handles error', async () => {
    mockGetType.mockRejectedValue(new Error('fetch failed'));

    const { result } = renderHook(() => useOrganizationType('token', 1));

    await act(async () => {
      await result.current.fetchOrganizationType();
    });

    expect(result.current.error).toBe('fetch failed');
  });

  it('fetchOrganizationTypeById fetches by id', async () => {
    const mockData = [{ id: 1, name: 'NGO' }];
    mockGetTypeById.mockResolvedValue(mockData);

    const { result } = renderHook(() => useOrganizationType('token', 1));

    await act(async () => {
      await result.current.fetchOrganizationTypeById();
    });

    expect(result.current.organizationType).toEqual(mockData);
  });

  it('fetchOrganizationTypeById does nothing without token', async () => {
    const { result } = renderHook(() => useOrganizationType(null, 1));

    await act(async () => {
      await result.current.fetchOrganizationTypeById();
    });

    expect(mockGetTypeById).not.toHaveBeenCalled();
  });
});
