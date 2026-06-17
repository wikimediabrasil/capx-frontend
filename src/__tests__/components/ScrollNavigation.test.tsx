// Mock ResizeObserver
globalThis.ResizeObserver = class {
  observe() { /* noop for test */ }
  unobserve() { /* noop for test */ }
  disconnect() { /* noop for test */ }
} as any;

jest.mock('@/stores', () => ({
  useIsMobile: jest.fn(),
  usePageContent: jest.fn(() => ({})),
}));

import React from 'react';
import { render, screen } from '@testing-library/react';
import { ScrollNavigation } from '@/components/ScrollNavigation';
import { useIsMobile } from '@/stores';

const mockUseIsMobile = useIsMobile as jest.Mock;

describe('ScrollNavigation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders children in mobile mode', () => {
    mockUseIsMobile.mockReturnValue(true);
    render(
      <ScrollNavigation>
        <div data-testid="child">Child content</div>
      </ScrollNavigation>
    );
    expect(screen.getByTestId('child')).toBeInTheDocument();
  });

  it('renders children in desktop mode', () => {
    mockUseIsMobile.mockReturnValue(false);
    render(
      <ScrollNavigation>
        <div data-testid="child">Child content</div>
      </ScrollNavigation>
    );
    expect(screen.getByTestId('child')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    mockUseIsMobile.mockReturnValue(true);
    const { container } = render(
      <ScrollNavigation className="custom-class">
        <div>Content</div>
      </ScrollNavigation>
    );
    expect(container.firstChild).toHaveClass('custom-class');
  });

  it('does not show arrows initially in desktop (no overflow)', () => {
    mockUseIsMobile.mockReturnValue(false);
    render(
      <ScrollNavigation>
        <div>Content</div>
      </ScrollNavigation>
    );
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
});
