import MiniBioTextarea from '@/components/MiniBioTextarea';
import * as stores from '@/stores';
import { fireEvent, screen } from '@testing-library/react';
import { renderWithProviders } from '../utils/test-helpers';


jest.mock('@/stores', () => ({
  ...jest.requireActual('@/stores'),
  useDarkMode: jest.fn(() => false),
  useSetDarkMode: jest.fn(() => jest.fn()),
  useThemeStore: Object.assign(
    jest.fn(() => ({ darkMode: false, setDarkMode: jest.fn(), mounted: true, hydrate: jest.fn() })),
    { getState: () => ({ darkMode: false, setDarkMode: jest.fn(), mounted: true, hydrate: jest.fn() }) }
  ),
  useIsMobile: jest.fn(() => false),
  usePageContent: jest.fn(() => ({})),
  useLanguage: jest.fn(() => 'en'),
  useMobileMenuStatus: jest.fn(() => false),
  useAppStore: Object.assign(
    jest.fn(() => ({ isMobile: false, mobileMenuStatus: false, language: 'en', pageContent: {}, session: null, mounted: true, setMobileMenuStatus: jest.fn(), setLanguage: jest.fn(), setPageContent: jest.fn(), setSession: jest.fn(), setIsMobile: jest.fn(), hydrate: jest.fn() })),
    { getState: () => ({ isMobile: false, mobileMenuStatus: false, language: 'en', pageContent: {}, session: null, mounted: true, setMobileMenuStatus: jest.fn(), setLanguage: jest.fn(), setPageContent: jest.fn(), setSession: jest.fn(), setIsMobile: jest.fn(), hydrate: jest.fn() }) }
  ),
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
    (stores.usePageContent as jest.Mock).mockReturnValue({
      'edit-profile-mini-bio-exceeded-chars': '$1 caracteres excedidos',
      'edit-profile-mini-bio-remaining-chars': '$1 caracteres restantes',
    });
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

  it.each([
    ['plain text', 'Texto de teste', 2000],
    ['text exceeding limit', 'a'.repeat(2001), 2000],
    ['custom character limit', '', 1000],
    ['accented characters', 'Texto com acentos: áéíóú çãõ ñ', 2000],
    ['emojis', 'Texto com emojis 😀🎉🚀', 2000],
    ['multiple spaces', 'Texto com   espaços   múltiplos', 2000],
    ['line breaks', 'Linha 1\nLinha 2\nLinha 3', 2000],
  ])('displays correct character count with %s', (_label, value, maxLength) => {
    testCharacterCount(value as string, maxLength as number);
  });

  it('calls onChange when the user types', () => {
    renderTextarea();
    fireEvent.change(getTextarea(), { target: { value: 'Novo texto' } });
    expect(defaultOnChange).toHaveBeenCalledWith('Novo texto');
  });

  it('changes the text color when the limit is exceeded', () => {
    renderTextarea({ value: 'a'.repeat(2001) });
    expect(screen.getByText('1 caracteres excedidos')).toHaveClass('text-red-500');
  });

  it('changes the text color when it is close to the limit', () => {
    renderTextarea({ value: 'a'.repeat(1900) });
    expect(screen.getByText('100 caracteres restantes')).toHaveClass('text-yellow-600');
  });

  it('applies custom CSS classes', () => {
    renderTextarea({ className: 'custom-class' });
    expect(getTextarea()).toHaveClass('custom-class');
  });

  it('disables the textarea when disabled is true', () => {
    renderTextarea({ disabled: true });
    expect(getTextarea()).toBeDisabled();
  });

  it.each([
    ['minHeight', { minHeight: '100px' }],
    ['padding', { padding: '8px 12px' }],
  ])('has correct %s style applied', (_label, style) => {
    renderTextarea();
    expect(getTextarea()).toHaveStyle(style);
  });

  it.each([
    'rounded-[4px]',
    'border-[1px]',
    'border-[solid]',
    'font-[Montserrat]',
    'bg-transparent',
    'resize-none',
    'minibio-textarea',
  ])('has %s class applied', className => {
    renderTextarea();
    expect(getTextarea()).toHaveClass(className);
  });

  it('has red border when the limit is exceeded', () => {
    renderTextarea({ value: 'a'.repeat(2001) });
    expect(getTextarea()).toHaveClass('border-red-500');
  });
});
