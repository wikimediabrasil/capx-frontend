'use client';

import { useEffect, useState } from 'react';
import { useOrganizationDisplayName } from '@/hooks/useOrganizationDisplayName';
import { Organization } from '@/types/organization';

interface OrganizationNameLoaderProps {
  organization: Organization;
  token?: string;
  onNameLoaded: (id: number, name: string) => void;
}

/**
 * Component that loads translated name for a single organization
 */
function OrganizationNameLoader({ organization, token, onNameLoaded }: OrganizationNameLoaderProps) {
  const { displayName } = useOrganizationDisplayName({
    organizationId: organization.id,
    defaultName: organization.display_name,
    token,
  });

  useEffect(() => {
    onNameLoaded(organization.id, displayName || organization.display_name);
  }, [organization.id, organization.display_name, displayName, onNameLoaded]);

  return null;
}

interface OrganizationOptionsLoaderProps {
  organizations: Organization[];
  token?: string;
  onNamesLoaded: (names: Record<number, string>) => void;
}

/**
 * Component that loads translated organization names for all organizations
 */
export default function OrganizationOptionsLoader({
  organizations,
  token,
  onNamesLoaded,
}: OrganizationOptionsLoaderProps) {
  const [namesMap, setNamesMap] = useState<Record<number, string>>({});

  const handleNameLoaded = (id: number, name: string) => {
    setNamesMap(prev => ({ ...prev, [id]: name }));
  };

  useEffect(() => {
    if (Object.keys(namesMap).length === organizations.length) {
      onNamesLoaded(namesMap);
    }
  }, [namesMap, organizations.length, onNamesLoaded]);

  return (
    <>
      {organizations.map(org => (
        <OrganizationNameLoader
          key={org.id}
          organization={org}
          token={token}
          onNameLoaded={handleNameLoaded}
        />
      ))}
    </>
  );
}

