import { screen, fireEvent } from '@testing-library/react';
import MiniBioTextarea from '@/components/MiniBioTextarea';
import { renderWithProviders } from '../utils/test-helpers';

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

describe('MiniBioTextarea', () => {
  const defaultOnChange = jest.fn();
  const defaultProps = {
    value: '',
    onChange: defaultOnChange,
    placeholder: 'Digite sua minibio...',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockThemeContext.darkMode = false;
  });

  const renderTextarea = (props: any = {}) => {
    return renderWithProviders(<MiniBioTextarea {...defaultProps} {...props} />);
  };

  const getTextarea = () => screen.getByPlaceholderText('Digite sua minibio...');

  const testCharacterCount = (value: string, maxLength = 2000) => {
    const charCount = value.length;
    const remaining = maxLength - charCount;
    const isExceeded = charCount > maxLength;

    renderTextarea({ value, maxLength });

    expect(screen.getByText(`${charCount} / ${maxLength}`)).toBeInTheDocument();

    if (isExceeded) {
      expect(screen.getByText(`${charCount - maxLength} caracteres excedidos`)).toBeInTheDocument();
    } else {
      expect(screen.getByText(`${remaining} caracteres restantes`)).toBeInTheDocument();
    }
  };

  it('renders correctly', () => {
    renderTextarea();
    expect(getTextarea()).toBeInTheDocument();
    expect(screen.getByText('0 / 2000')).toBeInTheDocument();
    expect(screen.getByText('2000 caracteres restantes')).toBeInTheDocument();
  });

  it('displays the correct character count', () => {
    testCharacterCount('Texto de teste');
  });

  it('calls onChange when the user types', () => {
    renderTextarea();
    fireEvent.change(getTextarea(), { target: { value: 'Novo texto' } });
    expect(defaultOnChange).toHaveBeenCalledWith('Novo texto');
  });

  it('respects the maximum character limit', () => {
    testCharacterCount('a'.repeat(2001));
  });

  it('changes the text color when the limit is exceeded', () => {
    renderTextarea({ value: 'a'.repeat(2001) });
    expect(screen.getByText('1 caracteres excedidos')).toHaveClass('text-red-500');
  });

  it('changes the text color when it is close to the limit', () => {
    renderTextarea({ value: 'a'.repeat(1900) });
    expect(screen.getByText('100 caracteres restantes')).toHaveClass('text-yellow-600');
  });

  it('accepts a custom character limit', () => {
    testCharacterCount('', 1000);
  });

  it('applies custom CSS classes', () => {
    renderTextarea({ className: 'custom-class' });
    expect(getTextarea()).toHaveClass('custom-class');
  });

  it('disables the textarea when disabled is true', () => {
    renderTextarea({ disabled: true });
    expect(getTextarea()).toBeDisabled();
  });

  it('works correctly with text in different languages', () => {
    testCharacterCount('Texto com acentos: áéíóú çãõ ñ');
  });

  it('works correctly with emojis', () => {
    testCharacterCount('Texto com emojis 😀🎉🚀');
  });

  it('works correctly with spaces', () => {
    testCharacterCount('Texto com   espaços   múltiplos');
  });

  it('works correctly with line breaks', () => {
    testCharacterCount('Linha 1\nLinha 2\nLinha 3');
  });

  const testStyle = (styleOrClass: any, expected?: any) => {
    renderTextarea();
    const textarea = getTextarea();
    if (expected) {
      expect(textarea).toHaveStyle(styleOrClass);
    } else {
      expect(textarea).toHaveClass(styleOrClass);
    }
  };

  it('has a minimum height defined', () => {
    testStyle({ minHeight: '100px' }, true);
  });

  it('has correct padding applied', () => {
    testStyle({ padding: '8px 12px' }, true);
  });

  it('has border radius applied', () => {
    testStyle('rounded-[4px]');
  });

  it('has border applied', () => {
    renderTextarea();
    const textarea = getTextarea();
    expect(textarea).toHaveClass('border-[1px]');
    expect(textarea).toHaveClass('border-[solid]');
  });

  it('has red border when the limit is exceeded', () => {
    renderTextarea({ value: 'a'.repeat(2001) });
    expect(getTextarea()).toHaveClass('border-red-500');
  });

  it('has Montserrat font applied', () => {
    testStyle('font-[Montserrat]');
  });

  it('has transparent background', () => {
    testStyle('bg-transparent');
  });

  it('has resize none', () => {
    testStyle('resize-none');
  });

  it('has minibio-textarea class for custom scrollbar styling', () => {
    testStyle('minibio-textarea');
  });
});
