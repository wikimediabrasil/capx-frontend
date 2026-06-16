const mockUpdateLanguage = jest.fn();

jest.mock('next-auth/react', () => ({
  useSession: jest.fn(() => ({
    data: { user: { token: 'test-token' } },
    status: 'authenticated',
  })),
}));

jest.mock('@/stores', () => ({
  useLanguage: jest.fn(() => 'en'),
  useCapacityStore: jest.fn(() => ({
    updateLanguage: mockUpdateLanguage,
    isLoaded: true,
  })),
}));

import { renderHook } from '@testing-library/react';
import { useTranslationSync } from '@/hooks/useTranslationSync';

describe('useTranslationSync', () => {
  beforeEach(() => jest.clearAllMocks());

  it('returns currentLanguage and isLoaded', () => {
    const { result } = renderHook(() => useTranslationSync());
    expect(result.current.currentLanguage).toBe('en');
    expect(result.current.isLoaded).toBe(true);
  });

  it('does not call updateLanguage on first render', () => {
    renderHook(() => useTranslationSync());
    expect(mockUpdateLanguage).not.toHaveBeenCalled();
  });

  it('calls updateLanguage when language changes', () => {
    const { useLanguage } = require('@/stores');
    (useLanguage as jest.Mock).mockReturnValue('en');

    const { rerender } = renderHook(() => useTranslationSync());

    // Change language
    (useLanguage as jest.Mock).mockReturnValue('pt');
    rerender();

    expect(mockUpdateLanguage).toHaveBeenCalledWith('pt', 'test-token');
  });
});
