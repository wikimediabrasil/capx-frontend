import {
  ProfileCapacityType,
  createProfilesFromOrganizations,
  createProfilesFromUsers,
  createUnifiedProfiles,
} from '@/app/(auth)/feed/types';

describe('feed/types', () => {
  describe('ProfileCapacityType', () => {
    it('has correct enum values', () => {
      expect(ProfileCapacityType.Learner).toBe('learner');
      expect(ProfileCapacityType.Sharer).toBe('sharer');
      expect(ProfileCapacityType.Known).toBe('known');
      expect(ProfileCapacityType.Incomplete).toBe('incomplete');
    });
  });

  describe('createProfilesFromOrganizations', () => {
    const mockOrgs = [
      {
        id: 1,
        display_name: 'Org A',
        wanted_capacities: [10, 20],
        available_capacities: [30],
        profile_image: 'img.png',
        territory: ['18'],
      },
    ] as any[];

    it('creates learner profiles with wanted_capacities', () => {
      const profiles = createProfilesFromOrganizations(mockOrgs, ProfileCapacityType.Learner);
      expect(profiles).toHaveLength(1);
      expect(profiles[0].capacities).toEqual([10, 20]);
      expect(profiles[0].isOrganization).toBe(true);
      expect(profiles[0].username).toBe('Org A');
      expect(profiles[0].territory).toBe('18');
    });

    it('creates sharer profiles with available_capacities', () => {
      const profiles = createProfilesFromOrganizations(mockOrgs, ProfileCapacityType.Sharer);
      expect(profiles[0].capacities).toEqual([30]);
    });
  });

  describe('createProfilesFromUsers', () => {
    const mockUsers = [
      {
        user: { id: 1, username: 'user1' },
        skills_wanted: ['10'],
        skills_available: ['20'],
        skills_known: ['30'],
        language: [{ id: 'en' }],
        territory: ['18'],
        avatar: 2,
        wikidata_qid: null,
      },
    ] as any[];

    it('creates learner profiles', () => {
      const profiles = createProfilesFromUsers(mockUsers, ProfileCapacityType.Learner);
      expect(profiles[0].capacities).toEqual(['10']);
      expect(profiles[0].isOrganization).toBe(false);
    });

    it('creates sharer profiles', () => {
      const profiles = createProfilesFromUsers(mockUsers, ProfileCapacityType.Sharer);
      expect(profiles[0].capacities).toEqual(['20']);
    });

    it('creates known profiles', () => {
      const profiles = createProfilesFromUsers(mockUsers, ProfileCapacityType.Known);
      expect(profiles[0].capacities).toEqual(['30']);
    });
  });

  describe('createUnifiedProfiles', () => {
    it('creates multi-type profile for user with all skills', () => {
      const users = [
        {
          user: { id: 1, username: 'user1' },
          skills_wanted: ['10'],
          skills_available: ['20'],
          skills_known: ['30'],
          language: [],
          territory: ['18'],
          avatar: null,
          wikidata_qid: null,
          last_update: '2024-01-01',
        },
      ] as any[];
      const profiles = createUnifiedProfiles(users);
      expect(profiles).toHaveLength(1);
      expect(profiles[0].type).toEqual([
        ProfileCapacityType.Learner,
        ProfileCapacityType.Sharer,
        ProfileCapacityType.Known,
      ]);
      expect(profiles[0].capacities).toEqual(['10', '20', '30']);
      expect(profiles[0].hasIncompleteProfile).toBe(false);
    });

    it('creates single-type profile', () => {
      const users = [
        {
          user: { id: 2, username: 'user2' },
          skills_wanted: ['10'],
          skills_available: [],
          skills_known: [],
          language: [],
          territory: [],
          avatar: null,
          wikidata_qid: null,
        },
      ] as any[];
      const profiles = createUnifiedProfiles(users);
      expect(profiles[0].type).toBe(ProfileCapacityType.Learner);
    });

    it('marks incomplete profiles', () => {
      const users = [
        {
          user: { id: 3, username: 'user3' },
          skills_wanted: [],
          skills_available: [],
          skills_known: [],
          language: [],
          territory: [],
          avatar: null,
          wikidata_qid: null,
        },
      ] as any[];
      const profiles = createUnifiedProfiles(users);
      expect(profiles[0].type).toBe(ProfileCapacityType.Incomplete);
      expect(profiles[0].hasIncompleteProfile).toBe(true);
    });

    it('handles null skill arrays', () => {
      const users = [
        {
          user: { id: 4, username: 'user4' },
          skills_wanted: null,
          skills_available: null,
          skills_known: null,
          language: [],
          territory: [],
          avatar: null,
          wikidata_qid: null,
        },
      ] as any[];
      const profiles = createUnifiedProfiles(users);
      expect(profiles[0].hasIncompleteProfile).toBe(true);
    });
  });
});
