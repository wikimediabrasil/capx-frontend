import { renderHook } from '@testing-library/react';
import { useSkills } from '@/hooks/useSkills';

jest.mock('next-auth/react', () => ({
  useSession: jest.fn(() => ({
    data: { user: { token: 'test-token', name: 'testuser' } },
    status: 'authenticated',
  })),
}));

const mockUseQuery = jest.fn();

jest.mock('@tanstack/react-query', () => ({
  useQuery: (...args: any[]) => mockUseQuery(...args),
}));

jest.mock('@/services/skillService', () => ({
  skillService: {
    fetchSkills: jest.fn(),
    fetchSkillById: jest.fn(),
  },
}));

describe('useSkills', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Re-set the useSession mock since clearAllMocks resets it
    const { useSession } = require('next-auth/react');
    useSession.mockReturnValue({
      data: { user: { token: 'test-token', name: 'testuser' } },
      status: 'authenticated',
    });
    mockUseQuery.mockReturnValue({
      data: undefined,
      isLoading: false,
      error: null,
    });
  });

  it('returns initial state with no data', () => {
    const { result } = renderHook(() => useSkills());

    expect(result.current.skills).toBeUndefined();
    expect(result.current.isSkillsLoading).toBe(false);
    expect(result.current.skillsError).toBeNull();
    expect(typeof result.current.useSkillById).toBe('function');
  });

  it('returns skills when data is available', () => {
    const mockSkills = [
      { id: '1', name: 'JavaScript' },
      { id: '2', name: 'TypeScript' },
    ];

    mockUseQuery.mockReturnValue({
      data: mockSkills,
      isLoading: false,
      error: null,
    });

    const { result } = renderHook(() => useSkills());

    expect(result.current.skills).toEqual(mockSkills);
  });

  it('returns loading state', () => {
    mockUseQuery.mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
    });

    const { result } = renderHook(() => useSkills());

    expect(result.current.isSkillsLoading).toBe(true);
  });

  it('returns error state', () => {
    const mockError = new Error('Failed to fetch skills');

    mockUseQuery.mockReturnValue({
      data: undefined,
      isLoading: false,
      error: mockError,
    });

    const { result } = renderHook(() => useSkills());

    expect(result.current.skillsError).toEqual(mockError);
  });

  it('calls useQuery with correct queryKey when token is present', () => {
    renderHook(() => useSkills());

    expect(mockUseQuery).toHaveBeenCalledWith(
      expect.objectContaining({
        queryKey: ['skills', 'test-token'],
        enabled: true,
      })
    );
  });

  it('disables query when no token is available', () => {
    const { useSession } = require('next-auth/react');
    useSession.mockReturnValue({ data: null, status: 'unauthenticated' });

    renderHook(() => useSkills());

    expect(mockUseQuery).toHaveBeenCalledWith(
      expect.objectContaining({
        enabled: false,
      })
    );
  });

  it('supports limit and offset parameters', () => {
    renderHook(() => useSkills(10, 20));

    expect(mockUseQuery).toHaveBeenCalledWith(
      expect.objectContaining({
        queryKey: ['skills', 'test-token'],
      })
    );
  });

  it('useSkillById returns a query result', () => {
    const mockSkill = { id: '1', name: 'JavaScript' };

    mockUseQuery
      .mockReturnValueOnce({
        data: undefined,
        isLoading: false,
        error: null,
      })
      .mockReturnValueOnce({
        data: mockSkill,
        isLoading: false,
        error: null,
      });

    const { result } = renderHook(() => useSkills());
    const skillResult = result.current.useSkillById('1');

    expect(skillResult.data).toEqual(mockSkill);
  });
});
