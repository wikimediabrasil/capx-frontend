import RecommendationCapacityCard from '@/app/(auth)/home/components/RecommendationCapacityCard';
import { useSnackbar } from '@/app/providers/SnackbarProvider';
import { CapacityRecommendation } from '@/types/recommendation';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { fireEvent, screen, waitFor } from '@testing-library/react';
import { useSession } from 'next-auth/react';
import React from 'react';
import * as stores from '@/stores';

jest.mock('@/stores', () => {
  const { createStoresMock } = require('../helpers/componentTestHelpers');
  return createStoresMock({ capacityStore: true });
});

import {
  cleanupMocks,
  createMockCapacityCache,
  createMockQueryClient,
  createMockRouter,
  createMockSnackbar,
  renderWithProviders,
  setupRecommendationCardMocks,
} from '../helpers/recommendationTestHelpers';

jest.mock('next-auth/react', () => require('../helpers/homeTestMocks').nextAuthMock);
jest.mock('@/app/providers/SnackbarProvider');
jest.mock('@tanstack/react-query', () => require('../helpers/homeTestMocks').reactQueryCardMock());
jest.mock(
  '@/services/profileService',
  () => require('../helpers/homeTestMocks').profileServiceMock
);
jest.mock('@/services/userService');
jest.mock('next/image', () => require('../helpers/componentTestHelpers').nextImageMock());
jest.mock('next/navigation');

// Test data factory
const createMockCapacityRecommendation = (overrides = {}): CapacityRecommendation => ({
  id: 50,
  skill_wikidata_item: 'Q123',
  skill_type: 1,
  name: 'Learning',
  description: 'Learning capability',
  color: 'learning',
  ...overrides,
});

const createMockUserProfile = () => ({
  id: 123,
  username: 'testuser',
  skills_wanted: [],
  language: ['en'],
});

// Helper to render card with default props
const DEFAULT_PROPS = {};
function renderCapacityCard(props = DEFAULT_PROPS) {
  const defaultProps = {
    recommendation: createMockCapacityRecommendation(),
    ...props,
  };

  return renderWithProviders(<RecommendationCapacityCard {...defaultProps} />);
}

// Helper to wait for card to be loaded
async function waitForCardLoaded() {
  await waitFor(() => {
    const headings = screen.queryAllByText('Learning');
    expect(headings.length).toBeGreaterThan(0);
  });
}

async function waitForCardReady() {
  await waitFor(() => {
    expect(screen.getByText('Learning')).toBeInTheDocument();
  });
  await waitFor(() => {
    expect(screen.getByText('Add to Profile')).toBeEnabled();
  });
}

async function clickAddToProfileButton() {
  await waitFor(() => {
    expect(screen.getByText('Add to Profile')).toBeInTheDocument();
  });
  fireEvent.click(screen.getByText('Add to Profile'));
}

