export interface BadgesResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Badge[];
} 

export interface UserBadgeResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: UserBadge[];
}

export interface Badge {
  id: number;
  name: string;
  picture: string;
  description: string;
  logic: {
    target: string;
    value: string;
  };
  type: string;
  external_id: string | null;
  progress?: number | null;
  is_displayed?: boolean | null;
}

export interface UserBadge {
  id: number;
  badge: number;
  is_displayed: boolean;
  progress: number;
}
