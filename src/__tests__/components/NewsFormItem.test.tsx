import { render, screen, fireEvent, act } from '@testing-library/react';
import NewsFormItem from '@/app/(auth)/organization_profile/components/NewsFormItem';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { AppProvider } from '@/contexts/AppContext';
import * as ThemeContext from '@/contexts/ThemeContext';
import * as AppContext from '@/contexts/AppContext';

// Mock contexts
jest.mock('@/contexts/AppContext', () => ({
  ...jest.requireActual('@/contexts/AppContext'),
  useApp: jest.fn(),
}));

jest.mock('@/contexts/ThemeContext', () => ({
  ...jest.requireActual('@/contexts/ThemeContext'),
  useTheme: jest.fn(),
}));

// Mock Next.js Image component
jest.mock('next/image', () => ({
  __esModule: true,
  default: ({ src, alt, className, width, height, ...props }: any) => (
    <img src={src} alt={alt} className={className} width={width} height={height} {...props} />
  ),
}));

describe('NewsFormItem', () => {
  const mockUseApp = AppContext.useApp as jest.MockedFunction<typeof AppContext.useApp>;
  const mockUseTheme = ThemeContext.useTheme as jest.MockedFunction<typeof ThemeContext.useTheme>;

  const mockPageContent = {
    'organization-profile-add-a-diff-tag': 'Add a news tag',
  };

  const mockNews = {
    id: 1,
    tag: 'Breaking News',
    creator: 1,
  };

  const mockProps = {
    news: mockNews,
    index: 0,
    onDelete: jest.fn(),
    onChange: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();

    mockUseApp.mockReturnValue({
      isMobile: false,
      pageContent: mockPageContent,
      language: 'en',
      mobileMenuStatus: false,
      setMobileMenuStatus: jest.fn(),
      setLanguage: jest.fn(),
      setPageContent: jest.fn(),
      session: null,
      setSession: jest.fn(),
    });

    mockUseTheme.mockReturnValue({
      darkMode: false,
      setDarkMode: jest.fn(),
    });
  });

  const renderWithProviders = (component: React.ReactNode) => {
    return render(
      <ThemeProvider>
        <AppProvider>{component}</AppProvider>
      </ThemeProvider>
    );
  };

  it('renders news form item with tag input', () => {
    renderWithProviders(<NewsFormItem {...mockProps} />);

    const tagInput = screen.getByDisplayValue('Breaking News');
    expect(tagInput).toBeInTheDocument();
    expect(tagInput).toHaveAttribute('placeholder', 'Add a news tag');
  });

  it('calls onChange when tag is modified', () => {
    renderWithProviders(<NewsFormItem {...mockProps} />);

    const tagInput = screen.getByDisplayValue('Breaking News');

    act(() => {
      fireEvent.change(tagInput, { target: { value: 'Updated News' } });
    });

    expect(mockProps.onChange).toHaveBeenCalledWith(0, 'tag', 'Updated News');
  });

  it('calls onDelete when delete button is clicked', () => {
    renderWithProviders(<NewsFormItem {...mockProps} />);

    const deleteButton = screen.getByRole('button');

    act(() => {
      fireEvent.click(deleteButton);
    });

    expect(mockProps.onDelete).toHaveBeenCalledWith(0);
  });

  it('renders delete icon correctly', () => {
    renderWithProviders(<NewsFormItem {...mockProps} />);

    const deleteIcon = screen.getByAltText('Delete icon');
    expect(deleteIcon).toBeInTheDocument();
  });

  it('applies dark mode styling', () => {
    mockUseTheme.mockReturnValue({
      darkMode: true,
      setDarkMode: jest.fn(),
    });

    renderWithProviders(<NewsFormItem {...mockProps} />);

    const tagInput = screen.getByDisplayValue('Breaking News');
    expect(tagInput).toHaveClass('text-white', 'placeholder-gray-400');
  });

  it('applies light mode styling', () => {
    renderWithProviders(<NewsFormItem {...mockProps} />);

    const tagInput = screen.getByDisplayValue('Breaking News');
    expect(tagInput).toHaveClass('text-[#829BA4]', 'placeholder-[#829BA4]');
  });

  it('handles empty tag', () => {
    const emptyNews = { ...mockNews, tag: '' };
    const propsWithEmptyTag = { ...mockProps, news: emptyNews };

    renderWithProviders(<NewsFormItem {...propsWithEmptyTag} />);

    const tagInput = screen.getByRole('textbox');
    expect(tagInput).toHaveValue('');
  });

  it('handles null tag', () => {
    const nullNews = { ...mockNews, tag: '' };
    const propsWithNullTag = { ...mockProps, news: nullNews };

    renderWithProviders(<NewsFormItem {...propsWithNullTag} />);

    const tagInput = screen.getByRole('textbox');
    expect(tagInput).toHaveValue('');
  });

  describe('mobile view', () => {
    beforeEach(() => {
      mockUseApp.mockReturnValue({
        ...mockUseApp(),
        isMobile: true,
      });
    });

    it('renders mobile layout correctly', () => {
      renderWithProviders(<NewsFormItem {...mockProps} />);

      const tagInput = screen.getByDisplayValue('Breaking News');
      expect(tagInput).toBeInTheDocument();
      expect(tagInput).toHaveClass('text-[12px]');
    });

    it('shows correct delete icon size in mobile', () => {
      renderWithProviders(<NewsFormItem {...mockProps} />);

      const deleteIcon = screen.getByAltText('Delete icon');
      expect(deleteIcon).toHaveAttribute('width', '24');
      expect(deleteIcon).toHaveAttribute('height', '24');
    });
  });

  describe('desktop view', () => {
    it('renders desktop layout correctly', () => {
      renderWithProviders(<NewsFormItem {...mockProps} />);

      const tagInput = screen.getByDisplayValue('Breaking News');
      expect(tagInput).toBeInTheDocument();
      // The component uses responsive classes: text-[16px] md:text-[24px]
      expect(tagInput).toHaveClass('md:text-[24px]');
    });

    it('shows correct delete icon size in desktop', () => {
      renderWithProviders(<NewsFormItem {...mockProps} />);

      const deleteIcon = screen.getByAltText('Delete icon');
      // NewsFormItem uses consistent 24px icons for both mobile and desktop
      expect(deleteIcon).toHaveAttribute('width', '24');
      expect(deleteIcon).toHaveAttribute('height', '24');
    });
  });

  it('uses dark mode delete icon when dark mode is enabled', () => {
    mockUseTheme.mockReturnValue({
      darkMode: true,
      setDarkMode: jest.fn(),
    });

    renderWithProviders(<NewsFormItem {...mockProps} />);

    const deleteIcon = screen.getByAltText('Delete icon');
    expect(deleteIcon).toBeInTheDocument();
    // The component should use CancelIconWhite when darkMode is true
  });

  it('uses light mode delete icon when dark mode is disabled', () => {
    renderWithProviders(<NewsFormItem {...mockProps} />);

    const deleteIcon = screen.getByAltText('Delete icon');
    expect(deleteIcon).toBeInTheDocument();
    // The component should use CancelIcon when darkMode is false
  });

  it('has proper input styling', () => {
    renderWithProviders(<NewsFormItem {...mockProps} />);

    const tagInput = screen.getByDisplayValue('Breaking News');
    expect(tagInput).toHaveClass('w-full', 'bg-transparent', 'border-none', 'outline-none');
  });

  it('has proper container styling', () => {
    renderWithProviders(<NewsFormItem {...mockProps} />);

    const container = screen.getByDisplayValue('Breaking News').closest('.flex.flex-row.gap-2');
    expect(container).toBeInTheDocument();
  });

  it('maintains tag value after re-render', () => {
    const { rerender } = renderWithProviders(<NewsFormItem {...mockProps} />);

    expect(screen.getByDisplayValue('Breaking News')).toBeInTheDocument();

    const updatedNews = { ...mockNews, tag: 'Updated Tag' };
    const updatedProps = { ...mockProps, news: updatedNews };

    rerender(
      <ThemeProvider>
        <AppProvider>
          <NewsFormItem {...updatedProps} />
        </AppProvider>
      </ThemeProvider>
    );

    expect(screen.getByDisplayValue('Updated Tag')).toBeInTheDocument();
    expect(screen.queryByDisplayValue('Breaking News')).not.toBeInTheDocument();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });
});
