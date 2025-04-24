"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import { OrganizationFilters, organizationProfileService } from "@/services/organizationProfileService";
import { Organization } from "@/types/organization";
import { useSession } from "next-auth/react";
import { FilterState } from "@/app/(auth)/feed/types";
import { ProfileCapacityType } from "@/app/(auth)/feed/types";

export function useOrganization(
  token?: string,
  specificOrgId?: number,
) {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [managedOrganizationIds, setManagedOrganizationIds] = useState<
    number[]
  >([]);
  const [isPermissionsLoaded, setIsPermissionsLoaded] = useState(false);

  const fetchUserProfile = useCallback(async (token: string) => {
    try {
      const userProfile = await organizationProfileService.getUserProfile(
        token
      );
      return userProfile.is_manager;
    } catch (err) {
      console.error("Error fetching user profile:", err);
      return [];
    }
  }, []);

  const fetchOrganizations = useCallback(
    async (token: string, orgIds: number[]) => {
      try {
        const orgsData = await Promise.all(
          orgIds.map((id) =>
            organizationProfileService.getOrganizationById(token, id)
          )
        );
        return orgsData.filter(Boolean); // Remove any null values
      } catch (err) {
        console.error("Error fetching organizations:", err);
        return [];
      }
    },
    []
  );

  const fetchData = useCallback(async () => {
    if (!token) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setIsPermissionsLoaded(false);

    try {
      // First, fetch the IDs of the managed organizations
      const managedIds = await fetchUserProfile(token);
      setManagedOrganizationIds(managedIds);
      setIsPermissionsLoaded(true);

      // Then, fetch the organizations
      if (specificOrgId) {
        try {
          const orgData = await organizationProfileService.getOrganizationById(
            token,
            specificOrgId
          );
          if (orgData) {
            setOrganizations([orgData]);
          }
        } catch (err) {
          console.error(`Error fetching organization ${specificOrgId}:`, err);
          setOrganizations([]);
        }
      } else if (managedIds.length > 0) {
        const orgsData = await fetchOrganizations(token, managedIds);
        setOrganizations(orgsData);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch data");
      setOrganizations([]);
      setManagedOrganizationIds([]);
    } finally {
      setIsLoading(false);
    }
  }, [token, specificOrgId, fetchUserProfile, fetchOrganizations]);

  const isOrgManager = useMemo(() => {
    if (!isPermissionsLoaded) return false;
    if (specificOrgId) {
      return managedOrganizationIds.includes(Number(specificOrgId));
    }
    return managedOrganizationIds.length > 0;
  }, [isPermissionsLoaded, specificOrgId, managedOrganizationIds]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    organization: organizations[0],
    organizations,
    isLoading,
    isPermissionsLoaded,
    error,
    isOrgManager,
    managedOrganizationIds,
    refetch: fetchData,
    updateOrganization: async (data: Partial<Organization>) => {
      if (!token || !specificOrgId || !isOrgManager) return;
      try {
        const updatedOrg =
          await organizationProfileService.updateOrganizationProfile(
            token,
            specificOrgId,
            data
          );
        setOrganizations((prev) =>
          prev.map((org) => (org.id === specificOrgId ? updatedOrg : org))
        );
        return updatedOrg;
      } catch (error) {
        console.error("Error updating organization:", error);
        throw error;
      }
    },
  };
}

export function useOrganizations(limit?: number, offset?: number, activeFilters?: FilterState) {
  const { data: session } = useSession();
  const [organizations, setOrganizations] = useState<Organization[] | null>([]);
  const [count, setCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    setIsLoading(true);
    const getOrganizations = async () => {
      try {
        const filters: OrganizationFilters = {
          limit,
          offset,
          ...(activeFilters?.capacities?.length && {
            available_capacities: activeFilters.profileCapacityTypes.includes(ProfileCapacityType.Sharer) 
              ? activeFilters.capacities.map(cap => cap.code)
              : undefined,
            wanted_capacities: activeFilters.profileCapacityTypes.includes(ProfileCapacityType.Learner) 
              ? activeFilters.capacities.map(cap => cap.code)
              : undefined,
          }),
          ...(activeFilters?.territories?.length && {
            territory: activeFilters.territories
          }),
          has_capacities_available: activeFilters?.profileCapacityTypes.includes(ProfileCapacityType.Sharer) ?? undefined,
          has_capacities_wanted: activeFilters?.profileCapacityTypes.includes(ProfileCapacityType.Learner) ?? undefined,
        };

        const data = await organizationProfileService.getOrganizations(
          session?.user?.token ?? "",
          filters
        );

        setOrganizations(data.results);
        setCount(data.count);
      } catch (error) {
        console.error("Error fetching organizations:", error);
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
    };

    getOrganizations();
  }, [session?.user?.token, limit, offset, 
    JSON.stringify(activeFilters?.capacities),
    JSON.stringify(activeFilters?.territories),
    JSON.stringify(activeFilters?.profileCapacityTypes)
  ]);

  return { organizations, isLoading, error, count };
}
