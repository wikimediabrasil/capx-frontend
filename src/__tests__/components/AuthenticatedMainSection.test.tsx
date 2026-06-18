import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import AuthenticatedMainSection from '@/app/(auth)/home/components/AuthenticatedMainSection';
import { useSession } from 'next-auth/react';
import * as stores from '@/stores';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useSnackbar } from '@/app/providers/SnackbarProvider';

jest.mock('next-auth/react', () => require('../helpers/homeTestMocks').nextAuthMock);
jest.mock('@/hooks/useProfile', () => require('../helpers/homeTestMocks').useProfileMock);
jest.mock(
  '@/hooks/useRecommendations',
  () => require('../helpers/homeTestMocks').useRecommendationsMock
);
jest.mock(
  '@/hooks/useUserCapacities',
  () => require('../helpers/homeTestMocks').useUserCapacitiesMock
);
jest.mock('@/hooks/useStatistics', () => require('../helpers/homeTestMocks').useStatisticsMock);
jest.mock('@/hooks/useTerritories', () => require('../helpers/homeTestMocks').useTerritoriesMock);
jest.mock(
  '@/hooks/useOrganizationDisplayName',
  () => require('../helpers/homeTestMocks').useOrganizationDisplayNameMock
);
jest.mock('@/hooks/useProfileImage', () => require('../helpers/homeTestMocks').useProfileImageMock);
jest.mock('@/hooks/useSavedItems', () => require('../helpers/homeTestMocks').useSavedItemsMock);
jest.mock(
  '@/app/providers/SnackbarProvider',
  () => require('../helpers/homeTestMocks').snackbarProviderMock
);
jest.mock('@tanstack/react-query', () => require('../helpers/homeTestMocks').reactQueryMock());
jest.mock('@/services/userService', () => require('../helpers/homeTestMocks').userServiceMock);
jest.mock(
  '@/services/profileService',
  () => require('../helpers/homeTestMocks').profileServiceMock
);

jest.mock('@/components/skeletons', () => ({
  RecommendationCarouselSkeleton: ({ type }: { type: string }) => (
    <div data-testid={`skeleton-${type}`}>Loading...</div>
  ),
}));

jest.mock('@/app/(auth)/home/components/SectionRecommendationsCarousel', () => ({
  __esModule: true,
  default: () => <div data-testid="section-recommendations-carousel" />,
}));

jest.mock('next/image', () => {
  const { nextImageMock } = require('../helpers/componentTestHelpers');
  return nextImageMock();
});

jest.mock('next/navigation', () => {
  const { nextNavigationMock } = require('../helpers/componentTestHelpers');
  return nextNavigationMock();
});

const defaultPageContent = {
  'body-loggedin-home-main-section-title': 'Welcome to CapX',
  'body-loggedin-home-main-section-description': 'Connect with peers',
  'body-loggedin-home-main-section-button01': 'Browse Feed',
  'body-loggedin-home-main-section-button02': 'My Profile',
  'body-loggedin-home-third-section-title': 'Get in Touch',
  'body-loggedin-home-third-section-description': 'Contact us at capx@wmnobrasil.org',
  'body-loggedin-home-third-section-button': 'Copy Email',
  'body-loggedin-home-third-section-button-success': 'Email copied!',
};

const DEFAULT_PAGE_CONTENT_OVERRIDES = {};
const DEFAULT_PROPS = {};
function renderComponent(
  pageContentOverrides = DEFAULT_PAGE_CONTENT_OVERRIDES,
  props = DEFAULT_PROPS
) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <AuthenticatedMainSection
        pageContent={{ ...defaultPageContent, ...pageContentOverrides }}
        {...props}
      />
    </QueryClientProvider>
  );
}

