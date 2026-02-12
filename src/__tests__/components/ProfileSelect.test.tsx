import { render, screen, fireEvent } from '@testing-library/react';
import ProfileSelect from '@/components/ProfileSelect';
import { SessionProvider } from 'next-auth/react';
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
    jest.fn((selector?: any) => { const state = { isMobile: false, mobileMenuStatus: false, language: 'en', pageContent: {}, session: null, mounted: true, setMobileMenuStatus: jest.fn(), setLanguage: jest.fn(), setPageContent: jest.fn(), setSession: jest.fn(), setIsMobile: jest.fn(), hydrate: jest.fn() }; return selector ? selector(state) : state; }),
    { getState: () => ({ isMobile: false, mobileMenuStatus: false, language: 'en', pageContent: {}, session: null, mounted: true, setMobileMenuStatus: jest.fn(), setLanguage: jest.fn(), setPageContent: jest.fn(), setSession: jest.fn(), setIsMobile: jest.fn(), hydrate: jest.fn() }) }
  ),
}));

const pushMock = jest.fn();

// Mock do Next.js Router
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: pushMock,
      replace: () => jest.fn(),
      prefetch: () => jest.fn(),
      back: () => jest.fn(),
    };
  },
  usePathname() {
    return '/';
  },
  useSearchParams() {
    return new URLSearchParams();
  },
}));

// Mock next-auth
jest.mock('next-auth/react', () => ({
  useSession: () => ({
    data: {
      user: {
        id: '123',
        token: 'test-token',
        username: 'test-user',
        first_login: false,
        name: 'Test User',
        email: 'test@example.com',
        image: 'test-image.jpg',
      },
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    },
    status: 'authenticated',
  }),
  SessionProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

// Mock useOrganization hook
jest.mock('@/hooks/useOrganizationProfile', () => ({
  useOrganization: () => ({
    organizations: [],
    isOrgManager: false,
  }),
}));

const mockPageContent = {
  'navbar-link-profiles': 'My Profiles',
  'navbar-user-profile': 'User Profile',
};

// Mock AppContext

describe('ProfileSelect', () => {
  beforeEach(() => {
    (stores.usePageContent as jest.Mock).mockReturnValue(mockPageContent);
  });

  const renderWithProviders = (component: React.ReactNode) => {
    return render(
      <SessionProvider>
        {component}
      </SessionProvider>
    );
  };

  it('renders with default text correctly', () => {
    renderWithProviders(<ProfileSelect />);
    expect(screen.getByText('My Profiles')).toBeInTheDocument();
  });

  it('handles long text without breaking layout', () => {
    (stores.usePageContent as jest.Mock).mockReturnValue({
      ...mockPageContent,
      'navbar-link-profiles': 'Meine Profile und Einstellungen',
    });

    renderWithProviders(<ProfileSelect />);

    const selectContainer = screen.getByText('Meine Profile und Einstellungen');
    expect(selectContainer).toHaveClass('css-4yxo90-singleValue');

    const container = selectContainer.closest('.css-b62m3t-container');
    expect(container).toHaveClass('relative', 'w-[200px]');
  });

  it('supports RTL text direction', () => {
    (stores.usePageContent as jest.Mock).mockReturnValue({
      ...mockPageContent,
      'navbar-link-profiles': 'الملفات الشخصية',
    });

    renderWithProviders(<ProfileSelect />);
    expect(screen.getByText('الملفات الشخصية')).toBeInTheDocument();
  });

  it('maintains consistent height across different text lengths', () => {
    const { container } = renderWithProviders(<ProfileSelect />);

    const controlElement = container.querySelector('div[class*="flex"][class*="h-[64px]"]');
    expect(controlElement).toBeInTheDocument();
  });

  it('renders select component with correct role', () => {
    renderWithProviders(<ProfileSelect />);
    const select = screen.getByRole('combobox');
    expect(select).toBeInTheDocument();
  });

  it('applies theme styles correctly', () => {
    renderWithProviders(<ProfileSelect />);

    const selectValue = screen.getByText('My Profiles');
    expect(selectValue).toHaveClass('text-[24px]');

    const container = selectValue.closest('div[class*="container"]');
    expect(container).toHaveClass('text-[20px]');
  });

  it('renders without crashing', () => {
    renderWithProviders(<ProfileSelect />);

    // Check if the default text is present
    expect(screen.getByText('My Profiles')).toBeInTheDocument();
  });

  it('shows user profile option when clicked', () => {
    renderWithProviders(<ProfileSelect />);

    // Find the select container
    const selectContainer = screen.getByRole('combobox');
    fireEvent.mouseDown(selectContainer);

    // Find the profile option using the role 'option'
    const profileOption = screen.getByRole('option', { name: 'User Profile' });
    expect(profileOption).toBeInTheDocument();
  });

  it('handles profile selection correctly', () => {
    renderWithProviders(<ProfileSelect />);

    // Find and click on the select
    const selectContainer = screen.getByRole('combobox');
    fireEvent.mouseDown(selectContainer);

    // Find and click on the profile option
    const profileOption = screen.getByRole('option', { name: 'User Profile' });
    fireEvent.click(profileOption);

    // Check if the router.push was called with the correct path
    expect(pushMock).toHaveBeenCalledWith('/profile');
  });

  it('displays correct profile options', () => {
    renderWithProviders(<ProfileSelect />);

    const selectContainer = screen.getByRole('combobox');
    fireEvent.mouseDown(selectContainer);

    // Check if the correct options are present
    expect(screen.getByText('User Profile')).toBeInTheDocument();
    expect(screen.getByText('My Profiles')).toBeInTheDocument();
  });
});
