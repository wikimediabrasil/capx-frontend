import DocumentFormItem from '@/app/(auth)/organization_profile/components/DocumentFormItem';
import { SnackbarProvider } from '@/app/providers/SnackbarProvider';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import React from 'react';

// Image Mock
jest.mock('next/image', () => {
  return function MockedImage({
    src,
    alt,
    width,
    height,
    fill,
    unoptimized,
    loading,
    ...props
  }: any) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt={alt} width={width} height={height} {...props} />;
  };
});

const mockPageContent = {
  'edit-profile-insert-link': 'Insert link',
  'snackbar-edit-profile-organization-invalid-document-url':
    'Invalid document URL. Please use a Wikimedia Commons URL (commons.wikimedia.org) with less than 200 characters.',
  'snackbar-edit-profile-organization-document-url-too-long':
    'Document URL is too long. Please use a URL with less than 200 characters.',
  'snackbar-edit-profile-organization-document-url-invalid-format':
    'Invalid URL format. Please use a valid Wikimedia Commons URL.',
};

jest.mock('@/contexts/AppContext', () => ({
  useApp: () => ({
    pageContent: mockPageContent,
    isMobile: false,
  }),
  AppProvider: ({ children }: any) => <div>{children}</div>,
}));

jest.mock('@/contexts/ThemeContext', () => ({
  useTheme: jest.fn(() => ({
    darkMode: false,
  })),
  ThemeProvider: ({ children }: any) => <div>{children}</div>,
}));

const mockShowSnackbar = jest.fn();
jest.mock('@/app/providers/SnackbarProvider', () => ({
  useSnackbar: () => ({
    showSnackbar: mockShowSnackbar,
  }),
  SnackbarProvider: ({ children }: any) => <div>{children}</div>,
}));

const renderWithProviders = (component: React.ReactElement) => {
  return render(<SnackbarProvider>{component}</SnackbarProvider>);
};

