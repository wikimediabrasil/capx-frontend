export type MentorshipStatus = 'open' | 'closed';

export type MentorshipFormat = 'in-person' | 'online' | 'hybrid';

export type MentorshipRole = 'mentor' | 'mentee';

export type FormFieldType = 'text' | 'email' | 'tel' | 'number' | 'textarea' | 'select' | 'multiselect' | 'time' | 'date' | 'datetime';

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
  submitButtonLabel?: string;
}

export interface MentorshipProgram {
  id: number;
  name: string;
  logo: string | null;
  location: string;
  status: MentorshipStatus;
  description: string;
  format: MentorshipFormat;
  capacities: string[];
  languages: string[];
  subscribers: number;
  forms?: {
    mentor?: MentorshipForm;
    mentee?: MentorshipForm;
  };
}

