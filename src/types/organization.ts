export interface Organization {
  id: number;
  report_link: string | null;
  display_name: string;
  profile_image: string | null;
  acronym: string;
  tag_diff: any[];
  projects: number[];
  home_project: string | null;
  update_date: string;
  type: number;
  territory: number[];
  managers: number[];
  known_capacities: number[];
  available_capacities: number[];
  wanted_capacities: number[];
  events: number[];
  documents: number[];
  email: string | null;
  website: string | null;
  mastodon: string | null;
  meta_page: string | null;
  label: string;
}

export interface OrganizationType {
  id: number;
  name: string;
  description: string;
}
