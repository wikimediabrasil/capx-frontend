import { render } from '@testing-library/react';
import * as stores from '@/stores';

// ---------------------------------------------------------------------------
// Store mocks
// ---------------------------------------------------------------------------
jest.mock('@/stores', () => {
  const { createStoresMock } = require('../helpers/componentTestHelpers');
  return createStoresMock();
});

// HomePageSkeleton imports AnalyticsCallToActionSkeleton from this module,
// which itself uses useDarkMode / useIsMobile — mock the whole module so we
// avoid pulling in heavy page-level dependencies.
jest.mock('@/app/(auth)/home/components/AuthenticatedMainSection', () => ({
  AnalyticsCallToActionSkeleton: () => <div data-testid="analytics-cta-skeleton" />,
}));

// ---------------------------------------------------------------------------
// Component imports (after mocks)
// ---------------------------------------------------------------------------
import SkeletonBase from '@/components/skeletons/SkeletonBase';
import AnalyticsDashboardSkeleton from '@/components/skeletons/AnalyticsDashboardSkeleton';
import BadgesPageSkeleton from '@/components/skeletons/BadgesPageSkeleton';
import CapacitiesTreeSkeleton from '@/components/skeletons/CapacitiesTreeSkeleton';
import CapacityDirectorySkeleton from '@/components/skeletons/CapacityDirectorySkeleton';
import ChildCapacitiesSkeleton from '@/components/skeletons/ChildCapacitiesSkeleton';
import DocumentCardSkeleton from '@/components/skeletons/DocumentCardSkeleton';
import EventCardSkeleton from '@/components/skeletons/EventCardSkeleton';
import EventsPageSkeleton from '@/components/skeletons/EventsPageSkeleton';
import EventsSectionSkeleton from '@/components/skeletons/EventsSectionSkeleton';
import FeedPageSkeleton from '@/components/skeletons/FeedPageSkeleton';
import HomePageSkeleton from '@/components/skeletons/HomePageSkeleton';
import MentorshipPageSkeleton from '@/components/skeletons/MentorshipPageSkeleton';
import MentorshipProgramCardSkeleton from '@/components/skeletons/MentorshipProgramCardSkeleton';
import MessageListSkeleton from '@/components/skeletons/MessageListSkeleton';
import MessagePageSkeleton from '@/components/skeletons/MessagePageSkeleton';
import OrganizationProfileSkeleton from '@/components/skeletons/OrganizationProfileSkeleton';
import ProfileCardSkeleton from '@/components/skeletons/ProfileCardSkeleton';
import ProfileEditSkeleton from '@/components/skeletons/ProfileEditSkeleton';
import ProfileHeaderSkeleton from '@/components/skeletons/ProfileHeaderSkeleton';
import ProfilePageSkeleton from '@/components/skeletons/ProfilePageSkeleton';
import ProjectCardSkeleton from '@/components/skeletons/ProjectCardSkeleton';
import RecommendationCapacityCardSkeleton from '@/components/skeletons/RecommendationCapacityCardSkeleton';
import RecommendationCarouselSkeleton from '@/components/skeletons/RecommendationCarouselSkeleton';
import RecommendationProfileCardSkeleton from '@/components/skeletons/RecommendationProfileCardSkeleton';
import ReportBugPageSkeleton from '@/components/skeletons/ReportBugPageSkeleton';
import SavedItemsSkeleton from '@/components/skeletons/SavedItemsSkeleton';
import TranslationPageSkeleton from '@/components/skeletons/TranslationPageSkeleton';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
const mockUseDarkMode = stores.useDarkMode as jest.Mock;
const mockUseIsMobile = stores.useIsMobile as jest.Mock;

beforeEach(() => {
  jest.clearAllMocks();
  mockUseDarkMode.mockReturnValue(false);
  mockUseIsMobile.mockReturnValue(false);
});

// ---------------------------------------------------------------------------
// SkeletonBase
// ---------------------------------------------------------------------------
describe('SkeletonBase', () => {
  it('renders without crashing', () => {
    const { container } = render(<SkeletonBase />);
    expect(container.firstChild).not.toBeNull();
  });

  it('always contains animate-pulse class', () => {
    const { container } = render(<SkeletonBase />);
    expect(container.firstChild).toHaveClass('animate-pulse');
  });

  it('applies additional className prop', () => {
    const { container } = render(<SkeletonBase className="h-10 w-32" />);
    expect(container.firstChild).toHaveClass('h-10', 'w-32');
  });

  it('uses light-mode color when darkMode is false', () => {
    const { container } = render(<SkeletonBase />);
    expect(container.firstChild).toHaveClass('bg-gray-200');
  });

  it('uses dark-mode color when darkMode is true', () => {
    mockUseDarkMode.mockReturnValue(true);
    const { container } = render(<SkeletonBase />);
    expect(container.firstChild).toHaveClass('bg-gray-700');
  });
});

