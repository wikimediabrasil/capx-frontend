import { render, screen, fireEvent } from '@testing-library/react';
import { CapacityCard } from '@/app/(auth)/capacity/components/CapacityCard';
import React from 'react';

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
  useSearchParams: () => ({
    get: jest.fn(),
  }),
}));

jest.mock('@/contexts/AppContext', () => ({
  useApp: () => ({
    isMobile: false,
    pageContent: {
      'capacity-card-expand-capacity': 'Expand capacity',
      'capacity-card-explore-capacity': 'Explore capacity',
      'capacity-card-info': 'Information',
    },
  }),
}));

jest.mock('@/contexts/CapacityCacheContext', () => ({
  useCapacityCache: () => ({
    hasChildren: jest.fn(),
  }),
}));

jest.mock('@/contexts/ThemeContext', () => ({
  useTheme: () => ({
    darkMode: false,
    setDarkMode: jest.fn(),
  }),
  ThemeProvider: ({ children }: { children: React.ReactNode }) => children,
}));

describe('CapacityCard', () => {
  const mockProps = {
    code: 1,
    name: 'Test Capacity',
    icon: '/test-icon.svg',
    color: 'blue',
    onExpand: jest.fn(),
    isExpanded: false,
    hasChildren: true,
    description: 'Test description',
    wd_code: 'WD123',
    isRoot: true,
    onInfoClick: jest.fn().mockResolvedValue('Test description'),
  };

  it('renders root capacity card correctly', () => {
    render(<CapacityCard {...mockProps} />);

    expect(screen.getByText('Test Capacity')).toBeInTheDocument();
    const images = screen.getAllByRole('img');
    expect(images.some(img => img.getAttribute('alt') === 'Test Capacity')).toBe(true);
  });

  it('calls onExpand when arrow button is clicked', () => {
    render(<CapacityCard {...mockProps} />);

    const expandButton = screen.getByAltText('Expand capacity');
    fireEvent.click(expandButton.closest('button') || expandButton);

    expect(mockProps.onExpand).toHaveBeenCalled();
  });

  it('shows info content when info button is clicked', async () => {
    render(<CapacityCard {...mockProps} />);

    const infoButton = screen.getByLabelText('Information');
    fireEvent.click(infoButton);

    expect(await screen.findByText('Test description')).toBeInTheDocument();
    expect(screen.getByText('WD123')).toBeInTheDocument();
    expect(screen.getByText('Explore capacity')).toBeInTheDocument();
  });

  it('renders non-root capacity card correctly', () => {
    const nonRootProps = {
      ...mockProps,
      isRoot: false,
      parentCapacity: {
        code: 2,
        name: 'Parent Capacity',
        color: 'red',
        skill_type: 1,
        skill_wikidata_item: 'skill_wikidata_item',
        icon: 'icon',
        hasChildren: true,
      },
    };

    render(<CapacityCard {...nonRootProps} />);

    expect(screen.getByText('Test Capacity')).toBeInTheDocument();
    const images = screen.getAllByRole('img');
    expect(images.some(img => img.getAttribute('alt') === 'Test Capacity')).toBe(true);
  });
});
