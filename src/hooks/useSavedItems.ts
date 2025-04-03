"use client";

import { useState, useEffect } from "react";
import { savedItemService, SavedItemFilters } from "@/services/savedItemsService";
import { useSession } from "next-auth/react";
import { SavedItem } from "@/types/saved_item";
import { userService } from "@/services/userService";
import { organizationProfileService } from "@/services/organizationProfileService";
import { ProfileCapacityType } from "@/app/(auth)/feed/types";
import { LanguageProficiency } from "@/types/language";

export interface SavedProfile {
  id: number;
  username: string;
  profile_image: string;
  type: string;
  capacities?: string[];
  languages?: LanguageProficiency[];
  territory?: string;
  avatar?: string;
  isOrganization: boolean;
  savedItemId: number;
}

export function useSavedItems(limit?: number, offset?: number) {
  const { data: session } = useSession();
  const [savedItems, setSavedItems] = useState<SavedItem[] | null>([]);
  const [savedProfiles, setSavedProfiles] = useState<SavedProfile[]>([]);
  const [count, setCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!session?.user?.token) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const getSavedItems = async () => {
      try {
        const filters: SavedItemFilters = {
          limit,
          offset,
        };

        const data = await savedItemService.getSavedItems(
          session.user.token,
          filters
        );

        setSavedItems(data.results);
        setCount(data.count);
        
        await fetchSavedProfileDetails(data.results);
      } catch (error) {
        console.error("Error fetching saved items:", error);
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
    };

    getSavedItems();
  }, [session?.user?.token, limit, offset]);

  const fetchSavedProfileDetails = async (items: SavedItem[]) => {
    if (!items || !items.length || !session?.user?.token) return;

    const profiles: SavedProfile[] = [];

    for (const item of items) {
      try {
        if (item.entity === 'user') {
          const userData = await userService.fetchUserProfile(item.entity_id, session.user.token,);
          if (userData) {
            profiles.push({
              id: userData.user.id,
              username: userData.user.username,
              profile_image: userData.profile_image || '',
              type: item.relation,
              capacities: item.relation === ProfileCapacityType.Sharer ? userData.skills_available : userData.skills_wanted,
              languages: userData.language,
              territory: userData.territory?.[0]?.toString() || '',
              avatar: userData.avatar?.toString(),
              isOrganization: false,
              savedItemId: item.id
            });
          }
        } else if (item.entity === 'org') {
          const orgData = await organizationProfileService.getOrganizationById(session.user.token, item.entity_id);
          console.log("orgData", orgData);
          if (orgData) {
            profiles.push({
              id: orgData.id,
              username: orgData.display_name,
              profile_image: orgData.profile_image || undefined,
              type: item.relation,
              capacities: item.relation === ProfileCapacityType.Learner ? orgData.wanted_capacities : orgData.available_capacities,
              languages: orgData.languages || [],
              territory: orgData.territory?.[0],
              avatar: orgData.profile_image || undefined,
              isOrganization: true,
              savedItemId: item.id
            });
          }
        }
      } catch (err) {
        console.error(`Error fetching details for saved item ${item.id}:`, err);
      }
    }
    
    setSavedProfiles(profiles);
  };

  const deleteSavedItem = async (savedItemId: number) => {
    if (!session?.user?.token) return;
    try {
      const success = await savedItemService.deleteSavedItem(
        session.user.token,
        savedItemId
      );

      if (success) {
        setSavedItems(prevItems =>
          prevItems?.filter(item => item.id !== savedItemId) || null
        );
        setSavedProfiles(prevProfiles =>
          prevProfiles.filter(profile => profile.savedItemId !== savedItemId)
        );
        setCount(prevCount => prevCount - 1);
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error deleting saved item:", error);
      return false;
    }
  };

  const createSavedItem = async (relation: string, entity: string, entityId: number) => {
    if (!session?.user?.token) return;
    try {
      const newItem = {
        relation: relation,
        entity: entity,
        entity_id: entityId
      };
      
      const savedItem = await savedItemService.createSavedItem(
        session.user.token,
        newItem
      );
      
      if (savedItem) {
        setSavedItems(prevItems => [...(prevItems || []), savedItem]);
        
        if (entity === 'user') {
          const userData = await userService.fetchUserProfile(entityId, session.user.token);
          if (userData) {
            setSavedProfiles(prev => [...prev, {
              id: userData.user.id,
              username: userData.user.username,
              profile_image: userData.profile_image || '',
              type: relation,
              capacities: relation === ProfileCapacityType.Sharer ? userData.skills_available : userData.skills_wanted,
              languages: userData.language,
              territory: userData.territory?.[0]?.toString() || '',
              avatar: userData.avatar?.toString(),
              isOrganization: false,
              savedItemId: savedItem.id
            }]);
          }
        } else if (entity === 'org') {
          const orgData = await organizationProfileService.getOrganizationById(session.user.token, entityId);
          if (orgData) {
            setSavedProfiles(prev => [...prev, {
              id: orgData.id,
              username: orgData.name,
              profile_image: orgData.logo || '',
              type: relation,
              capacities: orgData.capacities || [],
              territory: orgData.territory || '',
              isOrganization: true,
              savedItemId: savedItem.id
            }]);
          }
        }
        
        setCount(prevCount => prevCount + 1);
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error creating saved item:", error);
      return false;
    }
  };

  return { 
    savedItems, 
    savedProfiles, 
    isLoading, 
    error, 
    count, 
    deleteSavedItem, 
    createSavedItem 
  };
}
