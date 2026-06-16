import React from 'react';
import { screen, waitFor } from '@testing-library/react';
import { renderWithProviders, cleanupMocks } from '../helpers/recommendationTestHelpers';
import AnalyticsCallToActionSection from '@/app/(auth)/home/components/AnalyticsCallToActionSection';
import { useSession } from 'next-auth/react';
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
  usePageContent: jest.fn(() => ({
    'home-analytics-cta-button': 'View Statistics',
    'home-analytics-cta-text': '{count}+ languages are spoken on CapX.',
    'home-analytics-cta-total-users': "CapX's network has {count} users today.",
    'home-analytics-cta-total-organizations': '{count} organizations are active on CapX today.',
    'home-analytics-cta-total-capacities':
      'There are {count} capacities for you to choose from on CapX.',
    'home-analytics-cta-total-messages': 'The CapX community has exchanged {count} messages.',
    'home-analytics-cta-territories': '{territoryname} is represented by {count} users on CapX.',
  })),
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

jest.mock('next-auth/react', () => ({
  useSession: jest.fn(),
}));

jest.mock('@/hooks/useStatistics', () => ({
  useStatistics: jest.fn(),
}));

jest.mock('@/hooks/useTerritories', () => ({
  useTerritories: jest.fn(),
}));

// AnalyticsCallToActionSection imports AnalyticsCallToActionSkeleton from AuthenticatedMainSection.
// Mock AuthenticatedMainSection to avoid pulling in its deep dependency tree.
jest.mock('@/app/(auth)/home/components/AuthenticatedMainSection', () => ({
  __esModule: true,
  default: () => <div data-testid="authenticated-main-section" />,
  AnalyticsCallToActionSkeleton: ({ isMobile }: { isMobile?: boolean }) => (
    <div data-testid="analytics-skeleton" className="animate-pulse" />
  ),
}));

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
  })),
  usePathname: jest.fn(() => '/'),
  useSearchParams: jest.fn(() => new URLSearchParams()),
}));

jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => {
    const { fill, priority, quality, placeholder, blurDataURL, ...imgProps } = props;
    // eslint-disable-next-line jsx-a11y/alt-text
    return <img {...imgProps} />;
  },
}));

const { useStatistics } = require('@/hooks/useStatistics');
const { useTerritories } = require('@/hooks/useTerritories');

const mockStatisticsData = {
  total_users: 500,
  total_organizations: 30,
  total_capacities: 200,
  total_messages: 1000,
  language_user_counts: { en: 100, fr: 50 },
  territory_user_counts: {},
};

describe('AnalyticsCallToActionSection', () => {
  beforeEach(() => {
    (useSession as jest.Mock).mockReturnValue({
      data: { user: { token: 'mock-token', id: '1' } },
    });
    (useStatistics as jest.Mock).mockReturnValue({
      data: mockStatisticsData,
      isLoading: false,
    });
    (useTerritories as jest.Mock).mockReturnValue({
      territoriesMap: {},
      loading: false,
    });
  });

  afterEach(cleanupMocks);

  it('renders without crashing when statistics are available', async () => {
    const { container } = renderWithProviders(<AnalyticsCallToActionSection />);
    await waitFor(() => {
      expect(container.firstChild).toBeInTheDocument();
    });
  });

  it('renders View Statistics button', async () => {
    renderWithProviders(<AnalyticsCallToActionSection />);
    await waitFor(() => {
      expect(screen.getByText('View Statistics')).toBeInTheDocument();
    });
  });

  it('renders statistic text with count substitution', async () => {
    renderWithProviders(<AnalyticsCallToActionSection />);
    await waitFor(() => {
      // language count: 2 languages with users (en=100, fr=50)
      expect(screen.getByText('2+ languages are spoken on CapX.')).toBeInTheDocument();
    });
  });

  it('shows skeleton while loading statistics', () => {
    (useStatistics as jest.Mock).mockReturnValue({ data: null, isLoading: true });
    (useTerritories as jest.Mock).mockReturnValue({ territoriesMap: {}, loading: false });

    const { container } = renderWithProviders(<AnalyticsCallToActionSection />);
    // Skeleton uses animate-pulse
    expect(container.querySelector('.animate-pulse')).toBeInTheDocument();
  });

  it('shows skeleton while loading territories', () => {
    (useStatistics as jest.Mock).mockReturnValue({
      data: mockStatisticsData,
      isLoading: false,
    });
    (useTerritories as jest.Mock).mockReturnValue({ territoriesMap: {}, loading: true });

    const { container } = renderWithProviders(<AnalyticsCallToActionSection />);
    expect(container.querySelector('.animate-pulse')).toBeInTheDocument();
  });

  it('returns null when there are no statistics with values > 0', () => {
    (useStatistics as jest.Mock).mockReturnValue({
      data: {
        total_users: 0,
        total_organizations: 0,
        total_capacities: 0,
        total_messages: 0,
        language_user_counts: {},
        territory_user_counts: {},
      },
      isLoading: false,
    });

    const { container } = renderWithProviders(<AnalyticsCallToActionSection />);
    expect(container.firstChild).toBeNull();
  });

  it('navigates to analytics dashboard on button click', async () => {
    const { useRouter } = require('next/navigation');
    const mockPush = jest.fn();
    (useRouter as jest.Mock).mockReturnValue({ push: mockPush });

    renderWithProviders(<AnalyticsCallToActionSection />);

    await waitFor(() => {
      expect(screen.getByText('View Statistics')).toBeInTheDocument();
    });

    screen.getByText('View Statistics').click();
    expect(mockPush).toHaveBeenCalledWith('/data_analytics_dashboard');
  });

  it('renders mobile layout on mobile devices', async () => {
    (stores.useIsMobile as jest.Mock).mockReturnValue(true);

    renderWithProviders(<AnalyticsCallToActionSection />);

    await waitFor(() => {
      expect(screen.getByText('View Statistics')).toBeInTheDocument();
    });
  });

  it('renders territory stats when territories have users', async () => {
    (useStatistics as jest.Mock).mockReturnValue({
      data: {
        ...mockStatisticsData,
        territory_user_counts: { '18': 75 },
      },
      isLoading: false,
    });
    (useTerritories as jest.Mock).mockReturnValue({
      territoriesMap: { '18': 'North America' },
      loading: false,
    });

    renderWithProviders(<AnalyticsCallToActionSection />);

    await waitFor(() => {
      expect(screen.getByText('View Statistics')).toBeInTheDocument();
    });
  });

  it('renders in dark mode', async () => {
    (stores.useDarkMode as jest.Mock).mockReturnValue(true);
    (stores.useIsMobile as jest.Mock).mockReturnValue(true);

    renderWithProviders(<AnalyticsCallToActionSection />);

    await waitFor(() => {
      expect(screen.getByText('View Statistics')).toBeInTheDocument();
    });
  });

  it('returns null when statistics data is not available', () => {
    (useStatistics as jest.Mock).mockReturnValue({ data: null, isLoading: false });

    const { container } = renderWithProviders(<AnalyticsCallToActionSection />);
    expect(container.firstChild).toBeNull();
  });
});
