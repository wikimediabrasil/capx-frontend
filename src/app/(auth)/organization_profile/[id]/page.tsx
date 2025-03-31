"use client";
import { useTheme } from "@/contexts/ThemeContext";
import { useApp } from "@/contexts/AppContext";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { useEffect } from "react";
import { useOrganization } from "@/hooks/useOrganizationProfile";
import LoadingState from "@/components/LoadingState";
import { useCapacityDetails } from "@/hooks/useCapacityDetails";
import OrganizationProfileMobileView from "../components/OrganizationProfileMobileView";
import OrganizationProfileDesktopView from "../components/OrganizationProfileDesktopView";

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

  const organization = organizations.find((org) => org.id === organizationId);

  const allCapacityIds = [
    ...(organization?.known_capacities || []),
    ...(organization?.available_capacities || []),
    ...(organization?.wanted_capacities || []),
  ];

  const { getCapacityName } = useCapacityDetails(allCapacityIds);

  useEffect(() => {
    const refreshData = async () => {
      await refetch();
    };

    refreshData();
  }, []);

  useEffect(() => {
    if (error) {
      console.error("Error fetching organization:", error);
    }
  }, [error, organization]);

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
