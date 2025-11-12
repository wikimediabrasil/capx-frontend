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
  capacities?: Array<number | string>;
  skills_available?: Array<number | string>;
  skills_wanted?: Array<number | string>;
  skills_known?: Array<number | string>;
}

export interface OrganizationRecommendation {
  id: number;
  display_name: string;
  profile_image?: string | null;
  acronym?: string;
  matches?: number;
  // These will be populated when fetching full organization data
  capacities?: Array<number | string>;
  available_capacities?: Array<number | string>;
  wanted_capacities?: Array<number | string>;
}

export interface EventRecommendation {
  id: number;
  name: string;
  type_of_location?: string;
  openstreetmap_id?: string;
  url?: string;
  description?: string;
  wikidata_qid?: string;
  image_url?: string;
  time_begin: string;
  time_end?: string;
  created_at?: string;
  updated_at?: string;
  creator?: number;
  organization?: number;
  organization_name?: string;
  related_skills?: number[];
  // Legacy fields for backward compatibility
  capacities_hint?: boolean;
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

