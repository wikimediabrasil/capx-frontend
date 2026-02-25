import { Organization } from '@/types/organization';
import { UserProfile } from '@/types/user';

export enum ProfileCapacityType {
  Learner = 'learner',
  Sharer = 'sharer',
  Known = 'known',
  Incomplete = 'incomplete',
}

export interface Skill {
  name: string;
  code: number;
}

export interface FilterState {
  capacities: Skill[];
  profileCapacityTypes: ProfileCapacityType[];
  territories: string[];
  languages: string[];
  name?: string;
  affiliations?: string[];
}

export const createProfilesFromOrganizations = (
  organizations: Organization[],
  type: ProfileCapacityType
) => {
  const profiles: any[] = [];
  organizations.forEach(org => {
    profiles.push({
      id: org.id,
      username: org.display_name,
      capacities:
        type === ProfileCapacityType.Learner ? org.wanted_capacities : org.available_capacities,
      type,
      profile_image: org.profile_image,
      territory: org.territory?.[0],
      avatar: org.profile_image || undefined,
      isOrganization: true,
    });
  });
  return profiles;
};

export const createProfilesFromUsers = (users: UserProfile[], type: ProfileCapacityType) => {
  const profiles: any[] = [];
  users.forEach(user => {
    let capacities: string[] = [];
    if (type === ProfileCapacityType.Sharer) {
      capacities = user.skills_available;
    } else if (type === ProfileCapacityType.Learner) {
      capacities = user.skills_wanted;
    } else if (type === ProfileCapacityType.Known) {
      capacities = user.skills_known;
    }

    profiles.push({
      id: user.user.id,
      username: user.user.username,
      capacities,
      wantedCapacities: user.skills_wanted,
      availableCapacities: user.skills_available,
      knownCapacities: user.skills_known,
      type,
      languages: user.language,
      territory: user.territory?.[0],
      avatar: user.avatar,
      wikidataQid: user.wikidata_qid,
      isOrganization: false,
    });
  });
  return profiles;
};

// Combine sharer, learner, and known data
export const createUnifiedProfiles = (users: UserProfile[]) => {
  const profiles: any[] = [];
  users.forEach(user => {
    const hasWanted = user.skills_wanted && user.skills_wanted.length > 0;
    const hasAvailable = user.skills_available && user.skills_available.length > 0;
    const hasKnown = user.skills_known && user.skills_known.length > 0;

    const types: ProfileCapacityType[] = [];
    if (hasWanted) types.push(ProfileCapacityType.Learner);
    if (hasAvailable) types.push(ProfileCapacityType.Sharer);
    if (hasKnown) types.push(ProfileCapacityType.Known);

    if (types.length > 0) {
      profiles.push({
        id: user.user.id,
        username: user.user.username,
        capacities: [
          ...(user.skills_wanted || []),
          ...(user.skills_available || []),
          ...(user.skills_known || []),
        ],
        wantedCapacities: user.skills_wanted,
        availableCapacities: user.skills_available,
        knownCapacities: user.skills_known,
        type: types.length === 1 ? types[0] : types,
        languages: user.language,
        territory: user.territory?.[0],
        avatar: user.avatar,
        wikidataQid: user.wikidata_qid,
        isOrganization: false,
      });
    }
  });
  return profiles;
};
