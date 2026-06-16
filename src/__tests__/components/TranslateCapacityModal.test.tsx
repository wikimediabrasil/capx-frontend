import TranslateCapacityModal from '@/app/(auth)/capacity/components/TranslateCapacityModal';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import React from 'react';

jest.mock('@/stores', () => ({
  ...jest.requireActual('@/stores'),
  useDarkMode: jest.fn(() => false),
  useSetDarkMode: jest.fn(() => jest.fn()),
  usePageContent: jest.fn(() => ({})),
  useLanguage: jest.fn(() => 'en'),
  useIsMobile: jest.fn(() => false),
  useCapacityStore: Object.assign(
    jest.fn((selector?: any) => {
      const state = {
        capacities: {},
        isLoaded: true,
        isLoadingTranslations: false,
        language: 'en',
        getName: jest.fn(() => ''),
        getDescription: jest.fn(() => ''),
        updateCapacityTranslation: jest.fn(),
        isFallbackTranslation: jest.fn(() => false),
      };
      return selector ? selector(state) : state;
    }),
    {
      getState: () => ({ capacities: {}, isLoaded: true }),
    }
  ),
  useAppStore: Object.assign(
    jest.fn(() => ({ isMobile: false, language: 'en', pageContent: {} })),
    { getState: () => ({ isMobile: false, language: 'en', pageContent: {} }) }
  ),
}));

jest.mock('next-auth/react', () => ({
  useSession: jest.fn(() => ({
    data: { user: { id: '1', token: 'test-token' } },
    status: 'authenticated',
  })),
}));

jest.mock('@/app/providers/SnackbarProvider', () => ({
  useSnackbar: () => ({ showSnackbar: jest.fn() }),
}));

const mockGetOAuthStatus = jest.fn();
const mockBeginOAuth = jest.fn();
const mockSaveTranslation = jest.fn();

jest.mock('@/services/translationService', () => ({
  translationService: {
    getOAuthStatus: (...args: any[]) => mockGetOAuthStatus(...args),
    beginOAuth: (...args: any[]) => mockBeginOAuth(...args),
    saveTranslation: (...args: any[]) => mockSaveTranslation(...args),
  },
}));

const defaultProps = {
  isOpen: true,
  onClose: jest.fn(),
  capacityName: 'Test Capacity',
  capacityCode: 42,
  qid: 'Q12345',
  metabaseCode: 'M9001',
  fallbackLabel: 'Test Label',
  fallbackDescription: 'Test description of the capacity',
};

