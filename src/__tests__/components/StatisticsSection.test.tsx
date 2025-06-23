import { render, screen } from '@testing-library/react';
import StatisticsSection from '@/components/StatisticsSection';
import { Statistics } from '@/types/statistics';
import * as StatisticsHook from '@/hooks/useStatistics';
import * as ThemeContext from '@/contexts/ThemeContext';
import * as AppContext from '@/contexts/AppContext';

// Mocking the required hooks and services
jest.mock('@/hooks/useStatistics');
jest.mock('@/contexts/ThemeContext', () => ({
  ...jest.requireActual('@/contexts/ThemeContext'),
  useTheme: jest.fn(),
}));

jest.mock('@/contexts/AppContext', () => ({
  ...jest.requireActual('@/contexts/AppContext'),
  useApp: jest.fn(),
}));

describe('StatisticsSection', () => {
  // Mock data for testing
  const mockStatistics: Statistics = {
    total_users: 1250,
    new_users: 250,
    total_capacities: 432,
    new_capacities: 89,
    total_messages: 5674,
    new_messages: 782,
    total_organizations: 156,
    new_organizations: 32,
  };

  const mockTranslations = {
    'statistics-section-title': 'Platform Statistics',
    'statistics-users-title': 'Users',
    'statistics-capacities-title': 'Capacities',
    'statistics-messages-title': 'Messages',
    'statistics-organizations-title': 'Organizations',
    'statistics-new-label': 'new',
    'statistics-loading-text': 'Loading statistics...',
    'statistics-error-text': 'Error loading statistics',
    'statistics-source-text': 'Data source: CapX API',
    'navbar-link-capacities': 'View Capacities',
    'navbar-link-organizations': 'View Organizations',
  };

  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();

    // Setup default mock returns
    (StatisticsHook.useStatistics as jest.Mock).mockReturnValue({
      data: mockStatistics,
      isLoading: false,
      error: null,
    });

    (ThemeContext.useTheme as jest.Mock).mockReturnValue({
      darkMode: false,
    });

    (AppContext.useApp as jest.Mock).mockReturnValue({
      pageContent: mockTranslations,
    });
  });

  it('renders loading state correctly', () => {
    (StatisticsHook.useStatistics as jest.Mock).mockReturnValue({
      data: null,
      isLoading: true,
      error: null,
    });

    render(<StatisticsSection />);

    const loadingText = screen.getByText(mockTranslations['statistics-loading-text']);
    expect(loadingText).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveClass('animate-spin');
  });

  it('renders error state correctly', () => {
    (StatisticsHook.useStatistics as jest.Mock).mockReturnValue({
      data: null,
      isLoading: false,
      error: new Error('Test error'),
    });

    render(<StatisticsSection />);

    const errorText = screen.getByText(mockTranslations['statistics-error-text']);
    expect(errorText).toBeInTheDocument();
    expect(errorText).toHaveClass('text-red-500');
  });

  it('renders all statistics cards with correct data', () => {
    render(<StatisticsSection />);

    // Check section title
    expect(screen.getByText(mockTranslations['statistics-section-title'])).toBeInTheDocument();

    // Check card titles
    expect(screen.getByText(mockTranslations['statistics-users-title'])).toBeInTheDocument();
    expect(screen.getByText(mockTranslations['statistics-capacities-title'])).toBeInTheDocument();
    expect(screen.getByText(mockTranslations['statistics-messages-title'])).toBeInTheDocument();
    expect(
      screen.getByText(mockTranslations['statistics-organizations-title'])
    ).toBeInTheDocument();

    // Check values
    expect(screen.getByText('1250')).toBeInTheDocument(); // total users
    expect(screen.getByText('432')).toBeInTheDocument(); // total capacities
    expect(screen.getByText('5674')).toBeInTheDocument(); // total messages
    expect(screen.getByText('156')).toBeInTheDocument(); // total organizations

    // Check new values
    expect(
      screen.getByText(`+250 ${mockTranslations['statistics-new-label']}`)
    ).toBeInTheDocument();
    expect(screen.getByText(`+89 ${mockTranslations['statistics-new-label']}`)).toBeInTheDocument();
    expect(
      screen.getByText(`+782 ${mockTranslations['statistics-new-label']}`)
    ).toBeInTheDocument();
    expect(screen.getByText(`+32 ${mockTranslations['statistics-new-label']}`)).toBeInTheDocument();
  });

  it('renders the pie chart for users statistics', () => {
    render(<StatisticsSection />);

    // Check for SVG elements in the users card
    const svgElements = document.querySelectorAll('svg');
    expect(svgElements.length).toBeGreaterThanOrEqual(1);

    // Check for the percentage display
    expect(screen.getByText('+20%')).toBeInTheDocument(); // 250/1250 = 20%
  });

  it('renders navigation links correctly', () => {
    render(<StatisticsSection />);

    const capacitiesLink = screen.getByText(mockTranslations['navbar-link-capacities']);
    const organizationsLink = screen.getByText(mockTranslations['navbar-link-organizations']);

    expect(capacitiesLink).toBeInTheDocument();
    expect(capacitiesLink.tagName).toBe('A');
    expect(capacitiesLink).toHaveAttribute('href', '/capacity');

    expect(organizationsLink).toBeInTheDocument();
    expect(organizationsLink.tagName).toBe('A');
    expect(organizationsLink).toHaveAttribute('href', '/organization_list');
  });

  it('applies dark mode classes when darkMode is true', () => {
    (ThemeContext.useTheme as jest.Mock).mockReturnValue({
      darkMode: true,
    });

    const { container } = render(<StatisticsSection />);

    const section = container.querySelector('#statistics-section');
    expect(section).toHaveClass('bg-capx-dark-box-bg');

    const title = screen.getByText(mockTranslations['statistics-section-title']);
    expect(title).toHaveClass('text-capx-dark-text');

    // Check links have dark mode classes
    const links = screen.getAllByRole('link');
    links.forEach(link => {
      expect(link).toHaveClass('text-capx-dark-link');
    });
  });

  it('includes data source text', () => {
    render(<StatisticsSection />);

    const sourceText = screen.getByText(mockTranslations['statistics-source-text']);
    expect(sourceText).toBeInTheDocument();
    expect(sourceText).toHaveClass('text-capx-text-sm');
  });
});
