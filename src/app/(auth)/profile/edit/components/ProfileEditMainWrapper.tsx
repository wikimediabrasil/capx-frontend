"use client";

import { useSession } from "next-auth/react";
import { useApp } from "@/contexts/AppContext";
import { useRouter } from "next/navigation";
import { useState, useEffect, useMemo, useRef, useCallback } from "react";

import NoAvatarIcon from "@/public/static/images/no_avatar.svg";
import { useProfile } from "@/hooks/useProfile";
import { useTerritories } from "@/hooks/useTerritories";
import { Profile } from "@/types/profile";
import { Capacity } from "@/types/capacity";
import { useLanguage } from "@/hooks/useLanguage";
import { useAffiliation } from "@/hooks/useAffiliation";
import { useWikimediaProject } from "@/hooks/useWikimediaProject";
import { useAvatars } from "@/hooks/useAvatars";
import ProfileEditDesktopView from "./ProfileEditDesktopView";
import ProfileEditMobileView from "./ProfileEditMobileView";
import { useSnackbar } from "@/app/providers/SnackbarProvider";
import { useProfileEdit } from "@/contexts/ProfileEditContext";
import LoadingState from "@/components/LoadingState";
import DebugPanel from "./DebugPanel";
import CapacityDebug from "./CapacityDebug";
import {
  ensureArray,
  safeAccess,
  createSafeFunction,
} from "@/lib/utils/safeDataAccess";

// Import the new capacity hooks
import { useCapacities } from "@/hooks/useCapacities";
import { useCapacityCache } from "@/contexts/CapacityCacheContext";

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
      return data.results.bindings[0].item.value.split("/").pop();
    }
    return null;
  } catch (error) {
    console.error("Error fetching Wikidata Qid:", error);
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
    console.error("Error fetching Wikidata image:", error);
    return null;
  }
};

