jest.mock('@/lib/utils/dateLocale', () => ({ setDocumentLocale: jest.fn() }));

import { renderHook, act } from '@testing-library/react';
import { useAppStore } from '@/stores/appStore';
import {
  useIsMobileView,
  useMobileMenu,
  useCurrentLanguage,
  useTranslations,
  useTranslation,
  useSessionData,
  useIsMounted,
  useNavigationState,
  useLanguageState,
} from '@/stores/hooks/useAppSelectors';

const resetStore = () => {
  act(() => {
    useAppStore.setState({
      isMobile: false,
      isTablet: false,
      mobileMenuStatus: false,
      language: 'en',
      pageContent: {
        'capacity-card-explore-capacity': 'Explore capacity',
        hello: 'Hello',
      },
      session: null,
      mounted: false,
    });
  });
};

describe('useAppSelectors hooks', () => {
  beforeEach(() => {
    resetStore();
  });

  // -------------------------------------------------------------------------
  // useIsMobileView
  // -------------------------------------------------------------------------
  describe('useIsMobileView', () => {
    it('returns false by default', () => {
      const { result } = renderHook(() => useIsMobileView());
      expect(result.current).toBe(false);
    });

    it('returns true when isMobile is set', () => {
      act(() => {
        useAppStore.setState({ isMobile: true });
      });
      const { result } = renderHook(() => useIsMobileView());
      expect(result.current).toBe(true);
    });
  });

  // -------------------------------------------------------------------------
  // useMobileMenu
  // -------------------------------------------------------------------------
  describe('useMobileMenu', () => {
    it('returns false by default', () => {
      const { result } = renderHook(() => useMobileMenu());
      expect(result.current).toBe(false);
    });

    it('returns true when mobileMenuStatus is set', () => {
      act(() => {
        useAppStore.getState().setMobileMenuStatus(true);
      });
      const { result } = renderHook(() => useMobileMenu());
      expect(result.current).toBe(true);
    });
  });

  // -------------------------------------------------------------------------
  // useCurrentLanguage
  // -------------------------------------------------------------------------
  describe('useCurrentLanguage', () => {
    it('returns "en" by default', () => {
      const { result } = renderHook(() => useCurrentLanguage());
      expect(result.current).toBe('en');
    });

    it('reflects language changes', () => {
      act(() => {
        useAppStore.setState({ language: 'pt' });
      });
      const { result } = renderHook(() => useCurrentLanguage());
      expect(result.current).toBe('pt');
    });
  });

  // -------------------------------------------------------------------------
  // useTranslations
  // -------------------------------------------------------------------------
  describe('useTranslations', () => {
    it('returns pageContent object', () => {
      const { result } = renderHook(() => useTranslations());
      expect(result.current).toHaveProperty('hello', 'Hello');
    });

    it('reflects pageContent updates', () => {
      act(() => {
        useAppStore.getState().setPageContent({ 'new-key': 'New Value' });
      });
      const { result } = renderHook(() => useTranslations());
      expect(result.current).toHaveProperty('new-key', 'New Value');
    });
  });

  // -------------------------------------------------------------------------
  // useTranslation
  // -------------------------------------------------------------------------
  describe('useTranslation', () => {
    it('returns translated value for existing key', () => {
      const { result } = renderHook(() => useTranslation('hello'));
      expect(result.current).toBe('Hello');
    });

    it('returns the key itself for missing translation', () => {
      const { result } = renderHook(() => useTranslation('missing-key'));
      expect(result.current).toBe('missing-key');
    });

    it('returns updated value when pageContent changes', () => {
      const { result, rerender } = renderHook(() => useTranslation('hello'));
      expect(result.current).toBe('Hello');

      act(() => {
        useAppStore.getState().setPageContent({ hello: 'Bonjour' });
      });
      rerender();

      expect(result.current).toBe('Bonjour');
    });
  });

  // -------------------------------------------------------------------------
  // useSessionData
  // -------------------------------------------------------------------------
  describe('useSessionData', () => {
    it('returns null by default', () => {
      const { result } = renderHook(() => useSessionData());
      expect(result.current).toBeNull();
    });

    it('returns session when set', () => {
      const session = { user: { name: 'Alice', token: 'abc123' } };
      act(() => {
        useAppStore.getState().setSession(session);
      });
      const { result } = renderHook(() => useSessionData());
      expect(result.current).toEqual(session);
    });
  });

  // -------------------------------------------------------------------------
  // useIsMounted
  // -------------------------------------------------------------------------
  describe('useIsMounted', () => {
    it('returns false by default', () => {
      const { result } = renderHook(() => useIsMounted());
      expect(result.current).toBe(false);
    });

    it('returns true when mounted is set', () => {
      act(() => {
        useAppStore.setState({ mounted: true });
      });
      const { result } = renderHook(() => useIsMounted());
      expect(result.current).toBe(true);
    });
  });

  // -------------------------------------------------------------------------
  // useNavigationState
  // -------------------------------------------------------------------------
  describe('useNavigationState', () => {
    it('returns combined navigation state', () => {
      act(() => {
        useAppStore.setState({ isMobile: true, mobileMenuStatus: true, language: 'de' });
      });
      const { result } = renderHook(() => useNavigationState());

      expect(result.current.isMobile).toBe(true);
      expect(result.current.mobileMenuStatus).toBe(true);
      expect(result.current.language).toBe('de');
      expect(typeof result.current.setMobileMenuStatus).toBe('function');
      expect(typeof result.current.setLanguage).toBe('function');
    });

    it('setMobileMenuStatus action works through hook', () => {
      const { result } = renderHook(() => useNavigationState());

      act(() => {
        result.current.setMobileMenuStatus(true);
      });

      expect(useAppStore.getState().mobileMenuStatus).toBe(true);
    });

    it('setLanguage action works through hook', () => {
      const { result } = renderHook(() => useNavigationState());

      act(() => {
        result.current.setLanguage('fr');
      });

      expect(useAppStore.getState().language).toBe('fr');
    });
  });

  // -------------------------------------------------------------------------
  // useLanguageState
  // -------------------------------------------------------------------------
  describe('useLanguageState', () => {
    it('returns combined language state', () => {
      act(() => {
        useAppStore.setState({ language: 'ja', pageContent: { key: 'value' } });
      });
      const { result } = renderHook(() => useLanguageState());

      expect(result.current.language).toBe('ja');
      expect(result.current.pageContent).toHaveProperty('key', 'value');
      expect(typeof result.current.setLanguage).toBe('function');
      expect(typeof result.current.setPageContent).toBe('function');
    });

    it('setPageContent action works through hook', () => {
      const { result } = renderHook(() => useLanguageState());
      const newContent = { title: 'Titulo' };

      act(() => {
        result.current.setPageContent(newContent);
      });

      expect(useAppStore.getState().pageContent).toEqual(newContent);
    });
  });
});
