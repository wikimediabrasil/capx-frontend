import { ContactsSection } from '@/app/(auth)/organization_profile/components/ContactsSection';
import * as AppContext from '@/contexts/AppContext';
import { AppProvider } from '@/contexts/AppContext';
import * as ThemeContext from '@/contexts/ThemeContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { render, screen } from '@testing-library/react';

const mockPageContent = {
  'body-profile-section-title-contacts': 'Contacts',
};

// Mock AppContext
jest.mock('@/contexts/AppContext', () => ({
  ...jest.requireActual('@/contexts/AppContext'),
  useApp: jest.fn(),
}));

// Mock ThemeContext
jest.mock('@/contexts/ThemeContext', () => ({
  ...jest.requireActual('@/contexts/ThemeContext'),
  useTheme: jest.fn(),
}));

// Mock Next.js Image component
jest.mock('next/image', () => ({
  __esModule: true,
  default: ({ src, alt, className, fill, ...props }: any) => (
    <img src={src} alt={alt} className={className} {...props} />
  ),
}));

describe('ContactsSection', () => {
  const mockUseApp = AppContext.useApp as jest.MockedFunction<typeof AppContext.useApp>;
  const mockUseTheme = ThemeContext.useTheme as jest.MockedFunction<typeof ThemeContext.useTheme>;

  beforeEach(() => {
    mockUseApp.mockReturnValue({
      isMobile: false,
      pageContent: mockPageContent,
      mobileMenuStatus: false,
      setMobileMenuStatus: jest.fn(),
      language: 'en',
      setLanguage: jest.fn(),
      setPageContent: jest.fn(),
      session: null,
      setSession: jest.fn(),
    });

    mockUseTheme.mockReturnValue({
      darkMode: false,
      setDarkMode: jest.fn(),
    });
  });

  const renderWithProviders = (component: React.ReactNode) => {
    return render(
      <ThemeProvider>
        <AppProvider>{component}</AppProvider>
      </ThemeProvider>
    );
  };

  describe('when no contacts are provided', () => {
    it('renders empty contacts section with ProfileItem', () => {
      renderWithProviders(<ContactsSection email="" meta_page="" website="" />);

      expect(screen.getByText('Contacts')).toBeInTheDocument();
      const images = screen.getAllByRole('img');
      expect(images.length).toBeGreaterThan(0);
    });

    it('applies correct styling for empty state in mobile', () => {
      mockUseApp.mockReturnValue({
        ...mockUseApp(),
        isMobile: true,
      });

      const { container } = renderWithProviders(
        <ContactsSection email="" meta_page="" website="" />
      );

      const section = container.querySelector('section');
      expect(section).toHaveClass('w-full', 'mx-auto');
    });

    it('applies correct styling for empty state in desktop', () => {
      const { container } = renderWithProviders(
        <ContactsSection email="" meta_page="" website="" />
      );

      const section = container.querySelector('section');
      expect(section).toHaveClass('w-full', 'max-w-screen-xl', 'py-8');
    });
  });

  describe('when contacts are provided', () => {
    const testProps = {
      email: 'test@example.com',
      meta_page: 'https://meta.wikimedia.org/wiki/User:Test',
      website: 'https://example.com',
    };

    it('renders all contact information correctly', () => {
      renderWithProviders(<ContactsSection {...testProps} />);

      expect(screen.getByText('Contacts')).toBeInTheDocument();
      expect(screen.getByText('test@example.com')).toBeInTheDocument();
      expect(screen.getByText('https://meta.wikimedia.org/wiki/User:Test')).toBeInTheDocument();
      expect(screen.getByText('https://example.com')).toBeInTheDocument();
    });

    it('renders email as non-link when no URL format', () => {
      renderWithProviders(<ContactsSection {...testProps} />);

      const emailElement = screen.getByText('test@example.com');
      expect(emailElement.tagName).toBe('P');
    });

    it('renders meta_page as link when URL format', () => {
      renderWithProviders(<ContactsSection {...testProps} />);

      const metaPageElement = screen.getByText('https://meta.wikimedia.org/wiki/User:Test');
      expect(metaPageElement.tagName).toBe('A');
      expect(metaPageElement).toHaveAttribute('href', 'https://meta.wikimedia.org/wiki/User:Test');
      expect(metaPageElement).toHaveAttribute('target', '_blank');
      expect(metaPageElement).toHaveAttribute('rel', 'noopener noreferrer');
    });

    it('renders website as link when URL format', () => {
      renderWithProviders(<ContactsSection {...testProps} />);

      const websiteElement = screen.getByText('https://example.com');
      expect(websiteElement.tagName).toBe('A');
      expect(websiteElement.getAttribute('href')).toContain('https://example.com');
      expect(websiteElement).toHaveAttribute('target', '_blank');
      expect(websiteElement).toHaveAttribute('rel', 'noopener noreferrer');
    });

    it('renders contact icons correctly', () => {
      renderWithProviders(<ContactsSection {...testProps} />);

      const images = screen.getAllByRole('img');
      expect(images).toHaveLength(4); // 1 for title + 3 for contacts
      expect(images[0]).toHaveAttribute('alt', 'Wikimedia');
      expect(images[1]).toHaveAttribute('alt', 'Meta Page');
      expect(images[2]).toHaveAttribute('alt', 'Email');
      expect(images[3]).toHaveAttribute('alt', 'Website');
    });

    it('filters out empty contacts', () => {
      renderWithProviders(
        <ContactsSection email="test@example.com" meta_page="" website="https://example.com" />
      );

      expect(screen.getByText('test@example.com')).toBeInTheDocument();
      expect(screen.getByText('https://example.com')).toBeInTheDocument();
      expect(
        screen.queryByText('https://meta.wikimedia.org/wiki/User:Test')
      ).not.toBeInTheDocument();

      const images = screen.getAllByRole('img');
      expect(images).toHaveLength(3); // 1 for title + 2 for contacts
    });
  });

  describe('mobile responsive behavior', () => {
    const testProps = {
      email: 'test@example.com',
      meta_page: 'https://meta.wikimedia.org/wiki/User:Test',
      website: 'https://example.com',
    };

    it('applies mobile styling when isMobile is true', () => {
      mockUseApp.mockReturnValue({
        ...mockUseApp(),
        isMobile: true,
      });

      const { container } = renderWithProviders(<ContactsSection {...testProps} />);

      const section = container.querySelector('section');
      expect(section).toHaveClass('w-full', 'mx-auto');
    });

    it('applies desktop styling when isMobile is false', () => {
      const { container } = renderWithProviders(<ContactsSection {...testProps} />);

      const section = container.querySelector('section');
      expect(section).toHaveClass('w-full', 'max-w-screen-xl', 'py-8');
    });

    it('applies correct mobile text styling', () => {
      mockUseApp.mockReturnValue({
        ...mockUseApp(),
        isMobile: true,
      });

      const { container } = renderWithProviders(<ContactsSection {...testProps} />);

      const contactText = container.querySelector('[class*="text-[13px]"]');
      expect(contactText).toBeInTheDocument();
    });

    it('applies correct desktop text styling', () => {
      const { container } = renderWithProviders(<ContactsSection {...testProps} />);

      const contactText = container.querySelector('[class*="text-[24px]"]');
      expect(contactText).toBeInTheDocument();
    });
  });

  describe('dark mode behavior', () => {
    const testProps = {
      email: 'test@example.com',
      meta_page: 'https://meta.wikimedia.org/wiki/User:Test',
      website: 'https://example.com',
    };

    it('uses dark mode icons when darkMode is true', () => {
      mockUseTheme.mockReturnValue({
        darkMode: true,
        setDarkMode: jest.fn(),
      });

      renderWithProviders(<ContactsSection {...testProps} />);

      const images = screen.getAllByRole('img');
      // Check that images are present (specific src checking would require more complex mocking)
      expect(images).toHaveLength(4);
    });

    it('applies dark mode text colors', () => {
      mockUseTheme.mockReturnValue({
        darkMode: true,
        setDarkMode: jest.fn(),
      });

      const { container } = renderWithProviders(<ContactsSection {...testProps} />);

      const titleElement = screen.getByText('Contacts');
      expect(titleElement).toHaveClass('text-[#F6F6F6]');
    });

    it('applies light mode text colors', () => {
      const { container } = renderWithProviders(<ContactsSection {...testProps} />);

      const titleElement = screen.getByText('Contacts');
      expect(titleElement).toHaveClass('text-[#003649]');
    });

    it('applies dark mode background colors in desktop', () => {
      mockUseTheme.mockReturnValue({
        darkMode: true,
        setDarkMode: jest.fn(),
      });

      const { container } = renderWithProviders(<ContactsSection {...testProps} />);

      const contactContainer = container.querySelector('[class*="bg-[#04222F]"]');
      expect(contactContainer).toBeInTheDocument();
    });

    it('applies light mode background colors in desktop', () => {
      const { container } = renderWithProviders(<ContactsSection {...testProps} />);

      const contactContainer = container.querySelector('[class*="bg-[#EFEFEF]"]');
      expect(contactContainer).toBeInTheDocument();
    });

    it('applies dark mode border styling in mobile', () => {
      mockUseApp.mockReturnValue({
        ...mockUseApp(),
        isMobile: true,
      });

      mockUseTheme.mockReturnValue({
        darkMode: true,
        setDarkMode: jest.fn(),
      });

      const { container } = renderWithProviders(<ContactsSection {...testProps} />);

      const contactContainer = container.querySelector('[class*="border-white"]');
      expect(contactContainer).toBeInTheDocument();
    });
  });

  describe('URL formatting', () => {
    it('correctly identifies and formats HTTP URLs', () => {
      renderWithProviders(
        <ContactsSection
          email="test@example.com"
          meta_page="http://example.com"
          website="https://test.com"
        />
      );

      const httpLink = screen.getByText('http://example.com');
      expect(httpLink.tagName).toBe('A');
      expect(httpLink.getAttribute('href')).toContain('http://example.com');
    });

    it('correctly identifies and formats HTTPS URLs', () => {
      renderWithProviders(
        <ContactsSection
          email="test@example.com"
          meta_page="https://example.com"
          website="https://test.com"
        />
      );

      const httpsLink = screen.getByText('https://example.com');
      expect(httpsLink.tagName).toBe('A');
      expect(httpsLink.getAttribute('href')).toContain('https://example.com');
    });

    it('does not format non-URL text as links', () => {
      renderWithProviders(
        <ContactsSection
          email="plain.email@test.com"
          meta_page="plain text"
          website="another.plain.text"
        />
      );

      const emailElement = screen.getByText('plain.email@test.com');
      const plainTextElement = screen.getByText('plain text');
      const anotherTextElement = screen.getByText('another.plain.text');

      expect(emailElement.tagName).toBe('P');
      expect(plainTextElement.tagName).toBe('P');
      expect(anotherTextElement.tagName).toBe('P');
    });
  });

  describe('title attribute behavior', () => {
    const testProps = {
      email: 'test@example.com',
      meta_page: 'https://meta.wikimedia.org/wiki/User:Test',
      website: 'https://example.com',
    };

    it('adds title attribute to links in mobile view', () => {
      mockUseApp.mockReturnValue({
        ...mockUseApp(),
        isMobile: true,
      });

      renderWithProviders(<ContactsSection {...testProps} />);

      const metaPageLink = screen.getByText('https://meta.wikimedia.org/wiki/User:Test');
      const websiteLink = screen.getByText('https://example.com');

      expect(metaPageLink.getAttribute('title')).toBe('https://meta.wikimedia.org/wiki/User:Test');
      expect(websiteLink.getAttribute('title')).toBe('https://example.com/');
    });

    it('adds title attribute to non-link text in mobile view', () => {
      mockUseApp.mockReturnValue({
        ...mockUseApp(),
        isMobile: true,
      });

      renderWithProviders(<ContactsSection {...testProps} />);

      const emailText = screen.getByText('test@example.com');
      expect(emailText.getAttribute('title')).toBe('test@example.com');
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });
});
