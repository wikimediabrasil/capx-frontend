import React from 'react';
import { render, screen } from '@testing-library/react';
import SectionNoRecommendations from '@/app/(auth)/home/components/SectionNoRecommendations';
import * as stores from '@/stores';

jest.mock('@/stores', () => {
  const { createStoresMock } = require('../helpers/componentTestHelpers');
  const { noRecommendationsPageContent } = require('../helpers/recommendationTestHelpers');
  return createStoresMock({ pageContent: noRecommendationsPageContent });
});

jest.mock('next/navigation', () => {
  const { nextNavigationMock } = require('../helpers/componentTestHelpers');
  return nextNavigationMock();
});

jest.mock('next/image', () => {
  const { nextImageMock } = require('../helpers/componentTestHelpers');
  return nextImageMock();
});

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
