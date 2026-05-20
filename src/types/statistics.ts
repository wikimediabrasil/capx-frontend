export interface Statistics {
  total_users: number;
  new_users: number;
  total_capacities: number;
  new_capacities: number;
  total_messages: number;
  new_messages: number;
  total_organizations: number;
  new_organizations: number;
  active_users: number;
  users_with_territory: number;
  users_with_language: number;
  users_with_capacities: number;
  territory_user_counts: Count;
  language_user_counts: Count;
  skill_known_user_counts: Count;
  skill_available_user_counts: Count;
  skill_wanted_user_counts: Count;
}
interface Count {
  [key: string]: number;
}