// ---------------------------------------------------------------------------
// AnalyticsDashboardSkeleton
// ---------------------------------------------------------------------------
describe('AnalyticsDashboardSkeleton', () => {
  it('renders without crashing', () => {
    const { container } = render(<AnalyticsDashboardSkeleton />);
    expect(container.firstChild).not.toBeNull();
  });

  it('renders a section as root element', () => {
    const { container } = render(<AnalyticsDashboardSkeleton />);
    expect(container.querySelector('section')).not.toBeNull();
  });

  it('renders 3 view-mode toggle skeletons', () => {
    const { container } = render(<AnalyticsDashboardSkeleton />);
    const toggles = container.querySelectorAll('.rounded-full.h-9.w-28');
    expect(toggles.length).toBe(3);
  });

  it('renders 6 capacity card skeletons in the grid', () => {
    const { container } = render(<AnalyticsDashboardSkeleton />);
    const grid = container.querySelector('.grid');
    expect(grid).not.toBeNull();
    expect(grid!.children.length).toBe(6);
  });

  it('applies dark card bg when darkMode is true', () => {
    mockUseDarkMode.mockReturnValue(true);
    const { container } = render(<AnalyticsDashboardSkeleton />);
    const darkCards = container.querySelectorAll('.bg-gray-800');
    expect(darkCards.length).toBeGreaterThan(0);
  });

  it('applies light card bg in light mode', () => {
    const { container } = render(<AnalyticsDashboardSkeleton />);
    const lightCards = container.querySelectorAll(String.raw`.bg-\[\#EFEFEF\]`);
    expect(lightCards.length).toBeGreaterThan(0);
  });
});

// ---------------------------------------------------------------------------
// BadgesPageSkeleton
// ---------------------------------------------------------------------------
describe('BadgesPageSkeleton', () => {
  it('renders without crashing', () => {
    const { container } = render(<BadgesPageSkeleton />);
    expect(container.firstChild).not.toBeNull();
  });

  it('renders a main element as root', () => {
    const { container } = render(<BadgesPageSkeleton />);
    expect(container.querySelector('main')).not.toBeNull();
  });

  it('renders 8 badge card skeletons in the grid', () => {
    const { container } = render(<BadgesPageSkeleton />);
    const grid = container.querySelector('.grid');
    expect(grid).not.toBeNull();
    expect(grid!.children.length).toBe(8);
  });

  it('renders the avatar section', () => {
    const { container } = render(<BadgesPageSkeleton />);
    const avatarSection = container.querySelector('.bg-gray-100, .bg-gray-700');
    expect(avatarSection).not.toBeNull();
  });

  it('renders back-button skeleton at full width', () => {
    const { container } = render(<BadgesPageSkeleton />);
    expect(container.querySelector('.h-10.w-full.rounded-md')).not.toBeNull();
  });

  it('applies light mode bg in light mode', () => {
    const { container } = render(<BadgesPageSkeleton />);
    expect(container.querySelector('main')).toHaveClass('bg-white');
  });

  it('applies dark mode bg when darkMode is true', () => {
    mockUseDarkMode.mockReturnValue(true);
    const { container } = render(<BadgesPageSkeleton />);
    expect(container.querySelector('main')).toHaveClass('bg-capx-dark-bg');
  });
});

// ---------------------------------------------------------------------------
// CapacitiesTreeSkeleton
// ---------------------------------------------------------------------------
describe('CapacitiesTreeSkeleton', () => {
  it('renders without crashing', () => {
    const { container } = render(<CapacitiesTreeSkeleton />);
    expect(container.firstChild).not.toBeNull();
  });

  it('renders a title/search row', () => {
    const { container } = render(<CapacitiesTreeSkeleton />);
    // Outer flex row containing title + search skeletons
    const row = container.querySelector('.flex.flex-row.gap-4.items-center');
    expect(row).not.toBeNull();
    expect(row!.querySelectorAll('.animate-pulse').length).toBeGreaterThanOrEqual(2);
  });

  it('renders the tree visualisation area', () => {
    const { container } = render(<CapacitiesTreeSkeleton />);
    // The flex-1 relative wrapper holding the full-screen skeleton
    const treeArea = container.querySelector('.flex-1.relative');
    expect(treeArea).not.toBeNull();
  });

  it('renders 3 branch-level node groups', () => {
    const { container } = render(<CapacitiesTreeSkeleton />);
    // The three branch groups are direct children of the second flex-row inside the tree
    const branchRow = container.querySelector('.flex.flex-row.gap-16');
    expect(branchRow).not.toBeNull();
    expect(branchRow!.children.length).toBe(3);
  });
});

// ---------------------------------------------------------------------------
// CapacityDirectorySkeleton
// ---------------------------------------------------------------------------
describe('CapacityDirectorySkeleton', () => {
  it('renders without crashing', () => {
    const { container } = render(<CapacityDirectorySkeleton />);
    expect(container.firstChild).not.toBeNull();
  });

  it('renders the search bar skeleton', () => {
    const { container } = render(<CapacityDirectorySkeleton />);
    expect(container.querySelector('.h-12.w-full.rounded-lg')).not.toBeNull();
  });

  it('renders 3 visualization-mode switcher skeletons', () => {
    const { container } = render(<CapacityDirectorySkeleton />);
    const switcher = container.querySelector('.flex.flex-row.gap-2.w-full.rounded-2xl');
    expect(switcher).not.toBeNull();
    expect(switcher!.children.length).toBe(3);
  });

  it('renders 5 capacity card skeletons', () => {
    const { container } = render(<CapacityDirectorySkeleton />);
    // The capacity-cards wrapper is a flex-col with gap-10
    const cardsWrapper = container.querySelector('.flex.flex-col.gap-10');
    expect(cardsWrapper).not.toBeNull();
    expect(cardsWrapper!.children.length).toBe(5);
  });
});

