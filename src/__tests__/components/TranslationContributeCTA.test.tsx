import { render, screen, fireEvent } from '@testing-library/react';
import { TranslationContributeCTA } from '../../components/TranslationContributeCTA';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { AppProvider } from '@/contexts/AppContext';
import * as ThemeContext from '@/contexts/ThemeContext';
import * as AppContext from '@/contexts/AppContext';

// Mock do Next.js
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: () => jest.fn(),
      replace: () => jest.fn(),
      prefetch: () => jest.fn(),
      back: () => jest.fn(),
    };
  },
  usePathname() {
    return '/';
  },
  useSearchParams() {
    return new URLSearchParams();
  },
}));

// Mock do Next.js Image
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => {
    return <img {...props} />;
  },
}));

// Mock do Next.js Link
jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ children, href, ...props }: any) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

// Mock dos contextos
jest.mock('@/contexts/ThemeContext', () => ({
  ...jest.requireActual('@/contexts/ThemeContext'),
  useTheme: jest.fn(),
}));

jest.mock('@/contexts/AppContext', () => ({
  ...jest.requireActual('@/contexts/AppContext'),
  useApp: jest.fn(),
}));

describe('TranslationContributeCTA', () => {
  const mockPageContent = {
    'translation-contribute-compact': 'Help translate this capacity',
    'translation-contribute-link': 'Contribute',
    'translation-contribute-message':
      "Don't see this capacity in your selected language? Help us translate it on Metabase!",
    'translation-contribute-action': 'Contribute translation',
  };

  const defaultProps = {
    capacityCode: 36,
    capacityName: 'Communication Skills',
    metabaseCode: 'Q123',
  };

  beforeEach(() => {
    (ThemeContext.useTheme as jest.Mock).mockReturnValue({
      darkMode: false,
      setDarkMode: jest.fn(),
    });

    (AppContext.useApp as jest.Mock).mockReturnValue({
      language: 'pt',
      pageContent: mockPageContent,
      isMobile: false,
      setLanguage: jest.fn(),
      setPageContent: jest.fn(),
    });
  });

  const renderWithProviders = (component: React.ReactNode) => {
    return render(
      <ThemeProvider>
        <AppProvider>{component}</AppProvider>
      </ThemeProvider>
    );
  };

  describe('Language Detection', () => {
    it('does not render when language is English', () => {
      (AppContext.useApp as jest.Mock).mockReturnValue({
        language: 'en',
        pageContent: mockPageContent,
        isMobile: false,
      });

      const { container } = renderWithProviders(<TranslationContributeCTA {...defaultProps} />);
      expect(container.firstChild).toBeNull();
    });

    it('renders when language is not English', () => {
      renderWithProviders(<TranslationContributeCTA {...defaultProps} />);
      expect(screen.getByText('Translation Needed')).toBeInTheDocument();
    });
  });

  describe('Compact Mode', () => {
    it('renders compact version when compact=true', () => {
      renderWithProviders(<TranslationContributeCTA {...defaultProps} compact={true} />);

      expect(screen.getByText('Help translate this capacity')).toBeInTheDocument();
      expect(screen.getByText('Contribute')).toBeInTheDocument();
      expect(screen.getByAltText('Translate')).toBeInTheDocument();
      expect(screen.getByAltText('Help')).toBeInTheDocument();
    });

    it('renders full version when compact=false or undefined', () => {
      renderWithProviders(<TranslationContributeCTA {...defaultProps} compact={false} />);

      expect(screen.getByText('Translation Needed')).toBeInTheDocument();
      expect(screen.getByText('Help wanted')).toBeInTheDocument();
      expect(screen.getByText('Contribute')).toBeInTheDocument();
    });
  });

  describe('Dark Mode Support', () => {
    it('applies dark mode styles when darkMode is true', () => {
      (ThemeContext.useTheme as jest.Mock).mockReturnValue({
        darkMode: true,
        setDarkMode: jest.fn(),
      });

      renderWithProviders(<TranslationContributeCTA {...defaultProps} compact={true} />);

      const container = screen.getByText('Help translate this capacity').closest('div')
        ?.parentElement?.parentElement;
      expect(container).toHaveClass('bg-capx-dark-box-bg', 'border-blue-800/50');
    });

    it('applies light mode styles when darkMode is false', () => {
      renderWithProviders(<TranslationContributeCTA {...defaultProps} compact={true} />);

      const container = screen.getByText('Help translate this capacity').closest('div')
        ?.parentElement?.parentElement;
      expect(container).toHaveClass('bg-blue-50', 'border-blue-200');
    });
  });

  describe('Metabase Link Generation', () => {
    it('generates correct URL with metabase code', () => {
      renderWithProviders(<TranslationContributeCTA {...defaultProps} metabaseCode="Q123" />);

      const link = screen.getByRole('link');
      expect(link).toHaveAttribute('href', 'https://metabase.wikibase.cloud/wiki/Item:Q123');
    });

    it('generates fallback URL for communication capacity without metabase code', () => {
      renderWithProviders(
        <TranslationContributeCTA {...defaultProps} capacityCode={36} metabaseCode="" />
      );

      const link = screen.getByRole('link');
      expect(link).toHaveAttribute('href', 'https://metabase.wikibase.cloud/wiki/Item:Q73');
    });

    it('generates fallback URL for organizational capacity', () => {
      renderWithProviders(
        <TranslationContributeCTA {...defaultProps} capacityCode={10} metabaseCode="" />
      );

      const link = screen.getByRole('link');
      expect(link).toHaveAttribute('href', 'https://metabase.wikibase.cloud/wiki/Item:Q72');
    });

    it('generates fallback URL for learning capacity', () => {
      renderWithProviders(
        <TranslationContributeCTA {...defaultProps} capacityCode={50} metabaseCode="" />
      );

      const link = screen.getByRole('link');
      expect(link).toHaveAttribute('href', 'https://metabase.wikibase.cloud/wiki/Item:Q74');
    });

    it('generates fallback URL for community capacity', () => {
      renderWithProviders(
        <TranslationContributeCTA {...defaultProps} capacityCode={56} metabaseCode="" />
      );

      const link = screen.getByRole('link');
      expect(link).toHaveAttribute('href', 'https://metabase.wikibase.cloud/wiki/Item:Q75');
    });

    it('generates fallback URL for social capacity', () => {
      renderWithProviders(
        <TranslationContributeCTA {...defaultProps} capacityCode={65} metabaseCode="" />
      );

      const link = screen.getByRole('link');
      expect(link).toHaveAttribute('href', 'https://metabase.wikibase.cloud/wiki/Item:Q76');
    });

    it('generates fallback URL for strategic capacity', () => {
      renderWithProviders(
        <TranslationContributeCTA {...defaultProps} capacityCode={74} metabaseCode="" />
      );

      const link = screen.getByRole('link');
      expect(link).toHaveAttribute('href', 'https://metabase.wikibase.cloud/wiki/Item:Q77');
    });

    it('generates fallback URL for technology capacity', () => {
      renderWithProviders(
        <TranslationContributeCTA {...defaultProps} capacityCode={106} metabaseCode="" />
      );

      const link = screen.getByRole('link');
      expect(link).toHaveAttribute('href', 'https://metabase.wikibase.cloud/wiki/Item:Q78');
    });

    it('generates default fallback URL for unknown capacity code', () => {
      renderWithProviders(
        <TranslationContributeCTA {...defaultProps} capacityCode={999} metabaseCode="" />
      );

      const link = screen.getByRole('link');
      expect(link).toHaveAttribute('href', 'https://metabase.wikibase.cloud/wiki/Item:Q72');
    });
  });

  describe('Link Properties', () => {
    it('opens link in new tab', () => {
      renderWithProviders(<TranslationContributeCTA {...defaultProps} />);

      const link = screen.getByRole('link');
      expect(link).toHaveAttribute('target', '_blank');
      expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    });
  });

  describe('Custom Content', () => {
    it('uses pageContent translations when available', () => {
      renderWithProviders(<TranslationContributeCTA {...defaultProps} />);

      expect(
        screen.getByText(
          "Don't see this capacity in your selected language? Help us translate it on Metabase!"
        )
      ).toBeInTheDocument();
      expect(screen.getByText('Contribute')).toBeInTheDocument();
    });

    it('falls back to default text when pageContent is not available', () => {
      (AppContext.useApp as jest.Mock).mockReturnValue({
        language: 'pt',
        pageContent: {},
        isMobile: false,
      });

      renderWithProviders(<TranslationContributeCTA {...defaultProps} />);

      expect(
        screen.getByText(
          "Don't see this capacity in your selected language? Help us translate it on Metabase!"
        )
      ).toBeInTheDocument();
      expect(screen.getByText('Contribute')).toBeInTheDocument();
    });
  });

  describe('Custom Styling', () => {
    it('applies custom className', () => {
      const customClass = 'custom-test-class';
      renderWithProviders(
        <TranslationContributeCTA {...defaultProps} className={customClass} compact={true} />
      );

      const container = screen.getByText('Help translate this capacity').closest('div')
        ?.parentElement?.parentElement;
      expect(container).toHaveClass(customClass);
    });
  });

  describe('Accessibility', () => {
    it('has proper alt text for images', () => {
      renderWithProviders(<TranslationContributeCTA {...defaultProps} />);

      expect(screen.getByAltText('Translation needed')).toBeInTheDocument();
      expect(screen.getByAltText('Help')).toBeInTheDocument();
    });

    it('has proper link text for screen readers', () => {
      renderWithProviders(<TranslationContributeCTA {...defaultProps} />);

      const link = screen.getByRole('link');
      expect(link).toHaveTextContent('Contribute');
    });
  });

  describe('Responsive Design', () => {
    it('handles mobile layout in compact mode', () => {
      (AppContext.useApp as jest.Mock).mockReturnValue({
        language: 'pt',
        pageContent: mockPageContent,
        isMobile: true,
      });

      renderWithProviders(<TranslationContributeCTA {...defaultProps} compact={true} />);

      const container = screen.getByText('Help translate this capacity').closest('div')
        ?.parentElement?.parentElement;
      expect(container).toHaveClass('flex-col');
    });
  });

  describe('Event Handling', () => {
    it('handles click on external link', () => {
      // Mock window.open to verify external link behavior
      const mockOpen = jest.fn();
      Object.defineProperty(window, 'open', {
        value: mockOpen,
        writable: true,
      });

      renderWithProviders(<TranslationContributeCTA {...defaultProps} />);

      const link = screen.getByRole('link');
      // The link should have target="_blank" which will open in new tab
      expect(link).toHaveAttribute('href', 'https://metabase.wikibase.cloud/wiki/Item:Q123');
      expect(link).toHaveAttribute('target', '_blank');
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });
});
