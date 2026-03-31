'use client';
import LoadingState from '@/components/LoadingState';
import { useOrganization } from '@/hooks/useOrganizationProfile';
import { useTerritories } from '@/hooks/useTerritories';
import { useSession } from 'next-auth/react';
import { useParams } from 'next/navigation';
import { useCallback, useEffect } from 'react';
import OrganizationProfileView from '../components/OrganizationProfileView';

import { useDarkMode, useLanguage, usePageContent, useCapacityStore } from '@/stores';
export default function OrganizationProfilePage() {
  const darkMode = useDarkMode();
  const pageContent = usePageContent();

  const language = useLanguage();
  const { data: session } = useSession();
  const token = session?.user?.token;
  const capacityCache = useCapacityStore();
  const { isLoadingTranslations } = capacityCache;
  const { territoriesMap: territories } = useTerritories(token);

  const params = useParams();
  const organizationId = Number(params?.id);

  const {
    organizations,
    isLoading: isOrganizationLoading,
    error,
    isOrgManager,
    refetch,
  } = useOrganization(token, organizationId);

  const organization = organizations.find(org => org.id === organizationId);

  // Use cached capacity names
  const getCapacityName = useCallback(
    (id: any) => {
      return capacityCache.getName(Number(id));
    },
    [capacityCache]
  );

  // Monitor language changes and update capacity cache
  useEffect(() => {
    const updateCacheLanguage = async () => {
      if (language && token) {
        try {
          await useCapacityStore.getState().updateLanguage(language, token);
        } catch (error) {
          console.error('Error updating capacity cache language:', error);
        }
      }
    };

    updateCacheLanguage();
  }, [language, token, capacityCache]);

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

  if (isOrganizationLoading || isLoadingTranslations) {
    return <LoadingState fullScreen={true} />;
  }

  return (
    <OrganizationProfileView
      pageContent={pageContent}
      darkMode={darkMode}
      organization={organization}
      organizationId={organizationId}
      token={token}
      isOrgManager={isOrgManager}
      getCapacityName={getCapacityName}
      territories={territories}
    />
  );
}
