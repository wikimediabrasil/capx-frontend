jest.mock('@tanstack/react-query', () => ({
  useQueryClient: jest.fn(() => ({
    getQueryCache: jest.fn(() => ({
      getAll: jest.fn(() => [
        { queryKey: ['capacities', 'root'] },
        { queryKey: ['capacities', 'children', 10] },
        { queryKey: ['other-key'] },
      ]),
    })),
  })),
}));
jest.mock('next-auth/react', () => ({
  useSession: jest.fn(() => ({
    data: { user: { token: 'test-token' } },
    status: 'authenticated',
  })),
}));
jest.mock('@/hooks/useCapacitiesQuery', () => ({
  CAPACITY_CACHE_KEYS: { root: ['capacities', 'root'] },
  useRootCapacities: jest.fn(() => ({ data: [{ code: 10, name: 'Cap1' }] })),
}));
jest.mock('@/stores', () => ({
  useCapacityStore: jest.fn(() => ({
    preloadCapacities: jest.fn(),
    clearCache: jest.fn(),
  })),
}));

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import CapacityCacheDebug from '@/components/CapacityCacheDebug';

describe('CapacityCacheDebug', () => {
  it('renders toggle button', () => {
    render(<CapacityCacheDebug />);
    expect(screen.getByText('Show Cache Debug')).toBeInTheDocument();
  });

  it('opens debug panel on click', () => {
    render(<CapacityCacheDebug />);
    fireEvent.click(screen.getByText('Show Cache Debug'));
    expect(screen.getByText('Capacity Cache Debug')).toBeInTheDocument();
    expect(screen.getByText('Hide Cache Debug')).toBeInTheDocument();
  });

  it('shows cache keys count', () => {
    render(<CapacityCacheDebug />);
    fireEvent.click(screen.getByText('Show Cache Debug'));
    expect(screen.getByText(/Active Cache Keys \(2\)/)).toBeInTheDocument();
  });

  it('shows root capacities count', () => {
    render(<CapacityCacheDebug />);
    fireEvent.click(screen.getByText('Show Cache Debug'));
    expect(screen.getByText(/Cache has 1 root capacities/)).toBeInTheDocument();
  });

  it('has preload and clear buttons', () => {
    render(<CapacityCacheDebug />);
    fireEvent.click(screen.getByText('Show Cache Debug'));
    expect(screen.getByText('Preload Capacity Data')).toBeInTheDocument();
    expect(screen.getByText('Clear Cache')).toBeInTheDocument();
  });

  it('calls preloadCapacities on preload click', () => {
    const { useCapacityStore } = require('@/stores');
    const mockPreload = jest.fn();
    useCapacityStore.mockReturnValue({ preloadCapacities: mockPreload, clearCache: jest.fn() });

    render(<CapacityCacheDebug />);
    fireEvent.click(screen.getByText('Show Cache Debug'));
    fireEvent.click(screen.getByText('Preload Capacity Data'));
    expect(mockPreload).toHaveBeenCalledWith('test-token');
  });

  it('calls clearCache on clear click', () => {
    const { useCapacityStore } = require('@/stores');
    const mockClear = jest.fn();
    useCapacityStore.mockReturnValue({ preloadCapacities: jest.fn(), clearCache: mockClear });

    render(<CapacityCacheDebug />);
    fireEvent.click(screen.getByText('Show Cache Debug'));
    fireEvent.click(screen.getByText('Clear Cache'));
    expect(mockClear).toHaveBeenCalled();
  });

  it('closes panel when close button is clicked', () => {
    render(<CapacityCacheDebug />);
    fireEvent.click(screen.getByText('Show Cache Debug'));
    expect(screen.getByText('Capacity Cache Debug')).toBeInTheDocument();
    fireEvent.click(screen.getByText('✕'));
    expect(screen.queryByText('Capacity Cache Debug')).not.toBeInTheDocument();
  });
});
