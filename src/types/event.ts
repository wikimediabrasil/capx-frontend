export interface Event {
  id: number;
  name: string;
  type_of_location: string;
  openstreetmap_id: string;
  url: string;
  wikidata_qid: string;
  image_url: string;
  time_begin: string;
  time_end: string;
  created_at: string;
  updated_at: string;
  creator: number;
  description: string;
  team: number[];
  organization: number;
  related_skills: number[];
}
