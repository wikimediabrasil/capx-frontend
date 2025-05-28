import React from "react";
import { render, screen, waitFor, act } from "@testing-library/react";
import LanguageSelect from "@/components/LanguageSelect";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { AppProvider } from "@/contexts/AppContext";
import * as ThemeContext from "@/contexts/ThemeContext";
import { useLanguageSelection } from "@/hooks/useLanguageSelection";
import { setCookie } from "@/app/actions";

// React-select's mock
jest.mock("react-select", () => ({
  __esModule: true,
  default: jest.fn(({ onChange, options, value }) => {
    // Simulate the react-select behavior
    React.useEffect(() => {
      // Call onChange automatically for the test
      if (options && options.length > 0) {
        setTimeout(() => {
          onChange(options[0]);
        }, 0);
      }
    }, [options, onChange]);

    return (
      <div data-testid="mock-select">
        <button
          data-testid="select-button"
          onClick={() => onChange(options[0])}
        >
          {value ? value.label : "Select"}
        </button>
        <div data-testid="options">
          {options.map((option: any) => (
            <div key={option.value}>{option.label}</div>
          ))}
        </div>
      </div>
    );
  }),
}));

// Hook useLanguageSelection's mock
jest.mock("@/hooks/useLanguageSelection", () => ({
  useLanguageSelection: jest.fn(),
}));

// useTheme's mock
jest.mock("@/contexts/ThemeContext", () => ({
  ...jest.requireActual("@/contexts/ThemeContext"),
  useTheme: jest.fn().mockReturnValue({
    darkMode: false,
    setDarkMode: jest.fn(),
  }),
}));

// setCookie's mock
jest.mock("@/app/actions", () => ({
  setCookie: jest.fn().mockResolvedValue(undefined),
}));

const mockSetPageContent = jest.fn();

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
    setPageContent: mockSetPageContent,
    isLoading: false,
    setIsLoading: jest.fn(),
    isMenuOpen: false,
    setIsMenuOpen: jest.fn(),
  }),
}));

describe("LanguageSelect", () => {
  const mockSetLanguage = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    (useLanguageSelection as jest.Mock).mockReturnValue({
      fetchLanguages: jest.fn().mockResolvedValue([
        { value: "pt-BR", label: "pt-BR" },
        { value: "en", label: "en" },
        { value: "es", label: "es" },
      ]),
      fetchTranslations: jest.fn().mockResolvedValue({
        "language-select-pt": "Português",
        "language-select-en": "English",
        "language-select-es": "Español",
        "aria-language-input": "Select language",
      }),
      isLoading: false,
      error: null,
    });

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

  test("deve renderizar o componente corretamente", async () => {
    renderWithProviders(
      <LanguageSelect
        language="en"
        setLanguage={mockSetLanguage}
        isMobile={false}
      />
    );

    // Wait for the options to load
    await waitFor(() => {
      expect(useLanguageSelection().fetchLanguages).toHaveBeenCalled();
    });

    expect(screen.getByTestId("mock-select")).toBeInTheDocument();
  });

  test("deve chamar fetchTranslations quando o idioma muda", async () => {
    const fetchLanguagesMock = jest.fn().mockResolvedValue([
      { value: "pt-BR", label: "pt-BR" },
      { value: "en", label: "en" },
      { value: "es", label: "es" },
    ]);

    const fetchTranslationsMock = jest.fn().mockResolvedValue({
      "language-select-pt": "Português",
      "language-select-en": "English",
      "language-select-es": "Español",
      "aria-language-input": "Select language",
    });

    (useLanguageSelection as jest.Mock).mockReturnValue({
      fetchLanguages: fetchLanguagesMock,
      fetchTranslations: fetchTranslationsMock,
      isLoading: false,
      error: null,
    });

    renderWithProviders(
      <LanguageSelect
        language="en"
        setLanguage={mockSetLanguage}
        isMobile={false}
      />
    );

    await waitFor(() => {
      expect(fetchTranslationsMock).toHaveBeenCalledWith("en");
    });
  });

  test("deve chamar setLanguage quando uma opção é selecionada", async () => {
    // Clear the mocks before the test
    mockSetLanguage.mockClear();
    (setCookie as jest.Mock).mockClear();

    renderWithProviders(
      <LanguageSelect
        language="en"
        setLanguage={mockSetLanguage}
        isMobile={false}
      />
    );

    // Wait for the asynchronous effect that calls onChange
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 100));
    });

    // Check if setLanguage was called with the correct value
    await waitFor(() => {
      expect(mockSetLanguage).toHaveBeenCalledWith("pt-BR");
    });

    // Check if setCookie was called
    await waitFor(() => {
      expect(setCookie).toHaveBeenCalled();
    });
  });

  test("deve lidar com o caso em que language é undefined", async () => {
    renderWithProviders(
      <LanguageSelect
        language={undefined as any}
        setLanguage={mockSetLanguage}
        isMobile={false}
      />
    );

    await waitFor(() => {
      // Should use 'en' as fallback
      expect(useLanguageSelection().fetchTranslations).toHaveBeenCalledWith(
        "en"
      );
    });
  });
});
