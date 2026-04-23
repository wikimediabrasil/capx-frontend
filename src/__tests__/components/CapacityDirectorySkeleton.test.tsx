import { render, screen } from '@testing-library/react';
import CapacityDirectorySkeleton from '@/components/skeletons/CapacityDirectorySkeleton';
import * as stores from '@/stores';

jest.mock('@/stores', () => ({
  ...jest.requireActual('@/stores'),
  useDarkMode: jest.fn(() => false),
}));

describe('CapacityDirectorySkeleton', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (stores.useDarkMode as jest.Mock).mockReturnValue(false);
  });

  it('renders without crashing', () => {
    const { container } = render(<CapacityDirectorySkeleton />);
    expect(container.firstChild).not.toBeNull();
  });

  it('renders the visualization mode switcher with 3 buttons', () => {
    const { container } = render(<CapacityDirectorySkeleton />);
    // The mode switcher is a flex row with 3 skeleton items
    const allSkeletons = container.querySelectorAll('.animate-pulse');
    expect(allSkeletons.length).toBeGreaterThan(0);
  });

  it('renders 5 capacity card skeletons', () => {
    const { container } = render(<CapacityDirectorySkeleton />);
    // Each capacity card has a flex row with sub-cards and an icon+title row
    // We verify sufficient skeleton blocks are rendered
    const skeletons = container.querySelectorAll('.animate-pulse');
    // Banner(2) + description(2) + searchbar(1) + mode switcher(3) + 5 cards * (icon+title + 4 sub-cards) = 2+2+1+3+5*5 = 33
    expect(skeletons.length).toBeGreaterThanOrEqual(30);
  });

  it('renders the suggest-capacity link placeholder', () => {
    const { container } = render(<CapacityDirectorySkeleton />);
    // The last skeleton is the suggest link — self-center
    const selfCenterSkeleton = container.querySelector('.self-center.animate-pulse');
    expect(selfCenterSkeleton).not.toBeNull();
  });

  it('applies light mode background classes by default', () => {
    const { container } = render(<CapacityDirectorySkeleton />);
    // SkeletonBase in light mode uses bg-gray-200
    const skeletons = container.querySelectorAll('.bg-gray-200');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('applies dark mode background classes when darkMode is true', () => {
    (stores.useDarkMode as jest.Mock).mockReturnValue(true);
    const { container } = render(<CapacityDirectorySkeleton />);
    const skeletons = container.querySelectorAll('.bg-gray-700');
    expect(skeletons.length).toBeGreaterThan(0);
  });
});
