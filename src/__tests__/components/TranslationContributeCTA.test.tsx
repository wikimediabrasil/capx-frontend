import { render, screen, fireEvent } from '@testing-library/react';
import { TranslationContributeCTA } from '../../components/TranslationContributeCTA';
import * as stores from '@/stores';

jest.mock('@/stores', () => ({
  ...jest.requireActual('@/stores'),
  useDarkMode: jest.fn(() => false),
  useSetDarkMode: jest.fn(() => jest.fn()),
  useThemeStore: Object.assign(
    jest.fn(() => ({ darkMode: false, setDarkMode: jest.fn(), mounted: true, hydrate: jest.fn() })),
    {
      getState: () => ({
        darkMode: false,
        setDarkMode: jest.fn(),
        mounted: true,
        hydrate: jest.fn(),
      }),
    }
  ),
  useIsMobile: jest.fn(() => false),
  usePageContent: jest.fn(() => ({})),
  useLanguage: jest.fn(() => 'en'),
  useMobileMenuStatus: jest.fn(() => false),
  useAppStore: Object.assign(
    jest.fn(() => ({
      isMobile: false,
      mobileMenuStatus: false,
      language: 'en',
      pageContent: {},
      session: null,
      mounted: true,
      setMobileMenuStatus: jest.fn(),
      setLanguage: jest.fn(),
      setPageContent: jest.fn(),
      setSession: jest.fn(),
      setIsMobile: jest.fn(),
      hydrate: jest.fn(),
    })),
    {
      getState: () => ({
        isMobile: false,
        mobileMenuStatus: false,
        language: 'en',
        pageContent: {},
        session: null,
        mounted: true,
        setMobileMenuStatus: jest.fn(),
        setLanguage: jest.fn(),
        setPageContent: jest.fn(),
        setSession: jest.fn(),
        setIsMobile: jest.fn(),
        hydrate: jest.fn(),
      }),
    }
  ),
}));

// Mock do Next.js Image
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => {
    return <img {...props} alt={props.alt || ''} />;
  },
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
    onContribute: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (stores.useLanguage as jest.Mock).mockReturnValue('pt-BR');
    (stores.usePageContent as jest.Mock).mockReturnValue(mockPageContent);
    (stores.useDarkMode as jest.Mock).mockReturnValue(false);
    (stores.useIsMobile as jest.Mock).mockReturnValue(false);
  });

  const renderWithProviders = (component: React.ReactNode) => {
    return render(<>{component}</>);
  };

  describe('Language Detection', () => {
    it('does not render when language is English', () => {
      (stores.useLanguage as jest.Mock).mockReturnValue('en');

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
      (stores.useDarkMode as jest.Mock).mockReturnValue(true);

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

  describe('Button Behavior', () => {
    it('calls onContribute when contribute button is clicked', () => {
      const onContribute = jest.fn();
      renderWithProviders(<TranslationContributeCTA onContribute={onContribute} />);

      const button = screen.getByRole('button');
      fireEvent.click(button);
      expect(onContribute).toHaveBeenCalledTimes(1);
    });

    it('calls onContribute when contribute button is clicked in compact mode', () => {
      const onContribute = jest.fn();
      renderWithProviders(<TranslationContributeCTA onContribute={onContribute} compact={true} />);

      const button = screen.getByRole('button', { name: /Contribute/i });
      fireEvent.click(button);
      expect(onContribute).toHaveBeenCalledTimes(1);
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
      (stores.usePageContent as jest.Mock).mockReturnValue({});

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
  });

  describe('Responsive Design', () => {
    it('handles mobile layout in compact mode', () => {
      (stores.useIsMobile as jest.Mock).mockReturnValue(true);

      renderWithProviders(<TranslationContributeCTA {...defaultProps} compact={true} />);

      const container = screen.getByText('Help translate this capacity').closest('div')
        ?.parentElement?.parentElement;
      expect(container).toHaveClass('flex-col');
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });
});
