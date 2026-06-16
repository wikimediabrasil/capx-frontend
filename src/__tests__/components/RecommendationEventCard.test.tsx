import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import RecommendationEventCard from '@/app/(auth)/home/components/RecommendationEventCard';
import { EventRecommendation } from '@/types/recommendation';
import { useSession } from 'next-auth/react';
import * as stores from '@/stores';

jest.mock('@/stores', () => {
  const { createStoresMock } = require('../helpers/componentTestHelpers');
  return createStoresMock({
    pageContent: {
      'view-event': 'View Event',
    },
  });
});

jest.mock('next-auth/react', () => ({
  useSession: jest.fn(),
}));

jest.mock('@/hooks/useOrganizationDisplayName', () => ({
  useOrganizationDisplayName: jest.fn(() => ({ displayName: '' })),
}));

jest.mock('next/navigation', () => {
  const { nextNavigationMock } = require('../helpers/componentTestHelpers');
  return nextNavigationMock();
});

jest.mock('next/image', () => {
  const { nextImageMock } = require('../helpers/componentTestHelpers');
  return nextImageMock();
});

const createMockEvent = (overrides: Partial<EventRecommendation> = {}): EventRecommendation => ({
  id: 1,
  name: 'Test Event',
  time_begin: '2026-07-01T10:00:00Z',
  time_end: '2026-07-01T12:00:00Z',
  type_of_location: 'virtual',
  organization_name: 'Test Org',
  language: 'English',
  ...overrides,
});

describe('RecommendationEventCard', () => {
  beforeEach(() => {
    (useSession as jest.Mock).mockReturnValue({
      data: { user: { token: 'mock-token', id: '123' } },
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing', () => {
    const { container } = render(<RecommendationEventCard recommendation={createMockEvent()} />);
    expect(container.firstChild).toBeInTheDocument();
  });

  it('renders event name', () => {
    render(<RecommendationEventCard recommendation={createMockEvent()} />);
    expect(screen.getByText('Test Event')).toBeInTheDocument();
  });

  it('renders View Event button', () => {
    render(<RecommendationEventCard recommendation={createMockEvent()} />);
    expect(screen.getByText('View Event')).toBeInTheDocument();
  });

  it('renders hint message when provided', () => {
    render(
      <RecommendationEventCard recommendation={createMockEvent()} hintMessage="Recommended event" />
    );
    expect(screen.getByText('Recommended event')).toBeInTheDocument();
  });

  it('renders organization name when provided', () => {
    const { useOrganizationDisplayName } = require('@/hooks/useOrganizationDisplayName');
    (useOrganizationDisplayName as jest.Mock).mockReturnValue({ displayName: 'Test Org' });

    render(<RecommendationEventCard recommendation={createMockEvent()} />);
    expect(screen.getByText(/Test Org/)).toBeInTheDocument();
  });

  it('renders virtual location label', () => {
    render(
      <RecommendationEventCard recommendation={createMockEvent({ type_of_location: 'virtual' })} />
    );
    expect(screen.getByText('Online event')).toBeInTheDocument();
  });

  it('renders in-person location label', () => {
    render(
      <RecommendationEventCard
        recommendation={createMockEvent({ type_of_location: 'in_person' })}
      />
    );
    expect(screen.getByText('In-person event')).toBeInTheDocument();
  });

  it('renders language information', () => {
    render(<RecommendationEventCard recommendation={createMockEvent({ language: 'English' })} />);
    expect(screen.getByText('English')).toBeInTheDocument();
  });

  it('opens external URL when View Event is clicked with url', () => {
    const windowOpenSpy = jest.spyOn(window, 'open').mockImplementation(() => null);
    render(
      <RecommendationEventCard
        recommendation={createMockEvent({ url: 'https://example.com/event' })}
      />
    );
    fireEvent.click(screen.getByText('View Event'));
    expect(windowOpenSpy).toHaveBeenCalledWith(
      'https://example.com/event',
      '_blank',
      'noopener,noreferrer'
    );
    windowOpenSpy.mockRestore();
  });

  it('navigates via router when view_event_link is set and no url', () => {
    const { useRouter } = require('next/navigation');
    const mockPush = jest.fn();
    (useRouter as jest.Mock).mockReturnValue({ push: mockPush });

    render(
      <RecommendationEventCard
        recommendation={createMockEvent({ url: undefined, view_event_link: '/events/99' })}
      />
    );
    fireEvent.click(screen.getByText('View Event'));
    expect(mockPush).toHaveBeenCalledWith('/events/99');
  });

  it('navigates to event id route when neither url nor view_event_link set', () => {
    const { useRouter } = require('next/navigation');
    const mockPush = jest.fn();
    (useRouter as jest.Mock).mockReturnValue({ push: mockPush });

    render(
      <RecommendationEventCard
        recommendation={createMockEvent({ id: 7, url: undefined, view_event_link: undefined })}
      />
    );
    fireEvent.click(screen.getByText('View Event'));
    expect(mockPush).toHaveBeenCalledWith('/events/7');
  });

  it('renders in dark mode', () => {
    (stores.useDarkMode as jest.Mock).mockReturnValue(true);
    const { container } = render(<RecommendationEventCard recommendation={createMockEvent()} />);
    const card = container.querySelector('.bg-gray-800');
    expect(card).toBeInTheDocument();
  });

  it('does not render time range when neither time_begin nor time_end provided', () => {
    render(
      <RecommendationEventCard
        recommendation={createMockEvent({ time_begin: '', time_end: undefined })}
      />
    );
    // No "(UTC)" time range text should appear
    expect(screen.queryByText(/\(UTC\)/)).not.toBeInTheDocument();
  });

  it('renders without organization name when not provided', () => {
    const { useOrganizationDisplayName } = require('@/hooks/useOrganizationDisplayName');
    (useOrganizationDisplayName as jest.Mock).mockReturnValue({ displayName: '' });

    render(
      <RecommendationEventCard
        recommendation={createMockEvent({ organization_name: undefined, organization: undefined })}
      />
    );
    expect(screen.queryByText(/by:/)).not.toBeInTheDocument();
  });
});
