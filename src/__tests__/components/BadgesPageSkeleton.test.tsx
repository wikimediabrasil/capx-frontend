import { render } from '@testing-library/react';
import BadgesPageSkeleton from '@/components/skeletons/BadgesPageSkeleton';
import * as stores from '@/stores';

jest.mock('@/stores', () => ({
  ...jest.requireActual('@/stores'),
  useDarkMode: jest.fn(() => false),
}));

describe('BadgesPageSkeleton', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (stores.useDarkMode as jest.Mock).mockReturnValue(false);
  });

  it('renders without crashing', () => {
    const { container } = render(<BadgesPageSkeleton />);
    expect(container.firstChild).not.toBeNull();
  });

  it('renders as a main element', () => {
    const { container } = render(<BadgesPageSkeleton />);
    expect(container.querySelector('main')).not.toBeNull();
  });

  it('renders 8 badge card skeletons', () => {
    const { container } = render(<BadgesPageSkeleton />);
    // The grid contains 8 badge cards; each has at least 5 skeletons (image, name, 2x desc, progress)
    const grid = container.querySelector('.grid');
    expect(grid).not.toBeNull();
    const gridChildren = grid!.children;
    expect(gridChildren.length).toBe(8);
  });

  it('renders the avatar section', () => {
    const { container } = render(<BadgesPageSkeleton />);
    // Avatar skeleton is mx-auto inside a bg-gray-100 div
    const avatarSection = container.querySelector('.bg-gray-100, .bg-gray-700');
    expect(avatarSection).not.toBeNull();
  });

  it('renders back button skeleton at full width', () => {
    const { container } = render(<BadgesPageSkeleton />);
    const backBtn = container.querySelector('.h-10.w-full.rounded-md');
    expect(backBtn).not.toBeNull();
  });

  it('applies light mode bg on main in light mode', () => {
    const { container } = render(<BadgesPageSkeleton />);
    const main = container.querySelector('main');
    expect(main).toHaveClass('bg-white');
  });

  it('applies dark mode bg on main when darkMode is true', () => {
    (stores.useDarkMode as jest.Mock).mockReturnValue(true);
    const { container } = render(<BadgesPageSkeleton />);
    const main = container.querySelector('main');
    expect(main).toHaveClass('bg-capx-dark-bg');
  });

  it('applies dark mode card bg when darkMode is true', () => {
    (stores.useDarkMode as jest.Mock).mockReturnValue(true);
    const { container } = render(<BadgesPageSkeleton />);
    const darkCards = container.querySelectorAll('.bg-capx-dark-box-bg');
    expect(darkCards.length).toBeGreaterThan(0);
  });

  it('applies light mode card bg in light mode', () => {
    const { container } = render(<BadgesPageSkeleton />);
    const lightCards = container.querySelectorAll('.bg-\\[\\#F6F6F6\\]');
    expect(lightCards.length).toBeGreaterThan(0);
  });
});
