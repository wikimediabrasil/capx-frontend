'use client';

import { useOrganizationDisplayName } from '@/hooks/useOrganizationDisplayName';
import { useSession } from 'next-auth/react';

interface OrganizationNameDisplayProps {
  organizationId: number;
  defaultName: string;
  fallback?: string;
}

/**
 * Component that displays the translated organization name
 */
export default function OrganizationNameDisplay({
  organizationId,
  defaultName,
  fallback = 'Organization',
}: OrganizationNameDisplayProps) {
  const { data: session } = useSession();
  const { displayName } = useOrganizationDisplayName({
    organizationId,
    defaultName,
    token: session?.user?.token,
  });

  return <>{displayName || fallback}</>;
}