// ---------------------------------------------------------------------------
// ChildCapacitiesSkeleton
// ---------------------------------------------------------------------------
describe('ChildCapacitiesSkeleton', () => {
  it('renders without crashing', () => {
    const { container } = render(<ChildCapacitiesSkeleton />);
    expect(container.firstChild).not.toBeNull();
  });

  it('renders 5 child capacity rows', () => {
    const { container } = render(<ChildCapacitiesSkeleton />);
    const rows = container.querySelectorAll('.flex.items-center.gap-3');
    expect(rows.length).toBe(5);
  });

  it('each row contains two skeleton elements', () => {
    const { container } = render(<ChildCapacitiesSkeleton />);
    const rows = container.querySelectorAll('.flex.items-center.gap-3');
    for (const row of rows) {
      expect(row.querySelectorAll('.animate-pulse').length).toBe(2);
    }
  });
});

// ---------------------------------------------------------------------------
// DocumentCardSkeleton
// ---------------------------------------------------------------------------
describe('DocumentCardSkeleton', () => {
  it('renders without crashing (default props)', () => {
    const { container } = render(<DocumentCardSkeleton />);
    expect(container.firstChild).not.toBeNull();
  });

  it('renders with isSingle=true', () => {
    const { container } = render(<DocumentCardSkeleton isSingle />);
    expect(container.firstChild).not.toBeNull();
  });

  it('applies carousel width classes when isSingle is false', () => {
    const { container } = render(<DocumentCardSkeleton isSingle={false} />);
    expect(container.firstChild).toHaveClass('w-[85vw]');
  });

  it('applies full-width classes when isSingle is true', () => {
    const { container } = render(<DocumentCardSkeleton isSingle />);
    expect(container.firstChild).toHaveClass('w-full');
  });

  it('renders light mode bg by default', () => {
    const { container } = render(<DocumentCardSkeleton />);
    expect(container.firstChild).toHaveClass('bg-[#EFEFEF]');
  });

  it('renders dark mode bg when darkMode is true', () => {
    mockUseDarkMode.mockReturnValue(true);
    const { container } = render(<DocumentCardSkeleton />);
    expect(container.firstChild).toHaveClass('bg-[#04222F]');
  });
});

// ---------------------------------------------------------------------------
// EventCardSkeleton
// ---------------------------------------------------------------------------
describe('EventCardSkeleton', () => {
  it('renders without crashing (default props)', () => {
    const { container } = render(<EventCardSkeleton />);
    expect(container.firstChild).not.toBeNull();
  });

  it('renders with isHorizontalScroll=true', () => {
    const { container } = render(<EventCardSkeleton isHorizontalScroll />);
    expect(container.firstChild).not.toBeNull();
  });

  it('renders action buttons when isHorizontalScroll is false', () => {
    const { container } = render(<EventCardSkeleton isHorizontalScroll={false} />);
    // Two action button skeletons in a flex-row my-4
    const btnRow = container.querySelector('.flex.flex-row.gap-2.my-4');
    expect(btnRow).not.toBeNull();
    expect(btnRow!.children.length).toBe(2);
  });

  it('does not render action buttons when isHorizontalScroll is true', () => {
    const { container } = render(<EventCardSkeleton isHorizontalScroll />);
    const btnRow = container.querySelector('.flex.flex-row.gap-2.my-4');
    expect(btnRow).toBeNull();
  });

  it('renders "organized by" row only when isHorizontalScroll is false', () => {
    const { container: c1 } = render(<EventCardSkeleton isHorizontalScroll={false} />);
    // The "organized by" row has a w-28 and w-32 sibling pair inside flex items-center gap-2
    const orgRows = c1.querySelectorAll('.flex.items-center.gap-2');
    expect(orgRows.length).toBeGreaterThan(0);

    const { container: c2 } = render(<EventCardSkeleton isHorizontalScroll />);
    // No "organized by" row rendered; its skeletons (h-4 w-28 sibling to h-4 w-32) won't appear
    const w32 = c2.querySelector('.w-32');
    expect(w32).toBeNull();
  });

  it('applies light bg by default', () => {
    const { container } = render(<EventCardSkeleton />);
    expect(container.firstChild).toHaveClass('bg-capx-light-box-bg');
  });

  it('applies dark bg when darkMode is true', () => {
    mockUseDarkMode.mockReturnValue(true);
    const { container } = render(<EventCardSkeleton />);
    expect(container.firstChild).toHaveClass('bg-capx-dark-box-bg');
  });
});

