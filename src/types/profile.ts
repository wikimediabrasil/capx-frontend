import { LanguageProficiency } from './language';

interface Capacity {
  id: number;
  skill_type: string[];
  skill_wikidata_item: string;
}

export interface Profile {
  name: string;
  about: string;
  affiliation: string[];
  avatar: number | null | undefined;
  contact?: string;
  display_name?: string;
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
