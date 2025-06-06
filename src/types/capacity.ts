export interface Capacity {
  id?: number;
  code: number;
  skill_type: number;
  skill_wikidata_item: string;
  name: string;
  icon: string;
  color: string;
  children?: Capacity[];
  parentCode?: string;
  description?: string;
  wd_code?: string;
  metabase_code?: string;
  parentCapacity?: Capacity;
  hasChildren: boolean;
  level?: number;
}

export interface CapacityResponse {
  code: string;
  wd_code: string;
  name: string;
  description?: string;
}

export interface QueryData {
  params?: {
    language?: string;
    [key: string]: any;
  };
  headers?: {
    Authorization?: string;
    [key: string]: any;
  };
}

export interface CapacityCategory {
  id: number;
  name: string;
  color: string;
}
