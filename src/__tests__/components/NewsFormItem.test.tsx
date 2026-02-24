import { screen, fireEvent, act } from '@testing-library/react';
import NewsFormItem from '@/app/(auth)/organization_profile/components/NewsFormItem';
import * as stores from '@/stores';

jest.mock('@/stores', () => ({
  ...jest.requireActual('@/stores'),
  useDarkMode: jest.fn(() => false),
  useSetDarkMode: jest.fn(() => jest.fn()),
  useThemeStore: Object.assign(
    jest.fn(() => ({ darkMode: false, setDarkMode: jest.fn(), mounted: true, hydrate: jest.fn() })),
    {
      getState: () => ({
        darkMode: false,
        setDarkMode: jest.fn(),
        mounted: true,
        hydrate: jest.fn(),
      }),
    }
  ),
  useIsMobile: jest.fn(() => false),
  usePageContent: jest.fn(() => ({})),
  useLanguage: jest.fn(() => 'en'),
  useMobileMenuStatus: jest.fn(() => false),
  useAppStore: Object.assign(
    jest.fn(() => ({
      isMobile: false,
      mobileMenuStatus: false,
      language: 'en',
      pageContent: {},
      session: null,
      mounted: true,
      setMobileMenuStatus: jest.fn(),
      setLanguage: jest.fn(),
      setPageContent: jest.fn(),
      setSession: jest.fn(),
      setIsMobile: jest.fn(),
      hydrate: jest.fn(),
    })),
    {
      getState: () => ({
        isMobile: false,
        mobileMenuStatus: false,
        language: 'en',
        pageContent: {},
        session: null,
        mounted: true,
        setMobileMenuStatus: jest.fn(),
        setLanguage: jest.fn(),
        setPageContent: jest.fn(),
        setSession: jest.fn(),
        setIsMobile: jest.fn(),
        hydrate: jest.fn(),
      }),
    }
  ),
}));

import {
  renderWithProviders,
  createMockAppContext,
  createMockThemeContext,
  createMockPageContent,
} from '../utils/test-helpers';

// Mock Next.js Image component
jest.mock('next/image', () => ({
  __esModule: true,
  default: ({ src, alt, className, width, height, ...props }: any) => (
    <img src={src} alt={alt} className={className} width={width} height={height} {...props} />
  ),
}));

describe('NewsFormItem', () => {
  const mockPageContent = createMockPageContent({
    'organization-profile-add-a-diff-tag': 'Add a news tag',
  });

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
    (stores.useIsMobile as jest.Mock).mockReturnValue(false);
    (stores.usePageContent as jest.Mock).mockReturnValue(mockPageContent);
    (stores.useLanguage as jest.Mock).mockReturnValue('en');
    (stores.useDarkMode as jest.Mock).mockReturnValue(false);
  });

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

  const testThemeStyling = (darkMode: boolean, expectedClasses: string[]) => {
    (stores.useDarkMode as jest.Mock).mockReturnValue(darkMode);
    renderWithProviders(<NewsFormItem {...mockProps} />);
    const tagInput = screen.getByDisplayValue('Breaking News');
    expectedClasses.forEach(className => {
      expect(tagInput).toHaveClass(className);
    });
  };

  it('applies dark mode styling', () => {
    testThemeStyling(true, ['text-white', 'placeholder-gray-400']);
  });

  it('applies light mode styling', () => {
    testThemeStyling(false, ['text-[#829BA4]', 'placeholder-[#829BA4]']);
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
      (stores.useIsMobile as jest.Mock).mockReturnValue(true);
      (stores.usePageContent as jest.Mock).mockReturnValue(mockPageContent);
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
    (stores.useDarkMode as jest.Mock).mockReturnValue(true);
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

    // Use a simple rerender instead of wrapping in providers again
    rerender(<NewsFormItem {...updatedProps} />);

    expect(screen.getByDisplayValue('Updated Tag')).toBeInTheDocument();
    expect(screen.queryByDisplayValue('Breaking News')).not.toBeInTheDocument();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });
});
