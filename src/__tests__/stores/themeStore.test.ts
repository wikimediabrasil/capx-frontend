jest.mock('@/lib/utils/dateLocale', () => ({ setDocumentLocale: jest.fn() }));

import { useThemeStore } from '@/stores/themeStore';
import { act } from '@testing-library/react';

// Ensure localStorage has removeItem
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(window, 'localStorage', { value: localStorageMock, writable: true });

describe('themeStore', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Only reset data fields, preserve methods by not using replace (true)
    act(() => {
      useThemeStore.setState({ darkMode: false, mounted: false });
    });
  });

  it('has correct initial state', () => {
    const state = useThemeStore.getState();
    expect(state.darkMode).toBe(false);
    expect(state.mounted).toBe(false);
  });

  it('setDarkMode updates darkMode', () => {
    act(() => {
      useThemeStore.getState().setDarkMode(true);
    });
    expect(useThemeStore.getState().darkMode).toBe(true);
  });

  it('setDarkMode saves to localStorage', () => {
    act(() => {
      useThemeStore.getState().setDarkMode(true);
    });
    expect(localStorageMock.setItem).toHaveBeenCalledWith('theme', 'dark');
  });

  it('setDarkMode(false) saves light to localStorage', () => {
    act(() => {
      useThemeStore.getState().setDarkMode(false);
    });
    expect(localStorageMock.setItem).toHaveBeenCalledWith('theme', 'light');
  });

  it('setDarkMode toggles dark class on documentElement', () => {
    act(() => {
      useThemeStore.getState().setDarkMode(true);
    });
    expect(document.documentElement.classList.contains('dark')).toBe(true);

    act(() => {
      useThemeStore.getState().setDarkMode(false);
    });
    expect(document.documentElement.classList.contains('dark')).toBe(false);
  });
});
