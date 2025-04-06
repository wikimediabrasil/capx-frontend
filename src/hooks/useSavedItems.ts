"use client";

import { useState, useEffect, useCallback } from "react";
import { savedItemService } from "@/services/savedItemsService";
import { useSession } from "next-auth/react";
import { SavedItem } from "@/types/saved_item";
import { userService } from "@/services/userService";
import { organizationProfileService } from "@/services/organizationProfileService";
import { ProfileCapacityType, ProfileFilterType } from "@/app/(auth)/feed/types";
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

export function useSavedItems() {
  const { data: session } = useSession();
  const [savedItems, setSavedItems] = useState<SavedItem[]>([]);
  const [allProfiles, setAllProfiles] = useState<SavedProfile[]>([]);
  const [filteredProfiles, setFilteredProfiles] = useState<SavedProfile[]>([]);
  const [count, setCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!session?.user?.token) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    
    const fetchSavedItems = async () => {
      try {
        const data = await savedItemService.getSavedItems(
          session.user.token,
          { limit: 100, offset: 0 }
        );

        setSavedItems(data.results);
        
        const profiles: SavedProfile[] = [];
        
        for (const item of data.results) {
          try {
            if (item.entity === 'user') {
              const userData = await userService.fetchUserProfile(item.entity_id, session.user.token);
              if (userData) {
                profiles.push({
                  id: userData.user.id,
                  username: userData.user.username,
                  profile_image: userData.profile_image || '',
                  type: item.relation || ProfileCapacityType.Learner,
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
              if (orgData) {
                profiles.push({
                  id: orgData.id,
                  username: orgData.display_name,
                  profile_image: orgData.profile_image,
                  type: item.relation,
                  avatar: orgData.profile_image || undefined,
                  capacities: item.relation === ProfileCapacityType.Learner ? orgData.wanted_capacities : orgData.available_capacities,
                  territory: orgData.territory[0],
                  isOrganization: true,
                  savedItemId: item.id
                });
              }
            }
          } catch (err) {
            console.error(`Error fetching details for saved item ${item.id}:`, err);
          }
        }
        
        setAllProfiles(profiles);
        setFilteredProfiles(profiles);
        setCount(profiles.length);
      } catch (err) {
        console.error("Error fetching saved items:", err);
        setError("Failed to fetch saved items");
      } finally {
        setIsLoading(false);
      }
    };

    fetchSavedItems();
  }, [session?.user?.token]);

  const fetchProfileDetails = useCallback(async (savedItem: SavedItem, token: string) => {
    try {
      if (savedItem.entity === 'user') {
        const userData = await userService.fetchUserProfile(savedItem.entity_id, token);
        if (userData) {
          const newProfile: SavedProfile = {
            id: userData.user.id,
            username: userData.user.username,
            profile_image: userData.profile_image || '',
            type: savedItem.relation || ProfileCapacityType.Learner,
            capacities: savedItem.relation === ProfileCapacityType.Sharer ? userData.skills_available : userData.skills_wanted,
            languages: userData.language,
            territory: userData.territory?.[0]?.toString() || '',
            avatar: userData.avatar?.toString(),
            isOrganization: false,
            savedItemId: savedItem.id
          };
          
          setAllProfiles(prev => [...prev, newProfile]);
          setFilteredProfiles(prev => [...prev, newProfile]);
          setCount(prev => prev + 1);
        }
      } else if (savedItem.entity === 'org') {
        const orgData = await organizationProfileService.getOrganizationById(token, savedItem.entity_id);
        if (orgData) {
          const newProfile: SavedProfile = {
            id: orgData.id,
            username: orgData.display_name,
            profile_image: orgData.profile_image,
            type: savedItem.relation,
            capacities: savedItem.relation === ProfileCapacityType.Learner ? orgData.wanted_capacities : orgData.available_capacities,
            territory: orgData.territory[0],
            avatar: orgData.profile_image || undefined,
            isOrganization: true,
            savedItemId: savedItem.id
          };
          
          setAllProfiles(prev => [...prev, newProfile]);
          setFilteredProfiles(prev => [...prev, newProfile]);
          setCount(prev => prev + 1);
        }
      }
    } catch (error) {
      console.error("Error fetching profile details:", error);
    }
  }, []);

  const applyFilters = useCallback((
    filters: {
      profileCapacityTypes?: ProfileCapacityType[];
      territories?: string[];
      languages?: string[];
      capacities?: any[];
      profileFilter?: ProfileFilterType;
    } = {}
  ) => {
    let filtered = [...allProfiles];

    if (filters.profileFilter === ProfileFilterType.User) {
      filtered = filtered.filter(profile => profile.isOrganization === false);
    } else if (filters.profileFilter === ProfileFilterType.Organization) {
      filtered = filtered.filter(profile => profile.isOrganization === true);
    }
    
    if (filters.profileCapacityTypes && filters.profileCapacityTypes.length > 0) {
      filtered = filtered.filter(profile => 
        filters.profileCapacityTypes?.includes(profile.type as ProfileCapacityType)
      );
    }
    
    if (filters.territories && filters.territories.length > 0) {
      filtered = filtered.filter(profile => 
        profile.territory && filters.territories?.includes(profile.territory.toString())
      );
    }

    // TODO confirm if we want to show orgs or not here (they don't have language). currently it's not showing
    if (filters.languages && filters.languages.length > 0) {
      filtered = filtered.filter(profile => 
        profile.languages?.some(lang => 
          filters.languages?.includes(lang.id.toString())
        )
      );
    }
    if (filters.capacities && filters.capacities.length > 0) {
      filtered = filtered.filter(profile => 
        profile.capacities && profile.capacities.some(capacity => 
          filters.capacities?.some(c => c.code == capacity)
        )
      );
    }
    setFilteredProfiles(filtered);
    setCount(filtered.length);
    
    return filtered;
  }, [allProfiles]);

  const paginatedProfiles = useCallback((page: number, itemsPerPage: number) => {
    const start = (page - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    return filteredProfiles.slice(start, end);
  }, [filteredProfiles]);

  const deleteSavedItem = useCallback(async (itemId: number) => {
    if (!session?.user?.token) return false;

    try {
      const success = await savedItemService.deleteSavedItem(session.user.token, itemId);
      
      if (success) {
        setSavedItems(prevItems => prevItems.filter(item => item.id !== itemId));
        setAllProfiles(prevProfiles => prevProfiles.filter(profile => profile.savedItemId !== itemId));
        setFilteredProfiles(prevProfiles => prevProfiles.filter(profile => profile.savedItemId !== itemId));
        setCount(prevCount => prevCount - 1);
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error deleting saved item:", error);
      return false;
    }
  }, [session?.user?.token]);

  const createSavedItem = useCallback(async (entity: string, entityId: number, relation: string) => {
    if (!session?.user?.token) return false;

    try {
      const newItem = await savedItemService.createSavedItem(
        session.user.token, 
        { 
          entity, 
          entity_id: entityId,
          relation
        }
      );
      
      if (newItem) {
        setSavedItems(prevItems => [...prevItems, newItem]);
        await fetchProfileDetails(newItem, session.user.token);
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error creating saved item:", error);
      return false;
    }
  }, [session?.user?.token, fetchProfileDetails]);

  const isProfileSaved = useCallback((profileId: number, isOrganization: boolean) => {
    return savedItems.some(item => 
      item.entity_id === profileId && 
      item.entity === (isOrganization ? 'org' : 'user')
    );
  }, [savedItems]);

  const getSavedItemId = useCallback((profileId: number, isOrganization: boolean) => {
    const savedItem = savedItems.find(item => 
      item.entity_id === profileId && 
      item.entity === (isOrganization ? 'org' : 'user')
    );
    return savedItem ? savedItem.id : null;
  }, [savedItems]);

  return { 
    savedItems, 
    savedProfiles: filteredProfiles,
    paginatedProfiles,
    applyFilters,
    isLoading, 
    error, 
    count, 
    deleteSavedItem,
    createSavedItem,
    isProfileSaved,
    getSavedItemId
  };
}
