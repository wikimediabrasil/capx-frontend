import { Organization } from '@/types/organization';
import { UserProfile } from '@/types/user';

export enum ProfileCapacityType {
  Learner = 'learner',
  Sharer = 'sharer',
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
  username?: string;
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
      type,
      languages: user.language,
      profile_image: user.profile_image,
      territory: user.territory?.[0],
      avatar: user.avatar,
      isOrganization: false,
    });
  });
  return profiles;
};
