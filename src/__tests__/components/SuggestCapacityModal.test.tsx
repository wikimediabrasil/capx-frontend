import SuggestCapacityModal from '@/app/(auth)/capacity/components/SuggestCapacityModal';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';

const mockSubmitBugReport = jest.fn();
const mockShowSnackbar = jest.fn();
let mockIsSubmitting = false;

jest.mock('@/stores', () => ({
  ...jest.requireActual('@/stores'),
  useDarkMode: jest.fn(() => false),
  useSetDarkMode: jest.fn(() => jest.fn()),
  usePageContent: jest.fn(() => ({})),
  useLanguage: jest.fn(() => 'en'),
  useIsMobile: jest.fn(() => false),
  useAppStore: Object.assign(
    jest.fn(() => ({ isMobile: false, language: 'en', pageContent: {} })),
    { getState: () => ({ isMobile: false, language: 'en', pageContent: {} }) }
  ),
}));

jest.mock('@/app/providers/SnackbarProvider', () => ({
  useSnackbar: () => ({ showSnackbar: mockShowSnackbar }),
}));

jest.mock('@/hooks/useBugReport', () => ({
  useBugReport: () => ({
    submitBugReport: mockSubmitBugReport,
    get isSubmitting() {
      return mockIsSubmitting;
    },
  }),
}));

const defaultProps = {
  isOpen: true,
  onClose: jest.fn(),
};

