import { render, screen } from '@testing-library/react';
import MainSection from '@/components/MainSection';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { AppProvider } from '@/contexts/AppContext';
import * as stores from '@/stores';
import * as ThemeContext from '@/contexts/ThemeContext';
import { useSession } from 'next-auth/react';

// Mocks necessários
jest.mock('next-auth/react', () => ({
  useSession: jest.fn(),
}));

jest.mock('@/stores', () => ({
  ...jest.requireActual('@/stores'),
  useIsMobile: jest.fn(),
  usePageContent: jest.fn(),
}));

jest.mock('@/contexts/ThemeContext', () => ({
  ...jest.requireActual('@/contexts/ThemeContext'),
  useTheme: jest.fn(),
}));

describe('MainSection', () => {
  const mockPageContent = {
    'body-home-section01-title-template': 'Sebuah ruang untuk $1',
    'body-home-section01-title-carousel': 'saling tukar,berbagi,belajar',
    'body-home-section01-description':
      'Berhubung dengan rekan sejawat, belajar, dan berbagi keterampilan dalam platform yang dibuat untuk dan oleh Gerakan Wikimedia.',
    'body-home-section01-button': 'Bergabunglah dengan Capacity Exchange',
    'body-home-section01-about-button': 'Tentang CapX',
  };

  beforeEach(() => {
    (useSession as jest.Mock).mockReturnValue({
      data: null,
      status: 'unauthenticated',
    });

    (stores.useIsMobile as jest.Mock).mockReturnValue(false);
    (stores.usePageContent as jest.Mock).mockReturnValue(mockPageContent);

    (ThemeContext.useTheme as jest.Mock).mockReturnValue({
      darkMode: false,
    });
  });

  const renderWithProviders = (component: React.ReactNode) => {
    return render(
      <ThemeProvider>
        <AppProvider>{component}</AppProvider>
      </ThemeProvider>
    );
  };

  it('renders title without text overflow', () => {
    const { container } = renderWithProviders(<MainSection />);

    const titleContainer = screen.getByTestId('title-container');
    expect(titleContainer).toHaveClass('min-h-[176px]', 'mb-12');
    expect(titleContainer).toHaveClass('flex', 'flex-col');
  });

  it('renders description with proper line breaks', () => {
    renderWithProviders(<MainSection />);

    const description = screen.getByTestId('main-description');
    expect(description).toHaveClass('break-words');
    expect(description).toHaveClass('leading-[1.4]');
  });

  it('maintains layout structure with long text', () => {
    const longContent = {
      ...mockPageContent,
      'body-home-section01-title-template': 'Sebuah ruang untuk saling bertukar $1',
      'body-home-section01-description':
        'Berhubung dengan rekan sejawat, belajar, dan berbagi keterampilan dalam platform yang dibuat untuk dan oleh Gerakan Wikimedia. Kami mendorong kolaborasi dan pertukaran pengetahuan antar komunitas.',
    };

    (stores.useIsMobile as jest.Mock).mockReturnValue(false);
    (stores.usePageContent as jest.Mock).mockReturnValue(longContent);

    renderWithProviders(<MainSection />);

    const mainContent = screen.getByTestId('main-content');
    expect(mainContent).toBeInTheDocument();
    expect(mainContent).toHaveClass('w-2/3', 'pr-20');
  });

  it('renders mobile version with correct styles', () => {
    (stores.useIsMobile as jest.Mock).mockReturnValue(true);
    (stores.usePageContent as jest.Mock).mockReturnValue(mockPageContent);

    renderWithProviders(<MainSection />);

    const description = screen.getByText(mockPageContent['body-home-section01-description']);
    expect(description).toHaveClass('text-[12px]');
  });
});
