jest.mock('next-auth/react', () => ({
  useSession: jest.fn(() => ({
    data: { user: { token: 'test-token' } },
    status: 'authenticated',
  })),
}));

jest.mock('@/services/capacityService', () => ({
  capacityService: {
    fetchCapacityById: jest.fn(),
  },
}));

jest.mock('@/hooks/useCapacities', () => ({
  CAPACITY_CACHE_KEYS: {
    byId: (id: number, lang: string) => ['capacities', 'byId', id, lang],
  },
}));

const mockRefetch = jest.fn();
jest.mock('@tanstack/react-query', () => ({
  useQuery: jest.fn(() => ({
    data: { name: 'Test Capacity', description: 'A test', code: '10' },
    isLoading: false,
    refetch: mockRefetch,
  })),
}));

import { renderHook } from '@testing-library/react';
import { useCapacityProfile } from '@/hooks/useCapacityProfile';

describe('useCapacityProfile', () => {
  beforeEach(() => jest.clearAllMocks());

  it('returns capacity data', () => {
    const { result } = renderHook(() => useCapacityProfile('10'));
    expect(result.current.selectedCapacityData).toEqual({
      name: 'Test Capacity',
      description: 'A test',
      code: '10',
    });
    expect(result.current.isLoading).toBe(false);
  });

  it('refreshCapacityData calls refetch', () => {
    const { result } = renderHook(() => useCapacityProfile('10'));
    result.current.refreshCapacityData('pt');
    expect(mockRefetch).toHaveBeenCalled();
  });
});
