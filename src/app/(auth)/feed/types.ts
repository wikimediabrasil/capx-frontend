export enum ProfileCapacityType {
  Learner = 'learner',
  Sharer = 'sharer',
}

export enum ProfileFilterType {
  Both = 'both',
  User = 'user',
  Organization = 'organization'
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
  profileFilter: ProfileFilterType;
}