describe('TranslateCapacityModal', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetOAuthStatus.mockResolvedValue({ connected: false, username: '' });
    mockBeginOAuth.mockResolvedValue({ authorization_url: 'https://example.com/oauth' });
    mockSaveTranslation.mockResolvedValue({ changed: ['label', 'description'] });
  });

  it('returns null when isOpen is false', () => {
    const { container } = render(<TranslateCapacityModal {...defaultProps} isOpen={false} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders the modal dialog when isOpen is true', async () => {
    await act(async () => {
      render(<TranslateCapacityModal {...defaultProps} />);
    });
    const dialog = document.querySelector('dialog');
    expect(dialog).toBeInTheDocument();
  });

  it('renders the modal title', async () => {
    await act(async () => {
      render(<TranslateCapacityModal {...defaultProps} />);
    });
    expect(screen.getByText('Add Translation')).toBeInTheDocument();
  });

  it('renders the capacity name in the header', async () => {
    await act(async () => {
      render(<TranslateCapacityModal {...defaultProps} />);
    });
    expect(screen.getByText('Test Capacity')).toBeInTheDocument();
  });

  it('renders the target language indicator', async () => {
    await act(async () => {
      render(<TranslateCapacityModal {...defaultProps} />);
    });
    expect(screen.getByText(/Translating to:/i)).toBeInTheDocument();
    expect(screen.getByText('en')).toBeInTheDocument();
  });

  it('renders the label input field with fallback label', async () => {
    await act(async () => {
      render(<TranslateCapacityModal {...defaultProps} />);
    });
    const labelInput = screen.getByLabelText(/Title/i);
    expect(labelInput).toBeInTheDocument();
    expect(labelInput).toHaveValue('Test Label');
  });

  it('renders the description textarea with fallback description', async () => {
    await act(async () => {
      render(<TranslateCapacityModal {...defaultProps} />);
    });
    const descInput = screen.getByLabelText(/Description/i);
    expect(descInput).toBeInTheDocument();
    expect(descInput).toHaveValue('Test description of the capacity');
  });

  it('shows loading state initially while checking OAuth', async () => {
    // Make getOAuthStatus never resolve so we stay in loading state
    mockGetOAuthStatus.mockReturnValue(new Promise(() => {}));
    render(<TranslateCapacityModal {...defaultProps} />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('shows connect button when OAuth is not connected', async () => {
    await act(async () => {
      render(<TranslateCapacityModal {...defaultProps} />);
    });
    await waitFor(() => {
      expect(screen.getByText('Connect Metabase')).toBeInTheDocument();
    });
  });

  it('shows connected status when OAuth is connected', async () => {
    mockGetOAuthStatus.mockResolvedValue({ connected: true, username: 'wikiuser' });

    await act(async () => {
      render(<TranslateCapacityModal {...defaultProps} />);
    });
    await waitFor(() => {
      expect(screen.getByText(/Connected as/i)).toBeInTheDocument();
      expect(screen.getByText('wikiuser')).toBeInTheDocument();
    });
  });

  it('calls onClose when close button (✕) is clicked', async () => {
    const onClose = jest.fn();
    await act(async () => {
      render(<TranslateCapacityModal {...defaultProps} onClose={onClose} />);
    });
    const closeButton = screen.getByLabelText('Close');
    fireEvent.click(closeButton);
    expect(onClose).toHaveBeenCalled();
  });

  it('calls onClose when Cancel button is clicked', async () => {
    const onClose = jest.fn();
    await act(async () => {
      render(<TranslateCapacityModal {...defaultProps} onClose={onClose} />);
    });
    fireEvent.click(screen.getByText('Cancel'));
    expect(onClose).toHaveBeenCalled();
  });

  it('Save Translation button is disabled when not connected', async () => {
    await act(async () => {
      render(<TranslateCapacityModal {...defaultProps} />);
    });
    await waitFor(() => {
      expect(screen.getByText('Connect Metabase')).toBeInTheDocument();
    });
    const saveButton = screen.getByText('Save Translation');
    expect(saveButton).toBeDisabled();
  });

  it('shows original fallback label hint', async () => {
    await act(async () => {
      render(<TranslateCapacityModal {...defaultProps} />);
    });
    const hints = screen.getAllByText(/Original \(English\):/i);
    expect(hints.length).toBeGreaterThan(0);
    expect(screen.getByText(/Test Label/)).toBeInTheDocument();
  });

  it('allows typing in the label input', async () => {
    mockGetOAuthStatus.mockResolvedValue({ connected: true, username: 'wikiuser' });

    await act(async () => {
      render(<TranslateCapacityModal {...defaultProps} />);
    });

    await waitFor(() => expect(screen.getByText(/Connected as/i)).toBeInTheDocument());

    const labelInput = screen.getByLabelText(/Title/i);
    fireEvent.change(labelInput, { target: { value: 'Nueva etiqueta' } });
    expect(labelInput).toHaveValue('Nueva etiqueta');
  });

  it('allows typing in the description textarea', async () => {
    mockGetOAuthStatus.mockResolvedValue({ connected: true, username: 'wikiuser' });

    await act(async () => {
      render(<TranslateCapacityModal {...defaultProps} />);
    });

    await waitFor(() => expect(screen.getByText(/Connected as/i)).toBeInTheDocument());

    const descInput = screen.getByLabelText(/Description/i);
    fireEvent.change(descInput, { target: { value: 'Nueva descripción' } });
    expect(descInput).toHaveValue('Nueva descripción');
  });

  it('calls beginOAuth when Connect Metabase button is clicked', async () => {
    await act(async () => {
      render(<TranslateCapacityModal {...defaultProps} />);
    });
    await waitFor(() => expect(screen.getByText('Connect Metabase')).toBeInTheDocument());

    await act(async () => {
      fireEvent.click(screen.getByText('Connect Metabase'));
    });

    expect(mockBeginOAuth).toHaveBeenCalled();
  });

  it('shows the OAuth iframe when authorization URL is returned', async () => {
    await act(async () => {
      render(<TranslateCapacityModal {...defaultProps} />);
    });

    await waitFor(() => expect(screen.getByText('Connect Metabase')).toBeInTheDocument());

    await act(async () => {
      fireEvent.click(screen.getByText('Connect Metabase'));
    });

    await waitFor(() => {
      expect(screen.getByTitle('Metabase OAuth')).toBeInTheDocument();
    });
  });

  it('calls saveTranslation when Save is clicked and connected', async () => {
    mockGetOAuthStatus.mockResolvedValue({ connected: true, username: 'wikiuser' });

    await act(async () => {
      render(<TranslateCapacityModal {...defaultProps} />);
    });

    await waitFor(() => expect(screen.getByText(/Connected as/i)).toBeInTheDocument());

    await act(async () => {
      fireEvent.click(screen.getByText('Save Translation'));
    });

    await waitFor(() => {
      expect(mockSaveTranslation).toHaveBeenCalledWith(
        'Q12345',
        'en',
        'Test Label',
        'Test description of the capacity',
        'test-token'
      );
    });
  });

  it('renders Metabase icon', async () => {
    await act(async () => {
      render(<TranslateCapacityModal {...defaultProps} />);
    });
    expect(screen.getByAltText('Metabase')).toBeInTheDocument();
  });

  it('shows dark mode styles when darkMode is true', async () => {
    const stores = jest.requireMock('@/stores');
    stores.useDarkMode.mockReturnValue(true);

    await act(async () => {
      render(<TranslateCapacityModal {...defaultProps} />);
    });

    const dialog = document.querySelector('dialog');
    expect(dialog).toBeInTheDocument();

    stores.useDarkMode.mockReturnValue(false);
  });
});