// ---------------------------------------------------------------------------
// EventsPageSkeleton
// ---------------------------------------------------------------------------
describe('EventsPageSkeleton', () => {
  it('renders without crashing', () => {
    const { container } = render(<EventsPageSkeleton />);
    expect(container.firstChild).not.toBeNull();
  });

  it('renders 6 event card skeletons in the grid', () => {
    const { container } = render(<EventsPageSkeleton />);
    const grid = container.querySelector('.grid');
    expect(grid).not.toBeNull();
    expect(grid!.children.length).toBe(6);
  });

  it('renders filter chip skeletons', () => {
    const { container } = render(<EventsPageSkeleton />);
    const chips = container.querySelectorAll('.rounded-full.h-8');
    expect(chips.length).toBeGreaterThanOrEqual(3);
  });
});

// ---------------------------------------------------------------------------
// EventsSectionSkeleton
// ---------------------------------------------------------------------------
describe('EventsSectionSkeleton', () => {
  it('renders without crashing', () => {
    const { container } = render(<EventsSectionSkeleton />);
    expect(container.firstChild).not.toBeNull();
  });

  it('renders 3 horizontal-scroll event card skeletons', () => {
    const { container } = render(<EventsSectionSkeleton />);
    // EventCardSkeleton with isHorizontalScroll renders without action buttons
    // Three cards means three children in the overflow row
    const row = container.querySelector('.flex.flex-row.gap-4.overflow-hidden');
    expect(row).not.toBeNull();
    expect(row!.children.length).toBe(3);
  });

  it('renders a section title skeleton', () => {
    const { container } = render(<EventsSectionSkeleton />);
    expect(container.querySelector('.h-6.w-32')).not.toBeNull();
  });
});

// ---------------------------------------------------------------------------
// FeedPageSkeleton
// ---------------------------------------------------------------------------
describe('FeedPageSkeleton', () => {
  it('renders without crashing', () => {
    const { container } = render(<FeedPageSkeleton />);
    expect(container.firstChild).not.toBeNull();
  });

  it('renders a search bar skeleton', () => {
    const { container } = render(<FeedPageSkeleton />);
    expect(container.querySelector('.h-10.w-full.rounded-lg')).not.toBeNull();
  });

  it('renders 3 profile card skeletons', () => {
    const { container } = render(<FeedPageSkeleton />);
    const cardsWrapper = container.querySelector('.flex.flex-col.gap-4');
    expect(cardsWrapper).not.toBeNull();
    expect(cardsWrapper!.children.length).toBe(3);
  });

  it('renders filter chip skeletons', () => {
    const { container } = render(<FeedPageSkeleton />);
    const chips = container.querySelectorAll('.rounded-full.h-8');
    expect(chips.length).toBeGreaterThanOrEqual(4);
  });
});

// ---------------------------------------------------------------------------
// HomePageSkeleton
// ---------------------------------------------------------------------------
describe('HomePageSkeleton', () => {
  it('renders without crashing', () => {
    const { container } = render(<HomePageSkeleton />);
    expect(container.firstChild).not.toBeNull();
  });

  it('renders the AnalyticsCallToActionSkeleton placeholder', () => {
    const { getByTestId } = render(<HomePageSkeleton />);
    expect(getByTestId('analytics-cta-skeleton')).not.toBeNull();
  });

  it('renders the welcome banner skeletons', () => {
    const { container } = render(<HomePageSkeleton />);
    // First child of root is the welcome banner flex-col
    const root = container.firstChild as HTMLElement;
    expect(root.children.length).toBeGreaterThan(0);
  });
});

// ---------------------------------------------------------------------------
// MentorshipPageSkeleton
// ---------------------------------------------------------------------------
describe('MentorshipPageSkeleton', () => {
  it('renders without crashing', () => {
    const { container } = render(<MentorshipPageSkeleton />);
    expect(container.firstChild).not.toBeNull();
  });

  it('renders a section as root element', () => {
    const { container } = render(<MentorshipPageSkeleton />);
    expect(container.querySelector('section')).not.toBeNull();
  });

  it('renders 6 mentorship program card skeletons', () => {
    const { container } = render(<MentorshipPageSkeleton />);
    const grid = container.querySelector('.grid');
    expect(grid).not.toBeNull();
    expect(grid!.children.length).toBe(6);
  });

  it('renders grid with correct responsive classes', () => {
    const { container } = render(<MentorshipPageSkeleton />);
    const grid = container.querySelector('.grid');
    expect(grid).toHaveClass('grid-cols-1', 'md:grid-cols-2', 'lg:grid-cols-3');
  });

  it('renders light mode programs section bg by default', () => {
    const { container } = render(<MentorshipPageSkeleton />);
    expect(container.querySelector(String.raw`.bg-\[\#F6F6F6\]`)).not.toBeNull();
  });

  it('renders dark mode programs section bg when darkMode is true', () => {
    mockUseDarkMode.mockReturnValue(true);
    const { container } = render(<MentorshipPageSkeleton />);
    expect(container.querySelector('.bg-capx-dark-bg')).not.toBeNull();
  });
});