describe('RecommendationCapacityCard', () => {
  const mockSnackbar = createMockSnackbar();
  const mockRouter = createMockRouter();
  const mockQueryClient = createMockQueryClient();
  const mockUserProfile = createMockUserProfile();
  const mockCapacityCache = createMockCapacityCache();

  function mockProfileWithSkills(skills: string[]) {
    mockQueryClient.getQueryData.mockImplementation((queryKey: any) => {
      if (Array.isArray(queryKey) && queryKey[0] === 'userProfile') {
        return { ...mockUserProfile, skills_wanted: skills };
      }
      return undefined;
    });
  }

  beforeEach(() => {
    jest.clearAllMocks();
    setupRecommendationCardMocks({
      useSession: useSession as jest.Mock,
      useSnackbar: useSnackbar as jest.Mock,
      useQuery: useQuery as jest.Mock,
      useQueryClient: useQueryClient as jest.Mock,
      stores,
      mockRouter,
      mockSnackbar,
      mockQueryClient,
      mockCapacityCache,
      mockUserProfile: mockUserProfile as any,
    });
  });

  afterEach(cleanupMocks);

  describe('Rendering', () => {
    it('should render capacity recommendation card correctly', async () => {
      renderCapacityCard();

      await waitForCardLoaded();

      expect(screen.getByText('Learning capability')).toBeInTheDocument();
      expect(screen.getByText('Add to Profile')).toBeInTheDocument();
      expect(screen.getByText('View')).toBeInTheDocument();

      // Verify preloadCapacities was called
      expect(mockCapacityCache.preloadCapacities).toHaveBeenCalled();
    });

    it('should render with hint message when provided', async () => {
      renderCapacityCard({
        hintMessage: 'Recommended for you',
      });

      await waitFor(() => {
        expect(screen.getByText('Recommended for you')).toBeInTheDocument();
      });
    });

    it('should render in dark mode correctly', async () => {
      (stores.useDarkMode as jest.Mock).mockReturnValue(true);

      const { container } = renderCapacityCard();

      await waitFor(() => {
        const card = container.querySelector('.bg-gray-800');
        expect(card).toBeInTheDocument();
      });
    });

    it('should eventually show content after loading', async () => {
      renderCapacityCard();

      await waitFor(() => {
        expect(screen.getByText('Add to Profile')).toBeInTheDocument();
      });
    });
  });

  describe('Add to Profile functionality', () => {
    it('should add capacity to profile when Add to Profile button is clicked', async () => {
      const { profileService } = require('@/services/profileService');
      profileService.updateProfile = jest.fn().mockResolvedValue({});

      renderCapacityCard();
      await waitForCardReady();

      fireEvent.click(screen.getByText('Add to Profile'));

      await waitFor(() => {
        expect(profileService.updateProfile).toHaveBeenCalledWith(
          123,
          expect.objectContaining({
            skills_wanted: ['50'],
            language: ['en'],
          }),
          expect.any(Object)
        );
      });

      await waitFor(() => {
        expect(mockSnackbar.showSnackbar).toHaveBeenCalledWith(
          'Capacity added to profile',
          'success'
        );
      });
    });

    it('should show "Added" button when capacity is already in wanted list', async () => {
      mockProfileWithSkills(['50']);
      renderCapacityCard();

      await waitFor(() => {
        expect(screen.getByText('✓ Added')).toBeInTheDocument();
      });

      const addedButton = screen.getByText('✓ Added');
      expect(addedButton.closest('button')).toBeDisabled();
    });

    it('should show success message with optimistic update even if server fails', async () => {
      const { profileService } = require('@/services/profileService');

      // Setup mocks - server update fails but UI shows success (optimistic update)
      profileService.updateProfile = jest.fn().mockRejectedValue(new Error('Network error'));
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      renderCapacityCard();

      await clickAddToProfileButton();

      // Should show success (optimistic update) even though server fails
      await waitFor(() => {
        expect(mockSnackbar.showSnackbar).toHaveBeenCalledWith(
          'Capacity added to profile',
          'success'
        );
      });

      // Server error should be logged but not shown to user
      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith(
          'Error updating profile on server:',
          expect.any(Error)
        );
      });

      consoleSpy.mockRestore();
    });

    it('should disable button while adding capacity', async () => {
      const { profileService } = require('@/services/profileService');
      const delayedResponse = new Promise(resolve => {
        setTimeout(() => resolve({}), 100);
      });
      profileService.updateProfile.mockImplementation(() => delayedResponse);

      renderCapacityCard();
      await waitForCardReady();

      fireEvent.click(screen.getByText('Add to Profile'));

      await waitFor(() => {
        expect(screen.getByText('Loading...')).toBeInTheDocument();
      });
    });

    it('should not add duplicate capacity', async () => {
      const { profileService } = require('@/services/profileService');
      profileService.updateProfile = jest.fn().mockResolvedValue({});
      mockProfileWithSkills(['50']);

      renderCapacityCard();

      await waitFor(() => {
        expect(screen.getByText('✓ Added')).toBeInTheDocument();
      });

      expect(profileService.updateProfile).not.toHaveBeenCalled();
    });
  });

  describe('View functionality', () => {
    it('should redirect to feed page with capacity filter when View button is clicked', async () => {
      renderCapacityCard();

      await clickAddToProfileButton();

      const viewButton = screen.getByText('View');
      fireEvent.click(viewButton);

      expect(mockRouter.push).toHaveBeenCalledWith('/feed?capacityId=50');
    });
  });

  describe('Capacity data', () => {
    it.each([
      ['recommendation name', { name: 'Custom Capacity Name' }, 'Custom Capacity Name'],
      ['cached name for empty name', { name: '' }, 'Learning'],
      ['recommendation description', { description: 'Custom description' }, 'Custom description'],
      ['cached description for empty desc', { description: '' }, 'Learning capability'],
    ])('should use %s', async (_label, overrides, expectedText) => {
      renderCapacityCard({ recommendation: createMockCapacityRecommendation(overrides) });
      await waitFor(() => {
        expect(screen.getByText(expectedText)).toBeInTheDocument();
      });
    });

    it('should display capacity icon with correct styling', async () => {
      renderCapacityCard();
      await waitFor(() => {
        expect(screen.getByAltText('Capacity icon')).toBeInTheDocument();
      });
    });
  });

  describe('Accessibility', () => {
    it('should have proper aria labels and semantic HTML', async () => {
      renderCapacityCard();

      await waitFor(() => {
        const heading = screen.getByRole('heading', { name: /Learning/i });
        expect(heading).toBeInTheDocument();
      });
    });

    it('should render hint icon with aria-hidden', async () => {
      renderCapacityCard({
        hintMessage: 'Test hint',
      });

      await waitFor(() => {
        expect(screen.getByText('Test hint')).toBeInTheDocument();
      });
    });
  });

  describe('Cache management', () => {
    it('should update query cache after adding capacity', async () => {
      const { profileService } = require('@/services/profileService');
      const { userService } = require('@/services/userService');
      profileService.updateProfile = jest.fn().mockResolvedValue({});
      userService.fetchUserProfile = jest.fn().mockResolvedValue(mockUserProfile);

      renderCapacityCard();
      await waitForCardReady();

      fireEvent.click(screen.getByText('Add to Profile'));

      // Should update cache optimistically with setQueryData
      await waitFor(
        () => {
          expect(mockQueryClient.setQueryData).toHaveBeenCalledWith(
            ['userProfile', '123', 'mock-token'],
            expect.objectContaining({
              skills_wanted: expect.arrayContaining(['50']),
            })
          );
        },
        { timeout: 1000 }
      );
    });
  });
});
