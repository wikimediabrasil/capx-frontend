import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { AppProvider } from '@/contexts/AppContext';
import MiniBioTextarea from '@/components/MiniBioTextarea';

// Mock do ThemeContext
const mockThemeContext = {
  darkMode: false,
  toggleDarkMode: jest.fn(),
};

// Mock do AppContext
const mockAppContext = {
  isMobile: false,
  pageContent: {
    'edit-profile-mini-bio-exceeded-chars': 'caracteres excedidos',
    'edit-profile-mini-bio-remaining-chars': 'caracteres restantes',
  },
  setPageContent: jest.fn(),
};

jest.mock('@/contexts/ThemeContext', () => ({
  useTheme: () => mockThemeContext,
  ThemeProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

jest.mock('@/contexts/AppContext', () => ({
  useApp: () => mockAppContext,
  AppProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <AppProvider>
      <ThemeProvider>{component}</ThemeProvider>
    </AppProvider>
  );
};

describe('MiniBioTextarea', () => {
  const defaultProps = {
    value: '',
    onChange: jest.fn(),
    placeholder: 'Digite sua minibio...',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockThemeContext.darkMode = false;
  });

  it('renders correctly', () => {
    renderWithProviders(<MiniBioTextarea {...defaultProps} />);

    expect(screen.getByPlaceholderText('Digite sua minibio...')).toBeInTheDocument();
    expect(screen.getByText('0 / 2000')).toBeInTheDocument();
    expect(screen.getByText('2000 caracteres restantes')).toBeInTheDocument();
  });

  it('displays the correct character count', () => {
    const text = 'Texto de teste';
    renderWithProviders(<MiniBioTextarea {...defaultProps} value={text} />);

    expect(screen.getByText(`${text.length} / 2000`)).toBeInTheDocument();
    expect(screen.getByText(`${2000 - text.length} caracteres restantes`)).toBeInTheDocument();
  });

  it('calls onChange when the user types', () => {
    const onChange = jest.fn();
    renderWithProviders(<MiniBioTextarea {...defaultProps} onChange={onChange} />);

    const textarea = screen.getByPlaceholderText('Digite sua minibio...');
    fireEvent.change(textarea, { target: { value: 'Novo texto' } });

    expect(onChange).toHaveBeenCalledWith('Novo texto');
  });

  it('respects the maximum character limit', () => {
    const longText = 'a'.repeat(2001);
    renderWithProviders(<MiniBioTextarea {...defaultProps} value={longText} />);

    expect(screen.getByText('2001 / 2000')).toBeInTheDocument();
    expect(screen.getByText('1 caracteres excedidos')).toBeInTheDocument();
  });

  it('changes the text color when the limit is exceeded', () => {
    const longText = 'a'.repeat(2001);
    renderWithProviders(<MiniBioTextarea {...defaultProps} value={longText} />);

    const exceededText = screen.getByText('1 caracteres excedidos');
    expect(exceededText).toHaveClass('text-red-500');
  });

  it('changes the text color when it is close to the limit', () => {
    const nearLimitText = 'a'.repeat(1900);
    renderWithProviders(<MiniBioTextarea {...defaultProps} value={nearLimitText} />);

    const remainingText = screen.getByText('100 caracteres restantes');
    expect(remainingText).toHaveClass('text-yellow-600');
  });

  it('accepts a custom character limit', () => {
    const customMaxLength = 1000;
    renderWithProviders(<MiniBioTextarea {...defaultProps} maxLength={customMaxLength} />);

    expect(screen.getByText(`0 / ${customMaxLength}`)).toBeInTheDocument();
    expect(screen.getByText(`${customMaxLength} caracteres restantes`)).toBeInTheDocument();
  });

  it('applies custom CSS classes', () => {
    const customClass = 'custom-class';
    renderWithProviders(<MiniBioTextarea {...defaultProps} className={customClass} />);

    const textarea = screen.getByPlaceholderText('Digite sua minibio...');
    expect(textarea).toHaveClass(customClass);
  });

  it('disables the textarea when disabled is true', () => {
    renderWithProviders(<MiniBioTextarea {...defaultProps} disabled={true} />);

    const textarea = screen.getByPlaceholderText('Digite sua minibio...');
    expect(textarea).toBeDisabled();
  });

  it('works correctly with text in different languages', () => {
    const unicodeText = 'Texto com acentos: áéíóú çãõ ñ';
    renderWithProviders(<MiniBioTextarea {...defaultProps} value={unicodeText} />);

    expect(screen.getByText(`${unicodeText.length} / 2000`)).toBeInTheDocument();
    expect(
      screen.getByText(`${2000 - unicodeText.length} caracteres restantes`)
    ).toBeInTheDocument();
  });

  it('works correctly with emojis', () => {
    const emojiText = 'Texto com emojis 😀🎉🚀';
    renderWithProviders(<MiniBioTextarea {...defaultProps} value={emojiText} />);

    expect(screen.getByText(`${emojiText.length} / 2000`)).toBeInTheDocument();
    expect(screen.getByText(`${2000 - emojiText.length} caracteres restantes`)).toBeInTheDocument();
  });

  it('works correctly with spaces', () => {
    const textWithSpaces = 'Texto com   espaços   múltiplos';
    renderWithProviders(<MiniBioTextarea {...defaultProps} value={textWithSpaces} />);

    expect(screen.getByText(`${textWithSpaces.length} / 2000`)).toBeInTheDocument();
    expect(
      screen.getByText(`${2000 - textWithSpaces.length} caracteres restantes`)
    ).toBeInTheDocument();
  });

  it('works correctly with line breaks', () => {
    const textWithNewlines = 'Linha 1\nLinha 2\nLinha 3';
    renderWithProviders(<MiniBioTextarea {...defaultProps} value={textWithNewlines} />);

    expect(screen.getByText(`${textWithNewlines.length} / 2000`)).toBeInTheDocument();
    expect(
      screen.getByText(`${2000 - textWithNewlines.length} caracteres restantes`)
    ).toBeInTheDocument();
  });

  it('has a minimum height defined', () => {
    renderWithProviders(<MiniBioTextarea {...defaultProps} />);

    const textarea = screen.getByPlaceholderText('Digite sua minibio...');
    expect(textarea).toHaveStyle({ minHeight: '100px' });
  });

  it('has correct padding applied', () => {
    renderWithProviders(<MiniBioTextarea {...defaultProps} />);

    const textarea = screen.getByPlaceholderText('Digite sua minibio...');
    expect(textarea).toHaveStyle({ padding: '8px 12px' });
  });

  it('has border radius applied', () => {
    renderWithProviders(<MiniBioTextarea {...defaultProps} />);

    const textarea = screen.getByPlaceholderText('Digite sua minibio...');
    expect(textarea).toHaveClass('rounded-[4px]');
  });

  it('has border applied', () => {
    renderWithProviders(<MiniBioTextarea {...defaultProps} />);

    const textarea = screen.getByPlaceholderText('Digite sua minibio...');
    expect(textarea).toHaveClass('border-[1px]');
    expect(textarea).toHaveClass('border-[solid]');
  });

  it('has red border when the limit is exceeded', () => {
    const longText = 'a'.repeat(2001);
    renderWithProviders(<MiniBioTextarea {...defaultProps} value={longText} />);

    const textarea = screen.getByPlaceholderText('Digite sua minibio...');
    expect(textarea).toHaveClass('border-red-500');
  });

  it('has Montserrat font applied', () => {
    renderWithProviders(<MiniBioTextarea {...defaultProps} />);

    const textarea = screen.getByPlaceholderText('Digite sua minibio...');
    expect(textarea).toHaveClass('font-[Montserrat]');
  });

  it('has transparent background', () => {
    renderWithProviders(<MiniBioTextarea {...defaultProps} />);

    const textarea = screen.getByPlaceholderText('Digite sua minibio...');
    expect(textarea).toHaveClass('bg-transparent');
  });

  it('has resize none', () => {
    renderWithProviders(<MiniBioTextarea {...defaultProps} />);

    const textarea = screen.getByPlaceholderText('Digite sua minibio...');
    expect(textarea).toHaveClass('resize-none');
  });

  it('has minibio-textarea class for custom scrollbar styling', () => {
    renderWithProviders(<MiniBioTextarea {...defaultProps} />);

    const textarea = screen.getByPlaceholderText('Digite sua minibio...');
    expect(textarea).toHaveClass('minibio-textarea');
  });
});
