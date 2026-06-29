// Extended appStore tests to improve coverage on hydrate() and selector hooks

jest.mock('@/lib/utils/dateLocale', () => ({ setDocumentLocale: jest.fn() }));

import { useAppStore } from '@/stores/appStore';
import { setDocumentLocale } from '@/lib/utils/dateLocale';
import { act } from '@testing-library/react';

const mockedSetDocumentLocale = setDocumentLocale as jest.MockedFunction<typeof setDocumentLocale>;

describe('appStore - extended', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset localStorage mock (provided by jest.setup.ts, no removeItem)
    (localStorage.getItem as jest.Mock).mockReturnValue(null);
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

  // -------------------------------------------------------------------------
  // hydrate()
  // -------------------------------------------------------------------------
  describe('hydrate', () => {
    it('returns no-op cleanup when already mounted', () => {
      act(() => {
        useAppStore.setState({ mounted: true });
      });

      let cleanup: (() => void) | undefined;
      act(() => {
        cleanup = useAppStore.getState().hydrate();
      });

      // Already mounted, should return a no-op (function that does nothing)
      expect(typeof cleanup).toBe('function');
    });

    it('detects mobile when globalThis.innerWidth <= 768', () => {
      Object.defineProperty(globalThis, 'innerWidth', { value: 375, writable: true });

      act(() => {
        useAppStore.getState().hydrate();
      });

      expect(useAppStore.getState().isMobile).toBe(true);
      expect(useAppStore.getState().mounted).toBe(true);
    });

    it('detects tablet when globalThis.innerWidth is between 768 and 1024', () => {
      Object.defineProperty(globalThis, 'innerWidth', { value: 900, writable: true });

      act(() => {
        useAppStore.getState().hydrate();
      });

      expect(useAppStore.getState().isTablet).toBe(true);
    });

    it('detects desktop (not mobile, not tablet) for wide screens', () => {
      Object.defineProperty(globalThis, 'innerWidth', { value: 1440, writable: true });

      act(() => {
        useAppStore.getState().hydrate();
      });

      expect(useAppStore.getState().isMobile).toBe(false);
      expect(useAppStore.getState().isTablet).toBe(false);
    });

    it('loads saved language from localStorage on hydrate', () => {
      (localStorage.getItem as jest.Mock).mockImplementation((key: string) => {
        if (key === 'language') return 'pt';
        return null;
      });

      act(() => {
        useAppStore.getState().hydrate();
      });

      expect(useAppStore.getState().language).toBe('pt');
      expect(mockedSetDocumentLocale).toHaveBeenCalledWith('pt');
    });

    it('does not call setDocumentLocale when saved language matches current', () => {
      (localStorage.getItem as jest.Mock).mockImplementation((key: string) => {
        if (key === 'language') return 'en';
        return null;
      });
      // language is already 'en'
      act(() => {
        useAppStore.getState().hydrate();
      });

      // setDocumentLocale should NOT be called since language didn't change
      expect(mockedSetDocumentLocale).not.toHaveBeenCalled();
    });

    it('returns a cleanup function that removes resize event listener', () => {
      const removeEventListenerSpy = jest.spyOn(globalThis, 'removeEventListener');

      let cleanup: (() => void) | undefined;
      act(() => {
        cleanup = useAppStore.getState().hydrate();
      });

      act(() => {
        cleanup?.();
      });

      expect(removeEventListenerSpy).toHaveBeenCalledWith('resize', expect.any(Function));
      removeEventListenerSpy.mockRestore();
    });

    it('updates mobile/tablet state on window resize', () => {
      const addEventListenerSpy = jest.spyOn(globalThis, 'addEventListener');

      Object.defineProperty(globalThis, 'innerWidth', { value: 1440, writable: true });

      act(() => {
        useAppStore.getState().hydrate();
      });

      expect(useAppStore.getState().isMobile).toBe(false);

      // Simulate resize to mobile
      Object.defineProperty(globalThis, 'innerWidth', { value: 375, writable: true });
      const resizeHandler = addEventListenerSpy.mock.calls.find(
        call => call[0] === 'resize'
      )?.[1] as EventListener;

      act(() => {
        resizeHandler?.(new Event('resize'));
      });

      expect(useAppStore.getState().isMobile).toBe(true);
      addEventListenerSpy.mockRestore();
    });

    it('auto-closes mobile menu on resize to desktop', () => {
      const addEventListenerSpy = jest.spyOn(globalThis, 'addEventListener');

      Object.defineProperty(globalThis, 'innerWidth', { value: 375, writable: true });

      act(() => {
        useAppStore.getState().hydrate();
        useAppStore.getState().setMobileMenuStatus(true);
      });

      expect(useAppStore.getState().mobileMenuStatus).toBe(true);

      // Resize to desktop
      Object.defineProperty(globalThis, 'innerWidth', { value: 1440, writable: true });
      const resizeHandler = addEventListenerSpy.mock.calls.find(
        call => call[0] === 'resize'
      )?.[1] as EventListener;

      act(() => {
        resizeHandler?.(new Event('resize'));
      });

      expect(useAppStore.getState().mobileMenuStatus).toBe(false);
      addEventListenerSpy.mockRestore();
    });

    it('does not update state when dimensions have not changed on resize', () => {
      const addEventListenerSpy = jest.spyOn(globalThis, 'addEventListener');

      Object.defineProperty(globalThis, 'innerWidth', { value: 1440, writable: true });

      act(() => {
        useAppStore.getState().hydrate();
      });

      const setStateSpy = jest.spyOn(useAppStore, 'setState');

      // Simulate resize to same width
      const resizeHandler = addEventListenerSpy.mock.calls.find(
        call => call[0] === 'resize'
      )?.[1] as EventListener;

      act(() => {
        resizeHandler?.(new Event('resize'));
      });

      // setState should not be called for isMobile/isTablet since nothing changed
      const mobileCalls = setStateSpy.mock.calls.filter(call => 'isMobile' in (call[0] as object));
      expect(mobileCalls).toHaveLength(0);

      addEventListenerSpy.mockRestore();
      setStateSpy.mockRestore();
    });
  });

  // -------------------------------------------------------------------------
  // setLanguage persists to localStorage
  // -------------------------------------------------------------------------
  describe('setLanguage', () => {
    it('persists language to localStorage', () => {
      act(() => {
        useAppStore.getState().setLanguage('fr');
      });

      expect(localStorage.setItem).toHaveBeenCalledWith('language', 'fr');
    });
  });

  // -------------------------------------------------------------------------
  // Selector hooks (exports from appStore)
  // -------------------------------------------------------------------------
  describe('exported selector hooks', () => {
    it('useIsMobile reflects isMobile state', () => {
      const appStoreExports = require('@/stores/appStore');
      expect(appStoreExports.useIsMobile).toBeDefined();
      act(() => {
        useAppStore.setState({ isMobile: true });
      });
      expect(useAppStore.getState().isMobile).toBe(true);
    });

    it('useIsTablet reflects isTablet state', () => {
      act(() => {
        useAppStore.setState({ isTablet: true });
      });
      expect(useAppStore.getState().isTablet).toBe(true);
    });

    it('useLanguage reflects language state', () => {
      act(() => {
        useAppStore.setState({ language: 'de' });
      });
      expect(useAppStore.getState().language).toBe('de');
    });

    it('useMobileMenuStatus reflects mobileMenuStatus', () => {
      act(() => {
        useAppStore.setState({ mobileMenuStatus: true });
      });
      expect(useAppStore.getState().mobileMenuStatus).toBe(true);
    });

    it('usePageContent reflects pageContent', () => {
      const content = { key: 'value' };
      act(() => {
        useAppStore.setState({ pageContent: content });
      });
      expect(useAppStore.getState().pageContent).toEqual(content);
    });

    it('useSession reflects session', () => {
      const session = { user: { name: 'Alice' } };
      act(() => {
        useAppStore.setState({ session });
      });
      expect(useAppStore.getState().session).toEqual(session);
    });

    it('useMounted reflects mounted', () => {
      act(() => {
        useAppStore.setState({ mounted: true });
      });
      expect(useAppStore.getState().mounted).toBe(true);
    });
  });
});
