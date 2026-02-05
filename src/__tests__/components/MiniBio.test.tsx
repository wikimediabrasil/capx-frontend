import { render, screen, fireEvent } from '@testing-library/react';
import MiniBio from '@/app/(auth)/profile/components/MiniBio';
import * as stores from '@/stores';

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

const mockPageContent = {
  'edit-profile-mini-bio': 'Mini Bio',
  'edit-profile-mini-bio-placeholder': 'Digite sua minibio...',
};

const renderWithProviders = (component: React.ReactElement) => {
  return render(
      <>{component}</>
      );
};

const renderInNarrowContainer = (component: React.ReactElement, width: string = '200px') => {
  return render(
    
      
        <div style={{ width, padding: '10px', border: '1px solid #ccc' }}>{component}</div>
      
    
  );
};

describe('MiniBio', () => {
  const defaultProps = {
    about: 'Minha minibio de teste',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (stores.useIsMobile as jest.Mock).mockReturnValue(false);
    (stores.usePageContent as jest.Mock).mockReturnValue(mockPageContent);
    (stores.useDarkMode as jest.Mock).mockReturnValue(false);
  });

  it('renders correctly in desktop mode', () => {
    renderWithProviders(<MiniBio {...defaultProps} />);

    expect(screen.getByText('Mini Bio')).toBeInTheDocument();
    expect(screen.getByText('Minha minibio de teste')).toBeInTheDocument();
  });

  it('renders correctly in mobile mode', () => {
    (stores.useIsMobile as jest.Mock).mockReturnValue(true);
    renderWithProviders(<MiniBio {...defaultProps} />);

    expect(screen.getByText('Mini Bio')).toBeInTheDocument();
    expect(screen.getByText('Minha minibio de teste')).toBeInTheDocument();
  });

  it('displays placeholder when about is empty', () => {
    renderWithProviders(<MiniBio about="" />);

    expect(screen.getByText('Digite sua minibio...')).toBeInTheDocument();
  });

  it('renders the textarea when isEditing is true', () => {
    const onAboutChange = jest.fn();
    renderWithProviders(
      <MiniBio {...defaultProps} isEditing={true} onAboutChange={onAboutChange} />
    );

    const textarea = screen.getByPlaceholderText('Digite sua minibio...');
    expect(textarea).toBeInTheDocument();
    expect(textarea).toHaveValue('Minha minibio de teste');
  });

  it('calls onAboutChange when the user edits the textarea', () => {
    const onAboutChange = jest.fn();
    renderWithProviders(
      <MiniBio {...defaultProps} isEditing={true} onAboutChange={onAboutChange} />
    );

    const textarea = screen.getByPlaceholderText('Digite sua minibio...');
    fireEvent.change(textarea, { target: { value: 'Novo texto' } });

    expect(onAboutChange).toHaveBeenCalledWith('Novo texto');
  });

  it('works correctly with text in different languages', () => {
    const unicodeText = 'Texto com acentos: áéíóú çãõ ñ';
    renderWithProviders(<MiniBio about={unicodeText} />);

    expect(screen.getByText(unicodeText)).toBeInTheDocument();
  });

  it('works correctly with emojis', () => {
    const emojiText = 'Texto com emojis 😀🎉🚀';
    renderWithProviders(<MiniBio about={emojiText} />);

    expect(screen.getByText(emojiText)).toBeInTheDocument();
  });

  it('works correctly with line breaks', () => {
    const textWithNewlines = 'Linha 1\nLinha 2\nLinha 3';
    renderWithProviders(<MiniBio about={textWithNewlines} />);

    expect(screen.getByText('Linha 1')).toBeInTheDocument();
    expect(screen.getByText('Linha 2')).toBeInTheDocument();
    expect(screen.getByText('Linha 3')).toBeInTheDocument();
  });

  it('applies custom character limit', () => {
    const onAboutChange = jest.fn();
    renderWithProviders(
      <MiniBio {...defaultProps} isEditing={true} onAboutChange={onAboutChange} maxLength={1000} />
    );

    const textarea = screen.getByPlaceholderText('Digite sua minibio...');
    expect(textarea).toHaveAttribute('maxLength', '1000');
  });

  it('renders correctly in dark mode', () => {
    (stores.useDarkMode as jest.Mock).mockReturnValue(true);
    renderWithProviders(<MiniBio {...defaultProps} />);

    expect(screen.getByText('Mini Bio')).toBeInTheDocument();
    expect(screen.getByText('Minha minibio de teste')).toBeInTheDocument();
  });

  it('works correctly without onAboutChange when isEditing is true', () => {
    renderWithProviders(<MiniBio {...defaultProps} isEditing={true} />);

    const textarea = screen.getByPlaceholderText('Digite sua minibio...');
    expect(textarea).toBeInTheDocument();

    fireEvent.change(textarea, { target: { value: 'Novo texto' } });
    expect(textarea).toBeInTheDocument();
  });

  it('works with Arabic text (RTL)', () => {
    const arabicText = 'نص عربي طويل للاختبار';
    renderWithProviders(<MiniBio about={arabicText} />);

    expect(screen.getByText(arabicText)).toBeInTheDocument();
  });

  it('works with Chinese text', () => {
    const chineseText = '这是一段很长的中文文本用于测试';
    renderWithProviders(<MiniBio about={chineseText} />);

    expect(screen.getByText(chineseText)).toBeInTheDocument();
  });

  it('works with Japanese text', () => {
    const japaneseText = 'これは長い日本語のテキストです';
    renderWithProviders(<MiniBio about={japaneseText} />);

    expect(screen.getByText(japaneseText)).toBeInTheDocument();
  });

  it('works with Korean text', () => {
    const koreanText = '이것은 긴 한국어 텍스트입니다';
    renderWithProviders(<MiniBio about={koreanText} />);

    expect(screen.getByText(koreanText)).toBeInTheDocument();
  });

  it('works with Thai text', () => {
    const thaiText = 'นี่คือข้อความภาษาไทยที่ยาว';
    renderWithProviders(<MiniBio about={thaiText} />);

    expect(screen.getByText(thaiText)).toBeInTheDocument();
  });

  it('works with Hindi text', () => {
    const hindiText = 'यह एक लंबा हिंदी टेक्स्ट है';
    renderWithProviders(<MiniBio about={hindiText} />);

    expect(screen.getByText(hindiText)).toBeInTheDocument();
  });

  it('works with Russian text', () => {
    const russianText = 'Это длинный русский текст для тестирования';
    renderWithProviders(<MiniBio about={russianText} />);

    expect(screen.getByText(russianText)).toBeInTheDocument();
  });

  it('works with Greek text', () => {
    const greekText = 'Αυτό είναι ένα μακρύ ελληνικό κείμενο';
    renderWithProviders(<MiniBio about={greekText} />);

    expect(screen.getByText(greekText)).toBeInTheDocument();
  });

  it('works with Hebrew text', () => {
    const hebrewText = 'זהו טקסט עברי ארוך לבדיקה';
    renderWithProviders(<MiniBio about={hebrewText} />);

    expect(screen.getByText(hebrewText)).toBeInTheDocument();
  });

  it('works with mixed text in different languages', () => {
    const mixedText = 'English text, texto em português, 中文文本, نص عربي, русский текст';
    renderWithProviders(<MiniBio about={mixedText} />);

    expect(screen.getByText(mixedText)).toBeInTheDocument();
  });

  it('preserves line breaks correctly', () => {
    const textWithNewlines = 'Primeira linha\nSegunda linha\nTerceira linha';
    renderWithProviders(<MiniBio about={textWithNewlines} />);

    // Verifica se as linhas estão separadas
    const lines = textWithNewlines.split('\n');
    lines.forEach(line => {
      expect(screen.getByText(line)).toBeInTheDocument();
    });
  });

  it('has full width in mobile mode', () => {
    (stores.useIsMobile as jest.Mock).mockReturnValue(true);
    renderWithProviders(<MiniBio {...defaultProps} />);

    const container = screen.getByText('Minha minibio de teste').closest('div');
    expect(container).toHaveClass('w-full');
  });

  it('has full width in desktop mode', () => {
    (stores.useIsMobile as jest.Mock).mockReturnValue(false);
    renderWithProviders(<MiniBio {...defaultProps} />);

    const container = screen.getByText('Minha minibio de teste').closest('div');
    expect(container).toHaveClass('w-full');
  });

  it('works with Arabic text in narrow container', () => {
    const arabicText = 'نص عربي طويل للاختبار مع الكثير من المحتوى';
    renderInNarrowContainer(<MiniBio about={arabicText} />, '120px');

    expect(screen.getByText(arabicText)).toBeInTheDocument();
  });

  it('works with Chinese text in narrow container', () => {
    const chineseText = '这是一段很长的中文文本用于测试';
    renderInNarrowContainer(<MiniBio about={chineseText} />, '100px');

    expect(screen.getByText(chineseText)).toBeInTheDocument();
  });

  it('works with Japanese text in narrow container', () => {
    const japaneseText = 'これは長い日本語のテキストです';
    renderInNarrowContainer(<MiniBio about={japaneseText} />, '100px');

    expect(screen.getByText(japaneseText)).toBeInTheDocument();
  });

  it('works with mixed text in narrow container', () => {
    const mixedText = 'English text, 中文文本, نص عربي';
    renderInNarrowContainer(<MiniBio about={mixedText} />, '80px');

    expect(screen.getByText(mixedText)).toBeInTheDocument();
  });

  it('works with very long text in mobile container', () => {
    (stores.useIsMobile as jest.Mock).mockReturnValue(true);
    const longText = 'a'.repeat(1000);
    renderInNarrowContainer(<MiniBio about={longText} />, '280px');

    expect(screen.getByText(longText)).toBeInTheDocument();
  });

  it('works with very long text in desktop container', () => {
    (stores.useIsMobile as jest.Mock).mockReturnValue(false);
    const longText = 'a'.repeat(1000);
    renderInNarrowContainer(<MiniBio about={longText} />, '400px');

    expect(screen.getByText(longText)).toBeInTheDocument();
  });

  it('preserves line breaks in narrow container', () => {
    const textWithNewlines = 'Linha 1\nLinha 2\nLinha 3';
    renderInNarrowContainer(<MiniBio about={textWithNewlines} />, '100px');

    expect(screen.getByText('Linha 1')).toBeInTheDocument();
    expect(screen.getByText('Linha 2')).toBeInTheDocument();
    expect(screen.getByText('Linha 3')).toBeInTheDocument();
  });

  it('works with emojis in narrow container', () => {
    const emojiText = 'Texto com emojis 😀🎉🚀 em container estreito';
    renderInNarrowContainer(<MiniBio about={emojiText} />, '120px');

    expect(screen.getByText(emojiText)).toBeInTheDocument();
  });

  it('works with empty text in narrow container', () => {
    renderInNarrowContainer(<MiniBio about="" />, '100px');

    expect(screen.getByText('Digite sua minibio...')).toBeInTheDocument();
  });
});
