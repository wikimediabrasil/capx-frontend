export interface CapacityItem {
  qid: string;
  metabase_id: string;
  lang: string;
  label: string | null;
  description: string | null;
  fallback_label: string | null;
  fallback_description: string | null;
}

export interface CapacityListResponse {
  results: CapacityItem[];
}

export interface TranslationSubmitResponse {
  status: 'ok';
  changed: ('label' | 'description')[];
  metabase_id: string;
}

export interface OAuthBeginResponse {
  authorization_url: string;
  state: string;
}

export interface OAuthStatusResponse {
  connected: boolean;
  username: string;
}

export type RowStatus = 'idle' | 'saving' | 'saved' | 'pending' | 'error';

export interface EditableCapacityItem extends CapacityItem {
  editedLabel?: string;
  editedDescription?: string;
  rowStatus: RowStatus;
  dirty: boolean;
  rowError?: string;
}
