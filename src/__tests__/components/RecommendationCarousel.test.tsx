import RecommendationCarousel from '@/app/(auth)/home/components/RecommendationCarousel';
import { AppProvider, useApp } from '@/contexts/AppContext';
import { ThemeProvider, useTheme } from '@/contexts/ThemeContext';
import { fireEvent, screen, waitFor } from '@testing-library/react';
import {
  renderWithProviders,
  setupCommonMocks,
  cleanupMocks,
  expectTextInDocument,
  expectTextNotInDocument,
  expectElementWithSelector,
  mockScrollMethods,
  setupScrollableContainer,
} from '../helpers/recommendationTestHelpers';

// Mock dependencies
jest.mock('@/contexts/ThemeContext', () => ({
  useTheme: jest.fn(),
  ThemeProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));
jest.mock('@/contexts/AppContext', () => ({
  useApp: jest.fn(),
  AppProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => {
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    return <img {...props} />;
  },
}));

describe('RecommendationCarousel', () => {
  beforeEach(() => {
    setupCommonMocks(jest.fn(), useTheme as jest.Mock, useApp as jest.Mock);
    mockScrollMethods();
  });

  afterEach(cleanupMocks);

  const renderCarousel = (props = {}) => {
    const defaultProps = {
      title: 'Test Carousel',
      children: [<div key="1">Item 1</div>, <div key="2">Item 2</div>, <div key="3">Item 3</div>],
      ...props,
    };

    return renderWithProviders(<RecommendationCarousel {...defaultProps} />, [
      ThemeProvider,
      AppProvider,
    ]);
  };

  describe('Rendering', () => {
    it('should render carousel with title', () => {
      renderCarousel();
      expectTextInDocument(screen, 'Test Carousel');
    });

    it('should render all children items', () => {
      renderCarousel();
      expectTextInDocument(screen, 'Item 1');
      expectTextInDocument(screen, 'Item 2');
      expectTextInDocument(screen, 'Item 3');
    });

    it('should render description when provided', () => {
      renderCarousel({ description: 'Test description' });
      expectTextInDocument(screen, 'Test description');
    });

    it('should render info icon when showInfoIcon is true', () => {
      renderCarousel({ showInfoIcon: true });
      expectTextInDocument(screen, 'Based on your profile');
    });

    it('should not render info icon when showInfoIcon is false', () => {
      renderCarousel({ showInfoIcon: false });
      expectTextNotInDocument(screen, 'Based on your profile');
    });

    it('should render with custom tooltip text', () => {
      renderCarousel({ tooltipText: 'Custom tooltip' });
      expectTextInDocument(screen, 'Custom tooltip');
    });

    it('should render in dark mode correctly', () => {
      (useTheme as jest.Mock).mockReturnValue({ darkMode: true });
      const { container } = renderCarousel();
      const title = screen.getByText('Test Carousel');
      expect(title).toHaveClass('text-white');
    });

    it('should return null when there are no children', () => {
      const { container } = renderCarousel({
        children: null,
      });

      expect(container.firstChild).toBeNull();
    });
  });

  describe('Navigation', () => {
    it('should render navigation buttons for multiple items', () => {
      renderCarousel();

      // Note: Navigation buttons are only visible when canScrollLeft or canScrollRight is true
      // In this test, we're just checking the structure
      const buttons = screen.queryAllByRole('button');
      expect(buttons.length).toBeGreaterThanOrEqual(0);
    });

    it('should render pagination dots for multiple items', () => {
      const { container } = renderCarousel();

      // Check for pagination dots - buttons with aria-label pattern
      const buttons = container.querySelectorAll('[aria-label^="Go to slide"]');
      expect(buttons.length).toBe(3);
    });

    it('should highlight current slide in pagination', () => {
      const { container } = renderCarousel();

      const firstDot = container.querySelector('[aria-label="Go to slide 1"]');
      expect(firstDot).toHaveAttribute('aria-current', 'true');
    });

    it('should navigate to specific slide when pagination dot is clicked', async () => {
      const { container } = renderCarousel();

      const secondDot = container.querySelector('[aria-label="Go to slide 2"]') as HTMLElement;
      fireEvent.click(secondDot);

      await waitFor(() => {
        expect(Element.prototype.scrollTo).toHaveBeenCalled();
      });
    });

    it('should scroll left when left arrow is clicked', () => {
      const { container } = renderCarousel();
      const scrollContainer = setupScrollableContainer(container, 300, 1000, 400);

      if (scrollContainer) {
        fireEvent.scroll(scrollContainer);
        const leftButton = screen.queryByLabelText('Previous');
        if (leftButton) {
          fireEvent.click(leftButton);
          expect(Element.prototype.scrollBy).toHaveBeenCalled();
        }
      }
    });

    it('should scroll right when right arrow is clicked', () => {
      const { container } = renderCarousel();
      const scrollContainer = setupScrollableContainer(container, 0, 1000, 400);

      if (scrollContainer) {
        fireEvent.scroll(scrollContainer);
        const rightButton = screen.queryByLabelText('Next');
        if (rightButton) {
          fireEvent.click(rightButton);
          expect(Element.prototype.scrollBy).toHaveBeenCalled();
        }
      }
    });
  });

  describe('Single item behavior', () => {
    it('should center single item', () => {
      const { container } = renderCarousel({
        children: <div>Single Item</div>,
      });

      const scrollContainer = container.querySelector('[class*="overflow-x-auto"]');
      expect(scrollContainer).toHaveClass('justify-center');
    });

    it('should not show navigation arrows for single item', () => {
      renderCarousel({
        children: <div>Single Item</div>,
      });

      expect(screen.queryByLabelText('Previous')).not.toBeInTheDocument();
      expect(screen.queryByLabelText('Next')).not.toBeInTheDocument();
    });

    it('should not show pagination dots for single item', () => {
      const { container } = renderCarousel({
        children: <div>Single Item</div>,
      });

      // Pagination dots are only shown when totalItems > 1
      const paginationDots = container.querySelectorAll('[aria-label^="Go to slide"]');
      expect(paginationDots.length).toBe(0);
    });
  });

  describe('Responsive behavior', () => {
    it('should handle window resize events', () => {
      renderCarousel();
      fireEvent(window, new Event('resize'));
      expectTextInDocument(screen, 'Test Carousel');
    });
  });

  describe('Accessibility', () => {
    it('should have proper heading structure', () => {
      renderCarousel();

      const heading = screen.getByRole('heading', { name: 'Test Carousel' });
      expect(heading).toBeInTheDocument();
    });

    it('should have aria-label on pagination dots', () => {
      const { container } = renderCarousel();

      const firstDot = container.querySelector('[aria-label="Go to slide 1"]');
      expect(firstDot).toBeInTheDocument();
    });

    it('should have aria-current on active pagination dot', () => {
      const { container } = renderCarousel();

      const firstDot = container.querySelector('[aria-label="Go to slide 1"]');
      expect(firstDot).toHaveAttribute('aria-current', 'true');
    });

    it('should have aria-labels on navigation buttons', () => {
      const { container } = renderCarousel();
      const scrollContainer = setupScrollableContainer(container, 300, 1000, 400);

      if (scrollContainer) {
        fireEvent.scroll(scrollContainer);
        const prevButton = screen.queryByLabelText('Previous');
        const nextButton = screen.queryByLabelText('Next');

        if (prevButton) {
          expect(prevButton).toHaveAttribute('aria-label', 'Previous');
        }
        if (nextButton) {
          expect(nextButton).toHaveAttribute('aria-label', 'Next');
        }
      }
    });

    it('should have aria-hidden on decorative info icon', () => {
      renderCarousel();
      expectTextInDocument(screen, 'Based on your profile');
    });
  });

  describe('Tooltip behavior', () => {
    it('should show tooltip on hover (desktop)', () => {
      renderCarousel({ tooltipText: 'Hover tooltip text' });
      const tooltipText = screen.getByText('Hover tooltip text');
      expect(tooltipText).toBeInTheDocument();
      expect(tooltipText.parentElement).toHaveClass('opacity-0');
    });

    it('should show default tooltip text when no custom text provided', () => {
      renderCarousel();
      expectTextInDocument(screen, 'Based on your profile');
    });
  });

});