// ---------------------------------------------------------------------------
// MentorshipProgramCardSkeleton
// ---------------------------------------------------------------------------
describe('MentorshipProgramCardSkeleton', () => {
  it('renders without crashing', () => {
    const { container } = render(<MentorshipProgramCardSkeleton />);
    expect(container.firstChild).not.toBeNull();
  });

  it('renders the logo skeleton', () => {
    const { container } = render(<MentorshipProgramCardSkeleton />);
    expect(container.querySelector('.w-20.h-20')).not.toBeNull();
  });

  it('renders the subscribe button skeleton', () => {
    const { container } = render(<MentorshipProgramCardSkeleton />);
    expect(container.querySelector('.h-9.flex-1.rounded-lg')).not.toBeNull();
  });

  it('applies light border in light mode', () => {
    const { container } = render(<MentorshipProgramCardSkeleton />);
    expect(container.firstChild).toHaveClass('border-gray-200');
  });

  it('applies dark bg and border when darkMode is true', () => {
    mockUseDarkMode.mockReturnValue(true);
    const { container } = render(<MentorshipProgramCardSkeleton />);
    expect(container.firstChild).toHaveClass('bg-capx-dark-box-bg', 'border-gray-700');
  });
});

// ---------------------------------------------------------------------------
// MessageListSkeleton
// ---------------------------------------------------------------------------
describe('MessageListSkeleton', () => {
  it('renders without crashing', () => {
    const { container } = render(<MessageListSkeleton />);
    expect(container.firstChild).not.toBeNull();
  });

  it('renders a section as root element', () => {
    const { container } = render(<MessageListSkeleton />);
    expect(container.querySelector('section')).not.toBeNull();
  });

  it('renders 5 message card skeletons', () => {
    const { container } = render(<MessageListSkeleton />);
    const section = container.querySelector('section');
    expect(section!.children.length).toBe(5);
  });

  it('applies light bg in light mode', () => {
    const { container } = render(<MessageListSkeleton />);
    const cards = container.querySelectorAll('.bg-white');
    expect(cards.length).toBeGreaterThan(0);
  });

  it('applies dark bg when darkMode is true', () => {
    mockUseDarkMode.mockReturnValue(true);
    const { container } = render(<MessageListSkeleton />);
    const darkCards = container.querySelectorAll('.bg-gray-800');
    expect(darkCards.length).toBeGreaterThan(0);
  });
});

// ---------------------------------------------------------------------------
// MessagePageSkeleton
// ---------------------------------------------------------------------------
describe('MessagePageSkeleton', () => {
  it('renders without crashing', () => {
    const { container } = render(<MessagePageSkeleton />);
    expect(container.firstChild).not.toBeNull();
  });

  it('renders a section as root element', () => {
    const { container } = render(<MessagePageSkeleton />);
    expect(container.querySelector('section')).not.toBeNull();
  });

  it('renders the banner area with icon and title', () => {
    const { container } = render(<MessagePageSkeleton />);
    const bannerRow = container.querySelector('.flex.flex-row.items-center.gap-4');
    expect(bannerRow).not.toBeNull();
    expect(bannerRow!.querySelectorAll('.animate-pulse').length).toBe(2);
  });

  it('renders two nav tab skeletons', () => {
    const { container } = render(<MessagePageSkeleton />);
    const tabRow = container.querySelector('.flex.flex-row.gap-20');
    expect(tabRow).not.toBeNull();
    expect(tabRow!.children.length).toBe(2);
  });

  it('renders the message body textarea skeleton', () => {
    const { container } = render(<MessagePageSkeleton />);
    expect(container.querySelector('.h-32.w-full.rounded-lg')).not.toBeNull();
  });

  it('renders the submit button skeleton', () => {
    const { container } = render(<MessagePageSkeleton />);
    expect(container.querySelector('.h-10.w-32.rounded-lg')).not.toBeNull();
  });
});

// ---------------------------------------------------------------------------
// OrganizationProfileSkeleton
// ---------------------------------------------------------------------------
describe('OrganizationProfileSkeleton', () => {
  it('renders without crashing', () => {
    const { container } = render(<OrganizationProfileSkeleton />);
    expect(container.firstChild).not.toBeNull();
  });

  it('renders a section inside the root div', () => {
    const { container } = render(<OrganizationProfileSkeleton />);
    expect(container.querySelector('section')).not.toBeNull();
  });

  it('renders the report activity banner skeleton', () => {
    const { container } = render(<OrganizationProfileSkeleton />);
    expect(container.querySelector(String.raw`.w-full.h-\[120px\]`)).not.toBeNull();
  });

  it('renders 3 project card skeletons in the projects row', () => {
    const { container } = render(<OrganizationProfileSkeleton />);
    // CardRowSkeleton uses a flex-row with 3 children of w-[350px]
    const projectCards = container.querySelectorAll(String.raw`.w-\[350px\].flex-shrink-0.flex.flex-col`);
    expect(projectCards.length).toBe(3);
  });

  it('applies light bg in light mode', () => {
    const { container } = render(<OrganizationProfileSkeleton />);
    expect(container.firstChild).toHaveClass('bg-capx-light-bg');
  });

  it('applies dark bg when darkMode is true', () => {
    mockUseDarkMode.mockReturnValue(true);
    const { container } = render(<OrganizationProfileSkeleton />);
    expect(container.firstChild).toHaveClass('bg-capx-dark-box-bg');
  });
});

