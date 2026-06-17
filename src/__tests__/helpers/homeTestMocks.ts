/**
 * Shared mock implementations for home page component tests.
 *
 * Because jest.mock() is hoisted, use require() to pull these in:
 *   jest.mock('@/hooks/useProfile', () => require('../helpers/homeTestMocks').useProfileMock);
 */

export const useProfileMock = {
  useProfile: jest.fn(() => ({ profile: null, isLoading: false })),
};

export const useRecommendationsMock = {
  useRecommendations: jest.fn(() => ({ data: null, isLoading: false, error: null })),
};

export const useUserCapacitiesMock = {
  useUserCapacities: jest.fn(() => ({
    userKnownCapacities: [],
    userAvailableCapacities: [],
    userWantedCapacities: [],
  })),
};

export const useStatisticsMock = {
  useStatistics: jest.fn(() => ({ data: null, isLoading: false })),
};

export const useTerritoriesMock = {
  useTerritories: jest.fn(() => ({ territoriesMap: {}, loading: false })),
};

export const useOrganizationDisplayNameMock = {
  useOrganizationDisplayName: jest.fn(() => ({ displayName: '' })),
};

export const useProfileImageMock = {
  useProfileImage: jest.fn(() => ({ profileImageUrl: null })),
};

export const useSavedItemsMock = {
  useSavedItems: jest.fn(() => ({
    savedItems: [],
    createSavedItem: jest.fn(),
    deleteSavedItem: jest.fn(),
  })),
};

export const snackbarProviderMock = {
  useSnackbar: jest.fn(() => ({ showSnackbar: jest.fn() })),
};

export function reactQueryMock() {
  return {
    ...jest.requireActual('@tanstack/react-query'),
    useQuery: jest.fn(() => ({ data: null, isLoading: false })),
    useQueryClient: jest.fn(() => ({
      getQueryData: jest.fn(() => null),
      setQueryData: jest.fn(),
      invalidateQueries: jest.fn(),
    })),
  };
}

export const userServiceMock = {
  userService: { fetchUserProfile: jest.fn() },
};

export const profileServiceMock = {
  profileService: { updateProfile: jest.fn() },
};

export const nextAuthMock = {
  useSession: jest.fn(),
};

export function reactQueryCardMock() {
  return {
    ...jest.requireActual('@tanstack/react-query'),
    useQuery: jest.fn(),
    useQueryClient: jest.fn(),
  };
}
