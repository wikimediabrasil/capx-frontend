import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import CardNoRecommendations from '@/app/(auth)/home/components/CardNoRecommendations';
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
