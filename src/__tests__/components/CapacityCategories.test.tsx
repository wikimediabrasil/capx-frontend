import CapacityCategories from '@/app/(auth)/capacity/components/CapacityCategories';
import { useRootCapacities } from '@/hooks/useCapacitiesQuery';
import { useUserCapacities } from '@/hooks/useUserCapacities';
import { profileService } from '@/services/profileService';
import { useCapacityStore, useIsMobile } from '@/stores';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { useSession } from 'next-auth/react';
import React from 'react';

jest.mock('@/stores', () => ({
  ...jest.requireActual('@/stores'),
  useDarkMode: jest.fn(() => false),
  useIsMobile: jest.fn(() => false),
  usePageContent: jest.fn(() => ({})),
  useLanguage: jest.fn(() => 'en'),
  useCapacityStore: Object.assign(
    jest.fn(() => ({
      capacities: {},
      children: {},
      language: 'en',
      isLoaded: true,
      getName: jest.fn(() => ''),
      getDescription: jest.fn(() => 'Test capacity description'),
      getWdCode: jest.fn(() => 'Q12345'),
      getMetabaseCode: jest.fn(() => 'M9001'),
      getIcon: jest.fn(() => null),
      getRootCapacities: jest.fn(() => []),
    })),
    {
      getState: () => ({
        capacities: {},
        isLoaded: true,
      }),
    }
  ),
}));

jest.mock('@/hooks/useCapacitiesQuery', () => ({
  useRootCapacities: jest.fn(() => ({ data: [] })),
}));

jest.mock('@/hooks/useUserCapacities', () => ({
  useUserCapacities: jest.fn(() => ({
    userKnownCapacities: [],
    userAvailableCapacities: [],
    userWantedCapacities: [],
  })),
}));

jest.mock('next-auth/react', () => ({
  useSession: jest.fn(() => ({
    data: { user: { id: '123', token: 'test-token' } },
    status: 'authenticated',
  })),
}));

jest.mock('@/app/providers/SnackbarProvider', () => ({
  useSnackbar: jest.fn(() => ({ showSnackbar: jest.fn() })),
}));

jest.mock('@/services/userService', () => ({
  userService: {
    fetchUserProfile: jest.fn(() =>
      Promise.resolve({
        id: 123,
        skills_known: [],
        skills_available: [],
        skills_wanted: [],
        language: ['en'],
      })
    ),
  },
}));

jest.mock('@/services/profileService', () => ({
  profileService: {
    updateProfile: jest.fn(() => Promise.resolve({})),
  },
}));

jest.mock('@/lib/utils/stringUtils', () => ({
  capitalizeFirstLetter: (str: string) => str.charAt(0).toUpperCase() + str.slice(1),
}));

const mockQueryClient = {
  getQueryData: jest.fn(() => null),
  setQueryData: jest.fn(),
  invalidateQueries: jest.fn(),
};

jest.mock('@tanstack/react-query', () => ({
  useQuery: jest.fn(() => ({
    data: {
      id: 123,
      skills_known: [],
      skills_available: [],
      skills_wanted: [],
      language: ['en'],
    },
    isLoading: false,
    isError: false,
  })),
  useQueryClient: jest.fn(() => mockQueryClient),
}));

const mockRootCapacities = [
  { code: 1, name: 'Translation', category: 'communication', icon: null },
  { code: 2, name: 'Social Media', category: 'social', icon: null },
  { code: 3, name: 'Knowledge Management', category: 'organizational', icon: null },
  { code: 4, name: 'E-Learning', category: 'technology', icon: null },
];

