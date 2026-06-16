import React from 'react';
import { render, screen } from '@testing-library/react';
import SectionNoRecommendations from '@/app/(auth)/home/components/SectionNoRecommendations';
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
    'home-carousel-suggestions-title-no-capacities': 'No capacities found',
    'home-carousel-suggestions-description-no-capacities': 'Add capacities to your profile',
    'home-carousel-suggestions-description-no-capacities-button': 'Edit Profile',
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

describe('SectionNoRecommendations', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing', () => {
    const { container } = render(<SectionNoRecommendations />);
    expect(container.firstChild).toBeInTheDocument();
  });

  it('renders no-capacities card content', () => {
    render(<SectionNoRecommendations />);
    expect(screen.getByText('No capacities found')).toBeInTheDocument();
  });

  it('renders desktop layout when not on mobile', () => {
    (stores.useIsMobile as jest.Mock).mockReturnValue(false);
    const { container } = render(<SectionNoRecommendations />);
    const section = container.querySelector('section');
    expect(section).toBeInTheDocument();
    // Desktop section has bg-transparent class
    expect(section).toHaveClass('bg-transparent');
  });

  it('renders mobile layout when on mobile', () => {
    (stores.useIsMobile as jest.Mock).mockReturnValue(true);
    const { container } = render(<SectionNoRecommendations />);
    const section = container.querySelector('section');
    expect(section).toBeInTheDocument();
  });

  it('applies dark mode style on mobile', () => {
    (stores.useIsMobile as jest.Mock).mockReturnValue(true);
    (stores.useDarkMode as jest.Mock).mockReturnValue(true);
    const { container } = render(<SectionNoRecommendations />);
    const section = container.querySelector('section');
    expect(section).toHaveClass('bg-capx-dark-bg');
  });

  it('applies light mode style on mobile', () => {
    (stores.useIsMobile as jest.Mock).mockReturnValue(true);
    (stores.useDarkMode as jest.Mock).mockReturnValue(false);
    const { container } = render(<SectionNoRecommendations />);
    const section = container.querySelector('section');
    expect(section).toHaveClass('bg-[#F6F6F6]');
  });
});
