import { render, screen, fireEvent } from "@testing-library/react";
import MobileMenuLinks from "../../components/MobileMenuLinks";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { AppProvider } from "@/contexts/AppContext";
import * as ThemeContext from "@/contexts/ThemeContext";
import { useOrganization } from "@/hooks/useOrganizationProfile";
import { Session } from "next-auth";

// Next.js Router's mock
jest.mock("next/navigation", () => ({
  useRouter() {
    return {
      push: () => jest.fn(),
      replace: () => jest.fn(),
      prefetch: () => jest.fn(),
      back: () => jest.fn(),
    };
  },
  usePathname: () => "/",
  useParams: () => ({ organizationId: "1" }),
  useSearchParams: () => new URLSearchParams()
}));

// useTheme's mock
jest.mock("@/contexts/ThemeContext", () => ({
  ...jest.requireActual("@/contexts/ThemeContext"),
  useTheme: jest.fn().mockReturnValue({
    darkMode: false,
    setDarkMode: jest.fn(),
  }),
}));

// useOrganization's mock
jest.mock("@/hooks/useOrganizationProfile", () => ({
  useOrganization: jest.fn(),
}));

const mockPageContent = {
  "sign-in-button": "Login",
  "sign-out-button": "Logout",
  "navbar-link-home": "Home",
  "navbar-link-capacities": "Capacities",
  "navbar-link-reports": "Reports",
  "navbar-link-feed": "Feed",
  "navbar-link-saved": "Saved",
  "navbar-link-report-bug": "Report Bug",
  "navbar-link-dark-mode": "Dark Mode",
  "navbar-link-profiles": "My Profiles",
  "navbar-link-organization-profile": "Organization Profile",
  "navbar-user-profile": "User Profile",
};

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

// Mocking AppContext
jest.mock("@/contexts/AppContext", () => ({
  ...jest.requireActual("@/contexts/AppContext"),
  useApp: () => ({
    pageContent: mockPageContent,
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

describe("MobileMenuLinks", () => {
  beforeEach(() => {
    (ThemeContext.useTheme as jest.Mock).mockReturnValue({
      darkMode: false,
      setDarkMode: jest.fn(),
    });
    (useOrganization as jest.Mock).mockReturnValue({
      organizations: [
        { id: 1, display_name: "Org 1" },
        { id: 2, display_name: "Org 2" },
      ],
      isOrgManager: true,
    });

    // Ensure that the useParams hook returns the correct organizationId
    jest.spyOn(require("next/navigation"), "useParams").mockReturnValue({ 
      organizationId: "1" 
    });
  });

  const renderWithProviders = (component: React.ReactNode) => {
    return render(
      <ThemeProvider>
        <AppProvider>{component}</AppProvider>
      </ThemeProvider>
    );
  };

  it("renders menu links when logged in", () => {
    const handleMenuStatus = jest.fn();

    renderWithProviders(
      <MobileMenuLinks
        session={validSession}
        handleMenuStatus={handleMenuStatus}
      />
    );

    expect(screen.getByText("Home")).toBeInTheDocument();
    expect(screen.getByText("Dark Mode")).toBeInTheDocument();
    expect(screen.getByText("My Profiles")).toBeInTheDocument();
  });

  it("calls handleMenuStatus when a link is clicked", () => {
    const handleMenuStatus = jest.fn();

    renderWithProviders(
      <MobileMenuLinks
        session={validSession}
        handleMenuStatus={handleMenuStatus}
      />
    );

    const homeLink = screen.getByText("Home");
    fireEvent.click(homeLink);

    expect(handleMenuStatus).toHaveBeenCalled();
  });

  it("applies dark mode styles", () => {
    (ThemeContext.useTheme as jest.Mock).mockReturnValue({
      darkMode: true,
      setDarkMode: jest.fn(),
    });

    renderWithProviders(
      <MobileMenuLinks
        session={validSession}
        handleMenuStatus={() => {}}
      />
    );

    const links = screen.getAllByRole("link");
    links.forEach((link) => {
      expect(link).toHaveClass("text-capx-light-bg");
    });
  });

  it("renders organization profiles for org managers", async () => {
    renderWithProviders(
      <MobileMenuLinks
        session={validSession}
        handleMenuStatus={jest.fn()}
      />
    );

    const profilesButton = screen.getByText("My Profiles");
    fireEvent.click(profilesButton);

    expect(screen.getByText("Org 1")).toBeInTheDocument();
    expect(screen.getByText("Org 2")).toBeInTheDocument();
  });

  it("navigates to correct organization profile", () => {
    const handleMenuStatus = jest.fn();

    renderWithProviders(
      <MobileMenuLinks
        session={validSession}
        handleMenuStatus={handleMenuStatus}
      />
    );

    const profilesButton = screen.getByText("My Profiles");
    fireEvent.click(profilesButton);

    const org1Button = screen.getByText("Org 1");
    fireEvent.click(org1Button);

    expect(handleMenuStatus).toHaveBeenCalled();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });
});
