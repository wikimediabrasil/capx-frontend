import { render } from '@testing-library/react';
import TranslationPageSkeleton from '@/components/skeletons/TranslationPageSkeleton';
import * as stores from '@/stores';

jest.mock('@/stores', () => ({
  ...jest.requireActual('@/stores'),
  useDarkMode: jest.fn(() => false),
}));

describe('TranslationPageSkeleton', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (stores.useDarkMode as jest.Mock).mockReturnValue(false);
  });

  it('renders without crashing', () => {
    const { container } = render(<TranslationPageSkeleton />);
    expect(container.firstChild).not.toBeNull();
  });

  it('renders a section as root element', () => {
    const { container } = render(<TranslationPageSkeleton />);
    expect(container.querySelector('section')).not.toBeNull();
  });

  it('renders the banner area with icon and title skeletons', () => {
    const { container } = render(<TranslationPageSkeleton />);
    const bannerRow = container.querySelector('.flex.flex-row.items-center.gap-4');
    expect(bannerRow).not.toBeNull();
    const skeletons = bannerRow!.querySelectorAll('.animate-pulse');
    expect(skeletons.length).toBe(2);
  });

  it('renders 5 translation row skeletons', () => {
    const { container } = render(<TranslationPageSkeleton />);
    // Each translation row has a two-column grid inside
    const twoColGrids = container.querySelectorAll('.grid-cols-1.md\\:grid-cols-2');
    expect(twoColGrids.length).toBe(5);
  });

  it('renders the controls row', () => {
    const { container } = render(<TranslationPageSkeleton />);
    const controlsRow = container.querySelector('.flex.flex-col.sm\\:flex-row.gap-4');
    expect(controlsRow).not.toBeNull();
  });

  it('renders pagination skeleton at the bottom', () => {
    const { container } = render(<TranslationPageSkeleton />);
    const paginationRow = container.querySelector('.flex.items-center.justify-center.gap-2');
    expect(paginationRow).not.toBeNull();
    const pageButtons = paginationRow!.querySelectorAll('.animate-pulse');
    expect(pageButtons.length).toBe(5);
  });

  it('applies light bg in light mode', () => {
    const { container } = render(<TranslationPageSkeleton />);
    const section = container.querySelector('section');
    expect(section).toHaveClass('bg-capx-light-bg');
  });

  it('applies dark bg when darkMode is true', () => {
    (stores.useDarkMode as jest.Mock).mockReturnValue(true);
    const { container } = render(<TranslationPageSkeleton />);
    const section = container.querySelector('section');
    expect(section).toHaveClass('bg-capx-dark-box-bg');
  });

  it('applies dark row card bg when darkMode is true', () => {
    (stores.useDarkMode as jest.Mock).mockReturnValue(true);
    const { container } = render(<TranslationPageSkeleton />);
    const darkRows = container.querySelectorAll('.bg-gray-800.border-gray-700');
    // 5 translation rows + 1 controls row
    expect(darkRows.length).toBeGreaterThanOrEqual(5);
  });
});
