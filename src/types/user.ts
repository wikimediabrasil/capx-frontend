interface Contact {
  display_name: string;
  value: string;
}

interface Social {
  display_name: string;
  value: string;
}

interface User {
  id: number;
  name: string;
  token: string;
  first_login: boolean;
}

export interface Session {
  user: User;
  expires: string;
}

interface UserData {
  id: number;
  username: string;
  email: string;
  is_staff: boolean;
  is_active: boolean;
  date_joined: string;
  last_login: string;
}

interface Language {
  id: number;
  proficiency: string;
}

export interface UserProfile {
  user: UserData;
  profile_image: string;
  display_name: string;
  pronoun: string;
  about: string;
  avatar: number;
  wikidata_qid: string;
  wiki_alt: string;
  territory: number[];
  language: Language[];
  affiliation: number[];
  wikimedia_project: number[];
  team: string;
  skills_known: string[];
  skills_available: string[];
  skills_wanted: string[];
  contact: Contact[];
  social: Social[];
  is_manager: number[];
  badges: number[];
}