// ---------------------------------------------------------------------------
// ProfileCardSkeleton
// ---------------------------------------------------------------------------
describe('ProfileCardSkeleton', () => {
  it('renders without crashing', () => {
    const { container } = render(<ProfileCardSkeleton />);
    expect(container.firstChild).not.toBeNull();
  });

  it('renders with light border in light mode', () => {
    const { container } = render(<ProfileCardSkeleton />);
    expect(container.firstChild).toHaveClass('border-gray-200');
  });

  it('renders with dark border when darkMode is true', () => {
    mockUseDarkMode.mockReturnValue(true);
    const { container } = render(<ProfileCardSkeleton />);
    expect(container.firstChild).toHaveClass('border-gray-700');
  });

  it('renders the avatar skeleton', () => {
    const { container } = render(<ProfileCardSkeleton />);
    expect(container.querySelector(String.raw`.w-\[100px\].h-\[100px\]`)).not.toBeNull();
  });
});

// ---------------------------------------------------------------------------
// ProfileEditSkeleton
// ---------------------------------------------------------------------------
describe('ProfileEditSkeleton', () => {
  it('renders without crashing', () => {
    const { container } = render(<ProfileEditSkeleton />);
    expect(container.firstChild).not.toBeNull();
  });

  it('renders the avatar skeleton', () => {
    const { container } = render(<ProfileEditSkeleton />);
    expect(container.querySelector(String.raw`.w-\[100px\].h-\[100px\]`)).not.toBeNull();
  });

  it('renders 6 capacity tag skeletons', () => {
    const { container } = render(<ProfileEditSkeleton />);
    const capacityTags = container.querySelectorAll('.h-8.w-24.rounded-full');
    expect(capacityTags.length).toBe(6);
  });

  it('renders 3 language tag skeletons', () => {
    const { container } = render(<ProfileEditSkeleton />);
    const langTags = container.querySelectorAll('.h-8.w-20.rounded-full');
    expect(langTags.length).toBe(3);
  });

  it('renders the save button skeleton', () => {
    const { container } = render(<ProfileEditSkeleton />);
    expect(container.querySelector('.h-12.w-full')).not.toBeNull();
  });
});

// ---------------------------------------------------------------------------
// ProfileHeaderSkeleton
// ---------------------------------------------------------------------------
describe('ProfileHeaderSkeleton', () => {
  it('renders desktop layout when isMobile is false', () => {
    mockUseIsMobile.mockReturnValue(false);
    const { container } = render(<ProfileHeaderSkeleton />);
    // Desktop: large avatar w-[200px]
    expect(container.querySelector(String.raw`.w-\[200px\].h-\[200px\]`)).not.toBeNull();
  });

  it('renders mobile layout when isMobile is true', () => {
    mockUseIsMobile.mockReturnValue(true);
    const { container } = render(<ProfileHeaderSkeleton />);
    // Mobile: smaller avatar w-[100px]
    expect(container.querySelector(String.raw`.w-\[100px\].h-\[100px\]`)).not.toBeNull();
  });

  it('renders 3 button skeletons in mobile layout', () => {
    mockUseIsMobile.mockReturnValue(true);
    const { container } = render(<ProfileHeaderSkeleton />);
    const btnContainer = container.querySelector('.flex.flex-col.gap-2');
    expect(btnContainer).not.toBeNull();
    expect(btnContainer!.children.length).toBe(3);
  });

  it('renders 3 button skeletons in desktop layout', () => {
    mockUseIsMobile.mockReturnValue(false);
    const { container } = render(<ProfileHeaderSkeleton />);
    const btnContainer = container.querySelector('.flex.flex-col.gap-2.w-full');
    expect(btnContainer).not.toBeNull();
    expect(btnContainer!.children.length).toBe(3);
  });
});

// ---------------------------------------------------------------------------
// ProfilePageSkeleton
// ---------------------------------------------------------------------------
describe('ProfilePageSkeleton', () => {
  it('renders without crashing', () => {
    const { container } = render(<ProfilePageSkeleton />);
    expect(container.firstChild).not.toBeNull();
  });

  it('renders the badges section with circular skeletons', () => {
    const { container } = render(<ProfilePageSkeleton />);
    const badges = container.querySelectorAll('.rounded-full.flex-shrink-0');
    expect(badges.length).toBeGreaterThanOrEqual(4);
  });

  it('renders the mini-bio skeleton lines', () => {
    const { container } = render(<ProfilePageSkeleton />);
    // Three bio lines with h-4 at the top-level of the bio div
    const bioDiv = container.querySelector('.flex.flex-col.gap-2');
    expect(bioDiv).not.toBeNull();
  });
});

// ---------------------------------------------------------------------------
// ProjectCardSkeleton
// ---------------------------------------------------------------------------
describe('ProjectCardSkeleton', () => {
  it('renders without crashing', () => {
    const { container } = render(<ProjectCardSkeleton />);
    expect(container.firstChild).not.toBeNull();
  });

  it('renders with fixed card dimensions', () => {
    const { container } = render(<ProjectCardSkeleton />);
    expect(container.firstChild).toHaveClass('w-[350px]', 'h-[400px]');
  });

  it('renders the image area skeleton', () => {
    const { container } = render(<ProjectCardSkeleton />);
    expect(container.querySelector(String.raw`.w-full.h-\[200px\]`)).not.toBeNull();
  });

  it('renders the action button skeleton', () => {
    const { container } = render(<ProjectCardSkeleton />);
    expect(container.querySelector('.h-10.w-full.rounded-lg')).not.toBeNull();
  });
});

