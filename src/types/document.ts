// Basic interface for the organization document
export interface OrganizationDocument {
  id: number | null;
  url?: string | null;
  organization?: number;
  creator?: number;
  title?: string;
  description?: string;
}

// Enriched interface for the Wikimedia document
export interface WikimediaDocument extends OrganizationDocument {
  id: number;
  imageUrl?: string;
  fullUrl?: string;
  title?: string;
  thumburl?: string;
  metadata?: Array<{
    name: string;
    value: string | any;
  }>;
}
