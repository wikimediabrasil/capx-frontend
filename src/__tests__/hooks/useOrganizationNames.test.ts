jest.mock('@tanstack/react-query', () => ({
  useQuery: jest.fn(),
  useMutation: jest.fn(),
  useQueryClient: jest.fn(),
}));

jest.mock('axios');

import { renderHook } from '@testing-library/react';
import { useOrganizationNames } from '@/hooks/useOrganizationNames';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

const mockUseQuery = useQuery as jest.Mock;
const mockUseMutation = useMutation as jest.Mock;
const mockUseQueryClient = useQueryClient as jest.Mock;
const mockAxios = axios as jest.Mocked<typeof axios>;

const mockInvalidateQueries = jest.fn();
const mockQueryClient = { invalidateQueries: mockInvalidateQueries };

const mockNames = [
  { id: 1, organization: 10, language_code: 'en', name: 'English Name' },
  { id: 2, organization: 10, language_code: 'fr', name: 'French Name' },
];

const mockMutateAsync = jest.fn();

describe('useOrganizationNames', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseQueryClient.mockReturnValue(mockQueryClient);
    mockUseQuery.mockReturnValue({
      data: undefined,
      isLoading: false,
      error: null,
    });
    mockUseMutation.mockReturnValue({
      mutateAsync: mockMutateAsync,
    });
  });

  it('returns empty names array when no data', () => {
    const { result } = renderHook(() =>
      useOrganizationNames({ organizationId: 10, token: 'test-token' })
    );

    expect(result.current.names).toEqual([]);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('returns names when data is available', () => {
    mockUseQuery.mockReturnValue({
      data: mockNames,
      isLoading: false,
      error: null,
    });

    const { result } = renderHook(() =>
      useOrganizationNames({ organizationId: 10, token: 'test-token' })
    );

    expect(result.current.names).toEqual(mockNames);
  });

  it('returns loading state', () => {
    mockUseQuery.mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
    });

    const { result } = renderHook(() =>
      useOrganizationNames({ organizationId: 10, token: 'test-token' })
    );

    expect(result.current.isLoading).toBe(true);
  });

  it('returns error message from error object', () => {
    const mockError = new Error('Fetch failed');
    mockUseQuery.mockReturnValue({
      data: undefined,
      isLoading: false,
      error: mockError,
    });

    const { result } = renderHook(() =>
      useOrganizationNames({ organizationId: 10, token: 'test-token' })
    );

    expect(result.current.error).toBe('Fetch failed');
  });

  it('calls useQuery with correct parameters when token and org id present', () => {
    renderHook(() => useOrganizationNames({ organizationId: 10, token: 'test-token' }));

    expect(mockUseQuery).toHaveBeenCalledWith(
      expect.objectContaining({
        queryKey: ['organizationNames', 10, 'test-token'],
        enabled: true,
        staleTime: 1000 * 60 * 10,
        gcTime: 1000 * 60 * 30,
        refetchOnWindowFocus: false,
        refetchOnMount: false,
      })
    );
  });

  it('disables query when no organizationId', () => {
    renderHook(() => useOrganizationNames({ token: 'test-token' }));

    expect(mockUseQuery).toHaveBeenCalledWith(
      expect.objectContaining({
        enabled: false,
      })
    );
  });

  it('disables query when no token', () => {
    renderHook(() => useOrganizationNames({ organizationId: 10 }));

    expect(mockUseQuery).toHaveBeenCalledWith(
      expect.objectContaining({
        enabled: false,
      })
    );
  });

  it('works with no options provided', () => {
    const { result } = renderHook(() => useOrganizationNames());

    expect(result.current.names).toEqual([]);
    expect(mockUseQuery).toHaveBeenCalledWith(
      expect.objectContaining({
        enabled: false,
      })
    );
  });

  it('queryFn returns empty array when no organizationId or token', async () => {
    let capturedQueryFn: (() => Promise<any>) | undefined;
    mockUseQuery.mockImplementation(options => {
      capturedQueryFn = options.queryFn;
      return { data: undefined, isLoading: false, error: null };
    });

    renderHook(() => useOrganizationNames({ organizationId: undefined, token: undefined }));

    const result = await capturedQueryFn!();
    expect(result).toEqual([]);
  });

  it('queryFn calls axios and returns results', async () => {
    let capturedQueryFn: (() => Promise<any>) | undefined;
    mockUseQuery.mockImplementation(options => {
      capturedQueryFn = options.queryFn;
      return { data: undefined, isLoading: false, error: null };
    });

    mockAxios.get.mockResolvedValue({ data: { results: mockNames } });

    renderHook(() => useOrganizationNames({ organizationId: 10, token: 'test-token' }));

    const result = await capturedQueryFn!();
    expect(result).toEqual(mockNames);
    expect(mockAxios.get).toHaveBeenCalledWith(
      '/api/organization_name/',
      expect.objectContaining({
        headers: { Authorization: 'Token test-token' },
        params: { organization: 10 },
      })
    );
  });

  it('queryFn throws on axios error', async () => {
    let capturedQueryFn: (() => Promise<any>) | undefined;
    mockUseQuery.mockImplementation(options => {
      capturedQueryFn = options.queryFn;
      return { data: undefined, isLoading: false, error: null };
    });

    mockAxios.get.mockRejectedValue({ response: { data: { error: 'Not authorized' } } });

    renderHook(() => useOrganizationNames({ organizationId: 10, token: 'test-token' }));

    await expect(capturedQueryFn!()).rejects.toThrow('Not authorized');
  });

  it('exposes createName, updateName, deleteName from mutations', () => {
    const { result } = renderHook(() =>
      useOrganizationNames({ organizationId: 10, token: 'test-token' })
    );

    expect(typeof result.current.createName).toBe('function');
    expect(typeof result.current.updateName).toBe('function');
    expect(typeof result.current.deleteName).toBe('function');
  });

  it('exposes fetchNames function that invalidates queries', async () => {
    const { result } = renderHook(() =>
      useOrganizationNames({ organizationId: 10, token: 'test-token' })
    );

    await result.current.fetchNames();

    expect(mockInvalidateQueries).toHaveBeenCalledWith({
      queryKey: ['organizationNames', 10, 'test-token'],
    });
  });

  it('createName mutationFn throws when no orgId or token', async () => {
    let capturedMutationFn: ((args: any) => Promise<any>) | undefined;
    mockUseMutation.mockImplementation(options => {
      capturedMutationFn = options.mutationFn;
      return { mutateAsync: mockMutateAsync };
    });

    renderHook(() => useOrganizationNames());

    await expect(capturedMutationFn!({ languageCode: 'en', name: 'Test' })).rejects.toThrow(
      'Token is required'
    );
  });

  it('updateName mutationFn throws when no token', async () => {
    const mutationFns: Array<(args: any) => Promise<any>> = [];
    mockUseMutation.mockImplementation(options => {
      mutationFns.push(options.mutationFn);
      return { mutateAsync: mockMutateAsync };
    });

    renderHook(() => useOrganizationNames({ organizationId: 10 }));

    // Second mutation is updateName
    const updateFn = mutationFns[1];
    await expect(updateFn({ id: 1, languageCode: 'en', name: 'Test' })).rejects.toThrow(
      'Token is required'
    );
  });

  it('deleteName mutationFn throws when no token', async () => {
    const mutationFns: Array<(args: any) => Promise<any>> = [];
    mockUseMutation.mockImplementation(options => {
      mutationFns.push(options.mutationFn);
      return { mutateAsync: mockMutateAsync };
    });

    renderHook(() => useOrganizationNames({ organizationId: 10 }));

    // Third mutation is deleteName
    const deleteFn = mutationFns[2];
    await expect(deleteFn(1)).rejects.toThrow('Token is required');
  });

  it('createName mutationFn throws when no orgId', async () => {
    let capturedMutationFn: ((args: any) => Promise<any>) | undefined;
    mockUseMutation
      .mockImplementationOnce(options => {
        capturedMutationFn = options.mutationFn;
        return { mutateAsync: mockMutateAsync };
      })
      .mockReturnValue({ mutateAsync: mockMutateAsync });

    renderHook(() => useOrganizationNames({ token: 'test-token' }));

    await expect(capturedMutationFn!({ languageCode: 'en', name: 'Test' })).rejects.toThrow(
      'Organization ID and token are required'
    );
  });

  it('createName mutationFn posts and returns data when org and token present', async () => {
    const newName = { id: 3, organization: 10, language_code: 'en', name: 'New' };
    let capturedMutationFn: ((args: any) => Promise<any>) | undefined;
    mockUseMutation
      .mockImplementationOnce(options => {
        capturedMutationFn = options.mutationFn;
        return { mutateAsync: mockMutateAsync };
      })
      .mockReturnValue({ mutateAsync: mockMutateAsync });

    mockAxios.post.mockResolvedValueOnce({ data: newName });

    renderHook(() => useOrganizationNames({ organizationId: 10, token: 'test-token' }));

    const result = await capturedMutationFn!({ languageCode: 'en', name: 'New' });
    expect(result).toEqual(newName);
    expect(mockAxios.post).toHaveBeenCalledWith(
      '/api/organization_name/',
      { organization: 10, language_code: 'en', name: 'New' },
      { headers: { Authorization: 'Token test-token' } }
    );
  });

  it('createName mutationFn onSuccess invalidates queries', async () => {
    let capturedOnSuccess: (() => void) | undefined;
    mockUseMutation
      .mockImplementationOnce(options => {
        capturedOnSuccess = options.onSuccess;
        return { mutateAsync: mockMutateAsync };
      })
      .mockReturnValue({ mutateAsync: mockMutateAsync });

    renderHook(() => useOrganizationNames({ organizationId: 10, token: 'test-token' }));

    capturedOnSuccess!();
    expect(mockInvalidateQueries).toHaveBeenCalledWith({
      queryKey: ['organizationNames', 10, 'test-token'],
    });
  });

  it('updateName mutationFn calls PUT and returns data', async () => {
    const updatedName = { id: 1, organization: 10, language_code: 'en', name: 'Updated' };
    const mutationFns: Array<(args: any) => Promise<any>> = [];
    mockUseMutation.mockImplementation(options => {
      mutationFns.push(options.mutationFn);
      return { mutateAsync: mockMutateAsync };
    });

    mockAxios.put.mockResolvedValueOnce({ data: updatedName });

    renderHook(() => useOrganizationNames({ organizationId: 10, token: 'test-token' }));

    const updateFn = mutationFns[1];
    const result = await updateFn({ id: 1, languageCode: 'en', name: 'Updated' });
    expect(result).toEqual(updatedName);
    expect(mockAxios.put).toHaveBeenCalledWith(
      '/api/organization_name/1/',
      { organization: 10, language_code: 'en', name: 'Updated' },
      { headers: { Authorization: 'Token test-token' } }
    );
  });

  it('updateName mutationFn onSuccess invalidates queries', async () => {
    const onSuccessFns: Array<() => void> = [];
    mockUseMutation.mockImplementation(options => {
      onSuccessFns.push(options.onSuccess);
      return { mutateAsync: mockMutateAsync };
    });

    renderHook(() => useOrganizationNames({ organizationId: 10, token: 'test-token' }));

    onSuccessFns[1]();
    expect(mockInvalidateQueries).toHaveBeenCalledWith({
      queryKey: ['organizationNames', 10, 'test-token'],
    });
  });

  it('deleteName mutationFn calls DELETE and returns data', async () => {
    const mutationFns: Array<(args: any) => Promise<any>> = [];
    mockUseMutation.mockImplementation(options => {
      mutationFns.push(options.mutationFn);
      return { mutateAsync: mockMutateAsync };
    });

    mockAxios.delete.mockResolvedValueOnce({ data: {} });

    renderHook(() => useOrganizationNames({ organizationId: 10, token: 'test-token' }));

    const deleteFn = mutationFns[2];
    const result = await deleteFn(1);
    expect(result).toEqual({});
    expect(mockAxios.delete).toHaveBeenCalledWith('/api/organization_name/1/', {
      headers: { Authorization: 'Token test-token' },
    });
  });

  it('deleteName mutationFn onSuccess invalidates queries', async () => {
    const onSuccessFns: Array<() => void> = [];
    mockUseMutation.mockImplementation(options => {
      onSuccessFns.push(options.onSuccess);
      return { mutateAsync: mockMutateAsync };
    });

    renderHook(() => useOrganizationNames({ organizationId: 10, token: 'test-token' }));

    onSuccessFns[2]();
    expect(mockInvalidateQueries).toHaveBeenCalledWith({
      queryKey: ['organizationNames', 10, 'test-token'],
    });
  });

  it('deleteName mutationFn onError invalidates queries and rethrows', async () => {
    const onErrorFns: Array<(e: any) => void> = [];
    mockUseMutation.mockImplementation(options => {
      onErrorFns.push(options.onError);
      return { mutateAsync: mockMutateAsync };
    });

    renderHook(() => useOrganizationNames({ organizationId: 10, token: 'test-token' }));

    const onError = onErrorFns[2];
    const err = new Error('Delete failed');
    expect(() => onError(err)).toThrow('Delete failed');
    expect(mockInvalidateQueries).toHaveBeenCalledWith({
      queryKey: ['organizationNames', 10, 'test-token'],
    });
  });

  it('queryFn returns empty array when results field is missing', async () => {
    let capturedQueryFn: (() => Promise<any>) | undefined;
    mockUseQuery.mockImplementation(options => {
      capturedQueryFn = options.queryFn;
      return { data: undefined, isLoading: false, error: null };
    });

    mockAxios.get.mockResolvedValueOnce({ data: {} });

    renderHook(() => useOrganizationNames({ organizationId: 10, token: 'test-token' }));

    const result = await capturedQueryFn!();
    expect(result).toEqual([]);
  });

  it('queryFn throws error using response error message when available', async () => {
    let capturedQueryFn: (() => Promise<any>) | undefined;
    mockUseQuery.mockImplementation(options => {
      capturedQueryFn = options.queryFn;
      return { data: undefined, isLoading: false, error: null };
    });

    mockAxios.get.mockRejectedValueOnce({ response: { data: { error: 'Permission denied' } } });

    renderHook(() => useOrganizationNames({ organizationId: 10, token: 'test-token' }));

    await expect(capturedQueryFn!()).rejects.toThrow('Permission denied');
  });

  it('queryFn throws generic message when response error message not available', async () => {
    let capturedQueryFn: (() => Promise<any>) | undefined;
    mockUseQuery.mockImplementation(options => {
      capturedQueryFn = options.queryFn;
      return { data: undefined, isLoading: false, error: null };
    });

    mockAxios.get.mockRejectedValueOnce(new Error('Network error'));

    renderHook(() => useOrganizationNames({ organizationId: 10, token: 'test-token' }));

    await expect(capturedQueryFn!()).rejects.toThrow('Failed to fetch organization names');
  });
});