// ---------------------------------------------------------------------------
// RecommendationCapacityCardSkeleton
// ---------------------------------------------------------------------------
describe('RecommendationCapacityCardSkeleton', () => {
  it('renders without crashing', () => {
    const { container } = render(<RecommendationCapacityCardSkeleton />);
    expect(container.firstChild).not.toBeNull();
  });

  it('renders the colored icon box skeleton', () => {
    const { container } = render(<RecommendationCapacityCardSkeleton />);
    expect(container.querySelector(String.raw`.w-\[60px\].h-\[60px\]`)).not.toBeNull();
  });

  it('renders two action button skeletons', () => {
    const { container } = render(<RecommendationCapacityCardSkeleton />);
    const btnRow = container.querySelector('.flex.items-center.gap-2.w-full.mt-auto');
    expect(btnRow).not.toBeNull();
    expect(btnRow!.children.length).toBe(2);
  });

  it('applies light bg by default', () => {
    const { container } = render(<RecommendationCapacityCardSkeleton />);
    expect(container.firstChild).toHaveClass('bg-white', 'border-gray-200');
  });

  it('applies dark bg when darkMode is true', () => {
    mockUseDarkMode.mockReturnValue(true);
    const { container } = render(<RecommendationCapacityCardSkeleton />);
    expect(container.firstChild).toHaveClass('bg-gray-800', 'border-gray-700');
  });
});

// ---------------------------------------------------------------------------
// RecommendationCarouselSkeleton
// ---------------------------------------------------------------------------
describe('RecommendationCarouselSkeleton', () => {
  it('renders without crashing with defaults', () => {
    const { container } = render(<RecommendationCarouselSkeleton />);
    expect(container.firstChild).not.toBeNull();
  });

  it('renders a section title skeleton', () => {
    const { container } = render(<RecommendationCarouselSkeleton />);
    expect(container.querySelector('.h-7')).not.toBeNull();
  });

  it('renders 3 profile cards by default (type=profile)', () => {
    const { container } = render(<RecommendationCarouselSkeleton type="profile" cardCount={3} />);
    const row = container.querySelector('.flex.flex-row.gap-4.overflow-hidden');
    expect(row).not.toBeNull();
    expect(row!.children.length).toBe(3);
  });

  it('renders capacity cards when type=capacity', () => {
    const { container } = render(<RecommendationCarouselSkeleton type="capacity" cardCount={2} />);
    const row = container.querySelector('.flex.flex-row.gap-4.overflow-hidden');
    expect(row!.children.length).toBe(2);
    // Capacity cards have min-h-[250px]
    expect(container.querySelector(String.raw`.min-h-\[250px\]`)).not.toBeNull();
  });

  it('renders event mini cards when type=event', () => {
    const { container } = render(<RecommendationCarouselSkeleton type="event" cardCount={2} />);
    const row = container.querySelector('.flex.flex-row.gap-4.overflow-hidden');
    expect(row!.children.length).toBe(2);
    // Event mini cards have min-w-[300px]
    expect(container.querySelector(String.raw`.min-w-\[300px\]`)).not.toBeNull();
  });

  it('respects the cardCount prop', () => {
    const { container } = render(<RecommendationCarouselSkeleton type="profile" cardCount={5} />);
    const row = container.querySelector('.flex.flex-row.gap-4.overflow-hidden');
    expect(row!.children.length).toBe(5);
  });
});

// ---------------------------------------------------------------------------
// RecommendationProfileCardSkeleton
// ---------------------------------------------------------------------------
describe('RecommendationProfileCardSkeleton', () => {
  it('renders without crashing', () => {
    const { container } = render(<RecommendationProfileCardSkeleton />);
    expect(container.firstChild).not.toBeNull();
  });

  it('renders the profile image skeleton', () => {
    const { container } = render(<RecommendationProfileCardSkeleton />);
    expect(container.querySelector(String.raw`.h-\[115px\]`)).not.toBeNull();
  });

  it('renders two action button skeletons', () => {
    const { container } = render(<RecommendationProfileCardSkeleton />);
    const btnRow = container.querySelector('.flex.items-center.gap-2.w-full.mt-auto');
    expect(btnRow).not.toBeNull();
    expect(btnRow!.children.length).toBe(2);
  });

  it('applies light bg by default', () => {
    const { container } = render(<RecommendationProfileCardSkeleton />);
    expect(container.firstChild).toHaveClass('bg-white', 'border-gray-200');
  });

  it('applies dark bg when darkMode is true', () => {
    mockUseDarkMode.mockReturnValue(true);
    const { container } = render(<RecommendationProfileCardSkeleton />);
    expect(container.firstChild).toHaveClass('bg-gray-800', 'border-gray-700');
  });
});

