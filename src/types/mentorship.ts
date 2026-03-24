export type MentorshipStatus = 'open' | 'closed' | 'upcoming';

export type MentorshipFormat = 'in-person' | 'online' | 'hybrid';

export type MentorshipRole = 'mentor' | 'mentee';

// API response types (backend)
// Partner: id is organization id; used for mentorship programs when mentorship=true
export interface PartnerApi {
  id: number;
  name: string;
  description: string;
  mentorship: boolean;
  territory_names: string[];
  capacities: string[];
  profile_image: string | null;
  created_at: string;
  updated_at: string;
}

// Partner mentorship settings: one per partner with mentorship; used to fill cards
export interface MentorshipSettingsApi {
  id: number;
  organization: number;
  name: string;
  description: string;
  registration_open_date?: string | null;
  registration_close_date?: string | null;
  territory_names: string[];
  profile_image: string | null;
  skills: number[];
  skill_names: string[];
  languages: number[];
  language_names: string[];
  mentor_form: number | null;
  mentee_form: number | null;
  created_at: string;
  updated_at: string;
}

export interface MentorshipFormMentorApi {
  id: number;
  organization: number;
  counter: number;
  json: FormBuilderFieldSchema[];
  created_at: string;
}

export interface MentorshipFormMenteeApi {
  id: number;
  organization: number;
  counter: number;
  json: FormBuilderFieldSchema[];
  created_at: string;
}

// jQuery formBuilder field schema (stored in backend)
export interface FormBuilderFieldSchema {
  type: string;
  label?: string;
  name?: string;
  className?: string;
  subtype?: string;
  values?: Array<{ label: string; value: string }>;
  required?: boolean;
  placeholder?: string;
  [key: string]: unknown;
}

export type FormFieldType =
  | 'text'
  | 'email'
  | 'tel'
  | 'number'
  | 'textarea'
  | 'select'
  | 'multiselect'
  | 'time'
  | 'date'
  | 'datetime';

export interface FormFieldOption {
  label: string;
  value: string | number;
}

export interface MentorshipFormField {
  id: string;
  label: string;
  type: FormFieldType;
  required?: boolean;
  placeholder?: string;
  options?: FormFieldOption[];
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    minLength?: number;
    maxLength?: number;
  };
  hint?: string;
  defaultValue?: string | number | string[];
}

export interface MentorshipForm {
  role: MentorshipRole;
  fields: MentorshipFormField[];
  rawJson?: FormBuilderFieldSchema[];
  submitButtonLabel?: string;
}

export interface MentorshipProgram {
  id: number;
  name: string;
  logo: string | null;
  location: string;
  openDate?: string | null;
  closeDate?: string | null;
  status: MentorshipStatus;
  description: string;
  format: MentorshipFormat;
  capacities: (number | string)[];
  languages: string[];
  subscribers: number;
  forms?: {
    mentor?: MentorshipForm & { formId?: number };
    mentee?: MentorshipForm & { formId?: number };
  };
}
