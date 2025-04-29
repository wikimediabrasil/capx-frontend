import { render, screen } from "@testing-library/react";
import MobileMenu from "../../components/MobileMenu";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { AppProvider } from "@/contexts/AppContext";
import * as ThemeContext from "@/contexts/ThemeContext";
import { Session } from "next-auth";

// Mocking the Next.js Router
jest.mock("next/navigation", () => ({
  useRouter() {
    return {
      push: () => jest.fn(),
      replace: () => jest.fn(),
      prefetch: () => jest.fn(),
      back: () => jest.fn(),
    };
  },
  usePathname() {
    return "/";
  },
  useParams() {
    return {};
  },
  useSearchParams() {
    return new URLSearchParams();
  },
}));

// Mocking AppContext
jest.mock("@/contexts/AppContext", () => ({
  ...jest.requireActual("@/contexts/AppContext"),
  useApp: () => ({
    pageContent: {
      "sign-in-button": "Login",
      "sign-out-button": "Logout",
      "navbar-link-home": "Home",
      "navbar-link-capacities": "Capacities",
      "navbar-link-reports": "Reports",
      "navbar-link-feed": "Feed",
      "navbar-link-saved": "Saved",
      "navbar-link-report-bug": "Report Bug",
    },
    isMobile: true,
    mobileMenuStatus: true,
    setMobileMenuStatus: jest.fn(),
    language: "en",
    setLanguage: jest.fn(),
    darkMode: false,
    setDarkMode: jest.fn(),
    session: null,
    setSession: jest.fn(),
    setPageContent: jest.fn(),
    isLoading: false,
    setIsLoading: jest.fn(),
    isMenuOpen: false,
    setIsMenuOpen: jest.fn()
  }),
}));

//  Mocking the useTheme hook
jest.mock("@/contexts/ThemeContext", () => ({
  ...jest.requireActual("@/contexts/ThemeContext"),
  useTheme: jest.fn(),
}));

const validSession: Session = {
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
};

describe("MobileMenu", () => {
  beforeEach(() => {
    // Standard configuration for useTheme
    (ThemeContext.useTheme as jest.Mock).mockReturnValue({
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

  it("renders sign in button when not logged in", () => {
    renderWithProviders(
      <MobileMenu session={null} />
    );

    expect(screen.getByText("Login")).toBeInTheDocument();
  });

  it("renders sign out button when logged in", () => {
    renderWithProviders(
      <MobileMenu session={validSession} />
    );

    expect(screen.getByText("Logout")).toBeInTheDocument();
  });

  it("applies dark mode styles", () => {
    (ThemeContext.useTheme as jest.Mock).mockReturnValue({
      darkMode: true,
      setDarkMode: jest.fn(),
    });

    const { container } = renderWithProviders(
      <MobileMenu session={null} />
    );

    const menuDiv = container.firstChild;
    expect(menuDiv).toHaveClass("bg-capx-dark-box-bg");
    expect(menuDiv).toHaveClass("text-capx-light-bg");
  });

  it("applies light mode styles", () => {
    (ThemeContext.useTheme as jest.Mock).mockReturnValue({
      darkMode: false,
      setDarkMode: jest.fn(),
    });

    const { container } = renderWithProviders(
      <MobileMenu session={null} />
    );

    const menuDiv = container.firstChild;
    expect(menuDiv).toHaveClass("bg-capx-light-bg");
    expect(menuDiv).toHaveClass("text-capx-dark-bg");
  });

  // Clean up the mocks after each test
  afterEach(() => {
    jest.clearAllMocks();
  });
});
