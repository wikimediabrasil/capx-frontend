import { render } from '@testing-library/react';
import MessagePageSkeleton from '@/components/skeletons/MessagePageSkeleton';
import * as stores from '@/stores';

jest.mock('@/stores', () => ({
  ...jest.requireActual('@/stores'),
  useDarkMode: jest.fn(() => false),
}));

describe('MessagePageSkeleton', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (stores.useDarkMode as jest.Mock).mockReturnValue(false);
  });

  it('renders without crashing', () => {
    const { container } = render(<MessagePageSkeleton />);
    expect(container.firstChild).not.toBeNull();
  });

  it('renders the banner area skeletons', () => {
    const { container } = render(<MessagePageSkeleton />);
    const skeletons = container.querySelectorAll('.animate-pulse');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('renders two nav tab skeletons', () => {
    const { container } = render(<MessagePageSkeleton />);
    // Nav tabs row contains two h-8 skeletons
    const tabRow = container.querySelector('.flex.flex-row.gap-20');
    expect(tabRow).not.toBeNull();
    const tabs = tabRow!.querySelectorAll('.animate-pulse');
    expect(tabs.length).toBe(2);
  });

  it('renders form field skeletons (to, subject, body, submit)', () => {
    const { container } = render(<MessagePageSkeleton />);
    // 4 flex-col gap-2 groups inside the form area
    const formFields = container.querySelectorAll('.flex.flex-col.gap-2');
    expect(formFields.length).toBeGreaterThanOrEqual(3);
  });

  it('renders the submit button skeleton aligned to end', () => {
    const { container } = render(<MessagePageSkeleton />);
    const submitSkeleton = container.querySelector('.self-end.animate-pulse');
    expect(submitSkeleton).not.toBeNull();
  });

  it('applies light mode skeleton classes by default', () => {
    const { container } = render(<MessagePageSkeleton />);
    const skeletons = container.querySelectorAll('.bg-gray-200');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('applies dark mode skeleton classes when darkMode is true', () => {
    (stores.useDarkMode as jest.Mock).mockReturnValue(true);
    const { container } = render(<MessagePageSkeleton />);
    const skeletons = container.querySelectorAll('.bg-gray-700');
    expect(skeletons.length).toBeGreaterThan(0);
  });
});
