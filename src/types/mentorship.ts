export type MentorshipStatus = 'open' | 'closed';

export type MentorshipFormat = 'in-person' | 'online' | 'hybrid';

export type MentorshipRole = 'mentor' | 'mentee';

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
}

