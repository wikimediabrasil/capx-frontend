import { Profile } from '@/types/profile';

/**
 * Checks if a user profile is incomplete.
 * A profile is considered incomplete if it's missing:
 * - territory (empty array or undefined)
 * - language (empty array or undefined)
 * - skills_known (empty array or undefined)
 *
 * @param profile - The user profile to check
 * @returns true if the profile is incomplete, false otherwise
 */
export function isProfileIncomplete(profile: Profile | null | undefined): boolean {
  if (!profile) {
    return true;
  }

  const hasTerritory = profile.territory && profile.territory.length > 0;
  const hasLanguage = profile.language && profile.language.length > 0;
  const hasSkillsKnown = profile.skills_known && profile.skills_known.length > 0;

  return !hasTerritory || !hasLanguage || !hasSkillsKnown;
}
