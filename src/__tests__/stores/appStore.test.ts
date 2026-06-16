jest.mock('@/lib/utils/dateLocale', () => ({ setDocumentLocale: jest.fn() }));

import { useAppStore } from '@/stores/appStore';
import { setDocumentLocale } from '@/lib/utils/dateLocale';
import { act } from '@testing-library/react';

describe('appStore', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    act(() => {
      useAppStore.setState({
        isMobile: false,
        isTablet: false,
        mobileMenuStatus: false,
        language: 'en',
        pageContent: {},
        session: null,
        mounted: false,
      });
    });
  });

  it('has correct initial state', () => {
    const state = useAppStore.getState();
    expect(state.isMobile).toBe(false);
    expect(state.mobileMenuStatus).toBe(false);
    expect(state.language).toBe('en');
    expect(state.session).toBeNull();
    expect(state.mounted).toBe(false);
  });

  it('setMobileMenuStatus updates status', () => {
    act(() => {
      useAppStore.getState().setMobileMenuStatus(true);
    });
    expect(useAppStore.getState().mobileMenuStatus).toBe(true);
  });

  it('setLanguage updates language and calls setDocumentLocale', () => {
    act(() => {
      useAppStore.getState().setLanguage('pt');
    });
    expect(useAppStore.getState().language).toBe('pt');
    expect(setDocumentLocale).toHaveBeenCalledWith('pt');
  });

  it('setPageContent updates page content', () => {
    const content = { 'key-1': 'value-1' };
    act(() => {
      useAppStore.getState().setPageContent(content);
    });
    expect(useAppStore.getState().pageContent).toEqual(content);
  });

  it('setSession updates session', () => {
    const session = { user: { id: '1' } };
    act(() => {
      useAppStore.getState().setSession(session);
    });
    expect(useAppStore.getState().session).toEqual(session);
  });

  it('setIsMobile auto-closes mobile menu when false', () => {
    act(() => {
      useAppStore.getState().setMobileMenuStatus(true);
    });
    expect(useAppStore.getState().mobileMenuStatus).toBe(true);

    act(() => {
      useAppStore.getState().setIsMobile(false);
    });
    expect(useAppStore.getState().mobileMenuStatus).toBe(false);
  });

  it('setIsMobile keeps mobile menu open when true', () => {
    act(() => {
      useAppStore.getState().setMobileMenuStatus(true);
      useAppStore.getState().setIsMobile(true);
    });
    expect(useAppStore.getState().mobileMenuStatus).toBe(true);
  });
});
