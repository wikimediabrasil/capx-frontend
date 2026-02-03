'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useBadgesStore } from '@/stores/badgesStore';
import { useLanguage } from '@/stores/appStore';

/**
 * Fetches badges when the user is authenticated and language changes.
 * Replaces the side-effect that was in BadgesProvider.
 */
export default function BadgesFetcher() {
  const { data: session } = useSession();
  const token = session?.user?.token;
  const language = useLanguage();

  useEffect(() => {
    if (!token) return;
    useBadgesStore.getState().fetchBadges(token);
  }, [language, token]);

  return null;
}