describe('SuggestCapacityModal', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockIsSubmitting = false;
    mockSubmitBugReport.mockResolvedValue(undefined);
  });

  it('returns null when isOpen is false', () => {
    const { container } = render(<SuggestCapacityModal {...defaultProps} isOpen={false} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders the modal when isOpen is true', () => {
    render(<SuggestCapacityModal {...defaultProps} />);
    const dialog = document.querySelector('dialog');
    expect(dialog).toBeInTheDocument();
  });

  it('renders the modal title', () => {
    render(<SuggestCapacityModal {...defaultProps} />);
    expect(screen.getByText('Suggest a new capacity')).toBeInTheDocument();
  });

  it('renders the title input field', () => {
    render(<SuggestCapacityModal {...defaultProps} />);
    expect(screen.getByLabelText(/Title/i)).toBeInTheDocument();
  });

  it('renders the description textarea', () => {
    render(<SuggestCapacityModal {...defaultProps} />);
    expect(screen.getByLabelText(/Description/i)).toBeInTheDocument();
  });

  it('renders the Cancel and Submit buttons', () => {
    render(<SuggestCapacityModal {...defaultProps} />);
    expect(screen.getByText('Cancel')).toBeInTheDocument();
    expect(screen.getByText('Submit')).toBeInTheDocument();
  });

  it('Submit button is disabled when title is empty', () => {
    render(<SuggestCapacityModal {...defaultProps} />);
    const submitButton = screen.getByText('Submit');
    expect(submitButton).toBeDisabled();
  });

  it('Submit button is enabled when title is filled', () => {
    render(<SuggestCapacityModal {...defaultProps} />);
    const titleInput = screen.getByLabelText(/Title/i);
    fireEvent.change(titleInput, { target: { value: 'New Capacity Idea' } });
    expect(screen.getByText('Submit')).not.toBeDisabled();
  });

  it('allows typing in the title input', () => {
    render(<SuggestCapacityModal {...defaultProps} />);
    const titleInput = screen.getByLabelText(/Title/i);
    fireEvent.change(titleInput, { target: { value: 'Some capacity' } });
    expect(titleInput).toHaveValue('Some capacity');
  });

  it('allows typing in the description textarea', () => {
    render(<SuggestCapacityModal {...defaultProps} />);
    const descInput = screen.getByLabelText(/Description/i);
    fireEvent.change(descInput, { target: { value: 'Detailed description here' } });
    expect(descInput).toHaveValue('Detailed description here');
  });

  it('calls onClose when Cancel is clicked', () => {
    const onClose = jest.fn();
    render(<SuggestCapacityModal {...defaultProps} onClose={onClose} />);
    fireEvent.click(screen.getByText('Cancel'));
    expect(onClose).toHaveBeenCalled();
  });

  it('clears form and calls onClose when Cancel is clicked after typing', () => {
    const onClose = jest.fn();
    render(<SuggestCapacityModal {...defaultProps} onClose={onClose} />);
    fireEvent.change(screen.getByLabelText(/Title/i), { target: { value: 'Some text' } });
    fireEvent.click(screen.getByText('Cancel'));
    expect(onClose).toHaveBeenCalled();
  });

  it('calls submitBugReport with correct args when form is submitted', async () => {
    render(<SuggestCapacityModal {...defaultProps} />);
    fireEvent.change(screen.getByLabelText(/Title/i), { target: { value: 'New Capacity' } });
    fireEvent.change(screen.getByLabelText(/Description/i), { target: { value: 'More details' } });
    fireEvent.click(screen.getByText('Submit'));

    await waitFor(() => {
      expect(mockSubmitBugReport).toHaveBeenCalledWith({
        title: 'New Capacity',
        description: 'More details',
        bug_type: 'new_capacity',
      });
    });
  });

  it('shows success snackbar after successful submission', async () => {
    render(<SuggestCapacityModal {...defaultProps} />);
    fireEvent.change(screen.getByLabelText(/Title/i), { target: { value: 'New Capacity' } });
    fireEvent.click(screen.getByText('Submit'));

    await waitFor(() => {
      expect(mockShowSnackbar).toHaveBeenCalledWith(
        expect.stringContaining('submitted'),
        'success'
      );
    });
  });

  it('calls onClose after successful submission', async () => {
    const onClose = jest.fn();
    render(<SuggestCapacityModal {...defaultProps} onClose={onClose} />);
    fireEvent.change(screen.getByLabelText(/Title/i), { target: { value: 'New Capacity' } });
    fireEvent.click(screen.getByText('Submit'));

    await waitFor(() => {
      expect(onClose).toHaveBeenCalled();
    });
  });

  it('shows error snackbar when submission fails', async () => {
    mockSubmitBugReport.mockRejectedValue(new Error('Network error'));
    render(<SuggestCapacityModal {...defaultProps} />);
    fireEvent.change(screen.getByLabelText(/Title/i), { target: { value: 'New Capacity' } });
    fireEvent.click(screen.getByText('Submit'));

    await waitFor(() => {
      expect(mockShowSnackbar).toHaveBeenCalledWith(
        expect.stringContaining('Failed'),
        'error'
      );
    });
  });

  it('trims whitespace from title before submitting', async () => {
    render(<SuggestCapacityModal {...defaultProps} />);
    fireEvent.change(screen.getByLabelText(/Title/i), {
      target: { value: '  Trimmed Capacity  ' },
    });
    fireEvent.click(screen.getByText('Submit'));

    await waitFor(() => {
      expect(mockSubmitBugReport).toHaveBeenCalledWith(
        expect.objectContaining({ title: 'Trimmed Capacity' })
      );
    });
  });

  it('does not submit when title is only whitespace', () => {
    render(<SuggestCapacityModal {...defaultProps} />);
    const titleInput = screen.getByLabelText(/Title/i);
    fireEvent.change(titleInput, { target: { value: '   ' } });
    // Submit button remains disabled for whitespace-only titles
    expect(screen.getByText('Submit')).toBeDisabled();
  });

  it('shows Submitting text and disables buttons when isSubmitting is true', () => {
    mockIsSubmitting = true;
    render(<SuggestCapacityModal {...defaultProps} />);
    expect(screen.getByText('Submitting...')).toBeInTheDocument();
    expect(screen.getByText('Cancel')).toBeDisabled();
  });

  it('renders with dark mode styles', () => {
    const stores = jest.requireMock('@/stores');
    stores.useDarkMode.mockReturnValue(true);

    render(<SuggestCapacityModal {...defaultProps} />);
    const dialog = document.querySelector('dialog');
    expect(dialog).toBeInTheDocument();

    stores.useDarkMode.mockReturnValue(false);
  });

  it('uses pageContent for label text when available', () => {
    const stores = jest.requireMock('@/stores');
    stores.usePageContent.mockReturnValue({
      'suggest-capacity-modal-title': 'Propose a Capacity',
      'suggest-capacity-title-label': 'Name',
      'suggest-capacity-cancel': 'Dismiss',
      'suggest-capacity-submit': 'Send',
    });

    render(<SuggestCapacityModal {...defaultProps} />);
    expect(screen.getByText('Propose a Capacity')).toBeInTheDocument();
    expect(screen.getByText('Dismiss')).toBeInTheDocument();
    expect(screen.getByText('Send')).toBeInTheDocument();

    stores.usePageContent.mockReturnValue({});
  });

  it('has accessible aria-modal attribute', () => {
    render(<SuggestCapacityModal {...defaultProps} />);
    const dialog = document.querySelector('dialog');
    expect(dialog).toHaveAttribute('aria-modal', 'true');
  });

  it('has aria-labelledby attribute pointing to title', () => {
    render(<SuggestCapacityModal {...defaultProps} />);
    const dialog = document.querySelector('dialog');
    expect(dialog).toHaveAttribute('aria-labelledby', 'suggest-capacity-modal-title');
    expect(screen.getByText('Suggest a new capacity')).toBeInTheDocument();
  });
});
