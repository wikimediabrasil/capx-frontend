export interface Territory {
  id: number;
  territory_name: string;
  territory_acronym: string;
  parent_territory: number[];
}

export interface TerritoriesResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Territory[];
}
