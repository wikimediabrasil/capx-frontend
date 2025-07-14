import { LanguageProficiency } from './language';

export interface Profile {
  name: string;
  about: string;
  affiliation: string[];
  avatar: number | null | undefined;
  contact?: string;
  display_name?: string;
  automated_lets_connect?: boolean;
  language: LanguageProficiency[];
  profile_image?: string;
  pronoun?: string;
  skills_known: number[];
  skills_available: number[];
  skills_wanted: number[];
  social?: string[];
  team?: string;
  territory?: string[];
  user: {
    username: string;
    email: string;
    is_active: boolean;
    is_staff: boolean;
    last_login: string;
    date_joined: string;
  };
  wiki_alt?: string;
  wikidata_qid?: string;
  wikimedia_project?: string[];
}

export interface LetsConnectProfile {
  username: string;
  username_org: string;
  reconciled_affiliation: string;
  reconciled_territory: string;
  reconciled_languages: string[];
  reconciled_projects: string[];
  reconciled_want_to_learn: string[];
  reconciled_want_to_share: string[];
}
