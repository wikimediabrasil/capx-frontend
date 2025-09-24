import { SnackbarProvider, useSnackbar } from '@/app/providers/SnackbarProvider';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';

// Test component to trigger snackbar
const TestComponent = () => {
  const { showSnackbar } = useSnackbar();

  return (
    <div>
      <button onClick={() => showSnackbar('Success message', 'success')}>Show Success</button>
      <button onClick={() => showSnackbar('Error message', 'error')}>Show Error</button>
    </div>
  );
};

describe('SnackbarProvider', () => {
  const renderWithProvider = (component: React.ReactNode) => {
    return render(<SnackbarProvider>{component}</SnackbarProvider>);
  };

  beforeEach(() => {
    // Mock window.innerWidth for mobile detection
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1024,
    });
  });

  it('shows success snackbar with correct styling', async () => {
    renderWithProvider(<TestComponent />);

    const successButton = screen.getByText('Show Success');
    act(() => {
      fireEvent.click(successButton);
    });

    await waitFor(() => {
      const snackbar = screen.getByText('Success message');
      expect(snackbar).toBeInTheDocument();
      // Check if the background color is set in the style attribute on the snackbar itself
      expect(snackbar).toHaveAttribute(
        'style',
        expect.stringContaining('background-color: rgb(2, 174, 140)')
      );
    });
  });

  it('shows error snackbar with correct styling', async () => {
    renderWithProvider(<TestComponent />);

    const errorButton = screen.getByText('Show Error');
    act(() => {
      fireEvent.click(errorButton);
    });

    await waitFor(() => {
      const snackbar = screen.getByText('Error message');
      expect(snackbar).toBeInTheDocument();
      // Check if the background color is set in the style attribute on the snackbar itself
      expect(snackbar).toHaveAttribute(
        'style',
        expect.stringContaining('background-color: rgb(212, 56, 49)')
      );
    });
  });

  it('positions snackbar correctly on desktop', async () => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1024,
    });

    renderWithProvider(<TestComponent />);

    const successButton = screen.getByText('Show Success');
    act(() => {
      fireEvent.click(successButton);
    });

    await waitFor(() => {
      const snackbar = screen.getByText('Success message');
      expect(snackbar).toHaveClass('fixed');
      expect(snackbar).toHaveClass('top-4');
      expect(snackbar).toHaveClass('right-4');
    });
  });

  it('positions snackbar correctly on mobile', async () => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 500,
    });

    // Trigger resize event
    window.dispatchEvent(new Event('resize'));

    renderWithProvider(<TestComponent />);

    const successButton = screen.getByText('Show Success');
    act(() => {
      fireEvent.click(successButton);
    });

    await waitFor(() => {
      const snackbar = screen.getByText('Success message');
      expect(snackbar).toHaveClass('fixed');
      expect(snackbar).toHaveClass('bottom-4');
      expect(snackbar).toHaveClass('left-1/2');
    });
  });

  it('auto-hides snackbar after 3 seconds', async () => {
    jest.useFakeTimers();

    renderWithProvider(<TestComponent />);

    const successButton = screen.getByText('Show Success');
    act(() => {
      fireEvent.click(successButton);
    });

    await waitFor(() => {
      expect(screen.getByText('Success message')).toBeInTheDocument();
    });

    // Fast-forward time by 3 seconds
    act(() => {
      jest.advanceTimersByTime(3000);
    });

    await waitFor(() => {
      expect(screen.queryByText('Success message')).not.toBeInTheDocument();
    });

    jest.useRealTimers();
  });

  it('replaces previous message when showing new snackbar', async () => {
    renderWithProvider(<TestComponent />);

    // Show first message
    const successButton = screen.getByText('Show Success');
    act(() => {
      fireEvent.click(successButton);
    });

    await waitFor(() => {
      expect(screen.getByText('Success message')).toBeInTheDocument();
    });

    // Show second message
    const errorButton = screen.getByText('Show Error');
    act(() => {
      fireEvent.click(errorButton);
    });

    await waitFor(() => {
      expect(screen.getByText('Error message')).toBeInTheDocument();
      expect(screen.queryByText('Success message')).not.toBeInTheDocument();
    });
  });

  it('uses success as default type when type is not specified', async () => {
    const TestComponentDefault = () => {
      const { showSnackbar } = useSnackbar();

      return <button onClick={() => showSnackbar('Default message')}>Show Default</button>;
    };

    renderWithProvider(<TestComponentDefault />);

    const defaultButton = screen.getByText('Show Default');
    act(() => {
      fireEvent.click(defaultButton);
    });

    await waitFor(() => {
      const snackbar = screen.getByText('Default message');
      expect(snackbar).toBeInTheDocument();
      expect(snackbar).toHaveAttribute(
        'style',
        expect.stringContaining('background-color: rgb(2, 174, 140)')
      );
    });
  });

  it('throws error when useSnackbar is used outside provider', () => {
    // Mock console.error to avoid test output pollution
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    const TestComponentWithoutProvider = () => {
      return <div>Test</div>;
    };

    expect(() => {
      render(<TestComponentWithoutProvider />);
    }).toThrow('useSnackbar must be used within a SnackbarProvider');

    consoleSpy.mockRestore();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });
});