describe('DocumentFormItem', () => {
  const mockDocument = {
    id: 1,
    url: 'https://example.com/document',
  };

  const defaultProps = {
    document: mockDocument,
    index: 0,
    onDelete: jest.fn(),
    onChange: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockShowSnackbar.mockClear();
  });

  it('renders document form item correctly', () => {
    renderWithProviders(<DocumentFormItem {...defaultProps} />);

    expect(screen.getByDisplayValue('https://example.com/document')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Insert link')).toBeInTheDocument();
    expect(screen.getByAltText('Delete icon')).toBeInTheDocument();
  });

  it('calls onChange when input value changes', () => {
    const mockOnChange = jest.fn();
    renderWithProviders(<DocumentFormItem {...defaultProps} onChange={mockOnChange} />);

    const input = screen.getByDisplayValue('https://example.com/document');
    fireEvent.change(input, { target: { value: 'https://newurl.com' } });

    expect(mockOnChange).toHaveBeenCalledWith(0, 'url', 'https://newurl.com');
  });

  it('calls onDelete when delete button is clicked', () => {
    const mockOnDelete = jest.fn();
    renderWithProviders(<DocumentFormItem {...defaultProps} onDelete={mockOnDelete} />);

    const deleteButton = screen.getByAltText('Delete icon').closest('button');
    fireEvent.click(deleteButton!);

    expect(mockOnDelete).toHaveBeenCalledWith(0);
  });

  it('handles empty document url', () => {
    const emptyDocument = { id: 0, url: '' };
    renderWithProviders(<DocumentFormItem {...defaultProps} document={emptyDocument} />);

    const input = screen.getByPlaceholderText('Insert link');
    expect(input).toHaveValue('');
  });

  it('applies dark mode styles correctly', () => {
    const { useTheme } = require('@/contexts/ThemeContext');
    useTheme.mockReturnValue({ darkMode: true });

    const validDocument = { id: 1, url: 'https://commons.wikimedia.org/wiki/File:Test.pdf' };
    renderWithProviders(<DocumentFormItem {...defaultProps} document={validDocument} />);

    const input = screen.getByDisplayValue('https://commons.wikimedia.org/wiki/File:Test.pdf');
    expect(input).toHaveClass('text-white', 'border-gray-600');
  });

  it('applies light mode styles correctly', () => {
    const { useTheme } = require('@/contexts/ThemeContext');
    useTheme.mockReturnValue({ darkMode: false });

    const validDocument = { id: 1, url: 'https://commons.wikimedia.org/wiki/File:Test.pdf' };
    renderWithProviders(<DocumentFormItem {...defaultProps} document={validDocument} />);

    const input = screen.getByDisplayValue('https://commons.wikimedia.org/wiki/File:Test.pdf');
    expect(input).toHaveClass('text-[#829BA4]', 'border-gray-300');
  });

  it('handles null url gracefully', () => {
    const documentWithNullUrl = { id: 1, url: null };
    renderWithProviders(<DocumentFormItem {...defaultProps} document={documentWithNullUrl} />);

    const input = screen.getByPlaceholderText('Insert link');
    expect(input).toHaveValue('');
  });

  it('has proper accessibility attributes', () => {
    renderWithProviders(<DocumentFormItem {...defaultProps} />);

    const input = screen.getByRole('textbox');
    expect(input).toBeInTheDocument();

    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();

    const deleteIcon = screen.getByAltText('Delete icon');
    expect(deleteIcon).toBeInTheDocument();
  });

  it('shows validation checkmark for valid Commons URLs', async () => {
    const validDocument = { id: 1, url: 'https://commons.wikimedia.org/wiki/File:Test.pdf' };
    renderWithProviders(<DocumentFormItem {...defaultProps} document={validDocument} />);

    await waitFor(() => {
      expect(screen.getByText('✅')).toBeInTheDocument();
    });
  });

  it('shows error indicator for invalid URLs', async () => {
    const invalidDocument = { id: 1, url: 'https://example.com/invalid' };
    renderWithProviders(<DocumentFormItem {...defaultProps} document={invalidDocument} />);

    await waitFor(() => {
      expect(screen.getByText('❌')).toBeInTheDocument();
    });
  });

  it('applies error styling for invalid URLs', async () => {
    const invalidDocument = { id: 1, url: 'https://example.com/invalid' };
    renderWithProviders(<DocumentFormItem {...defaultProps} document={invalidDocument} />);

    const input = screen.getByDisplayValue('https://example.com/invalid');

    await waitFor(() => {
      expect(input).toHaveClass('border-red-500', 'border-2');
    });
  });

  it('shows snackbar for invalid URL after typing', async () => {
    renderWithProviders(<DocumentFormItem {...defaultProps} />);

    const input = screen.getByDisplayValue('https://example.com/document');
    fireEvent.change(input, { target: { value: 'https://invalid-url.com/doc' } });

    await waitFor(
      () => {
        expect(mockShowSnackbar).toHaveBeenCalledWith(
          'Invalid document URL. Please use a Wikimedia Commons URL (commons.wikimedia.org) with less than 200 characters.',
          'error'
        );
      },
      { timeout: 1500 }
    );
  });

  it('shows snackbar for URLs that are too long', async () => {
    const longUrl = 'https://commons.wikimedia.org/wiki/File:' + 'A'.repeat(200) + '.pdf';
    renderWithProviders(<DocumentFormItem {...defaultProps} />);

    const input = screen.getByDisplayValue('https://example.com/document');
    fireEvent.change(input, { target: { value: longUrl } });

    await waitFor(
      () => {
        expect(mockShowSnackbar).toHaveBeenCalledWith(
          'Document URL is too long. Please use a URL with less than 200 characters.',
          'error'
        );
      },
      { timeout: 1500 }
    );
  });

  it('does not show snackbar for valid URLs', async () => {
    renderWithProviders(<DocumentFormItem {...defaultProps} />);

    const input = screen.getByDisplayValue('https://example.com/document');
    fireEvent.change(input, {
      target: { value: 'https://commons.wikimedia.org/wiki/File:Valid.pdf' },
    });

    // Wait a bit to ensure no snackbar is shown
    await new Promise(resolve => setTimeout(resolve, 1200));

    expect(mockShowSnackbar).not.toHaveBeenCalled();
  });
});
