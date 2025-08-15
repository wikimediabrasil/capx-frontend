'use client';

import { useApp } from '@/contexts/AppContext';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { useSnackbar } from '@/app/providers/SnackbarProvider';
import LoadingState from '@/components/LoadingState';
import { useProfileEdit } from '@/contexts/ProfileEditContext';
import { useAffiliation } from '@/hooks/useAffiliation';
import { useAvatars } from '@/hooks/useAvatars';
import { useLanguage } from '@/hooks/useLanguage';
import { useProfile } from '@/hooks/useProfile';
import { useTerritories } from '@/hooks/useTerritories';
import { useWikimediaProject } from '@/hooks/useWikimediaProject';
import {
  addUniqueAffiliations,
  addUniqueCapacities,
  addUniqueCapacity,
  addUniqueItem,
  addUniqueLanguages,
  addUniqueTerritory,
} from '@/lib/utils/formDataUtils';
import { ensureArray, safeAccess } from '@/lib/utils/safeDataAccess';
import NoAvatarIcon from '@/public/static/images/no_avatar.svg';
import { Profile } from '@/types/profile';
import CapacityDebug from './CapacityDebug';
import DebugPanel from './DebugPanel';
import ProfileEditDesktopView from './ProfileEditDesktopView';
import ProfileEditMobileView from './ProfileEditMobileView';

// Import the new capacity hooks
import { useCapacityCache } from '@/contexts/CapacityCacheContext';
import { useAllCapacities } from '@/hooks/useAllCapacities';
import { useCapacities } from '@/hooks/useCapacities';
import { useProfileFormCapacitySelection } from '@/hooks/useCapacitySelection';
import { useLetsConnect } from '@/hooks/useLetsConnect';
import {
  getCapacityValidationErrorMessage,
  isCapacityValidationError,
  validateCapacitiesBeforeSave,
} from '@/lib/utils/capacityValidation';
import { LanguageProficiency } from '@/types/language';

// Helper function declarations moved to safeDataAccess.ts utility file

const fetchWikidataQid = async (name: string) => {
  try {
    const wikidataQuery = `
      SELECT ?item ?names ?p18 WHERE {
      VALUES ?names {
        "${name}"
      }
      ?item wdt:P4174 ?names.
      OPTIONAL { ?item wdt:P18 ?p18. }
      SERVICE wikibase:label { bd:serviceParam wikibase:language "pt-br,pt,en". }
    }`;
    const encodedQuery = encodeURIComponent(wikidataQuery);
    const response = await fetch(
      `https://query.wikidata.org/sparql?query=${encodedQuery}&format=json`
    );
    const data = await response.json();

    if (data?.results?.bindings?.length > 0) {
      return data.results.bindings[0].item.value.split('/').pop();
    }
    return null;
  } catch (error) {
    console.error('Error fetching Wikidata Qid:', error);
    return null;
  }
};

const fetchWikidataImage = async (qid: string) => {
  try {
    const sparqlQuery = `
      SELECT ?image WHERE {
        wd:${qid} wdt:P18 ?image.
      }
    `;
    const encodedQuery = encodeURIComponent(sparqlQuery);
    const response = await fetch(
      `https://query.wikidata.org/sparql?query=${encodedQuery}&format=json`
    );
    const data = await response.json();

    if (data?.results?.bindings?.length > 0) {
      return data.results.bindings[0].image.value;
    }
    return null;
  } catch (error) {
    console.error('Error fetching Wikidata image:', error);
    return null;
  }
};

