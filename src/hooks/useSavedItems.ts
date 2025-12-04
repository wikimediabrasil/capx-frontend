'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { savedItemService } from '@/services/savedItemsService';
import { useSession } from 'next-auth/react';
import { SavedItem } from '@/types/saved_item';
import { userService } from '@/services/userService';
import { organizationProfileService } from '@/services/organizationProfileService';
import { ProfileCapacityType } from '@/app/(auth)/feed/types';
import { LanguageProficiency } from '@/types/language';
import { useQuery, useQueryClient } from '@tanstack/react-query';

export interface SavedProfile {
  id: number;
  username: string;
  profile_image?: string; // Only for organizations
  type: string;
  capacities?: string[];
  languages?: LanguageProficiency[];
  territory?: string;
  avatar?: string;
  wikidataQid?: string; // For people with Wikidata images
  isOrganization: boolean;
  savedItemId: number;
}

export function useSavedItems() {
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const abortControllerRef = useRef<AbortController | null>(null);
  const [allProfiles, setAllProfiles] = useState<SavedProfile[]>([]);
  const [count, setCount] = useState<number>(0);

  // Use React Query to cache saved items with automatic sharing
  const {
    data: savedItems = [],
    isLoading,
    error,
  } = useQuery<SavedItem[], Error>({
    queryKey: ['savedItems', session?.user?.token],
    queryFn: async () => {
      if (!session?.user?.token) return [];

      const data = await savedItemService.getSavedItems(session.user.token, {
        limit: 100,
        offset: 0,
      });
      return data.results || [];
    },
    enabled: !!session?.user?.token,
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
    gcTime: 1000 * 60 * 30, // Keep in cache for 30 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });

  // Fetch profile details in parallel (not sequentially)
  useEffect(() => {
    if (!session?.user?.token || !savedItems.length) {
      setAllProfiles([]);
      setCount(0);
      return;
    }

    // Cancel previous requests if component unmounts or token changes
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;

    // Helper function to create user profile from saved item
    const createUserProfile = (
      userData: any,
      item: SavedItem,
      signal: AbortSignal
    ): SavedProfile | null => {
      if (!userData || signal.aborted) return null;
      return {
        id: userData.user.id,
        username: userData.user.username,
        type: item.relation || ProfileCapacityType.Learner,
        capacities:
          item.relation === ProfileCapacityType.Sharer
            ? userData.skills_available
            : userData.skills_wanted,
        languages: userData.language,
        territory: userData.territory?.[0]?.toString() || '',
        avatar: userData.avatar != null ? userData.avatar.toString() : undefined,
        wikidataQid: userData.wikidata_qid,
        isOrganization: false,
        savedItemId: item.id,
      };
    };

    // Helper function to create organization profile from saved item
    const createOrgProfile = (
      orgData: any,
      item: SavedItem,
      signal: AbortSignal
    ): SavedProfile | null => {
      if (!orgData || signal.aborted) return null;
      return {
        id: orgData.id,
        username: orgData.display_name,
        profile_image: orgData.profile_image,
        type: item.relation,
        avatar: undefined,
        capacities:
          item.relation === ProfileCapacityType.Learner
            ? orgData.wanted_capacities
            : orgData.available_capacities,
        territory: orgData.territory[0],
        isOrganization: true,
        savedItemId: item.id,
      };
    };

    // Helper function to fetch a single profile
    const fetchSingleProfile = async (item: SavedItem): Promise<SavedProfile | null> => {
      if (signal.aborted) return null;

      try {
        if (item.entity === 'user') {
          const userData = await userService.fetchUserProfile(item.entity_id, session.user.token);
          return createUserProfile(userData, item, signal);
        }

        if (item.entity === 'org') {
          const orgData = await organizationProfileService.getOrganizationById(
            session.user.token,
            item.entity_id
          );
          return createOrgProfile(orgData, item, signal);
        }
      } catch (err) {
        // Silently handle errors for individual items
      }
      return null;
    };

    const fetchAllProfileDetails = async () => {
      try {
        // Fetch all profiles in parallel instead of sequentially
        const profilePromises = savedItems.map(fetchSingleProfile);
        const profiles = (await Promise.all(profilePromises)).filter(
          (p): p is SavedProfile => p !== null && !signal.aborted
        );

        if (!signal.aborted) {
          setAllProfiles(profiles);
          setCount(profiles.length);
        }
      } catch (err) {
        // Error already handled by React Query
      }
    };

    fetchAllProfileDetails();

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [savedItems, session?.user?.token]);

  const fetchProfileDetails = useCallback(async (savedItem: SavedItem, token: string) => {
    try {
      let newProfile: SavedProfile | null = null;

      if (savedItem.entity === 'user') {
        const userData = await userService.fetchUserProfile(savedItem.entity_id, token);
        newProfile = userData
          ? {
              id: userData.user.id,
              username: userData.user.username,
              type: savedItem.relation || ProfileCapacityType.Learner,
              capacities:
                savedItem.relation === ProfileCapacityType.Sharer
                  ? userData.skills_available
                  : userData.skills_wanted,
              languages: userData.language,
              territory: userData.territory?.[0]?.toString() || '',
              avatar: userData.avatar != null ? userData.avatar.toString() : undefined,
              wikidataQid: userData.wikidata_qid,
              isOrganization: false,
              savedItemId: savedItem.id,
            }
          : null;
      } else if (savedItem.entity === 'org') {
        const orgData = await organizationProfileService.getOrganizationById(
          token,
          savedItem.entity_id
        );
        newProfile = orgData
          ? {
              id: orgData.id,
              username: orgData.display_name,
              profile_image: orgData.profile_image,
              type: savedItem.relation,
              capacities:
                savedItem.relation === ProfileCapacityType.Learner
                  ? orgData.wanted_capacities
                  : orgData.available_capacities,
              territory: orgData.territory[0],
              avatar: undefined,
              isOrganization: true,
              savedItemId: savedItem.id,
            }
          : null;
      }

      if (newProfile) {
        setAllProfiles(prev => [...prev, newProfile]);
        setCount(prev => prev + 1);
      }
    } catch (error) {
      // Log error but don't throw - individual item failures shouldn't break the whole process
      console.error('Error fetching profile details:', error);
    }
  }, []);

  const paginatedProfiles = useCallback(
    (page: number, itemsPerPage: number) => {
      const start = (page - 1) * itemsPerPage;
      const end = start + itemsPerPage;
      return allProfiles.slice(start, end);
    },
    [allProfiles]
  );

  const deleteSavedItem = useCallback(
    async (itemId: number) => {
      if (!session?.user?.token) return false;

      try {
        const success = await savedItemService.deleteSavedItem(session.user.token, itemId);

        if (success) {
          // Invalidate and refetch saved items
          queryClient.setQueryData<SavedItem[]>(['savedItems', session.user.token], old => {
            if (!old) return [];
            return old.filter(item => item.id !== itemId);
          });

          setAllProfiles(prevProfiles =>
            prevProfiles.filter(profile => profile.savedItemId !== itemId)
          );
          setCount(prevCount => prevCount - 1);
          return true;
        }
        return false;
      } catch (error) {
        console.error('Error deleting saved item:', error);
        return false;
      }
    },
    [session?.user?.token, queryClient]
  );

  const createSavedItem = useCallback(
    async (entity: string, entityId: number, relation: string) => {
      if (!session?.user?.token) return false;

      try {
        const newItem = await savedItemService.createSavedItem(session.user.token, {
          entity,
          entity_id: entityId,
          relation,
        });

        if (newItem) {
          // Update React Query cache
          queryClient.setQueryData<SavedItem[]>(['savedItems', session.user.token], old => {
            if (!old) return [newItem];
            return [...old, newItem];
          });

          // Fetch profile details for the new item
          await fetchProfileDetails(newItem, session.user.token);
          return true;
        }
        return false;
      } catch (error) {
        console.error('Error creating saved item:', error);
        return false;
      }
    },
    [session?.user?.token, queryClient]
  );

  const isProfileSaved = useCallback(
    (profileId: number, isOrganization: boolean) => {
      return savedItems.some(
        item => item.entity_id === profileId && item.entity === (isOrganization ? 'org' : 'user')
      );
    },
    [savedItems]
  );

  const getSavedItemId = useCallback(
    (profileId: number, isOrganization: boolean) => {
      const savedItem = savedItems.find(
        item => item.entity_id === profileId && item.entity === (isOrganization ? 'org' : 'user')
      );
      return savedItem ? savedItem.id : null;
    },
    [savedItems]
  );

  return {
    savedItems,
    paginatedProfiles,
    isLoading,
    error,
    count,
    deleteSavedItem,
    createSavedItem,
    isProfileSaved,
    getSavedItemId,
  };
}
