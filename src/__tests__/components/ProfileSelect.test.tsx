import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ProfileSelect from '@/components/ProfileSelect';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { AppProvider } from '@/contexts/AppContext';
import * as AppContext from '@/contexts/AppContext';
import { SessionProvider } from 'next-auth/react';

const pushMock = jest.fn();

// Mock do Next.js Router
jest.mock("next/navigation", () => ({
  useRouter() {
    return {
      push: pushMock,
      replace: () => jest.fn(),
      prefetch: () => jest.fn(),
      back: () => jest.fn(),
    };
  },
  usePathname() {
    return "/";
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
        id: "123",
        token: "test-token",
        username: "test-user",
        first_login: false,
        name: "Test User",
        email: "test@example.com",
        image: "test-image.jpg",
      },
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    },
    status: 'authenticated'
  }),
  SessionProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>
}));

// Mock useOrganization hook
jest.mock('@/hooks/useOrganizationProfile', () => ({
  useOrganization: () => ({
    organizations: [],
    isOrgManager: false
  })
}));

const mockPageContent = {
  'navbar-link-profiles': 'My Profiles',
  'navbar-user-profile': 'User Profile',
};

// Mock AppContext
jest.mock('@/contexts/AppContext', () => ({
  useApp: jest.fn(() => ({
    pageContent: mockPageContent,
    isMobile: false
  })),
  AppProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>
}));

jest.mock('@/contexts/ThemeContext', () => ({
  useTheme: jest.fn(() => ({
    darkMode: false,
    setDarkMode: jest.fn(),
    theme: {
      fontSize: {
        mobile: { base: '14px' },
        desktop: { base: '24px' }
      }
    },
    getFontSize: () => ({ mobile: '14px', desktop: '24px' }),
    getBackgroundColor: () => '#FFFFFF',
    getTextColor: () => '#000000'
  })),
  ThemeProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>
}));

describe('ProfileSelect', () => {
  beforeEach(() => {
    (AppContext.useApp as jest.Mock).mockReturnValue({
      pageContent: mockPageContent,
      isMobile: false
    });
  });

  const renderWithProviders = (component: React.ReactNode) => {
    return render(
      <SessionProvider>
        <AppProvider>
          <ThemeProvider>
            {component}
          </ThemeProvider>
        </AppProvider>
      </SessionProvider>
    );
  };

  it('renders with default text correctly', () => {
    renderWithProviders(<ProfileSelect />);
    expect(screen.getByText('My Profiles')).toBeInTheDocument();
  });

  it('handles long text without breaking layout', () => {
    (AppContext.useApp as jest.Mock).mockImplementation(() => ({
      pageContent: {
        'navbar-link-profiles': 'Meine Profile und Einstellungen',
        'navbar-user-profile': 'Benutzerprofil',
      },
      isMobile: false
    }));

    renderWithProviders(<ProfileSelect />);

    const selectContainer = screen.getByText('Meine Profile und Einstellungen');
    expect(selectContainer).toHaveClass('css-4yxo90-singleValue');
    
    const container = selectContainer.closest('.css-b62m3t-container');
    expect(container).toHaveClass('relative', 'w-[200px]');
  });

  it('supports RTL text direction', () => {
    (AppContext.useApp as jest.Mock).mockImplementation(() => ({
      pageContent: {
        'navbar-link-profiles': 'الملفات الشخصية',
        'navbar-user-profile': 'الملف الشخصي',
      },
      isMobile: false
    }));

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

  it('shows user profile option when clicked', async () => {
    renderWithProviders(<ProfileSelect />);
    
    // Find the select container
    const selectContainer = screen.getByRole('combobox');
    await userEvent.click(selectContainer);
    
    // Find the profile option using the role 'option'
    const profileOption = screen.getByRole('option', { name: 'User Profile' });
    expect(profileOption).toBeInTheDocument();
  });

  it('handles profile selection correctly', async () => {
    renderWithProviders(<ProfileSelect />);
    
    // Find and click on the select
    const selectContainer = screen.getByRole('combobox');
    await userEvent.click(selectContainer);
    
    // Find and click on the profile option
    const profileOption = screen.getByRole('option', { name: 'User Profile' });
    await userEvent.click(profileOption);
    
    // Check if the router.push was called with the correct path
    expect(pushMock).toHaveBeenCalledWith('/profile');
  });

  it('displays correct profile options', async () => {
    renderWithProviders(<ProfileSelect />);
    
    const selectContainer = screen.getByRole('combobox');
    await userEvent.click(selectContainer);
    
    // Check if the correct options are present
    expect(screen.getByText('User Profile')).toBeInTheDocument();
    expect(screen.getByText('My Profiles')).toBeInTheDocument();
  });
});
