export enum EventFilterType {
  All = 'all',
  Organization = 'organization',
}

export enum EventLocationType {
  All = 'all',
  Online = 'online',
  InPerson = 'in_person',
  Hybrid = 'hybrid',
}

export interface EventSkill {
  name: string;
  code: number;
}

export interface EventFilterState {
  capacities: EventSkill[];
  territories: string[];
  eventType: EventFilterType;
  dateRange?: {
    startDate?: string;
    endDate?: string;
  };
  locationType: EventLocationType;
  organizationId?: number;
}
