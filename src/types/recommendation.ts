import { Profile } from './profile';
import { Organization } from './organization';
import { Event } from './event';
import { Capacity } from './capacity';

export interface ProfileRecommendation {
  id: number;
  display_name?: string;
  username: string;
  profile_image?: string | null;
  matches?: number;
  // These will be populated when fetching full profile data
  capacities?: number[];
  skills_available?: number[];
  skills_wanted?: number[];
}

export interface OrganizationRecommendation {
  id: number;
  display_name: string;
  profile_image?: string | null;
  acronym?: string;
  matches?: number;
  // These will be populated when fetching full organization data
  capacities?: number[];
  available_capacities?: number[];
  wanted_capacities?: number[];
}

export interface EventRecommendation {
  id: number;
  name: string;
  type_of_location?: string;
  time_begin: string;
  time_end?: string;
  organization?: number;
  organization_name?: string;
  image_url?: string;
  description?: string;
  capacities_hint?: boolean;
  related_skills?: number[];
  view_event_link?: string;
  save_action_link?: string;
  language?: string;
}

export interface CapacityRecommendation {
  id: number;
  skill_wikidata_item: string;
  skill_type: number | null;
  // These will be populated from capacity cache
  name?: string;
  description?: string;
  icon?: string;
  color?: string;
}

export interface RecommendationsResponse {
  share_with: ProfileRecommendation[];
  learn_from: ProfileRecommendation[];
  same_language: ProfileRecommendation[];
  share_with_orgs: OrganizationRecommendation[];
  learn_from_orgs: OrganizationRecommendation[];
  new_skills: CapacityRecommendation[];
  events: EventRecommendation[];
}

