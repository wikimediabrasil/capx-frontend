import { render } from '@testing-library/react';
import MentorshipPageSkeleton from '@/components/skeletons/MentorshipPageSkeleton';
import * as stores from '@/stores';

jest.mock('@/stores', () => ({
  ...jest.requireActual('@/stores'),
  useDarkMode: jest.fn(() => false),
}));

describe('MentorshipPageSkeleton', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (stores.useDarkMode as jest.Mock).mockReturnValue(false);
  });

  it('renders without crashing', () => {
    const { container } = render(<MentorshipPageSkeleton />);
    expect(container.firstChild).not.toBeNull();
  });

  it('renders a section as root element', () => {
    const { container } = render(<MentorshipPageSkeleton />);
    expect(container.querySelector('section')).not.toBeNull();
  });

  it('renders the banner area', () => {
    const { container } = render(<MentorshipPageSkeleton />);
    // Banner row: icon skeleton + title skeleton
    const bannerRow = container.querySelector('.flex.flex-row.items-center.gap-4');
    expect(bannerRow).not.toBeNull();
    const skeletons = bannerRow!.querySelectorAll('.animate-pulse');
    expect(skeletons.length).toBe(2);
  });

  it('renders 6 mentorship program card skeletons', () => {
    const { container } = render(<MentorshipPageSkeleton />);
    const grid = container.querySelector('.grid');
    expect(grid).not.toBeNull();
    expect(grid!.children.length).toBe(6);
  });

  it('renders the programs grid with correct column classes', () => {
    const { container } = render(<MentorshipPageSkeleton />);
    const grid = container.querySelector('.grid');
    expect(grid).toHaveClass('grid-cols-1');
    expect(grid).toHaveClass('md:grid-cols-2');
    expect(grid).toHaveClass('lg:grid-cols-3');
  });

  it('applies light mode bg to programs section in light mode', () => {
    const { container } = render(<MentorshipPageSkeleton />);
    const section = container.querySelector('.bg-\\[\\#F6F6F6\\]');
    expect(section).not.toBeNull();
  });

  it('applies dark mode bg to programs section when darkMode is true', () => {
    (stores.useDarkMode as jest.Mock).mockReturnValue(true);
    const { container } = render(<MentorshipPageSkeleton />);
    const section = container.querySelector('.bg-capx-dark-bg');
    expect(section).not.toBeNull();
  });
});