export default function EditProfilePage() {
  const router = useRouter();
  const { data: session, status: sessionStatus } = useSession();
  const { isMobile, pageContent, language } = useApp();
  const { avatars, getAvatarById } = useAvatars();
  const token = session?.user?.token;
  const userId = session?.user?.id ? Number(session.user.id) : undefined;
  const { showSnackbar } = useSnackbar();
  const { unsavedData, setUnsavedData, clearUnsavedData } = useProfileEdit();
  const { preloadCapacities } = useCapacityCache();

  // Create a ref to track if capacities have been preloaded
  const capacitiesPreloadedRef = useRef(false);

  // Initialize capacity cache when the component mounts
  useEffect(() => {
    if (token && !capacitiesPreloadedRef.current) {
      preloadCapacities();
      capacitiesPreloadedRef.current = true;
    }
  }, [token, preloadCapacities]);

  // Initialize all hooks at the top of the component
  const {
    profile,
    isLoading: profileLoading,
    error: profileError,
    updateProfile,
    refetch,
    deleteProfile,
  } = useProfile(token, userId);
  const { territories, loading: territoriesLoading } = useTerritories(token);
  const { languages, loading: languagesLoading } = useLanguage(token);
  const { affiliations } = useAffiliation(token);
  const {
    wikimediaProjects,
    error: wikimediaProjectsError,
    retry: retryWikimediaProjects,
  } = useWikimediaProject(token);

  // Log wikimedia project error for debugging
  useEffect(() => {
    if (wikimediaProjectsError) {
      console.warn('Wikimedia Projects API error:', wikimediaProjectsError);
    }
  }, [wikimediaProjectsError]);

  // Get the capacity system with React Query
  const { getCapacityById, isLoadingRootCapacities } = useCapacities();
  const { allCapacities: capacities, loading: isLoadingAllCapacities } = useAllCapacities(token);

  const [showAvatarPopup, setShowAvatarPopup] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState<{
    id: number | null;
    src: string;
  }>({
    id: 0,
    src: NoAvatarIcon,
  });
  const [isWikidataSelected, setIsWikidataSelected] = useState(false);
  const [showCapacityModal, setShowCapacityModal] = useState(false);
  const [selectedCapacityType, setSelectedCapacityType] = useState<
    'known' | 'available' | 'wanted'
  >('known');
  const [showLetsConnectPopup, setShowLetsConnectPopup] = useState(false);
  const [loading, setLoading] = useState(false);
  const { letsConnectData, isLoading: isLetsConnectLoading } = useLetsConnect();
  const [formData, setFormData] = useState<Partial<Profile>>({
    about: '',
    affiliation: [],
    contact: '',
    display_name: '',
    language: [],
    profile_image: '',
    pronoun: '',
    skills_available: [],
    skills_known: [],
    skills_wanted: [],
    social: [],
    team: '',
    territory: undefined,
    wiki_alt: '',
    wikidata_qid: '',
    wikimedia_project: [],
  });
  const [avatarUrl, setAvatarUrl] = useState<string>(profile?.avatar ? NoAvatarIcon : NoAvatarIcon);
  // TODO: Remove this after Lets Connect Integration is complete
  const [hasAutomatedLetsConnect, setHasAutomatedLetsConnect] = useState(false);
  const [isImageLoading, setIsImageLoading] = useState(false);
  const [previousImageState, setPreviousImageState] = useState<{
    avatar: number | null;
    profile_image: string;
    wikidata_qid: string;
    src: string;
  }>({
    avatar: null,
    profile_image: '',
    wikidata_qid: '',
    src: NoAvatarIcon,
  });

  // Move useMemo before any early returns to fix Rules of Hooks violation
  const capacityIds = useMemo(
    () =>
      [
        ...(formData?.skills_known || []),
        ...(formData?.skills_available || []),
        ...(formData?.skills_wanted || []),
      ].map(id => Number(id)),
    [formData]
  );

  // Create a function to get capacity names using the optimized system
  const getCapacityName = useCallback(
    (capacityId: any) => {
      try {
        if (capacityId === null || capacityId === undefined) {
          return 'Unknown Capacity';
        }

        let id: number;
        if (typeof capacityId === 'object' && capacityId.code) {
          id = Number(capacityId.code);
        } else {
          id = Number(capacityId);
        }

        if (isNaN(id)) {
          return 'Unknown Capacity';
        }

        const capacity = getCapacityById(id);
        return capacity?.name || `Capacity ${id}`;
      } catch (error) {
        console.error('Error getting capacity name:', error);
        return 'Unknown Capacity';
      }
    },
    [getCapacityById]
  );

  // Redirect to home if not authenticated
  useEffect(() => {
    if (sessionStatus === 'unauthenticated') {
      router.push('/');
    }
  }, [sessionStatus, router]);

  // Create a ref to track if the form has been populated
  const formPopulatedRef = useRef(false);

  // Update formData when profile data is loaded
  useEffect(() => {
    if (profile && !formPopulatedRef.current) {
      setFormData({
        ...profile,
        affiliation: ensureArray<string>(profile.affiliation),
        territory: profile.territory,
        profile_image: profile.profile_image || '',
        wikidata_qid: profile.wikidata_qid || '',
        wikimedia_project: ensureArray<string>(profile.wikimedia_project),
        language: ensureArray<any>(profile.language),
        skills_known: ensureArray<number>(profile.skills_known),
        skills_available: ensureArray<number>(profile.skills_available),
        skills_wanted: ensureArray<number>(profile.skills_wanted),
      });
      formPopulatedRef.current = true;

      // Check if the user is using Wikidata
      const isUsingWikidata = Boolean(profile.wikidata_qid);
      setIsWikidataSelected(isUsingWikidata);

      if (isUsingWikidata) {
        // If the user is using Wikidata, set the Wikidata image
        setSelectedAvatar({
          id: -1,
          src: profile.profile_image || NoAvatarIcon,
        });
      } else if (profile.avatar) {
        // If the user is not using Wikidata, set the avatar
        const avatarData = avatars?.find(avatar => avatar.id === profile.avatar);
        setSelectedAvatar({
          id: profile.avatar,
          src: avatarData?.avatar_url || NoAvatarIcon,
        });
      } else {
        // If the user is not using Wikidata, set the default image
        setSelectedAvatar({
          id: 0,
          src: NoAvatarIcon,
        });
      }

      // Save the initial state
      setPreviousImageState({
        avatar: profile.avatar || null,
        profile_image: profile.profile_image || '',
        wikidata_qid: profile.wikidata_qid || '',
        src: isUsingWikidata
          ? profile.profile_image || NoAvatarIcon
          : avatars?.find(a => a.id === profile.avatar)?.avatar_url || NoAvatarIcon,
      });
    }
  }, [profile, avatars]);

  // Create a ref to track if unsaved data has been loaded
  const unsavedDataLoadedRef = useRef(false);


  // When the component mounts, check if there are unsaved data
  useEffect(() => {
    if (unsavedData) {
      setFormData(prevData => ({
        ...prevData,
        ...unsavedData,
      }));
      unsavedDataLoadedRef.current = true;
    }
  }, [unsavedData]);

  const wikidataImageLoadedRef = useRef(false);

  useEffect(() => {
    // Reset the ref when dependencies change
    wikidataImageLoadedRef.current = false;

    const loadWikidataImage = async () => {
      if (profile?.wikidata_qid && isWikidataSelected) {
        const wikidataImage = await fetchWikidataImage(profile.wikidata_qid);
        if (wikidataImage) {
          setSelectedAvatar({
            id: -1,
            src: wikidataImage,
          });

          if (!wikidataImageLoadedRef.current) {
            setFormData(prev => ({
              ...prev,
              profile_image: wikidataImage,
            }));
            wikidataImageLoadedRef.current = true;
          }
        }
      }
    };

    loadWikidataImage();
  }, [profile?.wikidata_qid, isWikidataSelected]);

  // Create a ref to track avatar loading status
  const avatarLoadedRef = useRef(false);

  // Memoize the fetch avatar function to avoid recreating it on every render
  const fetchAvatar = useCallback(async () => {
    if (typeof profile?.avatar === 'number' && profile?.avatar > 0 && !avatarLoadedRef.current) {
      try {
        const avatarData = await getAvatarById(profile.avatar);
        if (avatarData?.avatar_url) {
          setAvatarUrl(avatarData.avatar_url);
          avatarLoadedRef.current = true;
        }
      } catch (error) {
        console.error('Error fetching avatar:', error);
      }
    }
  }, [profile?.avatar, getAvatarById]);

  // Run the fetch only once when avatar ID changes
  useEffect(() => {
    // Reset the loading status when the avatar ID changes
    avatarLoadedRef.current = false;
    fetchAvatar();
  }, [fetchAvatar]);

  // Initialize capacity selection hook before any early returns
  const { handleCapacitySelect } = useProfileFormCapacitySelection(
    selectedCapacityType,
    formData,
    setFormData,
    addUniqueCapacity,
    ensureArray,
    () => setShowCapacityModal(false)
  );

  // Show loading state while session is loading
  if (sessionStatus === 'loading') {
    return <LoadingState fullScreen={true} />;
  }

  // If session is unauthenticated, don't render anything
  if (sessionStatus === 'unauthenticated') {
    return null;
  }

  // Show loading state while profile is loading
  if (profileLoading || isLoadingAllCapacities) {
    return <LoadingState fullScreen={true} />;
  }

  // Handle error state
  if (profileError) {
    console.error('Error loading profile:', profileError);
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <p className="text-xl text-red-500">
          {safeAccess(pageContent, 'error-loading-profile', 'Error loading profile')}
        </p>
        <button
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
          onClick={() => router.push('/')}
        >
          {safeAccess(pageContent, 'go-back', 'Go back')}
        </button>
      </div>
    );
  }

  const handleDeleteProfile = async () => {
    if (!token) {
      console.error('No token available');
      return;
    }

    try {
      await deleteProfile();
      router.push('/');
    } catch (error) {
      console.error('Error deleting profile:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      console.error('No token available');
      return;
    }

    // Validate capacities before saving
    const validationResult = validateCapacitiesBeforeSave(
      ensureArray<number>(formData.skills_known),
      ensureArray<number>(formData.skills_available),
      pageContent
    );

    if (!validationResult.isValid) {
      // Show validation error
      showSnackbar(validationResult.errors[0], 'error');
      return;
    }

    try {
      formData.automated_lets_connect = hasAutomatedLetsConnect ? true : undefined;
      await updateProfile(formData);
      clearUnsavedData(); // Clear unsaved data after saving successfully

      // Force a refetch to ensure the cache is updated
      await refetch();

      showSnackbar(pageContent['snackbar-edit-profile-success'], 'success');

      // Add a small delay to ensure the cache is updated before navigation
      setTimeout(() => {
        router.push('/profile');
      }, 100);
    } catch (error) {
      console.error('Error updating profile:', error);

      // Check if this is a capacity validation error from backend
      if (isCapacityValidationError(error)) {
        const errorMessage = getCapacityValidationErrorMessage(error, pageContent);
        showSnackbar(errorMessage, 'error');
      } else {
        showSnackbar(pageContent['snackbar-edit-profile-failed'], 'error');
      }
    } finally {
      setIsImageLoading(false);
    }
  };

  const handleAvatarSelect = (avatarId: number | null) => {
    setFormData(prev => ({
      ...prev,
      avatar: avatarId,
      profile_image: '', // Clear Wikidata data
      wikidata_qid: '', // Clear Wikidata data
    }));

    setIsWikidataSelected(false);

    // Se avatarId for null, usar a imagem NoAvatar
    const selectedAvatarUrl =
      avatarId === null
        ? 'https://upload.wikimedia.org/wikipedia/commons/6/60/CapX_-_No_avatar.svg'
        : avatars?.find(avatar => avatar.id === avatarId)?.avatar_url;

    setSelectedAvatar({
      id: avatarId,
      src: selectedAvatarUrl || NoAvatarIcon,
    });
  };

  const handleWikidataClick = async (newWikidataSelected: boolean) => {
    setIsImageLoading(true);
    setIsWikidataSelected(newWikidataSelected);

    try {
      if (newWikidataSelected) {
        // Save the current state before fetching the Wikidata image
        setPreviousImageState({
          avatar: formData.avatar || null,
          profile_image: formData.profile_image || '',
          wikidata_qid: formData.wikidata_qid || '',
          src: selectedAvatar.src,
        });

        if (!profile?.user.username) {
          throw new Error('Username not found');
        }

        const wikidataQid = await fetchWikidataQid(profile.user.username);

        if (wikidataQid) {
          const wikidataImage = await fetchWikidataImage(wikidataQid);

          // Update the state with the Wikidata image
          setSelectedAvatar({
            id: -1,
            src: wikidataImage || NoAvatarIcon,
          });

          // Update the formData with the Wikidata data
          const updatedFormData = {
            ...formData,
            profile_image: wikidataImage || '',
            wikidata_qid: wikidataQid,
            avatar: null, // Remove the avatar when using Wikidata
          };

          setFormData(updatedFormData);
          setUnsavedData(updatedFormData); // Important: also update the unsavedData
        } else {
          showSnackbar('Wikidata information not found for this username', 'error');
        }
      } else {
        // When unselecting the Wikidata option

        // Clear the Wikidata data and set the default image
        setSelectedAvatar({
          id: 0,
          src: NoAvatarIcon,
        });

        // Update the formData removing the Wikidata data
        const restoredFormData = {
          ...formData,
          profile_image: '',
          wikidata_qid: '',
          avatar: null, // Important: use null instead of 0
        };
        setFormData(restoredFormData);
        setUnsavedData(restoredFormData);
      }
    } catch (error) {
      console.error('Error fetching Wikidata data:', error);
      showSnackbar(pageContent['snackbar-edit-profile-failed-generic'], 'error');

      // In case of error, restore the previous state
      setSelectedAvatar({
        id: previousImageState.avatar || 0,
        src: previousImageState.src || NoAvatarIcon,
      });
    } finally {
      setIsImageLoading(false);
    }
  };

  const handleRemoveCapacity = (type: 'known' | 'available' | 'wanted', index: number) => {
    setFormData(prev => {
      const newFormData = { ...prev };
      const key = `skills_${type}` as 'skills_known' | 'skills_available' | 'skills_wanted';

      // Guarantee the array exists before filtering
      const currentArray = ensureArray<number>(newFormData[key]);
      newFormData[key] = currentArray.filter((_, i) => i !== index) as number[];

      return newFormData;
    });
  };

  const handleRemoveLanguage = (index: number) => {
    // Guarantee the language array exists
    const languageArray = ensureArray<any>(formData.language);

    setFormData({
      ...formData,
      language: languageArray.filter((_, i) => i !== index) as any[],
    });
  };

  const handleAddCapacity = (type: 'known' | 'available' | 'wanted') => {
    setSelectedCapacityType(type);
    setShowCapacityModal(true);
  };

  const handleAddProject = () => {
    setFormData(prev => ({
      ...prev,
      wikimedia_project: addUniqueItem(ensureArray<string>(prev.wikimedia_project), ''),
    }));
  };

  const goTo = (path: string) => {
    // Save unsaved data before navigating
    setUnsavedData(formData);
    router.push(path);
  };

  const handleLetsConnectImport = async () => {
    const allLanguages = Object.entries(languages).map(
      ([id, name]) =>
        ({
          id: Number(id),
          name: name,
          proficiency: '3',
        }) as LanguageProficiency
    );
    const letsConnectLanguages = allLanguages.filter(language =>
      letsConnectData?.reconciled_languages.includes(language.name || '')
    );

    const allCapacities = capacities.map(capacity => ({
      id: capacity.id,
      code: capacity.skill_wikidata_item,
    }));

    const letsConnectWantedCapacities = allCapacities.filter(capacity =>
      letsConnectData?.reconciled_want_to_learn.includes(capacity.code || '')
    );
    const letsConnectAvailableCapacities = allCapacities.filter(capacity =>
      letsConnectData?.reconciled_want_to_share.includes(capacity.code || '')
    );

    const allAffiliations = Object.entries(affiliations).map(([id, name]) => ({
      id: Number(id),
      name: name,
    }));

    const letsConnectAffiliation = allAffiliations.filter(affiliation => {
      const affiliationName = affiliation.name.split(' (')[0]; // Get everything before ' ('
      return affiliationName === letsConnectData?.reconciled_affiliation;
    });

    const allTerritories = Object.entries(territories).map(([id, name]) => ({
      id: Number(id),
      name: name,
    }));

    const letsConnectTerritory = allTerritories.find(
      territory => territory.name === letsConnectData?.reconciled_territory
    );
    const letsConnectTerritoryId = letsConnectTerritory?.id.toString() || '';

    if (letsConnectData) {
      // Ensure the arrays exist and are of the correct type
      const currentAffiliations = ensureArray<string>(formData.affiliation);
      const currentTerritories = ensureArray<string>(formData.territory);
      const currentLanguages = ensureArray<LanguageProficiency>(formData.language);
      const currentSkillsKnown = ensureArray<number>(formData.skills_known);
      const currentSkillsAvailable = ensureArray<number>(formData.skills_available);
      const currentSkillsWanted = ensureArray<number>(formData.skills_wanted);

      // Prepare the new data
      const newAffiliations = letsConnectAffiliation.map(affiliation => affiliation.id.toString());
      const newTerritories = letsConnectTerritoryId ? [letsConnectTerritoryId] : [];
      const newLanguages = letsConnectLanguages;
      const newSkillsKnown = letsConnectAvailableCapacities.map(capacity => capacity.id);
      const newSkillsAvailable = letsConnectAvailableCapacities.map(capacity => capacity.id);
      const newSkillsWanted = letsConnectWantedCapacities.map(capacity => capacity.id);

      setHasAutomatedLetsConnect(true);
      const updatedFormData = {
        ...formData,
        affiliation: addUniqueAffiliations(currentAffiliations, newAffiliations),
        language: addUniqueLanguages(currentLanguages, newLanguages),
        territory: addUniqueTerritory(currentTerritories, letsConnectTerritoryId),
        skills_known: addUniqueCapacities(currentSkillsKnown, newSkillsKnown),
        skills_available: addUniqueCapacities(currentSkillsAvailable, newSkillsAvailable),
        skills_wanted: addUniqueCapacities(currentSkillsWanted, newSkillsWanted),
      };
      setFormData(updatedFormData);
      setUnsavedData(updatedFormData);
      showSnackbar(pageContent['snackbar-lets-connect-import-success'], 'success');
      setLoading(true);
      setTimeout(() => {
        router.push('/profile/lets_connect');
      }, 3500);
    }
    setShowLetsConnectPopup(false);
  };

  const ViewProps: any = {
    selectedAvatar: {
      id: selectedAvatar.id,
      src: selectedAvatar.src || NoAvatarIcon,
    },
    handleAvatarSelect,
    hasLetsConnectData: letsConnectData !== null,
    showAvatarPopup,
    setShowAvatarPopup,
    handleWikidataClick,
    isWikidataSelected,
    showCapacityModal,
    setShowCapacityModal,
    handleCapacitySelect,
    selectedCapacityType,
    handleAddCapacity,
    handleRemoveCapacity,
    handleRemoveLanguage,
    getCapacityName,
    handleAddProject,
    handleSubmit,
    handleDeleteProfile,
    handleCancel: () => router.back(),
    formData,
    setFormData,
    territories: territories || {},
    languages: languages || {},
    affiliations: affiliations || {},
    wikimediaProjects: wikimediaProjects || {},
    avatars,
    profile,
    refetch,
    goTo,
    showLetsConnectPopup,
    setShowLetsConnectPopup,
    handleLetsConnectImport,
    isLetsConnectLoading,
  };

  // When showing debug information, include loading state
  if (isMobile) {
    return (
      <>
        <ProfileEditMobileView {...ViewProps} />
        {process.env.NODE_ENV === 'development' && (
          <>
            <DebugPanel
              data={{
                capacityIds,
                capacitiesLoading: isLoadingRootCapacities,
              }}
              title="Debug: Capacity IDs"
            />
            <CapacityDebug
              capacityIds={capacityIds}
              knownSkills={formData.skills_known}
              availableSkills={formData.skills_available}
              wantedSkills={formData.skills_wanted}
            />
          </>
        )}
      </>
    );
  }

  return (
    <>
      <ProfileEditDesktopView {...ViewProps} />
      {process.env.NODE_ENV === 'development' && (
        <>
          <DebugPanel
            data={{
              capacityIds,
              capacitiesLoading: isLoadingRootCapacities,
            }}
            title="Debug: Capacity IDs"
          />
          <CapacityDebug
            capacityIds={capacityIds}
            knownSkills={formData.skills_known}
            availableSkills={formData.skills_available}
            wantedSkills={formData.skills_wanted}
          />
        </>
      )}
    </>
  );
}