// ---------------------------------------------------------------------------
// ReportBugPageSkeleton
// ---------------------------------------------------------------------------
describe('ReportBugPageSkeleton', () => {
  it('renders without crashing', () => {
    const { container } = render(<ReportBugPageSkeleton />);
    expect(container.firstChild).not.toBeNull();
  });

  it('renders a section as root element', () => {
    const { container } = render(<ReportBugPageSkeleton />);
    expect(container.querySelector('section')).not.toBeNull();
  });

  it('renders the banner image skeleton', () => {
    const { container } = render(<ReportBugPageSkeleton />);
    expect(container.querySelector(String.raw`.w-\[140px\].h-\[140px\]`)).not.toBeNull();
  });

  it('renders two nav tab skeletons', () => {
    const { container } = render(<ReportBugPageSkeleton />);
    const tabRow = container.querySelector('.flex.flex-row.gap-4.border-b');
    expect(tabRow).not.toBeNull();
    expect(tabRow!.children.length).toBe(2);
  });

  it('renders the description textarea skeleton', () => {
    const { container } = render(<ReportBugPageSkeleton />);
    expect(container.querySelector('.h-24.w-full.rounded-md')).not.toBeNull();
  });

  it('renders the mobile button pair', () => {
    const { container } = render(<ReportBugPageSkeleton />);
    const mobileBtns = container.querySelector(String.raw`.flex.flex-col.gap-2.md\:hidden`);
    expect(mobileBtns).not.toBeNull();
    expect(mobileBtns!.children.length).toBe(2);
  });

  it('applies light banner bg by default', () => {
    const { container } = render(<ReportBugPageSkeleton />);
    const banner = container.querySelector('.bg-gray-200');
    expect(banner).not.toBeNull();
  });

  it('applies dark banner bg when darkMode is true', () => {
    mockUseDarkMode.mockReturnValue(true);
    const { container } = render(<ReportBugPageSkeleton />);
    const banner = container.querySelector('.bg-gray-800');
    expect(banner).not.toBeNull();
  });
});

// ---------------------------------------------------------------------------
// SavedItemsSkeleton
// ---------------------------------------------------------------------------
describe('SavedItemsSkeleton', () => {
  it('renders without crashing', () => {
    const { container } = render(<SavedItemsSkeleton />);
    expect(container.firstChild).not.toBeNull();
  });

  it('renders 5 saved item card skeletons', () => {
    const { container } = render(<SavedItemsSkeleton />);
    const root = container.firstChild as HTMLElement;
    expect(root.children.length).toBe(5);
  });

  it('renders card thumbnails', () => {
    const { container } = render(<SavedItemsSkeleton />);
    const thumbs = container.querySelectorAll(String.raw`.w-\[80px\].h-\[80px\]`);
    expect(thumbs.length).toBe(5);
  });

  it('each card has two action button skeletons', () => {
    const { container } = render(<SavedItemsSkeleton />);
    // Each action column has h-9 w-28 rounded-lg skeletons
    const actionBtns = container.querySelectorAll('.h-9.w-28.rounded-lg');
    expect(actionBtns.length).toBe(10); // 5 cards × 2 buttons
  });

  it('applies light border in light mode', () => {
    const { container } = render(<SavedItemsSkeleton />);
    const lightCards = container.querySelectorAll('.border-gray-200');
    expect(lightCards.length).toBeGreaterThan(0);
  });

  it('applies dark border when darkMode is true', () => {
    mockUseDarkMode.mockReturnValue(true);
    const { container } = render(<SavedItemsSkeleton />);
    const darkCards = container.querySelectorAll('.border-gray-700');
    expect(darkCards.length).toBeGreaterThan(0);
  });
});

// ---------------------------------------------------------------------------
// TranslationPageSkeleton
// ---------------------------------------------------------------------------
describe('TranslationPageSkeleton', () => {
  it('renders without crashing', () => {
    const { container } = render(<TranslationPageSkeleton />);
    expect(container.firstChild).not.toBeNull();
  });

  it('renders a section as root element', () => {
    const { container } = render(<TranslationPageSkeleton />);
    expect(container.querySelector('section')).not.toBeNull();
  });

  it('renders 5 translation row skeletons', () => {
    const { container } = render(<TranslationPageSkeleton />);
    // Each row has a two-column grid
    const grids = container.querySelectorAll('.grid.grid-cols-1');
    expect(grids.length).toBe(5);
  });

  it('renders the pagination skeletons', () => {
    const { container } = render(<TranslationPageSkeleton />);
    const pagination = container.querySelector('.flex.items-center.justify-center.gap-2');
    expect(pagination).not.toBeNull();
    expect(pagination!.children.length).toBe(5);
  });

  it('renders the info notice and OAuth status bars', () => {
    const { container } = render(<TranslationPageSkeleton />);
    const bars = container.querySelectorAll('.h-12.w-full.rounded-lg, .h-14.w-full.rounded-lg');
    expect(bars.length).toBe(2);
  });

  it('applies light bg by default', () => {
    const { container } = render(<TranslationPageSkeleton />);
    expect(container.querySelector('section')).toHaveClass('bg-capx-light-bg');
  });

  it('applies dark bg when darkMode is true', () => {
    mockUseDarkMode.mockReturnValue(true);
    const { container } = render(<TranslationPageSkeleton />);
    expect(container.querySelector('section')).toHaveClass('bg-capx-dark-box-bg');
  });
});
