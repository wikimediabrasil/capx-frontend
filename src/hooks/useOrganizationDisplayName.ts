'use client';

import { useMemo } from 'react';
import { useApp } from '@/contexts/AppContext';
import { useOrganizationNames } from './useOrganizationNames';
import { getOrganizationDisplayName } from '@/lib/utils/getOrganizationDisplayName';

interface UseOrganizationDisplayNameOptions {
  organizationId?: number;
  defaultName?: string;
  token?: string;
}

/**
 * Hook that fetches organization names and returns the translated display name
 * based on the user's current language.
 * 
 * @param organizationId - The organization ID
 * @param defaultName - The default display_name from the organization (fallback)
 * @param token - The authentication token
 * @returns The translated organization name or the default name
 */
export function useOrganizationDisplayName({
  organizationId,
  defaultName = '',
  token,
}: UseOrganizationDisplayNameOptions = {}) {
  const { language } = useApp();
  const { names, isLoading } = useOrganizationNames({
    organizationId,
    token,
  });

  const displayName = useMemo(() => {
    if (!organizationId || !defaultName) {
      return defaultName;
    }

    return getOrganizationDisplayName(defaultName, names, language || 'en');
  }, [defaultName, names, language, organizationId]);

  return {
    displayName,
    isLoading,
  };
}

