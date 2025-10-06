import type { Meta, StoryObj } from '@storybook/react';
import { ProfileCard } from '@/app/(auth)/feed/components/ProfileCard';
import { ProfileCapacityType } from '@/app/(auth)/feed/types';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { AppProvider } from '@/contexts/AppContext';
import { CapacityCacheProvider } from '@/contexts/CapacityCacheContext';
import { SessionProvider } from 'next-auth/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false, gcTime: 0 },
  },
});

const meta: Meta<typeof ProfileCard> = {
  title: 'Components/ProfileCard',
  component: ProfileCard,
  decorators: [
    Story => (
      <AppProvider>
        <ThemeProvider>
          <QueryClientProvider client={queryClient}>
            <SessionProvider>
              <CapacityCacheProvider>
                <div className="max-w-[600px] mx-auto p-4">
                  <Story />
                </div>
              </CapacityCacheProvider>
            </SessionProvider>
          </QueryClientProvider>
        </ThemeProvider>
      </AppProvider>
    ),
  ],
  parameters: {
    layout: 'centered',
    nextjs: {
      appDirectory: true,
    },
  },
};

export default meta;
type Story = StoryObj<typeof ProfileCard>;

export const Learner: Story = {
  args: {
    id: '1',
    username: 'johndoe',
    profile_image: '',
    type: ProfileCapacityType.Learner,
    capacities: [10601, 10602, 10603],
    wantedCapacities: [10601, 10602],
    availableCapacities: [],
    languages: [],
    territory: '',
    avatar: undefined,
    isOrganization: false,
    isSaved: false,
  },
};

export const Sharer: Story = {
  args: {
    id: '2',
    username: 'janedoe',
    profile_image: '',
    type: ProfileCapacityType.Sharer,
    capacities: [3601, 3602],
    wantedCapacities: [],
    availableCapacities: [3601, 3602],
    languages: [],
    territory: '',
    avatar: undefined,
    isOrganization: false,
    isSaved: false,
  },
};

export const Unified: Story = {
  args: {
    id: '3',
    username: 'alex',
    profile_image: '',
    type: [ProfileCapacityType.Learner, ProfileCapacityType.Sharer],
    capacities: [10601, 3601],
    wantedCapacities: [10601],
    availableCapacities: [3601],
    languages: [],
    territory: '',
    avatar: undefined,
    isOrganization: false,
    isSaved: false,
  },
};

export const OrganizationUnified: Story = {
  args: {
    id: '10',
    username: 'Wikimedia Org',
    profile_image: '',
    type: [ProfileCapacityType.Learner, ProfileCapacityType.Sharer],
    capacities: [10601, 3601],
    wantedCapacities: [10601],
    availableCapacities: [3601],
    languages: [],
    territory: '',
    avatar: undefined,
    isOrganization: true,
    isSaved: false,
  },
};

export const WithProfileImage: Story = {
  args: {
    id: '4',
    username: 'userwithimage',
    profile_image: 'https://via.placeholder.com/200x200/4F46E5/FFFFFF?text=User',
    type: ProfileCapacityType.Learner,
    capacities: [10601],
    wantedCapacities: [10601],
    availableCapacities: [],
    languages: [],
    territory: '',
    avatar: undefined,
    isOrganization: false,
    isSaved: false,
  },
};

export const WithAvatar: Story = {
  args: {
    id: '5',
    username: 'userwithavatar',
    profile_image: '',
    type: ProfileCapacityType.Sharer,
    capacities: [3601],
    wantedCapacities: [],
    availableCapacities: [3601],
    languages: [],
    territory: '',
    avatar: '1',
    isOrganization: false,
    isSaved: false,
  },
};

export const SavedProfile: Story = {
  args: {
    id: '6',
    username: 'saveduser',
    profile_image: '',
    type: ProfileCapacityType.Learner,
    capacities: [10601],
    wantedCapacities: [10601],
    availableCapacities: [],
    languages: [],
    territory: '',
    avatar: undefined,
    isOrganization: false,
    isSaved: true,
  },
};

export const IncompleteProfile: Story = {
  args: {
    id: '7',
    username: 'incompleteuser',
    profile_image: '',
    type: ProfileCapacityType.Learner,
    capacities: [],
    wantedCapacities: [],
    availableCapacities: [],
    languages: [],
    territory: '',
    avatar: undefined,
    isOrganization: false,
    isSaved: false,
    hasIncompleteProfile: true,
  },
};

export const DarkMode: Story = {
  args: {
    id: '8',
    username: 'darkmodeuser',
    profile_image: '',
    type: ProfileCapacityType.Sharer,
    capacities: [3601],
    wantedCapacities: [],
    availableCapacities: [3601],
    languages: [],
    territory: '',
    avatar: undefined,
    isOrganization: false,
    isSaved: false,
  },
  parameters: {
    backgrounds: {
      default: 'dark',
      values: [{ name: 'dark', value: '#1a1a1a' }],
    },
  },
};

export const MobileView: Story = {
  args: {
    id: '9',
    username: 'mobileuser',
    profile_image: '',
    type: ProfileCapacityType.Learner,
    capacities: [10601],
    wantedCapacities: [10601],
    availableCapacities: [],
    languages: [],
    territory: '',
    avatar: undefined,
    isOrganization: false,
    isSaved: false,
  },
  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
  },
};