describe('CapacityCategories', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useRootCapacities as jest.Mock).mockReturnValue({ data: [] });
    (useIsMobile as jest.Mock).mockReturnValue(false);
    (useCapacityStore as unknown as jest.Mock).mockReturnValue({
      getName: jest.fn(() => ''),
      getDescription: jest.fn(() => 'Test capacity description'),
      getWdCode: jest.fn(() => 'Q12345'),
      getMetabaseCode: jest.fn(() => 'M9001'),
      getIcon: jest.fn(() => null),
    });
    (useSession as jest.Mock).mockReturnValue({
      data: { user: { id: '123', token: 'test-token' } },
      status: 'authenticated',
    });
    (useUserCapacities as jest.Mock).mockReturnValue({
      userKnownCapacities: [],
      userAvailableCapacities: [],
      userWantedCapacities: [],
    });
  });

  describe('main component', () => {
    it('renders all three thematic category cards', () => {
      render(<CapacityCategories />);

      expect(screen.getByText('Linguistic Equity')).toBeInTheDocument();
      expect(screen.getByText('Knowledge gaps')).toBeInTheDocument();
      expect(screen.getByText('Open education')).toBeInTheDocument();
    });

    it('renders category descriptions', () => {
      render(<CapacityCategories />);

      expect(screen.getByText('Language Diversity Hub')).toBeInTheDocument();
      expect(screen.getByText('WikiCamp, Week Club, Education')).toBeInTheDocument();
    });

    it('filters capacities into the correct thematic card', () => {
      (useRootCapacities as jest.Mock).mockReturnValue({ data: mockRootCapacities });
      render(<CapacityCategories />);

      // 'communication' and 'social' categories → Linguistic Equity
      expect(screen.getByText('Translation')).toBeInTheDocument();
      expect(screen.getByText('Social Media')).toBeInTheDocument();

      // 'technology' category → Open education
      expect(screen.getByText('E-Learning')).toBeInTheDocument();
    });

    it('shows correct capacity count per category', () => {
      (useRootCapacities as jest.Mock).mockReturnValue({ data: mockRootCapacities });
      render(<CapacityCategories />);

      // Linguistic Equity: 2 capacities (translation + social media)
      expect(screen.getByText('2 specialized capacities')).toBeInTheDocument();
    });

    it('shows singular "capacity" for a single match', () => {
      (useRootCapacities as jest.Mock).mockReturnValue({
        data: [{ code: 1, name: 'Translation', category: 'communication', icon: null }],
      });
      render(<CapacityCategories />);

      expect(screen.getByText('1 specialized capacity')).toBeInTheDocument();
    });
  });

  describe('desktop layout (isMobile: false)', () => {
    it('chips are always visible without expanding', () => {
      (useRootCapacities as jest.Mock).mockReturnValue({ data: mockRootCapacities });
      render(<CapacityCategories />);

      expect(screen.getByText('Translation')).toBeInTheDocument();
    });

    it('shows "No capacities found" message for empty categories', () => {
      render(<CapacityCategories />);

      const noCapacitiesMessages = screen.getAllByText('No capacities found for this category.');
      expect(noCapacitiesMessages.length).toBeGreaterThan(0);
    });

    it('shows capacity info panel when a chip is clicked', () => {
      (useRootCapacities as jest.Mock).mockReturnValue({ data: mockRootCapacities });
      render(<CapacityCategories />);

      fireEvent.click(screen.getByText('Translation'));

      expect(screen.getByText('Add to Known')).toBeInTheDocument();
      expect(screen.getByText('Add to Wanted')).toBeInTheDocument();
    });

    it('hides info panel when the same chip is clicked again', () => {
      (useRootCapacities as jest.Mock).mockReturnValue({ data: mockRootCapacities });
      render(<CapacityCategories />);

      fireEvent.click(screen.getByText('Translation'));
      expect(screen.getByText('Add to Known')).toBeInTheDocument();

      // Click the chip (first occurrence) to deselect
      fireEvent.click(screen.getAllByText('Translation')[0]);
      expect(screen.queryByText('Add to Known')).not.toBeInTheDocument();
    });

    it('closes info panel when close button is clicked', () => {
      (useRootCapacities as jest.Mock).mockReturnValue({ data: mockRootCapacities });
      render(<CapacityCategories />);

      fireEvent.click(screen.getByText('Translation'));
      expect(screen.getByText('Add to Known')).toBeInTheDocument();

      fireEvent.click(screen.getByLabelText('Close'));
      expect(screen.queryByText('Add to Known')).not.toBeInTheDocument();
    });

    it('switches info panel when a different chip is clicked', () => {
      (useRootCapacities as jest.Mock).mockReturnValue({ data: mockRootCapacities });
      (useCapacityStore as unknown as jest.Mock).mockReturnValue({
        getName: jest.fn(() => ''),
        getDescription: jest.fn(code => (code === 1 ? 'Translation desc' : 'Social desc')),
        getWdCode: jest.fn(() => ''),
        getMetabaseCode: jest.fn(() => ''),
        getIcon: jest.fn(() => null),
      });
      render(<CapacityCategories />);

      fireEvent.click(screen.getByText('Translation'));
      expect(screen.getByText('Translation desc')).toBeInTheDocument();

      fireEvent.click(screen.getByText('Social Media'));
      expect(screen.queryByText('Translation desc')).not.toBeInTheDocument();
      expect(screen.getByText('Social desc')).toBeInTheDocument();
    });
  });

  describe('mobile layout (isMobile: true)', () => {
    beforeEach(() => {
      (useIsMobile as jest.Mock).mockReturnValue(true);
    });

    it('renders category cards collapsed by default', () => {
      (useRootCapacities as jest.Mock).mockReturnValue({ data: mockRootCapacities });
      render(<CapacityCategories />);

      // Chips should not be visible before expanding
      expect(screen.queryByRole('button', { name: /Translation/i })).not.toBeInTheDocument();
    });

    it('expands a category card when its header is clicked', () => {
      (useRootCapacities as jest.Mock).mockReturnValue({ data: mockRootCapacities });
      render(<CapacityCategories />);

      const expandableButtons = screen
        .getAllByRole('button')
        .filter(btn => btn.getAttribute('aria-expanded') !== null);

      // Click the first expandable button (Linguistic Equity)
      fireEvent.click(expandableButtons[0]);

      expect(screen.getByText('Translation')).toBeInTheDocument();
    });

    it('collapses an expanded category card when clicked again', () => {
      (useRootCapacities as jest.Mock).mockReturnValue({ data: mockRootCapacities });
      render(<CapacityCategories />);

      const expandableButtons = screen
        .getAllByRole('button')
        .filter(btn => btn.getAttribute('aria-expanded') !== null);

      fireEvent.click(expandableButtons[0]);
      expect(screen.getByText('Translation')).toBeInTheDocument();

      fireEvent.click(expandableButtons[0]);
      expect(screen.queryByRole('button', { name: /Translation/i })).not.toBeInTheDocument();
    });

    it('shows capacity info panel after expanding and clicking a chip', () => {
      (useRootCapacities as jest.Mock).mockReturnValue({ data: mockRootCapacities });
      render(<CapacityCategories />);

      const expandableButtons = screen
        .getAllByRole('button')
        .filter(btn => btn.getAttribute('aria-expanded') !== null);

      fireEvent.click(expandableButtons[0]);
      fireEvent.click(screen.getByText('Translation'));

      expect(screen.getByText('Add to Known')).toBeInTheDocument();
    });
  });

  describe('CapacityInfoPanel', () => {
    const openTranslationPanel = () => {
      (useRootCapacities as jest.Mock).mockReturnValue({ data: mockRootCapacities });
      render(<CapacityCategories />);
      fireEvent.click(screen.getByText('Translation'));
    };

    it('displays the capacity name in the panel header', () => {
      openTranslationPanel();
      // The capacity name appears as a heading in the panel
      const nameElements = screen.getAllByText('Translation');
      expect(nameElements.length).toBeGreaterThanOrEqual(2); // chip + panel header
    });

    it('displays the capacity description', () => {
      openTranslationPanel();
      expect(screen.getByText('Test capacity description')).toBeInTheDocument();
    });

    it('displays the Wikidata link when wd_code is available', () => {
      openTranslationPanel();
      expect(screen.getByText('Q12345')).toBeInTheDocument();
    });

    it('displays the Metabase link when metabase_code is available', () => {
      openTranslationPanel();
      expect(screen.getByText('M9001')).toBeInTheDocument();
    });

    it('does not show Wikidata link when wd_code is empty', () => {
      (useCapacityStore as unknown as jest.Mock).mockReturnValue({
        getName: jest.fn(() => ''),
        getDescription: jest.fn(() => 'Test capacity description'),
        getWdCode: jest.fn(() => ''),
        getMetabaseCode: jest.fn(() => 'M9001'),
        getIcon: jest.fn(() => null),
      });
      openTranslationPanel();
      expect(screen.queryByText('Q12345')).not.toBeInTheDocument();
    });

    it('calls updateProfile when "Add to Known" is clicked', async () => {
      openTranslationPanel();

      fireEvent.click(screen.getByText('Add to Known'));

      await waitFor(() => {
        expect(profileService.updateProfile).toHaveBeenCalled();
      });
    });

    it('calls updateProfile when "Add to Wanted" is clicked', async () => {
      openTranslationPanel();

      fireEvent.click(screen.getByText('Add to Wanted'));

      await waitFor(() => {
        expect(profileService.updateProfile).toHaveBeenCalled();
      });
    });

    it('optimistically updates the query cache when adding to known', async () => {
      openTranslationPanel();

      fireEvent.click(screen.getByText('Add to Known'));

      await waitFor(() => {
        expect(mockQueryClient.setQueryData).toHaveBeenCalled();
      });
    });

    it('shows "Added to Known" state when capacity is already in known list', () => {
      (useUserCapacities as jest.Mock).mockReturnValue({
        userKnownCapacities: [1],
        userAvailableCapacities: [1],
        userWantedCapacities: [],
      });
      openTranslationPanel();

      expect(screen.getByText(/Added to Known/)).toBeInTheDocument();
    });

    it('shows "Added to Wanted" state when capacity is already in wanted list', () => {
      (useUserCapacities as jest.Mock).mockReturnValue({
        userKnownCapacities: [],
        userAvailableCapacities: [],
        userWantedCapacities: [1],
      });
      openTranslationPanel();

      expect(screen.getByText(/Added to Wanted/)).toBeInTheDocument();
    });

    it('does not call updateProfile when capacity is already added to known', async () => {
      (useUserCapacities as jest.Mock).mockReturnValue({
        userKnownCapacities: [1],
        userAvailableCapacities: [1],
        userWantedCapacities: [],
      });
      openTranslationPanel();

      // "Add to Known" button should be disabled; click should not call updateProfile
      const addedButton = screen.getByText(/Added to Known/);
      fireEvent.click(addedButton.closest('button') || addedButton);

      await waitFor(() => {
        expect(profileService.updateProfile).not.toHaveBeenCalled();
      });
    });

    it('shows profile info notice', () => {
      openTranslationPanel();
      expect(
        screen.getByText(/This will be added to your personal profile/i)
      ).toBeInTheDocument();
    });
  });
});
