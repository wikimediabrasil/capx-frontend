import { Organization } from '@/types/organization';
import { UserProfile } from '@/types/user';

export enum ProfileCapacityType {
  Learner = 'learner',
  Sharer = 'sharer',
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
    profiles.push({
      id: user.user.id,
      username: user.user.username,
      capacities: type === ProfileCapacityType.Sharer ? user.skills_available : user.skills_wanted,
      wantedCapacities: user.skills_wanted,
      availableCapacities: user.skills_available,
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

// Combine both sharer and learner data
export const createUnifiedProfiles = (users: UserProfile[]) => {
  const profiles: any[] = [];
  users.forEach(user => {
    const hasWanted = user.skills_wanted && user.skills_wanted.length > 0;
    const hasAvailable = user.skills_available && user.skills_available.length > 0;

    if (hasWanted && hasAvailable) {
      // User is both learner and sharer
      profiles.push({
        id: user.user.id,
        username: user.user.username,
        capacities: [...(user.skills_wanted || []), ...(user.skills_available || [])],
        wantedCapacities: user.skills_wanted,
        availableCapacities: user.skills_available,
        type: [ProfileCapacityType.Learner, ProfileCapacityType.Sharer],
        languages: user.language,
        territory: user.territory?.[0],
        avatar: user.avatar,
        wikidataQid: user.wikidata_qid,
        isOrganization: false,
      });
    } else if (hasWanted) {
      // User is only learner
      profiles.push({
        id: user.user.id,
        username: user.user.username,
        capacities: user.skills_wanted,
        wantedCapacities: user.skills_wanted,
        availableCapacities: [],
        type: ProfileCapacityType.Learner,
        languages: user.language,
        territory: user.territory?.[0],
        avatar: user.avatar,
        wikidataQid: user.wikidata_qid,
        isOrganization: false,
      });
    } else if (hasAvailable) {
      // User is only sharer
      profiles.push({
        id: user.user.id,
        username: user.user.username,
        capacities: user.skills_available,
        wantedCapacities: [],
        availableCapacities: user.skills_available,
        type: ProfileCapacityType.Sharer,
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
