import { render } from '@testing-library/react';
import ReportBugPageSkeleton from '@/components/skeletons/ReportBugPageSkeleton';
import * as stores from '@/stores';

jest.mock('@/stores', () => ({
  ...jest.requireActual('@/stores'),
  useDarkMode: jest.fn(() => false),
}));

describe('ReportBugPageSkeleton', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (stores.useDarkMode as jest.Mock).mockReturnValue(false);
  });

  it('renders without crashing', () => {
    const { container } = render(<ReportBugPageSkeleton />);
    expect(container.firstChild).not.toBeNull();
  });

  it('renders a section as root element', () => {
    const { container } = render(<ReportBugPageSkeleton />);
    expect(container.querySelector('section')).not.toBeNull();
  });

  it('renders the banner area', () => {
    const { container } = render(<ReportBugPageSkeleton />);
    const bannerWrapper = container.querySelector('.rounded-lg.overflow-hidden');
    expect(bannerWrapper).not.toBeNull();
    expect(bannerWrapper!.querySelector('.animate-pulse')).not.toBeNull();
  });

  it('renders the nav tab skeletons', () => {
    const { container } = render(<ReportBugPageSkeleton />);
    const tabRow = container.querySelector('.border-b');
    expect(tabRow).not.toBeNull();
    const tabs = tabRow!.querySelectorAll('.animate-pulse');
    expect(tabs.length).toBe(2);
  });

  it('renders the heading row with icon and title skeletons', () => {
    const { container } = render(<ReportBugPageSkeleton />);
    const headingRow = container.querySelector('.flex.items-start.gap-2');
    expect(headingRow).not.toBeNull();
    const skeletons = headingRow!.querySelectorAll('.animate-pulse');
    expect(skeletons.length).toBe(2);
  });

  it('renders the form field skeletons', () => {
    const { container } = render(<ReportBugPageSkeleton />);
    const allPulse = container.querySelectorAll('.animate-pulse');
    // Banner + tabs (2) + heading (2) + title field (2) + description (3) + type (3) + mobile buttons (2) = 15+
    expect(allPulse.length).toBeGreaterThanOrEqual(10);
  });

  it('applies light banner bg in light mode', () => {
    const { container } = render(<ReportBugPageSkeleton />);
    const banner = container.querySelector('.bg-gray-200');
    expect(banner).not.toBeNull();
  });

  it('applies dark banner bg when darkMode is true', () => {
    (stores.useDarkMode as jest.Mock).mockReturnValue(true);
    const { container } = render(<ReportBugPageSkeleton />);
    const banner = container.querySelector('.bg-gray-800');
    expect(banner).not.toBeNull();
  });
});
