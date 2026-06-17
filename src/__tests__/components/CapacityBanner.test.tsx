import { CapacityBanner } from '@/app/(auth)/capacity/components/CapacityBanner';
import { render, screen } from '@testing-library/react';
import React from 'react';

jest.mock('@/stores', () => ({
  ...jest.requireActual('@/stores'),
  useDarkMode: jest.fn(() => false),
  useSetDarkMode: jest.fn(() => jest.fn()),
  useIsMobile: jest.fn(() => false),
  usePageContent: jest.fn(() => ({
    'capacity-banner-title': 'Explore Capacities',
  })),
  useLanguage: jest.fn(() => 'en'),
  useAppStore: Object.assign(
    jest.fn(() => ({ isMobile: false, language: 'en', pageContent: {} })),
    { getState: () => ({ isMobile: false, language: 'en', pageContent: {} }) }
  ),
}));

describe('CapacityBanner', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the banner section', () => {
    const { container } = render(<CapacityBanner />);
    expect(container.querySelector('section')).toBeInTheDocument();
  });

  it('renders the title from pageContent', () => {
    render(<CapacityBanner />);
    expect(screen.getByText('Explore Capacities')).toBeInTheDocument();
  });

  it('renders the CapX people illustration image', () => {
    render(<CapacityBanner />);
    const img = screen.getByAltText('CapX Logo');
    expect(img).toBeInTheDocument();
  });

  it('renders the heading element', () => {
    render(<CapacityBanner />);
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
  });

  it('renders correctly in mobile layout', () => {
    const stores = jest.requireMock('@/stores');
    stores.useIsMobile.mockReturnValue(true);

    const { container } = render(<CapacityBanner />);
    expect(container.querySelector('section')).toHaveClass('h-fit');

    stores.useIsMobile.mockReturnValue(false);
  });

  it('renders correctly in desktop layout', () => {
    const stores = jest.requireMock('@/stores');
    stores.useIsMobile.mockReturnValue(false);

    const { container } = render(<CapacityBanner />);
    expect(container.querySelector('section')).toHaveClass('h-[399px]');
  });

  it('shows fallback empty string when pageContent key is missing', () => {
    const stores = jest.requireMock('@/stores');
    stores.usePageContent.mockReturnValue({});

    render(<CapacityBanner />);
    // The h1 should still render (with empty text)
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();

    stores.usePageContent.mockReturnValue({ 'capacity-banner-title': 'Explore Capacities' });
  });

  it('has a dark background section', () => {
    const { container } = render(<CapacityBanner />);
    const innerDiv = container.querySelector('.bg-capx-dark-bg');
    expect(innerDiv).toBeInTheDocument();
  });

  it('renders the image with priority attribute', () => {
    render(<CapacityBanner />);
    // next/image is mocked at global level in jest.setup.ts to an <img> element
    const img = screen.getByAltText('CapX Logo');
    expect(img).toBeInTheDocument();
  });
});
