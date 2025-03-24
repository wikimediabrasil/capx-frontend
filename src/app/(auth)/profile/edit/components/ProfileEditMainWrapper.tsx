"use client";

import { useSession } from "next-auth/react";
import { useApp } from "@/contexts/AppContext";
import { useRouter } from "next/navigation";
import { useState, useEffect, useMemo } from "react";

import NoAvatarIcon from "@/public/static/images/no_avatar.svg";
import { useProfile } from "@/hooks/useProfile";
import { useSkills } from "@/hooks/useSkills";
import { useTerritories } from "@/hooks/useTerritories";
import { Profile } from "@/types/profile";
import { useCapacityDetails } from "@/hooks/useCapacityDetails";
import { Capacity } from "@/types/capacity";
import { useLanguage } from "@/hooks/useLanguage";
import { useAffiliation } from "@/hooks/useAffiliation";
import { useWikimediaProject } from "@/hooks/useWikimediaProject";
import { useAvatars } from "@/hooks/useAvatars";
import ProfileEditDesktopView from "./ProfileEditDesktopView";
import ProfileEditMobileView from "./ProfileEditMobileView";
import { useSnackbar } from "@/app/providers/SnackbarProvider";

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

    if (data.results.bindings.length > 0) {
      return data.results.bindings[0].item.value.split("/").pop();
    }
    return null;
  } catch (error) {
    console.error("Error fetching Wikidata Qid:", error);
  }
};

const fetchWikidataImage = async (qid: string) => {
  try {
    // First, search for the Wikidata item image
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

    if (data.results.bindings.length > 0) {
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
  const { data: session } = useSession();
  const { isMobile, pageContent } = useApp();
  const { avatars } = useAvatars();
  const token = session?.user?.token;
  const userId = session?.user?.id;
  const { showSnackbar } = useSnackbar();

  const { profile, isLoading, error, updateProfile, refetch, deleteProfile } =
    useProfile(token, Number(userId));

  const { territories } = useTerritories(token);
  const { languages, loading: languagesLoading } = useLanguage(token);
  const { affiliations } = useAffiliation(token);
  const { wikimediaProjects } = useWikimediaProject(token);
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

  useEffect(() => {
    if (!token || !userId) {
      router.push("/");
    }
  }, [token, userId, router]);

  // Update formData when profile data is loaded
  useEffect(() => {
    if (profile) {
      setFormData({
        ...profile,
        affiliation: profile.affiliation ? profile.affiliation : [],
        territory: profile.territory ? profile.territory : undefined,
        profile_image: profile.profile_image || "",
        wikidata_qid: profile.wikidata_qid,
        wikimedia_project: profile.wikimedia_project || [],
        language: profile.language || [],
        skills_known: profile.skills_known || [],
        skills_available: profile.skills_available || [],
        skills_wanted: profile.skills_wanted || [],
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
  }, [profile]);

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

  const handleSubmit = async () => {
    if (!token) {
      console.error("No token available");
      return;
    }

    try {
      await updateProfile(formData);
      showSnackbar(pageContent["snackbar-edit-profile-success"],"success")
      router.push("/profile");
    } catch (error) {
      if (error.response.status == 409){
        showSnackbar(pageContent["snackbar-edit-profile-failed-capacities"],"error")
      }else{
        showSnackbar(pageContent["snackbar-edit-profile-failed-generic"],"error")
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

    if (profile?.user.username) {
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

  const capacityIds = useMemo(
    () =>
      [
        ...(formData?.skills_known || []),
        ...(formData?.skills_available || []),
        ...(formData?.skills_wanted || []),
      ].map((id) => Number(id)),
    [formData]
  );

  const { getCapacityName } = useCapacityDetails(capacityIds);

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

      if (Array.isArray(newFormData[key])) {
        newFormData[key] = (newFormData[key] as number[]).filter(
          (_, i) => i !== index
        );
      }

      return newFormData;
    });
  };

  const handleRemoveLanguage = (index: number) => {
    if (!formData.language) return;

    setFormData({
      ...formData,
      language: formData.language.filter((_, i) => i !== index),
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
            ...(prev.skills_known || []),
            capacityId,
          ] as number[];
          break;
        case "available":
          newFormData.skills_available = [
            ...(prev.skills_available || []),
            capacityId,
          ] as number[];
          break;
        case "wanted":
          newFormData.skills_wanted = [
            ...(prev.skills_wanted || []),
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
      wikimedia_project: [...(prev.wikimedia_project || []), ""],
    }));
  };

  const { getAvatarById } = useAvatars();
  const [avatarUrl, setAvatarUrl] = useState<string>(
    profile?.avatar || NoAvatarIcon
  );

  useEffect(() => {
    const fetchAvatar = async () => {
      if (typeof profile?.avatar === "number" && profile?.avatar > 0) {
        try {
          const avatarData = await getAvatarById(profile?.avatar);
          if (avatarData?.avatar_url) {
            setAvatarUrl(avatarData.avatar_url);
          }
        } catch (error) {
          console.error("Error fetching avatar:", error);
        }
      }
    };

    fetchAvatar();
  }, [profile?.avatar, getAvatarById]);

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
    refetch,
  };

  if (isMobile) {
    return <ProfileEditMobileView {...ViewProps} profile={profile} />;
  }

  return <ProfileEditDesktopView {...ViewProps} />;
}
