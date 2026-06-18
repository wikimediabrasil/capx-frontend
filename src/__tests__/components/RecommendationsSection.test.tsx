import React from 'react';
import { render, screen } from '@testing-library/react';
import RecommendationsSection from '@/app/(auth)/home/components/RecommendationsSection';
import * as stores from '@/stores';

describe('RecommendationsSection', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing', () => {
    const { container } = render(
      <RecommendationsSection>
        <div>child content</div>
      </RecommendationsSection>
    );
    expect(container.firstChild).toBeInTheDocument();
  });

  it('renders children', () => {
    render(
      <RecommendationsSection>
        <div>test child</div>
      </RecommendationsSection>
    );
    expect(screen.getByText('test child')).toBeInTheDocument();
  });

  it('renders desktop layout when not mobile', () => {
    (stores.useIsMobile as jest.Mock).mockReturnValue(false);
    const { container } = render(
      <RecommendationsSection>
        <div>content</div>
      </RecommendationsSection>
    );
    const section = container.querySelector('section');
    expect(section).toHaveClass('bg-transparent');
  });

  it('renders mobile layout when on mobile', () => {
    (stores.useIsMobile as jest.Mock).mockReturnValue(true);
    const { container } = render(
      <RecommendationsSection>
        <div>mobile content</div>
      </RecommendationsSection>
    );
    const section = container.querySelector('section');
    expect(section).toBeInTheDocument();
    expect(screen.getByText('mobile content')).toBeInTheDocument();
  });

  it('applies dark mode class on mobile', () => {
    (stores.useIsMobile as jest.Mock).mockReturnValue(true);
    (stores.useDarkMode as jest.Mock).mockReturnValue(true);
    const { container } = render(
      <RecommendationsSection>
        <div>dark content</div>
      </RecommendationsSection>
    );
    const section = container.querySelector('section');
    expect(section).toHaveClass('bg-capx-dark-bg');
  });

  it('applies light mode class on mobile', () => {
    (stores.useIsMobile as jest.Mock).mockReturnValue(true);
    (stores.useDarkMode as jest.Mock).mockReturnValue(false);
    const { container } = render(
      <RecommendationsSection>
        <div>light content</div>
      </RecommendationsSection>
    );
    const section = container.querySelector('section');
    expect(section).toHaveClass('bg-[#F6F6F6]');
  });

  it('renders multiple children', () => {
    render(
      <RecommendationsSection>
        <div>child one</div>
        <div>child two</div>
        <div>child three</div>
      </RecommendationsSection>
    );
    expect(screen.getByText('child one')).toBeInTheDocument();
    expect(screen.getByText('child two')).toBeInTheDocument();
    expect(screen.getByText('child three')).toBeInTheDocument();
  });
});
