'use client';
import { useTheme } from '@/contexts/ThemeContext';
import { useApp } from '@/contexts/AppContext';
import { useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useEffect, useMemo, useCallback } from 'react';
import { useOrganization } from '@/hooks/useOrganizationProfile';
import LoadingState from '@/components/LoadingState';
import { useCapacityDetails } from '@/hooks/useCapacityDetails';
import OrganizationProfileMobileView from '../components/OrganizationProfileMobileView';
import OrganizationProfileDesktopView from '../components/OrganizationProfileDesktopView';

// Hard-coded fallback names for known capacity IDs (same as in the API)
const FALLBACK_CAPACITY_NAMES = {
  '69': 'Strategic Thinking',
  '71': 'Team Leadership',
  '97': 'Project Management',
  '10': 'Organizational Skills',
  '36': 'Communication',
  '50': 'Learning',
  '56': 'Community Building',
  '65': 'Social Skills',
  '74': 'Strategic Planning',
  '106': 'Technology',
};

export default function OrganizationProfilePage() {
  const { darkMode } = useTheme();
  const { isMobile, pageContent } = useApp();
  const { data: session } = useSession();
  const token = session?.user?.token;

  const params = useParams();
  const organizationId = Number(params.id);

  const {
    organizations,
    isLoading: isOrganizationLoading,
    error,
    isOrgManager,
    refetch,
  } = useOrganization(token, organizationId);

  const organization = organizations.find(org => org.id === organizationId);

  // Memoize the capacity IDs to prevent unnecessary re-renders
  const allCapacityIds = useMemo(() => {
    if (!organization) return [];
    return [
      ...(organization.known_capacities || []),
      ...(organization.available_capacities || []),
      ...(organization.wanted_capacities || []),
    ];
  }, [organization]);

  const { getCapacityName: originalGetCapacityName, capacityNames } =
    useCapacityDetails(allCapacityIds);

  // Wrapper function to sanitize Wikibase URLs
  const getCapacityName = useCallback(
    (id: any) => {
      const name = originalGetCapacityName(id);

      // Filter out URLs and replace with fallback
      if (typeof name === 'string' && (name.startsWith('https://') || name.includes('entity/Q'))) {
        const idStr = id.toString();
        return FALLBACK_CAPACITY_NAMES[idStr] || `Capacity ${id}`;
      }

      return name;
    },
    [originalGetCapacityName]
  );

  // Only refetch when the organization ID changes, use useCallback to avoid recreation on every render
  const handleRefetch = useCallback(() => {
    if (organizationId) {
      refetch();
    }
  }, [organizationId, refetch]);

  useEffect(() => {
    handleRefetch();
  }, [handleRefetch]);

  useEffect(() => {
    if (error) {
      console.error('Error fetching organization:', error);
    }
  }, [error]);

  if (isOrganizationLoading) {
    return <LoadingState />;
  }

  if (isMobile) {
    return (
      <OrganizationProfileMobileView
        pageContent={pageContent}
        darkMode={darkMode}
        isMobile={isMobile}
        organization={organization}
        organizationId={organizationId}
        token={token}
        isOrgManager={isOrgManager}
        getCapacityName={getCapacityName}
        allCapacityIds={allCapacityIds}
      />
    );
  }

  return (
    <OrganizationProfileDesktopView
      pageContent={pageContent}
      darkMode={darkMode}
      isMobile={isMobile}
      organization={organization}
      organizationId={organizationId}
      token={token}
      isOrgManager={isOrgManager}
      getCapacityName={getCapacityName}
      allCapacityIds={allCapacityIds}
    />
  );
}