export default function EditProfilePage() {
  const router = useRouter();
  const { data: session, status: sessionStatus } = useSession();
  const { isMobile, pageContent } = useApp();
  const { avatars, getAvatarById } = useAvatars();
  const token = session?.user?.token;
  const userId = session?.user?.id ? Number(session.user.id) : undefined;
  const { showSnackbar } = useSnackbar();
  const { unsavedData, setUnsavedData, clearUnsavedData } = useProfileEdit();
  const { preloadCapacities } = useCapacityCache();

  // Initialize capacity cache when the component mounts
  useEffect(() => {
    if (token) {
      preloadCapacities();
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
  const { wikimediaProjects } = useWikimediaProject(token);

  // Get the capacity system with React Query
  const { getCapacityById, isLoadingRootCapacities } = useCapacities();

  const [showAvatarPopup, setShowAvatarPopup] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState({
    id: 0,
    src: NoAvatarIcon,
  });
  const [isWikidataSelected, setIsWikidataSelected] = useState(false);
  const [showCapacityModal, setShowCapacityModal] = useState(false);
  const [selectedCapacityType, setSelectedCapacityType] = useState<
    "known" | "available" | "wanted"
  >("known");
  const [formData, setFormData] = useState<Partial<Profile>>({
    about: "",
    affiliation: [],
    contact: "",
    display_name: "",
    language: [],
    profile_image: "",
    pronoun: "",
    skills_available: [],
    skills_known: [],
    skills_wanted: [],
    social: [],
    team: "",
    territory: undefined,
    wiki_alt: "",
    wikidata_qid: "",
    wikimedia_project: [],
  });
  const [avatarUrl, setAvatarUrl] = useState<string>(
    profile?.avatar ? NoAvatarIcon : NoAvatarIcon
  );

  // Calculate capacity IDs - do this early and make it stable
  const capacityIds = useMemo(() => {
    // Se formData não estiver inicializado, retorna array vazio
    if (!formData) return [];

    const knownSkills = ensureArray<number>(formData.skills_known || []);
    const availableSkills = ensureArray<number>(
      formData.skills_available || []
    );
    const wantedSkills = ensureArray<number>(formData.skills_wanted || []);

    // Combina todos os arrays e remove duplicatas
    const allIds = [...knownSkills, ...availableSkills, ...wantedSkills];
    const uniqueIds = Array.from(new Set(allIds)).filter(
      (id) => id !== null && id !== undefined
    );

    return uniqueIds;
  }, [
    formData?.skills_known,
    formData?.skills_available,
    formData?.skills_wanted,
  ]);

  // Create a function to get capacity names using the optimized system
  const getCapacityName = useCallback(
    (capacityId: any) => {
      try {
        if (capacityId === null || capacityId === undefined) {
          return "Unknown Capacity";
        }

        let id: number;
        if (typeof capacityId === "object" && capacityId.code) {
          id = Number(capacityId.code);
        } else {
          id = Number(capacityId);
        }

        if (isNaN(id)) {
          return "Unknown Capacity";
        }

        const capacity = getCapacityById(id);
        return capacity?.name || `Capacity ${id}`;
      } catch (error) {
        console.error("Error getting capacity name:", error);
        return "Unknown Capacity";
      }
    },
    [getCapacityById]
  );

  // Redirect to home if not authenticated
  useEffect(() => {
    if (sessionStatus === "unauthenticated") {
      router.push("/");
    }
  }, [sessionStatus, router]);

  // Update formData when profile data is loaded
  useEffect(() => {
    if (profile) {
      setFormData({
        ...profile,
        affiliation: ensureArray<string>(profile.affiliation),
        territory: profile.territory,
        profile_image: profile.profile_image || "",
        wikidata_qid: profile.wikidata_qid || "",
        wikimedia_project: ensureArray<string>(profile.wikimedia_project),
        language: ensureArray<any>(profile.language),
        skills_known: ensureArray<number>(profile.skills_known),
        skills_available: ensureArray<number>(profile.skills_available),
        skills_wanted: ensureArray<number>(profile.skills_wanted),
      });

      if (profile.avatar) {
        const avatarData = avatars?.find(
          (avatar) => avatar.id === profile.avatar
        );
        setSelectedAvatar({
          id: profile.avatar,
          src: avatarData?.avatar_url || NoAvatarIcon,
        });
        setIsWikidataSelected(false);
      } else if (profile.profile_image) {
        setSelectedAvatar({
          id: -1,
          src: profile.profile_image,
        });
        setIsWikidataSelected(true);
      } else {
        setSelectedAvatar({
          id: 0,
          src: NoAvatarIcon,
        });
      }
    }
  }, [profile, avatars]);

  // When the component mounts, check if there are unsaved data
  useEffect(() => {
    if (unsavedData) {
      setFormData((prevData) => ({
        ...prevData,
        ...unsavedData,
      }));
    }
  }, [unsavedData]);

  useEffect(() => {
    const loadWikidataImage = async () => {
      if (profile?.wikidata_qid && isWikidataSelected) {
        const wikidataImage = await fetchWikidataImage(profile.wikidata_qid);
        if (wikidataImage) {
          setSelectedAvatar({
            id: -1,
            src: wikidataImage,
          });
          setFormData((prev) => ({
            ...prev,
            profile_image: wikidataImage,
          }));
        }
      }
    };

    loadWikidataImage();
  }, [profile?.wikidata_qid, isWikidataSelected]);

  // Memoize the fetch avatar function to avoid recreating it on every render
  const fetchAvatar = useCallback(async () => {
    if (typeof profile?.avatar === "number" && profile?.avatar > 0) {
      try {
        const avatarData = await getAvatarById(profile.avatar);
        if (avatarData?.avatar_url) {
          setAvatarUrl(avatarData.avatar_url);
        }
      } catch (error) {
        console.error("Error fetching avatar:", error);
      }
    }
  }, [profile?.avatar, getAvatarById]);

  // Run the fetch only once when avatar ID changes
  useEffect(() => {
    fetchAvatar();
  }, [fetchAvatar]);

  // Show loading state while session is loading
  if (sessionStatus === "loading") {
    return <LoadingState />;
  }

  // If session is unauthenticated, don't render anything
  if (sessionStatus === "unauthenticated") {
    return null;
  }

  // Show loading state while profile is loading
  if (profileLoading) {
    return <LoadingState />;
  }

  // Handle error state
  if (profileError) {
    console.error("Error loading profile:", profileError);
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <p className="text-xl text-red-500">
          {safeAccess(
            pageContent,
            "error-loading-profile",
            "Error loading profile"
          )}
        </p>
        <button
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
          onClick={() => router.push("/")}
        >
          {safeAccess(pageContent, "go-back", "Go back")}
        </button>
      </div>
    );
  }

  const handleDeleteProfile = async () => {
    if (!token) {
      console.error("No token available");
      return;
    }

    try {
      await deleteProfile();
      router.push("/");
    } catch (error) {
      console.error("Error deleting profile:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      console.error("No token available");
      return;
    }

    try {
      await updateProfile(formData);
      clearUnsavedData(); // Clear unsaved data after saving successfully
      showSnackbar(
        safeAccess(
          pageContent,
          "snackbar-edit-profile-success",
          "Profile updated successfully"
        ),
        "success"
      );
      router.push("/profile");
    } catch (error) {
      if (error?.response?.status == 409) {
        showSnackbar(
          safeAccess(
            pageContent,
            "snackbar-edit-profile-failed-capacities",
            "Failed to update profile - capacity error"
          ),
          "error"
        );
      } else {
        showSnackbar(
          safeAccess(
            pageContent,
            "snackbar-edit-profile-failed-generic",
            "Failed to update profile"
          ),
          "error"
        );
      }
      console.error("Error updating profile:", error);
    }
  };

  const handleAvatarSelect = (avatarId: number) => {
    setFormData((prev) => ({
      ...prev,
      avatar: avatarId,
      profile_image: "",
      wikidata_qid: "",
    }));

    setIsWikidataSelected(false);

    const selectedAvatarUrl = avatars?.find(
      (avatar) => avatar.id === avatarId
    )?.avatar_url;
    if (selectedAvatarUrl) {
      setSelectedAvatar({
        id: avatarId,
        src: selectedAvatarUrl,
      });
    }
  };

  const handleWikidataClick = async () => {
    const newWikidataSelected = !isWikidataSelected;
    setIsWikidataSelected(newWikidataSelected);

    if (profile?.user?.username) {
      const wikidataQid = await fetchWikidataQid(profile.user.username);

      if (newWikidataSelected && wikidataQid) {
        const wikidataImage = await fetchWikidataImage(wikidataQid);

        if (wikidataImage) {
          // Update local state
          setSelectedAvatar({
            id: -1,
            src: wikidataImage,
          });

          // Prepare data for update
          const updatedData = {
            ...formData,
            profile_image: wikidataImage,
            wikidata_qid: wikidataQid,
            avatar: null, // Remove the avatar when using Wikidata image
          };

          setFormData(updatedData);

          // Update immediately in the backend
          try {
            await updateProfile(updatedData);
            await refetch(); // Reload the profile data
          } catch (error) {
            console.error("Error updating profile with Wikidata image:", error);
          }
        }
      } else {
        // Reverting to default state
        const updatedData = {
          ...formData,
          profile_image: "",
          wikidata_qid: "",
          avatar: null,
        };

        setSelectedAvatar({
          id: 0,
          src: "",
        });

        setFormData(updatedData);

        // Update immediately in the backend
        try {
          await updateProfile(updatedData);
          await refetch();
        } catch (error) {
          console.error("Error updating profile:", error);
        }
      }
    }
  };

  const handleRemoveCapacity = (
    type: "known" | "available" | "wanted",
    index: number
  ) => {
    setFormData((prev) => {
      const newFormData = { ...prev };
      const key = `skills_${type}` as
        | "skills_known"
        | "skills_available"
        | "skills_wanted";

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

  const handleAddCapacity = (type: "known" | "available" | "wanted") => {
    setSelectedCapacityType(type);
    setShowCapacityModal(true);
  };

  const handleCapacitySelect = (capacity: Capacity) => {
    setFormData((prev) => {
      const newFormData = { ...prev };
      const capacityId = Number(capacity.code);

      switch (selectedCapacityType) {
        case "known":
          newFormData.skills_known = [
            ...ensureArray(prev.skills_known),
            capacityId,
          ] as number[];
          break;
        case "available":
          newFormData.skills_available = [
            ...ensureArray(prev.skills_available),
            capacityId,
          ] as number[];
          break;
        case "wanted":
          newFormData.skills_wanted = [
            ...ensureArray(prev.skills_wanted),
            capacityId,
          ] as number[];
          break;
      }
      return newFormData;
    });
    setShowCapacityModal(false);
  };

  const handleAddProject = () => {
    setFormData((prev) => ({
      ...prev,
      wikimedia_project: [...ensureArray<string>(prev.wikimedia_project), ""],
    }));
  };

  const goTo = (path: string) => {
    // Save unsaved data before navigating
    setUnsavedData(formData);
    router.push(path);
  };

  const ViewProps: any = {
    selectedAvatar,
    handleAvatarSelect,
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
  };

  // When showing debug information, include loading state
  if (isMobile) {
    return (
      <>
        <ProfileEditMobileView {...ViewProps} />
        {process.env.NODE_ENV === "development" && (
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
      {process.env.NODE_ENV === "development" && (
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
