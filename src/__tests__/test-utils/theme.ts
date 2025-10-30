/**
 * Creates a mock theme object for testing
 */
export function createMockTheme(darkMode: boolean = false) {
  return {
    darkMode,
    setDarkMode: jest.fn(),
    theme: {
      fontSize: {
        mobile: { base: '14px' },
        desktop: { base: '24px' },
      },
    },
    getFontSize: () => ({ mobile: '14px', desktop: '24px' }),
    getBackgroundColor: () => (darkMode ? '#005B3F' : '#FFFFFF'),
    getTextColor: () => (darkMode ? '#FFFFFF' : '#000000'),
  };
}