describe('AuthenticatedMainSection', () => {
  beforeEach(() => {
    (useSession as jest.Mock).mockReturnValue({
      data: { user: { token: 'mock-token', id: '1', name: 'Test User' } },
    });
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.useRealTimers();
  });

  describe('Desktop rendering', () => {
    it('renders without crashing', () => {
      const { container } = renderComponent();
      expect(container.firstChild).toBeInTheDocument();
    });

    it('renders main section title', () => {
      renderComponent();
      expect(screen.getByText('Welcome to CapX')).toBeInTheDocument();
    });

    it('renders Browse Feed button', () => {
      renderComponent();
      expect(screen.getByText('Browse Feed')).toBeInTheDocument();
    });

    it('renders My Profile button', () => {
      renderComponent();
      expect(screen.getByText('My Profile')).toBeInTheDocument();
    });

    it('renders carousel navigation buttons', () => {
      renderComponent();
      expect(screen.getByLabelText('Previous slide')).toBeInTheDocument();
      expect(screen.getByLabelText('Next slide')).toBeInTheDocument();
    });

    it('renders carousel dot navigation', () => {
      renderComponent();
      expect(screen.getByLabelText('Go to slide 1')).toBeInTheDocument();
      expect(screen.getByLabelText('Go to slide 2')).toBeInTheDocument();
      expect(screen.getByLabelText('Go to slide 3')).toBeInTheDocument();
      expect(screen.getByLabelText('Go to slide 4')).toBeInTheDocument();
    });
  });

  describe('Mobile rendering', () => {
    it('renders mobile layout', () => {
      (stores.useIsMobile as jest.Mock).mockReturnValue(true);
      renderComponent();
      expect(screen.getByText('Welcome to CapX')).toBeInTheDocument();
    });
  });

  describe('Dark mode', () => {
    it('applies dark mode classes', () => {
      (stores.useDarkMode as jest.Mock).mockReturnValue(true);
      const { container } = renderComponent();
      const darkBg = container.querySelector('.bg-capx-dark-box-bg');
      expect(darkBg).toBeInTheDocument();
    });
  });

  describe('Slide navigation', () => {
    it('navigates to next slide when next button clicked', () => {
      renderComponent();
      const firstDot = screen.getByLabelText('Go to slide 1');
      expect(firstDot).toHaveClass('bg-[#851970]');

      const nextBtn = screen.getByLabelText('Next slide');
      fireEvent.click(nextBtn);

      const secondDot = screen.getByLabelText('Go to slide 2');
      expect(secondDot).toHaveClass('bg-[#851970]');
    });

    it('navigates to previous slide when prev button clicked', () => {
      renderComponent();

      // go to slide 2 first
      fireEvent.click(screen.getByLabelText('Next slide'));
      // now go back
      fireEvent.click(screen.getByLabelText('Previous slide'));

      const firstDot = screen.getByLabelText('Go to slide 1');
      expect(firstDot).toHaveClass('bg-[#851970]');
    });

    it('navigates to specific slide when dot clicked', () => {
      renderComponent();

      fireEvent.click(screen.getByLabelText('Go to slide 3'));

      const thirdDot = screen.getByLabelText('Go to slide 3');
      expect(thirdDot).toHaveClass('bg-[#851970]');
    });

    it('wraps around to last slide when prev is clicked from slide 1', () => {
      renderComponent();

      fireEvent.click(screen.getByLabelText('Previous slide'));

      const lastDot = screen.getByLabelText('Go to slide 4');
      expect(lastDot).toHaveClass('bg-[#851970]');
    });

    it('wraps around to first slide when next is clicked from last slide', () => {
      renderComponent();

      // Go to last slide (slide 4)
      fireEvent.click(screen.getByLabelText('Go to slide 4'));
      fireEvent.click(screen.getByLabelText('Next slide'));

      const firstDot = screen.getByLabelText('Go to slide 1');
      expect(firstDot).toHaveClass('bg-[#851970]');
    });

    it('auto-advances slides after interval', async () => {
      renderComponent({ slideInterval: 100 });

      const firstDot = screen.getByLabelText('Go to slide 1');
      expect(firstDot).toHaveClass('bg-[#851970]');

      jest.advanceTimersByTime(5000);

      await waitFor(() => {
        const secondDot = screen.getByLabelText('Go to slide 2');
        expect(secondDot).toHaveClass('bg-[#851970]');
      });
    });
  });

  describe('Router navigation', () => {
    it.each([
      ['Browse Feed', '/feed'],
      ['My Profile', '/profile'],
    ])('navigates to %s route when clicked', (buttonText, route) => {
      const { useRouter } = require('next/navigation');
      const mockPush = jest.fn();
      (useRouter as jest.Mock).mockReturnValue({ push: mockPush });

      renderComponent();
      fireEvent.click(screen.getByText(buttonText));
      expect(mockPush).toHaveBeenCalledWith(route);
    });
  });

  describe('Third section', () => {
    it.each(['Get in Touch', 'Contact us at capx@wmnobrasil.org', 'Copy Email'])(
      'renders %s',
      text => {
        renderComponent();
        expect(screen.getByText(text)).toBeInTheDocument();
      }
    );

    it('shows snackbar after copying email', () => {
      const mockShowSnackbar = jest.fn();
      (useSnackbar as jest.Mock).mockReturnValue({ showSnackbar: mockShowSnackbar });

      Object.assign(navigator, {
        clipboard: { writeText: jest.fn().mockResolvedValue(undefined) },
      });

      renderComponent();
      fireEvent.click(screen.getByText('Copy Email'));
      expect(mockShowSnackbar).toHaveBeenCalledWith('Email copied!', 'success');
    });
  });
});
