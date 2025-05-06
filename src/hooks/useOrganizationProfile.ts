"use client";

import { useState, useCallback, useEffect, useMemo, useRef } from "react";
import {
  OrganizationFilters,
  organizationProfileService,
} from "@/services/organizationProfileService";
import { Organization } from "@/types/organization";
import { useSession } from "next-auth/react";
import { FilterState } from "@/app/(auth)/feed/types";
import { ProfileCapacityType } from "@/app/(auth)/feed/types";

export function useOrganization(token?: string, specificOrgId?: number) {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [managedOrganizationIds, setManagedOrganizationIds] = useState<
    number[]
  >([]);
  const [isPermissionsLoaded, setIsPermissionsLoaded] = useState(false);
  const [lastFetchTime, setLastFetchTime] = useState<number>(0);

  // Store references to already fetched data to avoid refetches
  const orgCacheRef = useRef<
    Map<number, { data: Organization; timestamp: number }>
  >(new Map());

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

  const fetchData = useCallback(
    async (forceRefresh = false) => {
      if (!token) {
        setIsLoading(false);
        return;
      }

      // Don't fetch data if the active element is a text input
      if (
        document.activeElement?.tagName === "INPUT" &&
        document.activeElement.getAttribute("type") === "text"
      ) {
        return;
      }

      // Check if we need to actually make a new fetch
      const now = Date.now();
      const timeSinceLastFetch = now - lastFetchTime;
      const cacheTime = 5 * 60 * 1000; // 5 minutes of cache

      // If we don't want to force a refresh and we've recently fetched,
      // or we have valid cache data, return.
      if (
        !forceRefresh &&
        timeSinceLastFetch < cacheTime &&
        specificOrgId &&
        orgCacheRef.current.has(specificOrgId) &&
        organizations.length > 0
      ) {
        return;
      }

      // If there is a specific ID and we have it in cache, use it
      if (
        !forceRefresh &&
        specificOrgId &&
        orgCacheRef.current.has(specificOrgId) &&
        now - orgCacheRef.current.get(specificOrgId)!.timestamp < cacheTime
      ) {
        const cachedData = orgCacheRef.current.get(specificOrgId)!.data;
        setOrganizations([cachedData]);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);

      // For permissions, only load if they haven't been loaded yet
      // or if we are forcing a refresh
      if (!isPermissionsLoaded || forceRefresh) {
        setIsPermissionsLoaded(false);
        try {
          // First, fetch the IDs of the managed organizations
          const managedIds = await fetchUserProfile(token);
          setManagedOrganizationIds(managedIds);
          setIsPermissionsLoaded(true);
        } catch (err) {
          console.error("Error fetching user profile:", err);
          setIsPermissionsLoaded(false);
        }
      }

      try {
        // Then, fetch the organizations
        if (specificOrgId) {
          try {
            const orgData =
              await organizationProfileService.getOrganizationById(
                token,
                specificOrgId
              );
            if (orgData) {
              // Store in cache
              orgCacheRef.current.set(specificOrgId, {
                data: orgData,
                timestamp: now,
              });
              setOrganizations([orgData]);
            }
          } catch (err) {
            console.error(`Error fetching organization ${specificOrgId}:`, err);
            setOrganizations([]);
          }
        } else if (managedOrganizationIds.length > 0) {
          const orgsData = await fetchOrganizations(
            token,
            managedOrganizationIds
          );
          setOrganizations(orgsData);

          // Update cache for each organization
          orgsData.forEach((org) => {
            if (org && org.id) {
              orgCacheRef.current.set(org.id, {
                data: org,
                timestamp: now,
              });
            }
          });
        }

        // Update timestamp of last fetch
        setLastFetchTime(now);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch data");
        setOrganizations([]);
        setManagedOrganizationIds([]);
      } finally {
        setIsLoading(false);
      }
    },
    [
      token,
      specificOrgId,
      fetchUserProfile,
      fetchOrganizations,
      lastFetchTime,
      isPermissionsLoaded,
      organizations.length,
      managedOrganizationIds,
    ]
  );

  const isOrgManager = useMemo(() => {
    if (!isPermissionsLoaded) return false;
    if (specificOrgId) {
      return managedOrganizationIds.includes(Number(specificOrgId));
    }
    return managedOrganizationIds.length > 0;
  }, [isPermissionsLoaded, specificOrgId, managedOrganizationIds]);

  // Only fetch data on initial mount or when significant dependencies change
  useEffect(() => {
    // Check if critical dependencies have changed
    const shouldRefetch: boolean =
      !organizations.length ||
      !lastFetchTime ||
      (!!specificOrgId && !orgCacheRef.current.has(specificOrgId));

    fetchData(shouldRefetch);

    // Don't include fetchData in dependencies to avoid loops
  }, [token, specificOrgId]);

  return {
    organization: organizations[0],
    organizations,
    isLoading,
    isPermissionsLoaded,
    error,
    isOrgManager,
    managedOrganizationIds,
    refetch: () => fetchData(true), // Force refresh when called explicitly
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

        // Update the cache
        if (updatedOrg) {
          orgCacheRef.current.set(specificOrgId, {
            data: updatedOrg,
            timestamp: Date.now(),
          });
        }

        return updatedOrg;
      } catch (error) {
        console.error("Error updating organization:", error);
        throw error;
      }
    },
  };
}

export function useOrganizations(
  limit?: number,
  offset?: number,
  activeFilters?: FilterState
) {
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
            available_capacities: activeFilters.profileCapacityTypes.includes(
              ProfileCapacityType.Sharer
            )
              ? activeFilters.capacities.map((cap) => cap.code)
              : undefined,
            wanted_capacities: activeFilters.profileCapacityTypes.includes(
              ProfileCapacityType.Learner
            )
              ? activeFilters.capacities.map((cap) => cap.code)
              : undefined,
          }),
          ...(activeFilters?.territories?.length && {
            territory: activeFilters.territories,
          }),
          has_capacities_available:
            activeFilters?.profileCapacityTypes.includes(
              ProfileCapacityType.Sharer
            ) ?? undefined,
          has_capacities_wanted:
            activeFilters?.profileCapacityTypes.includes(
              ProfileCapacityType.Learner
            ) ?? undefined,
        };

        const data = await organizationProfileService.getOrganizations(filters);

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
  }, [
    limit,
    offset,
    JSON.stringify(activeFilters?.capacities),
    JSON.stringify(activeFilters?.territories),
    JSON.stringify(activeFilters?.profileCapacityTypes),
  ]);

  return { organizations, isLoading, error, count };
}
