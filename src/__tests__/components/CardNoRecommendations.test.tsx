import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import CardNoRecommendations from '@/app/(auth)/home/components/CardNoRecommendations';
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

describe('CardNoRecommendations', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing', () => {
    const { container } = render(<CardNoRecommendations alt="No capacities" />);
    expect(container.firstChild).toBeInTheDocument();
  });

  it('renders page content title', () => {
    render(<CardNoRecommendations alt="No capacities" />);
    expect(screen.getByText('No capacities found')).toBeInTheDocument();
  });

  it('renders page content description', () => {
    render(<CardNoRecommendations alt="No capacities" />);
    expect(screen.getByText('Add capacities to your profile')).toBeInTheDocument();
  });

  it('renders the edit profile button', () => {
    render(<CardNoRecommendations alt="No capacities" />);
    expect(screen.getByText('Edit Profile')).toBeInTheDocument();
  });

  it('renders image with correct alt text', () => {
    render(<CardNoRecommendations alt="contacts product image" />);
    expect(screen.getByAltText('contacts product image')).toBeInTheDocument();
  });

  it('navigates to profile edit on button click', () => {
    const { useRouter } = require('next/navigation');
    const mockPush = jest.fn();
    (useRouter as jest.Mock).mockReturnValue({ push: mockPush });

    render(<CardNoRecommendations alt="No capacities" />);
    fireEvent.click(screen.getByText('Edit Profile'));
    expect(mockPush).toHaveBeenCalledWith('/profile/edit');
  });

  it('renders with empty alt text by default', () => {
    render(<CardNoRecommendations alt="" />);
    const img = screen.getByAltText('');
    expect(img).toBeInTheDocument();
  });

  it('renders content from page content store', () => {
    (stores.usePageContent as jest.Mock).mockReturnValue({
      'home-carousel-suggestions-title-no-capacities': 'Custom title',
      'home-carousel-suggestions-description-no-capacities': 'Custom description',
      'home-carousel-suggestions-description-no-capacities-button': 'Custom button',
    });

    render(<CardNoRecommendations alt="test" />);
    expect(screen.getByText('Custom title')).toBeInTheDocument();
    expect(screen.getByText('Custom description')).toBeInTheDocument();
    expect(screen.getByText('Custom button')).toBeInTheDocument();
  });
});
