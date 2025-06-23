import { render, screen, fireEvent } from '@testing-library/react';
import { ProfileCard } from '@/app/(auth)/feed/components/ProfileCard';
import { ProfileCapacityType } from '@/app/(auth)/feed/types';
import { LanguageProficiency } from '@/types/language';

// Mock the router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
  }),
  usePathname: () => '/feed',
  useSearchParams: () => new URLSearchParams(),
}));

// Mock the next/image component
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => <img {...props} alt={props.alt || ''} />,
}));

// Mock next-auth
jest.mock('next-auth/react', () => ({
  useSession: () => ({
    data: {
      user: {
        token: 'test-token',
      },
    },
    status: 'authenticated',
  }),
}));

// Mock the hooks
jest.mock('@/hooks/useCapacityDetails', () => ({
  useCapacityDetails: () => ({
    getCapacityName: (id: string) => id.toString(),
  }),
}));

jest.mock('@/hooks/useTerritories', () => ({
  useTerritories: () => ({
    territories: {
      '1': 'Brazil',
      '2': 'Argentina',
    },
  }),
}));

jest.mock('@/hooks/useLanguage', () => ({
  useLanguage: () => ({
    languages: {
      1: 'English',
      2: 'Portuguese',
      3: 'Spanish',
      4: 'French',
    },
  }),
}));

jest.mock('@/hooks/useAvatars', () => ({
  useAvatars: () => ({
    avatars: [],
  }),
}));

// Mock the contexts
jest.mock('@/contexts/ThemeContext', () => ({
  useTheme: () => ({ darkMode: false }),
  ThemeProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

const mockPageContent = {
  'empty-field': "You haven't filled this field yet",
  'body-profile-known-capacities-title': 'Known capacities',
  'body-profile-available-capacities-title': 'Available capacities',
  'body-profile-wanted-capacities-title': 'Wanted capacities',
  'body-profile-languages-title': 'Languages',
  'body-profile-section-title-territory': 'Territory',
  'body-profile-languages-alt-icon': 'Languages icon',
  'filters-search-by-capacities': 'Search by capacities',
};

jest.mock('@/contexts/AppContext', () => ({
  useApp: () => ({ pageContent: mockPageContent }),
  AppProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

const defaultProps = {
  id: '1',
  profile_image: '/path/to/image.jpg',
  username: 'Test User',
  type: ProfileCapacityType.Learner,
  capacities: [],
  languages: [] as LanguageProficiency[],
  territory: '1',
  isOrganization: false,
  isSaved: false,
  onToggleSaved: jest.fn(),
};

const learnerProps = {
  ...defaultProps,
  type: ProfileCapacityType.Learner,
  capacities: ['Coding', 'Design'],
  languages: [
    { id: 1, proficiency: 'Native' },
    { id: 2, proficiency: 'Native' },
  ] as LanguageProficiency[],
  territory: '1',
};

const sharerProps = {
  ...defaultProps,
  type: ProfileCapacityType.Sharer,
  capacities: ['Teaching', 'Mentoring'],
  languages: [
    { id: 3, proficiency: 'Native' },
    { id: 4, proficiency: 'Native' },
  ] as LanguageProficiency[],
  territory: '1',
};

describe('ProfileCard', () => {
  describe('Learner Profile', () => {
    it('should display profile information correctly', () => {
      render(<ProfileCard {...learnerProps} />);

      expect(screen.getByText('Test User')).toBeInTheDocument();
      expect(screen.getByText('learner')).toBeInTheDocument();
      expect(screen.getByAltText('Test User')).toBeInTheDocument();
    });

    it('should display wanted capacities for learner', () => {
      render(<ProfileCard {...learnerProps} />);

      expect(screen.getByText('Wanted capacities')).toBeInTheDocument();
      expect(screen.getByText('Coding')).toBeInTheDocument();
      expect(screen.getByText('Design')).toBeInTheDocument();
    });

    it('should display languages correctly', () => {
      render(<ProfileCard {...learnerProps} />);

      expect(screen.getByText('Languages')).toBeInTheDocument();
      expect(screen.getByText('English')).toBeInTheDocument();
      expect(screen.getByText('Portuguese')).toBeInTheDocument();
    });

    it('should display territory correctly', () => {
      render(<ProfileCard {...learnerProps} />);

      expect(screen.getByText('Territory')).toBeInTheDocument();
      expect(screen.getByText('Brazil')).toBeInTheDocument();
    });
  });

  describe('Sharer Profile', () => {
    it('should display profile information correctly', () => {
      render(<ProfileCard {...sharerProps} />);

      expect(screen.getByText('Test User')).toBeInTheDocument();
      expect(screen.getByText('sharer')).toBeInTheDocument();
    });

    it('should display available capacities for sharer', () => {
      render(<ProfileCard {...sharerProps} />);

      expect(screen.getByText('Available capacities')).toBeInTheDocument();
      expect(screen.getByText('Teaching')).toBeInTheDocument();
      expect(screen.getByText('Mentoring')).toBeInTheDocument();
    });

    it('should handle bookmark toggle', () => {
      const onToggleSaved = jest.fn();
      render(<ProfileCard {...sharerProps} onToggleSaved={onToggleSaved} />);

      const bookmarkButton = screen.getByLabelText('Salvar perfil');
      fireEvent.click(bookmarkButton);

      expect(onToggleSaved).toHaveBeenCalled();
    });
  });

  describe('Layout Structure', () => {
    it('should have correct grid layout', () => {
      const { container } = render(<ProfileCard {...defaultProps} />);

      const article = container.querySelector('[role="article"]');
      expect(article).toHaveClass('md:grid', 'md:grid-cols-[350px_1fr]', 'md:gap-8');
    });
  });
});
