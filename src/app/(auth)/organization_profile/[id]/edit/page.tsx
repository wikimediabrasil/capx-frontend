"use client";

import { useRouter, useParams } from "next/navigation";
import { useEffect, useMemo, useState, useRef } from "react";
import { useSession } from "next-auth/react";
import { useOrganization } from "@/hooks/useOrganizationProfile";
import { useTheme } from "@/contexts/ThemeContext";
import { useApp } from "@/contexts/AppContext";
import BaseButton from "@/components/BaseButton";
import Image from "next/image";
import UserCircleIcon from "@/public/static/images/supervised_user_circle.svg";
import UserCircleIconWhite from "@/public/static/images/supervised_user_circle_white.svg";
import SaveIcon from "@/public/static/images/save_as.svg";
import CancelIcon from "@/public/static/images/cancel.svg";
import CancelIconWhite from "@/public/static/images/cancel_white.svg";
import ReportIcon from "@/public/static/images/report.svg";
import ReportIconWhite from "@/public/static/images/report_white.svg";
import NeurologyIcon from "@/public/static/images/neurology.svg";
import EmojiIcon from "@/public/static/images/emoji_objects.svg";
import TargetIcon from "@/public/static/images/target.svg";
import CloseIcon from "@/public/static/images/close_mobile_menu_icon_light_mode.svg";
import CloseIconWhite from "@/public/static/images/close_mobile_menu_icon_dark_mode.svg";
import AddIcon from "@/public/static/images/add_dark.svg";
import AddIconWhite from "@/public/static/images/add.svg";
import WikimediaIcon from "@/public/static/images/wikimedia_logo_black.svg";
import AvatarIcon from "@/public/static/images/avatar.svg";
import NeurologyIconWhite from "@/public/static/images/neurology_white.svg";
import EmojiIconWhite from "@/public/static/images/emoji_objects_white.svg";
import TargetIconWhite from "@/public/static/images/target_white.svg";
import WikimediaIconWhite from "@/public/static/images/wikimedia_logo_white.svg";
import ContactMetaIcon from "@/public/static/images/contact_meta.svg";
import ContactMetaIconWhite from "@/public/static/images/contact_meta_white.svg";
import ContactEmailIcon from "@/public/static/images/contact_alternate_email.svg";
import ContactEmailIconWhite from "@/public/static/images/contact_alternate_email_white.svg";
import ContactPortalIcon from "@/public/static/images/contact_captive_portal.svg";
import ContactPortalIconWhite from "@/public/static/images/contact_captive_portal_white.svg";
import { Organization, OrganizationType } from "@/types/organization";
import { Capacity } from "@/types/capacity";
import CapacitySelectionModal from "../../../profile/edit/components/CapacitySelectionModal";
import { useCapacityDetails } from "@/hooks/useCapacityDetails";
import { useProject, useProjects } from "@/hooks/useProjects";
import { useDocument } from "@/hooks/useDocument";
import { Project } from "@/types/project";
import { Event } from "@/types/event";
import { useEvent, useEvents } from "@/hooks/useEvents";
import { tagDiff } from "@/types/tagDiff";
import { OrganizationDocument } from "@/types/document";
import { Contacts } from "@/types/contacts";
import { useTagDiff } from "@/hooks/useTagDiff";
import { useUserProfile } from "@/hooks/useUserProfile";
import ProjectsFormItem from "../../components/ProjectsFormItem";
import EventsFormItem from "../../components/EventsFormItem";
import NewsFormItem from "../../components/NewsFormItem";
import DocumentFormItem from "../../components/DocumentFormItem";
import { formatWikiImageUrl } from "@/lib/utils/fetchWikimediaData";
import LoadingState from "@/components/LoadingState";
import NoAvatarIcon from "@/public/static/images/no_avatar.svg";
import { getProfileImage } from "@/lib/utils/getProfileImage";
import { useAvatars } from "@/hooks/useAvatars";
import { useSnackbar } from "@/app/providers/SnackbarProvider";

interface ProfileOption {
  value: string;
  label: string | null | undefined;
  image: any | string;
}

export default function EditOrganizationProfilePage() {
  const router = useRouter();
  const params = useParams();
  const organizationId = params.id as string;
  const { data: session } = useSession();
  const token = session?.user?.token;
  const { darkMode } = useTheme();
  const { isMobile, pageContent } = useApp();
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  const [profileOptions, setProfileOptions] = useState<ProfileOption[]>([]);
  const [selectedProfile, setSelectedProfile] = useState<ProfileOption | null>(null);
  const {showSnackbar} = useSnackbar();

  // Documents setters
  const {
    documents,
    loading: isDocumentsLoading,
    error: documentsError,
    createDocument,
    deleteDocument,
    fetchSingleDocument,
  } = useDocument(token);

  // Organization setters


  const {
    organization,
    organizations,
    isLoading: isOrganizationLoading,
    error: organizationError,
    refetch,
    updateOrganization,
  } = useOrganization(token, Number(organizationId));

  // Projects setters
  const {
    projects,
    isLoading: isProjectsLoading,
    error: projectsError,
  } = useProjects(organization?.projects, token);

  // State for projects
  const [projectsData, setProjectsData] = useState<Project[]>([]);
  const projectsLoaded = useRef(false);

  // State for existing and new projects
  const [newProjects, setNewProjects] = useState<Project[]>([]);
  const [projectId, setProjectId] = useState<number>(0);
  const { createProject, updateProject, deleteProject } = useProject(
    projectId,
    token
  );

  const [editedProjects, setEditedProjects] = useState<{
    [key: number]: boolean;
  }>({});



  // Effect to load projects
  useEffect(() => {
    if (!organization || !projects) {
      projectsLoaded.current = false;
      return;
    }

    if (
      !projectsLoaded.current &&
      !isProjectsLoading &&
      organization?.projects &&
      organization?.projects?.length > 0 &&
      projects &&
      projects.length > 0
    ) {
      setProjectsData(projects);
      projectsLoaded.current = true;
    }
  }, [organization, projects, isProjectsLoading]);

  // Events setters
  const {
    events,
    isLoading: isEventsLoading,
    error: eventsError,
  } = useEvents(organization?.events, token);

  // State for events
  const [eventsData, setEventsData] = useState<Event[]>([]);
  const eventsLoaded = useRef(false);

  // State for existing and new events
  const [newEvents, setNewEvents] = useState<Event[]>([]);
  const [eventId, setEventId] = useState<number>(0);
  const { createEvent, updateEvent, deleteEvent } = useEvent(eventId, token);

  const [editedEvents, setEditedEvents] = useState<{
    [key: number]: boolean;
  }>({});

  // Effect to load events
  useEffect(() => {
    if (!organization || !events) {
      eventsLoaded.current = false;
      return;
    }

    if (
      !eventsLoaded.current &&
      !isEventsLoading &&
      organization?.events &&
      organization?.events?.length > 0 &&
      events &&
      events.length > 0
    ) {
      setEventsData(events);
      eventsLoaded.current = true;
    }
  }, [organization, events, isEventsLoading]);

  // Tags setters
  const { tagDiff, loading, fetchTags, fetchSingleTag, createTag, deleteTag } =
    useTagDiff(token);

  const [diffTagsData, setDiffTagsData] = useState<tagDiff[]>([]);

  // Documents setters

  const [documentsData, setDocumentsData] = useState<OrganizationDocument[]>(
    []
  );

  // Effect to load documents
  useEffect(() => {
    const loadDocuments = async () => {
      if (!organization?.documents || !documents) return;

      const loadedDocs = organization.documents
        .map((docId) => {
          const doc = documents.find((d) => d.id === docId);
          return doc
            ? {
                id: doc.id,
                url: doc.url || "",
              }
            : null;
        })
        .filter((doc): doc is { id: number; url: string } => doc !== null);

      setDocumentsData(loadedDocs);
    };

    loadDocuments();
  }, [organization?.documents, documents]);

  // Contacts setters
  const [contactsData, setContactsData] = useState<Contacts>({
    id: "",
    email: "",
    meta_page: "",
    website: "",
  });

  // Form data
  const [formData, setFormData] = useState<Partial<Organization>>({
    display_name: organization?.display_name || "",
    report_link: organization?.report_link || "",
    profile_image: organization?.profile_image || "",
    acronym: organization?.acronym || "",
    meta_page: organization?.meta_page || "",
    mastodon: organization?.mastodon || "",
    tag_diff: organization?.tag_diff || [],
    events: organization?.events || [],
    documents: organization?.documents || [],
    projects: organization?.projects || [],
    home_project: organization?.home_project || "",
    type: organization?.type || 0,
    territory: organization?.territory || [],
    managers: organization?.managers || [],
    known_capacities: organization?.known_capacities || [],
    available_capacities: organization?.available_capacities || [],
    wanted_capacities: organization?.wanted_capacities || [],
  });

  // Use effect to initialize the form data
  useEffect(() => {
    if (organization && !isInitialized) {
      setFormData({
        display_name: organization.display_name || "",
        profile_image: organization.profile_image || "",
        acronym: organization.acronym || "",
        meta_page: organization.meta_page || "",
        email: organization.email || "",
        website: organization.website || "",
        mastodon: organization.mastodon || "",
        tag_diff: organization.tag_diff || [],
        projects: organization.projects || [],
        events: organization.events || [],
        documents: organization.documents || [],
        home_project: organization.home_project || "",
        type: organization.type || 0,
        territory: organization.territory || [],
        managers: organization.managers || [],
        known_capacities: organization.known_capacities || [],
        available_capacities: organization.available_capacities || [],
        wanted_capacities: organization.wanted_capacities || [],
      });

      // Initialize events data
      if (organization.events && organization.events.length > 0) {
        if (events) {
          setEventsData(events);
        }
      }

      // Initialize projects data
      if (organization.tag_diff && organization.tag_diff.length > 0) {
        const fetchTagsData = async () => {
          try {
            const tagPromises = organization?.tag_diff?.map((tagId) =>
              fetchSingleTag(tagId)
            );
            const tagsResults = await Promise.all(tagPromises || []);
            const validTags = tagsResults
              .filter(
                (tag): tag is NonNullable<typeof tag> =>
                  tag !== undefined && tag !== null
              )
              .map((tagData) => ({
                id: tagData.id,
                tag: tagData.tag,
                created_at: tagData.created_at || new Date().toISOString(),
                updated_at: tagData.updated_at || new Date().toISOString(),
              }));
            setDiffTagsData(validTags);
          } catch (error) {
            showSnackbar(pageContent["snackbar-edit-profile-organization-fetch-tags-failed"],"error")
            console.error("Error fetching tags:", error);
          }
        };

        fetchTagsData();
      }

      // Initialize documents data
      if (
        organization.documents &&
        organization.documents.length > 0 &&
        documents
      ) {
        const existingDocuments = organization.documents.map((docId) => ({
          id: docId,
          url: documents?.find((d) => d.id === docId)?.url || "",
        }));
        setDocumentsData(existingDocuments);
      }

      // Initialize contacts data
      if (organization) {
        setContactsData({
          id: organization.id?.toString() || "",
          email: organization.email || "",
          meta_page: organization.meta_page || "",
          website: organization.website || "",
        });
      }
      setIsInitialized(true);
    }
  }, [
    organization,
    isInitialized,
    events,
    projects,
    isProjectsLoading,
    documents,
    tagDiff,
  ]);

  const validUpdatedIds = (updatedIds: number[]) => {
    return updatedIds.filter(
      (id): id is number => id !== null && id !== undefined
    );
  };

  const validNewIds = (newIds: number[]) => {
    return newIds.filter((id): id is number => id !== null && id !== undefined);
  };

  const handleSubmit = async () => {
    try {
      if (!token) {
        showSnackbar(pageContent["snackbar-edit-profile-organization-not-authenticated"],"error")
        console.error("No authentication token found");
        return;
      }

      if (!organizationId) {
        showSnackbar(pageContent["snackbar-edit-profile-organization-no-organization"],"error")
        console.error(
          "No organization ID found. User might not be a manager of any organization."
        );
        return;
      }

      const updateProjectPromises = projectsData
        .filter((project) => project.id !== 0)
        .map(async (project) => {
          try {
            await updateProject(project.id, {
              display_name: project.display_name,
              profile_image: project.profile_image,
              url: project.url,
              description: project.description || "",
              related_skills: project.related_skills,
              organization: Number(organizationId),
            });
            showSnackbar(pageContent["snackbar-edit-profile-organization-success"],"success")
            return project.id;
          } catch (error) {
            showSnackbar(pageContent["snackbar-edit-profile-organization-update-project-failed"],"error")
            console.error(`Error updating project ${project.id}:`, error);
            return project.id;
          }
        });

      const projectPromises = projectsData
        .filter((project) => project.id === 0)
        .map(async (project) => {
          try {
            const newProject = await createProject({
              display_name: project.display_name,
              profile_image: project.profile_image,
              url: project.url,
              description: project.description || "",
              creation_date: new Date().toISOString(),
              creator: Number(session?.user?.id),
              related_skills: [],
              organization: Number(organizationId),
            });
            if (!newProject || !newProject.id) {
              // TODO confirm this snackbar error message
              showSnackbar(pageContent["snackbar-edit-profile-organization-processing-document-failed"],"error")
              console.error("Invalid project response:", newProject);
              return null;
            }
            showSnackbar(pageContent["snackbar-edit-profile-organization-success"],"success")
            return newProject?.id;
          } catch (error) {
            showSnackbar(pageContent["snackbar-edit-profile-organization-create-project-failed"],"error")
            console.error("Error creating project:", error);
            return null;
          }
        });

      const [updatedProjectIds, newProjectIds] = await Promise.all([
        Promise.all(updateProjectPromises),
        Promise.all(projectPromises),
      ]);

      const validUpdatedProjectIds = validUpdatedIds(
        updatedProjectIds as number[]
      );
      const validNewProjectIds = validNewIds(newProjectIds as number[]);
      const allProjectIds = [...validUpdatedProjectIds, ...validNewProjectIds];

      const updateEventPromises = eventsData
        .filter((event) => event.id !== 0)
        .map(async (event) => {
          try {
            await updateEvent(event.id, {
              name: event.name,
              image_url: event.image_url,
              url: event.url,
              organizations: [Number(organizationId)],
              time_begin: event.time_begin,
              time_end: event.time_end,
            });
            showSnackbar(pageContent["snackbar-edit-profile-organization-success"],"success")
            return event.id;
          } catch (error) {
            showSnackbar(pageContent["snackbar-edit-profile-organization-update-event-failed"],"error")
            console.error(`Error updating event ${event.id}:`, error);
            return event.id;
          }
        });

      const eventPromises = eventsData
        .filter((event) => event.id === 0)
        .map(async (event) => {
          try {
            const newEvent = await createEvent({
              name: event.name,
              image_url: event.image_url,
              url: event.url,
              organizations: [Number(organizationId)],
              time_begin: event.time_begin,
              time_end: event.time_end,
              creator: Number(session?.user?.id),
              team: [],
              related_skills: [],
              type_of_location: "virtual",
              openstreetmap_id: event.openstreetmap_id || "",
              wikidata_qid: event.wikidata_qid || "",
            });

            if (!newEvent || !newEvent.id) {
              // TODO confirm this snackbar error message
              showSnackbar(pageContent["snackbar-edit-profile-organization-processing-document-failed"],"error")
              console.error("Invalid event response:", newEvent);
              return null;
            }
            showSnackbar(pageContent["snackbar-edit-profile-organization-success"],"success")
            return newEvent.id;
          } catch (error) {
            showSnackbar(pageContent["snackbar-edit-profile-organization-create-event-failed"],"error")
            console.error("Error creating event:", error);
            return null;
          }
        });

      const [updatedEventIds, newEventIds] = await Promise.all([
        Promise.all(updateEventPromises),
        Promise.all(eventPromises),
      ]);

      const validUpdatedEventIds = validUpdatedIds(updatedEventIds as number[]);
      const validNewEventIds = validNewIds(newEventIds as number[]);
      const allEventIds = [...validUpdatedEventIds, ...validNewEventIds];

      const tagResults = await Promise.all(
        diffTagsData.map(async (tag) => {
          try {
            // If it's a new tag (negative ID)
            if (tag.id < 0) {
              const tagPayload = {
                tag: tag.tag,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                creator: Number(session?.user?.id),
              };

              const response = await createTag(tagPayload);

              if (!response || !response.id) {
                showSnackbar(pageContent["snackbar-edit-profile-organization-create-tag-failed"],"error")
                console.error("Invalid tag response:", response);
                throw new Error("Invalid response from tag creation");
              }
              showSnackbar(pageContent["snackbar-edit-profile-organization-success"],"success")
              return response.id;
            } else {
              // If it's an existing tag, just return its ID
              return tag.id;
            }
          } catch (error) {
            showSnackbar(pageContent["snackbar-edit-profile-organization-processing-tag-failed"],"error")
            console.error("Error processing tag:", error);
            return null;
          }
        })
      );

      const documentResults = await Promise.all(
        documentsData.map(async (document) => {
          try {
            if (document.id === 0) {
              const documentPayload = {
                url: document.url,
              };

              const response = await createDocument(documentPayload);

              if (!response || !response.id) {
                showSnackbar(pageContent["snackbar-edit-profile-organization-create-document-failed"],"error")
                console.error("Invalid document response:", response);
                throw new Error("Invalid response from document creation");
              }

              return response.id;
            } else {
              return document.id;
            }
          } catch (error) {
            showSnackbar(pageContent["snackbar-edit-profile-organization-processing-document-failed"],"error")
            console.error("Error processing document:", error);
            return null;
          }
        })
      );

      const validDocumentIds = documentResults.filter(
        (id): id is number => id !== null && id !== undefined
      );

      const validTagIds = tagResults.filter(
        (id): id is number => id !== null && id !== undefined
      );

      const updatedFormData = {
        ...formData,
        events: allEventIds,
        projects: allProjectIds,
        tag_diff: validTagIds,
        documents: validDocumentIds,
        meta_page: contactsData.meta_page,
        email: contactsData.email,
        website: contactsData.website,
      };

      await updateOrganization(updatedFormData as Partial<OrganizationType>);
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Update the redirection to include the organization ID
      router.push(`/organization_profile/${organizationId}`);
    } catch (error) {
      if (error.response.status == 409){
        showSnackbar(pageContent["snackbar-edit-profile-failed-capacities"],"error")
      } else{
        showSnackbar(pageContent["snackbar-edit-profile-organization-processing-form-failed"],"error")
      }
      console.error("Error processing form:", error);
    }
  };

  // Handlers

  // Projects handlers
  const handleAddProject = () => {
    const newProject: Project = {
      id: 0,
      display_name: "",
      profile_image: "",
      url: "",
      description: "",
      organization: Number(organizationId),
      creation_date: new Date().toISOString(),
      creator: Number(session?.user?.id),
      related_skills: [],
    };

    setProjectsData((prev) => [...prev, newProject]);
  };

  const handleDeleteProject = async (projectId: number) => {
    try {
      if (projectId === 0) {
        setProjectsData((prev) => {
          const index = prev.findIndex((p) => p.id === 0);
          if (index !== -1) {
            const updated = [...prev];
            updated.splice(index, 1);
            return updated;
          }
          return prev;
        });
        return;
      }
      await deleteProject(projectId);
      setProjectsData((prev) => prev.filter((p) => p.id !== projectId));
      showSnackbar(pageContent["snackbar-edit-profile-organization-delete-project-success"],"success")
    } catch (error) {
      showSnackbar(pageContent["snackbar-edit-profile-organization-delete-project-failed"],"error")
      console.error("Error deleting project:", error);
    }
  };

  const handleProjectChange = (
    index: number,
    field: keyof Project,
    value: string
  ) => {
    setProjectsData((prev) => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        [field]: value,
      };
      return updated;
    });
  };

  // Events handlers
  const handleAddEvent = () => {
    const newEvent = {
      id: 0,
      name: "New Event",
      type_of_location: "virtual",
      url: "https://example.com",
      image_url: "https://commons.wikimedia.org/wiki/File:example.svg",
      time_begin: new Date().toISOString(),
      time_end: new Date().toISOString(),
      organization: Number(organizationId),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      creator: Number(session?.user?.id),
      team: [],
      description: "",
      related_skills: [],
      organizations: [],
      openstreetmap_id: "",
      wikidata_qid: "",
    };
    setEventsData((prev) => [...prev, newEvent]);
  };

  const handleDeleteEvent = async (eventId: number) => {
    try {
      if (eventId === 0) {
        setEventsData((prev) => {
          const index = prev.findIndex((e) => e.id === 0);
          if (index !== -1) {
            const updated = [...prev];
            updated.splice(index, 1);
            return updated;
          }
          return prev;
        });
        return;
      }
      await deleteEvent(eventId);
      showSnackbar(pageContent["snackbar-edit-profile-organization-delete-event-success"],"success")
      setEventsData((prev) => prev.filter((e) => e.id !== eventId));
    } catch (error) {
      showSnackbar(pageContent["snackbar-edit-profile-organization-delete-event-failed"],"error")
      console.error("Error deleting event:", error);
    }
  };

  const handleEventChange = async (
    index: number,
    field: keyof Event,
    value: string
  ) => {
    const event = eventsData[index];
    const updatedEvent = {
      ...event,
      [field]: value,
      type_of_location: event.type_of_location || "virtual",
    };

    // First update in the backend if it's an existing event
    if (event.id > 0 && token) {
      try {
        await updateEvent(event.id, updatedEvent);
      } catch (error) {
        console.error("Error updating event:", error);
        return; // If the update fails, do not update the local state
      }
    }

    // Then update the local state
    setEventsData((prev) => {
      const updated = [...prev];
      updated[index] = updatedEvent;
      return updated;
    });
  };

  // Diff tags handlers
  const handleAddDiffTag = () => {
    const newTag = {
      id: Math.floor(Math.random() * -1000), // Temporary negative ID for new tags
      tag: "", // Empty string instead of default text
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      creator: Number(session?.user?.id),
    };
    setDiffTagsData((prev) => [...(prev || []), newTag]);
  };

  const handleDiffTagChange = async (
    index: number,
    field: string,
    value: string
  ) => {
    const newDiffTags = [...diffTagsData];
    newDiffTags[index] = {
      ...newDiffTags[index],
      [field]: value,
      updated_at: new Date().toISOString(),
    };
    setDiffTagsData(newDiffTags);
  };

  const handleDeleteDiffTag = (index: number) => {
    const newDiffTags = [...diffTagsData];
    newDiffTags.splice(index, 1);
    setDiffTagsData(newDiffTags);
  };

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentCapacityType, setCurrentCapacityType] = useState<
    "known" | "available" | "wanted"
  >("known");

  // Capacities handlers
  const handleAddCapacity = (type: "known" | "available" | "wanted") => {
    setCurrentCapacityType(type);
    setIsModalOpen(true);
  };

  const handleCapacitySelect = (capacity: Capacity) => {
    setFormData((prev) => {
      const capacityField = `${currentCapacityType}_capacities` as keyof typeof prev;
      const currentCapacities = (prev[capacityField] as number[]) || [];

      if (capacity.code && !currentCapacities.includes(capacity.code)) {
        return {
          ...prev,
          [capacityField]: [...currentCapacities, capacity.code],
        };
      }
      return prev;
    });
    
    // Close modal after selection
    setIsModalOpen(false);
  };

  const capacityIds = useMemo(
    () =>
      [
        ...(formData?.known_capacities || []),
        ...(formData?.available_capacities || []),
        ...(formData?.wanted_capacities || []),
      ].map((id) => Number(id)),
    [formData]
  );

  const { getCapacityName } = useCapacityDetails(capacityIds);

  const handleRemoveCapacity = (
    type: "known" | "available" | "wanted",
    index: number
  ) => {
    setFormData((prev) => {
      const capacityField = `${type}_capacities` as keyof typeof prev;
      const currentCapacities = [...((prev[capacityField] as number[]) || [])];
      currentCapacities.splice(index, 1);

      return {
        ...prev,
        [capacityField]: currentCapacities,
      };
    });
  };

  // Documents handlers
  const handleAddDocument = () => {
    const newDocument: OrganizationDocument = {
      id: 0,
      url: "",
    };
    setDocumentsData((prev) => [...(prev || []), newDocument]);
  };

  const handleDeleteDocument = (index: number) => {
    setDocumentsData((prev) => {
      const newDocs = [...prev];
      newDocs.splice(index, 1);
      return newDocs;
    });
  };

  const handleDocumentChange = (
    index: number,
    field: string,
    value: string
  ) => {
    if (!Array.isArray(documentsData)) {
      setDocumentsData([]);
      return;
    }

    setDocumentsData((prev) => {
      const newDocuments = [...prev];
      newDocuments[index] = {
        ...newDocuments[index],
        [field]: value,
      };
      return newDocuments;
    });
  };

  useEffect(() => {
    console.log("Organization documents:", organization?.documents);
    console.log("Documents data:", documentsData);
    console.log("Documents from hook:", documents);
  }, [organization?.documents, documentsData, documents]);

  // Load user profile data
  const { userProfile, isLoading: isUserLoading } = useUserProfile();
  const { avatars } = useAvatars();

  useEffect(() => {
    if (userProfile && organizations) {
      const managedOrgOptions = (userProfile.is_manager || [])
        .map((orgId) => {
          const org = organizations.find((o) => o.id === orgId);
          if (!org) return null;
          
          return {
            value: `org_${org.id}`,
            label: org.display_name || '',
            image: org.profile_image ? formatWikiImageUrl(org.profile_image) : NoAvatarIcon,
          };
        })
        .filter((item): item is NonNullable<typeof item> => item !== null);
      
      const options: ProfileOption[] = [
        {
          value: 'user',
          label: userProfile.display_name || session?.user?.name || '',
          image: getProfileImage(userProfile?.profile_image, userProfile?.avatar, avatars),
        },
        ...managedOrgOptions
      ];
      
      setProfileOptions(options);
      
      const currentOrgOption = options.find(opt => opt.value === `org_${organizationId}`);
      if (currentOrgOption) {
        setSelectedProfile(currentOrgOption);
      }
    }
  }, [userProfile, organizations, organizationId, session?.user?.name, avatars]);
  
  if (isUserLoading || isOrganizationLoading) {
    return <LoadingState />;
  }

  if (isMobile) {
    return (
      <div
        className={`relative w-full overflow-x-hidden min-h-screen ${
          darkMode ? "bg-[#053749] text-white" : "bg-white text-[#053749]"
        }`}
      >
        <section
          className={`w-full max-w-screen-xl mx-auto px-4 py-8 ${
            isMobile ? "mt-[80px]" : "mt-[64px]"
          }`}
        >
          <div className="flex flex-col gap-6 max-w-[600px] mx-auto">
            {/* Header */}
            <div className="flex flex-col gap-4">
              <div className="flex flex-row justify-between gap-4 items-center">
                <div className="flex flex-col gap-2">
                  <h1
                    className={`font-[Montserrat] text-[16px] not-italic font-normal leading-[29px] ${
                      darkMode ? "text-white" : "text-[#053749]"
                    }`}
                  >
                    {pageContent["edit-profile-welcome"]}
                  </h1>
                  <h2
                    className={`font-[Montserrat] text-[20px] not-italic font-extrabold leading-[normal] ${
                      darkMode ? "text-white" : "text-[#053749]"
                    }`}
                  >
                    {session?.user?.name}
                  </h2>
                </div>
                <div className="relative w-[75px] h-[75px]">
                  <Image
                    src={getProfileImage(
                      userProfile?.profile_image,
                      userProfile?.avatar,
                      avatars
                    )}
                    alt="Avatar"
                    className="w-full h-full"
                    width={75}
                    height={75}
                    priority
                    style={{
                      objectFit: "cover",
                    }}
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Image
                  src={darkMode ? UserCircleIconWhite : UserCircleIcon}
                  alt="User circle icon"
                  width={32}
                  height={32}
                />
                <span
                  className={`text-start font-[Montserrat] text-[16px] font-extrabold ${
                    darkMode ? "text-white" : "text-[#053749]"
                  }`}
                >
                  {formData?.display_name}
                </span>
              </div>

              {/* <p
                className={`font-[Montserrat] text-[12px] text-gray-600 ${
                  darkMode ? "text-white" : "text-[#053749]"
                }`}
              >
                {formData?.acronym}
              </p> */}

              {/* Logo Section */}
              <div className="w-full h-[78px] bg-[#EFEFEF] flex items-center justify-center">
                <div className="relative h-[51px] w-[127px]">
                  <Image
                    src={
                      formData?.profile_image
                        ? formatWikiImageUrl(formData?.profile_image)
                        : NoAvatarIcon
                    }
                    alt="Organization logo"
                    width={127}
                    height={51}
                    className="w-full rounded-lg object-contain"
                    priority
                  />
                </div>
              </div>

              {/* Save/Cancel Buttons */}
              <div className="flex flex-col gap-[10px] mt-4">
                <BaseButton
                  onClick={handleSubmit}
                  label={pageContent["edit-profile-save-organization"]}
                  customClass="w-full flex items-center px-[13px] py-[6px] pb-[6px] bg-[#851970] text-white rounded-md py-3 font-bold !mb-0"
                  imageUrl={SaveIcon}
                  imageAlt="Upload icon"
                  imageWidth={20}
                  imageHeight={20}
                />
                <BaseButton
                  onClick={() => router.back()}
                  label={pageContent["edit-profile-cancel"]}
                  customClass="flex border rounded-[4px] !mb-0 border-[1.5px] border-[solid] border-capx-dark-box-bg bg-[#FFF] items-center justify-between text-capx-dark-box-bg px-4 py-2 rounded-md font-[Montserrat] text-[14px] font-bold pb-[6px]"
                  imageUrl={darkMode ? CancelIconWhite : CancelIcon}
                  imageAlt="Cancel icon"
                  imageWidth={20}
                  imageHeight={20}
                />
              </div>
            </div>

      <div className="flex items-center gap-2 mb-2">
        <Image
          src={darkMode ? UserCircleIconWhite : UserCircleIcon}
          alt="User circle icon"
          style={{ width: "auto", height: "auto" }}
          width={20}
          height={20}
        />
        <span
          className={`text-center font-[Montserrat] text-[20px] md:text-[24px] not-italic font-extrabold leading-[normal] pl-2 ${
            darkMode ? "text-white" : "text-capx-dark-box-bg"
          }`}
        >
          {organization?.display_name}
        </span>
      </div>

      <div className="mt-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="relative w-[48px] h-[48px]">
              <Image
                src={darkMode ? WikimediaIconWhite : WikimediaIcon}
                alt="Organization logo"
                className="object-contain"
              />
            </div>
            <h2 className={`font-[Montserrat] text-[14px] md:text-[24px] font-bold`}>
              {pageContent["edit-profile-organization-logo"]}
            </h2>
          </div>

          <div className={`flex flex-col gap-4 ${darkMode ? "text-white" : "text-[#053749]"}`}>
            <input
              type="text"
              placeholder="Wikimedia Commons image's link (ex: File:Example.jpg)"
              className={`w-full p-2 md:p-3 text-[14px] md:text-[24px] border rounded-md ${
                darkMode
                  ? "bg-transparent border-white text-white placeholder-gray-400"
                  : "border-gray-300 text-[#829BA4]"
              }`}
              value={formData.profile_image || ""}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  profile_image: e.target.value,
                })
              }
            />
            <p className={`text-[12px] md:text-[20px] ${darkMode ? "text-white" : "text-[#053749]"} mt-1`}>
              {pageContent["edit-profile-organization-logo-help"]}
            </p>

            {/* Preview da imagem */}
            <div className="w-full h-[200px] bg-[#EFEFEF] rounded-md flex items-center justify-center overflow-hidden">
              {formData.profile_image ? (
                <div className="relative w-full h-full">
                  <Image
                    src={formatWikiImageUrl(formData.profile_image)}
                    alt="Organization logo preview"
                    className="object-contain"
                    fill
                    onError={(e) => {
                      console.error('Erro ao carregar preview:', e);
                      e.currentTarget.src = NoAvatarIcon;
                    }}
                  />
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center">
                  <Image
                    src={NoAvatarIcon}
                    alt="No image"
                    width={100}
                    height={100}
                    className="opacity-50"
                  />
                  <span className="text-gray-500 mt-2">
                    {pageContent["edit-profile-no-image"]}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
            {/* Report of Activities Section */}
            <div className="mt-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="relative w-[20px] h-[20px]">
                  <Image
                    src={darkMode ? ReportIconWhite : ReportIcon}
                    alt="Report icon"
                    className="object-contain"
                  />
                </div>
                <h2 className={`font-[Montserrat] text-[14px] font-bold`}>
                  {pageContent["organization-profile-report-activities-title"]}
                </h2>
              </div>
              <input
                type="text"
                placeholder={pageContent["edit-profile-insert-link"]}
                className={`w-full p-2 text-[12px] border rounded-md ${
                  darkMode
                    ? "bg-transparent border-white text-white placeholder-gray-400"
                    : "border-gray-300 text-gray-700"
                }`}
                value={formData?.report_link || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    report_link: e.target.value,
                  })
                }
              />
              <p
                className={`text-[12px] ${
                  darkMode ? "text-white" : "text-[#053749]"
                } mt-1`}
              >
                {pageContent["organization-profile-provide-meta-link"]}
              </p>
            </div>

            {/* Capacities Sections */}
            <div className="space-y-6">
              {/* Known Capacities */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <div className="relative w-[20px] h-[20px]">
                    <Image
                      src={darkMode ? NeurologyIconWhite : NeurologyIcon}
                      alt="Neurology icon"
                      className="object-contain"
                    />
                  </div>
                  <h2
                    className={`font-[Montserrat] text-[14px] font-bold flex items-center gap-2 ${
                      darkMode ? "text-white" : "text-[#053749]"
                    }`}
                  >
                    {pageContent["body-profile-known-capacities-title"]}
                  </h2>
                </div>
                <div
                  className={`flex flex-wrap gap-2 rounded-[4px] ${
                    darkMode ? "bg-[#04222F]" : "bg-[#EFEFEF]"
                  } flex w-full px-[4px] py-[6px] items-start gap-[12px]`}
                >
                  {formData?.known_capacities?.map((capacity, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-1 rounded-md"
                    >
                      <BaseButton
                        onClick={() => handleRemoveCapacity("known", index)}
                        label={getCapacityName(capacity)}
                        customClass="rounded-[4px] border-[1px] border-[solid] border-[var(--Links-light-link,#0070B9)] flex p-[4px] pb-[4px] justify-center items-center gap-[4px] font-[Montserrat] text-[12px] not-italic font-normal leading-[normal]"
                        imageUrl={darkMode ? CloseIconWhite : CloseIcon}
                        imageAlt="Close icon"
                        imageWidth={16}
                        imageHeight={16}
                      />
                    </div>
                  ))}
                </div>

                <BaseButton
                  onClick={() => handleAddCapacity("known")}
                  label={pageContent["edit-profile-add-capacities"]}
                  customClass={`rounded-[4px] mt-2 flex w-full px-[13px] py-[6px] pb-[6px] items-center gap-[116px] text-center font-[Montserrat] text-[14px] not-italic font-extrabold leading-[normal] ${
                    darkMode
                      ? "text-[#053749] bg-[#EFEFEF]"
                      : "text-white bg-capx-dark-box-bg"
                  }`}
                  imageUrl={darkMode ? AddIcon : AddIconWhite}
                  imageAlt="Add icon"
                  imageWidth={20}
                  imageHeight={20}
                />
                <p
                  className={`text-[12px] ${
                    darkMode ? "text-white" : "text-[#053749]"
                  } mt-1`}
                >
                  {pageContent["edit-profile-select-skills"]}
                </p>
              </div>

              {/* Available Capacities */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <div className="relative w-[20px] h-[20px]">
                    <Image
                      src={darkMode ? EmojiIconWhite : EmojiIcon}
                      alt="Emoji icon"
                      className="object-contain"
                    />
                  </div>
                  <h2
                    className={`font-[Montserrat] text-[14px] font-bold flex items-center gap-2 ${
                      darkMode ? "text-white" : "text-[#053749]"
                    }`}
                  >
                    {pageContent["body-profile-available-capacities-title"]}
                  </h2>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  <div
                    className={`flex flex-wrap gap-2 mt-2 px-1 py-[6px] rounded-[4px] ${
                      darkMode
                        ? "text-white bg-[#04222F]"
                        : "text-[#053749] bg-transparent"
                    }`}
                  >
                    {formData?.available_capacities?.map((capacity, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-1 rounded-md"
                      >
                        <BaseButton
                          onClick={() =>
                            handleRemoveCapacity("available", index)
                          }
                          label={getCapacityName(capacity)}
                          customClass="rounded-[4px] border-[1px] border-[solid] border-[#05A300] flex p-[4px] pb-[4px] justify-center items-center gap-[4px] font-[Montserrat] text-[12px] not-italic font-normal leading-[normal]"
                          imageUrl={darkMode ? CloseIconWhite : CloseIcon}
                          imageAlt="Close icon"
                          imageWidth={16}
                          imageHeight={16}
                        />
                      </div>
                    ))}
                  </div>
                  <BaseButton
                    onClick={() => handleAddCapacity("available")}
                    label={pageContent["edit-profile-add-capacities"]}
                    customClass={`rounded-[4px] mt-2 flex w-full px-[13px] py-[6px] pb-[6px] items-center gap-[116px] text-center font-[Montserrat] text-[14px] not-italic font-extrabold leading-[normal] ${
                      darkMode
                        ? "text-[#053749] bg-[#EFEFEF]"
                        : "text-white bg-[#053749]"
                    }`}
                    imageUrl={darkMode ? AddIcon : AddIconWhite}
                    imageAlt="Add icon"
                    imageWidth={20}
                    imageHeight={20}
                  />
                  <p
                    className={`text-[12px] ${
                      darkMode ? "text-white" : "text-[#053749]"
                    } mt-1`}
                  >
                    {pageContent["body-profile-choose-skills"]}
                  </p>
                </div>
              </div>

              {/* Wanted Capacities */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <div className="relative w-[20px] h-[20px]">
                    <Image
                      src={darkMode ? TargetIconWhite : TargetIcon}
                      alt="Target icon"
                      className="object-contain"
                    />
                  </div>
                  <h2
                    className={`font-[Montserrat] text-[14px] font-bold flex items-center gap-2 ${
                      darkMode ? "text-white" : "text-[#053749]"
                    }`}
                  >
                    {pageContent["body-profile-wanted-capacities-title"]}
                  </h2>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  <div
                    className={`flex flex-wrap gap-2 mt-2 px-1 py-[6px] rounded-[4px] ${
                      darkMode
                        ? "text-white bg-[#04222F]"
                        : "text-[#053749] bg-transparent"
                    }`}
                  >
                    {formData?.wanted_capacities?.map((capacity, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-1 rounded-md"
                      >
                        <BaseButton
                          onClick={() => handleRemoveCapacity("wanted", index)}
                          label={getCapacityName(capacity)}
                          customClass="rounded-[4px] border-[1px] border-[solid] border-[#D43831] flex p-[4px] pb-[4px] justify-center items-center gap-[4px] font-[Montserrat] text-[12px] not-italic font-normal leading-[normal]"
                          imageUrl={darkMode ? CloseIconWhite : CloseIcon}
                          imageAlt="Close icon"
                          imageWidth={16}
                          imageHeight={16}
                        />
                      </div>
                    ))}
                  </div>
                  <BaseButton
                    onClick={() => handleAddCapacity("wanted")}
                    label={pageContent["edit-profile-add-capacities"]}
                    customClass={`rounded-[4px] mt-2 flex w-full px-[13px] py-[6px] pb-[6px] items-center gap-[116px] text-center font-[Montserrat] text-[14px] not-italic font-extrabold leading-[normal] ${
                      darkMode
                        ? "text-[#053749] bg-[#EFEFEF]"
                        : "text-white bg-[#053749]"
                    }`}
                    imageUrl={darkMode ? AddIcon : AddIconWhite}
                    imageAlt="Add icon"
                    imageWidth={20}
                    imageHeight={20}
                  />
                  <p
                    className={`text-[12px] ${
                      darkMode ? "text-white" : "text-[#053749]"
                    } `}
                  >
                    {pageContent["edit-profile-wanted-capacities"]}
                  </p>
                </div>
              </div>
            </div>

            {/* Projects Section */}
            <div className="mt-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="relative w-[20px] h-[20px]">
                  <Image
                    src={darkMode ? WikimediaIconWhite : WikimediaIcon}
                    alt="Project icon"
                    width={24}
                    height={24}
                    style={{ width: "auto", height: "auto" }}
                  />
                </div>
                <h2
                  className={`font-[Montserrat] text-[14px] font-bold ${
                    darkMode ? "text-white" : "text-[#053749]"
                  }`}
                >
                  {pageContent["edit-profile-main-projects"]}
                </h2>
              </div>

              <div className="flex flex-col w-full gap-2 mb-2">
                {projectsData.map((project, index) => (
                  <ProjectsFormItem
                    key={project.id === 0 ? `new-${index}` : project.id}
                    project={project}
                    index={index}
                    onDelete={handleDeleteProject}
                    onChange={handleProjectChange}
                  />
                ))}
                <BaseButton
                  onClick={() => {
                    handleAddProject();
                  }}
                  label={pageContent["edit-profile-add-more-projects"]}
                  customClass={`rounded-[4px] bg-capx-dark-box-bg flex w-full px-[13px] py-[6px] pb-[6px] items-center gap-[116px] text-center font-[Montserrat] text-[14px] md:text-[16px] not-italic font-extrabold leading-[normal] ${
                    darkMode
                      ? "bg-capx-light-box-bg text-[#04222F]"
                      : "bg-[#053749] text-white"
                  }`}
                  imageUrl={darkMode ? AddIcon : AddIconWhite}
                  imageAlt="Add project"
                  imageWidth={20}
                  imageHeight={20}
                />
              </div>
              <p
                className={`text-[12px] ${
                  darkMode ? "text-white" : "text-[#053749]"
                } mt-1`}
              >
                {pageContent["edit-profile-display-links"]}
              </p>
            </div>

            {/* Events Section */}
            {/* <div className="">
              <div className="flex items-center gap-2 mb-4">
                <div className="relative w-[20px] h-[20px]">
                  <Image
                    src={darkMode ? WikimediaIconWhite : WikimediaIcon}
                    alt="Event icon"
                    className="object-contain"
                  />
                </div>
                <h2
                  className={`font-[Montserrat] text-[14px] font-bold ${
                    darkMode ? "text-white" : "text-[#053749]"
                  }`}
                >
                  {pageContent["body-profile-section-title-events"]}
                </h2>
              </div>
              <div className="flex flex-col w-full gap-2 mb-2">
                {eventsData?.map((event, index) => (
                  <EventsFormItem
                    key={event.id === 0 ? `new-${index}` : event.id}
                    eventData={event}
                    index={index}
                    onDelete={handleDeleteEvent}
                    onChange={handleEventChange}
                  />
                ))}
                <BaseButton
                  onClick={handleAddEvent}
                  label={pageContent["edit-profile-add-more-events"]}
                  customClass={`rounded-[4px] bg-capx-dark-box-bg flex w-full px-[13px] py-[6px] pb-[6px] items-center gap-[116px] text-center font-[Montserrat] text-[14px] md:text-[16px] not-italic font-extrabold leading-[normal] ${
                    darkMode
                      ? "text-capx-dark-box-bg bg-white"
                      : "text-white bg-capx-dark-box-bg"
                  }`}
                  imageUrl={darkMode ? AddIcon : AddIconWhite}
                  imageAlt="Add icon"
                  imageWidth={20}
                  imageHeight={20}
                />
              </div>

              <p
                className={`text-[12px] ${
                  darkMode ? "text-white" : "text-[#053749]"
                } mt-1`}
              >
                {pageContent["body-profile-section-title-events"]}
              </p>
            </div> */}

            {/* News Section */}
            <div className="">
              <div className="flex items-center gap-2 mb-4">
                <div className="relative w-[20px] h-[20px]">
                  <Image
                    src={darkMode ? WikimediaIconWhite : WikimediaIcon}
                    alt="News icon"
                    className="object-contain"
                  />
                </div>
                <h2
                  className={`font-[Montserrat] text-[14px] font-bold ${
                    darkMode ? "text-white" : "text-[#053749]"
                  }`}
                >
                  {pageContent["edit-profile-news"]}
                </h2>
              </div>
              <div className="flex flex-col w-full gap-2 mb-2">
                {diffTagsData?.map((tag, index) => (
                  <NewsFormItem
                    key={tag.id === 0 ? `new-${index}` : tag.id}
                    news={tag}
                    index={index}
                    onDelete={handleDeleteDiffTag}
                    onChange={handleDiffTagChange}
                  />
                ))}
              </div>
              <BaseButton
                onClick={handleAddDiffTag}
                label={pageContent["edit-profile-add-more-diff-tags"]}
                customClass={`rounded-[4px] bg-capx-dark-box-bg flex w-full px-[13px] py-[6px] pb-[6px] items-center gap-[116px] text-center font-[Montserrat] text-[14px] not-italic font-extrabold leading-[normal] ${
                  darkMode
                    ? "text-capx-dark-box-bg bg-white"
                    : "text-white bg-capx-dark-box-bg"
                }`}
                imageUrl={darkMode ? AddIcon : AddIconWhite}
                imageAlt="Add icon"
                imageWidth={20}
                imageHeight={20}
              />
              <p
                className={`text-[12px] ${
                  darkMode ? "text-white" : "text-[#053749]"
                } mt-1`}
              >
                {pageContent["edit-profile-enter-diff-tags"]}
              </p>
            </div>

            {/* Documents Section */}
            <div className="mt-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="relative w-[20px] h-[20px]">
                  <Image
                    src={darkMode ? WikimediaIconWhite : WikimediaIcon}
                    alt="Document icon"
                    className="object-contain"
                  />
                </div>
                <h2
                  className={`font-[Montserrat] text-[14px] font-bold ${
                    darkMode ? "text-white" : "text-[#053749]"
                  }`}
                >
                  {pageContent["body-profile-section-title-documents"]}
                </h2>
              </div>
              <div className="flex flex-col w-full gap-2 mb-2">
                {Array.isArray(documentsData) &&
                  documentsData?.map((document, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <input
                        type="text"
                        placeholder={pageContent["edit-profile-insert-link"]}
                        className="w-full p-2 text-[12px] text-[#829BA4] border border-white bg-transparent rounded-md mb-2"
                        value={document.url || ""}
                        onChange={(e) => {
                          const newDocuments = [...documentsData];
                          newDocuments[index] = {
                            ...newDocuments[index],
                            url: e.target.value,
                          };
                          setDocumentsData(newDocuments);
                        }}
                      />
                      <button onClick={() => handleDeleteEvent(index)}>
                        <div className="relative w-[24px] h-[24px]">
                          <Image
                            src={darkMode ? CancelIconWhite : CancelIcon}
                            alt="Delete icon"
                            className="object-contain"
                            width={24}
                            height={24}
                          />
                        </div>
                      </button>
                    </div>
                  ))}
              </div>

              <BaseButton
                onClick={handleAddDocument}
                label={pageContent["edit-profile-add-more-links"]}
                customClass={`rounded-[4px] bg-capx-dark-box-bg flex w-full px-[13px] py-[6px] pb-[6px] items-center gap-[116px] text-center font-[Montserrat] text-[14px] not-italic font-extrabold leading-[normal] ${
                  darkMode
                    ? "text-capx-dark-box-bg bg-white"
                    : "text-white bg-capx-dark-box-bg"
                }`}
                imageUrl={darkMode ? AddIcon : AddIconWhite}
                imageAlt="Add icon"
                imageWidth={20}
                imageHeight={20}
              />
              <p
                className={`text-[12px] ${
                  darkMode ? "text-white" : "text-[#053749]"
                } mt-1`}
              >
                {pageContent["edit-profile-share-documents-tooltop"]}
              </p>
            </div>
            {/* Contacts Section */}

            <section className="w-full max-w-screen-xl py-8">
              <div className="flex flex-row flex pl-0 pr-[13px] py-[6px] items-center gap-[4px] rounded-[8px] mb-6">
                <div className="relative w-[20px] h-[20px]">
                  <Image
                    src={darkMode ? WikimediaIconWhite : WikimediaIcon}
                    alt="Wikimedia"
                    fill
                    style={{ objectFit: "contain" }}
                  />
                </div>
                <h2
                  className={`font-[Montserrat] text-[14px] not-italic font-extrabold leading-[normal] ${
                    darkMode ? "text-[#F6F6F6]" : "text-[#003649]"
                  }`}
                >
                  {pageContent["body-profile-section-title-contacts"]}
                </h2>
              </div>
              <div className="flex flex-col gap-4">
                <div
                  className={`flex flex-row border-[1px] border-[solid] w-full p-2 items-center gap-[12px] rounded-[4px] ${
                    darkMode ? "bg-capx-dark-box-bg" : "bg-[#FFF]"
                  }`}
                >
                  <div className="relative w-[20px] h-[20px]">
                    <Image
                      src={darkMode ? ContactMetaIconWhite : ContactMetaIcon}
                      alt="Contact Meta"
                      fill
                      className={`object-contain ${
                        darkMode ? "bg-capx-dark-box-bg" : "bg-white"
                      }`}
                    />
                  </div>
                  <input
                    type="text"
                    placeholder="Metawiki"
                    className={`text-start font-[Montserrat] text-[12px] not-italic font-normal leading-[normal] bg-transparent border-none outline-none w-full ${
                      darkMode ? "text-[#F6F6F6]" : "text-[#003649]"
                    }`}
                    value={contactsData.meta_page || ""}
                    onChange={(e) => {
                      const newValue = e.target.value;
                      setContactsData((prev) => ({
                        ...prev,
                        meta_page: newValue,
                      }));
                    }}
                  />
                </div>
                <div
                  className={`flex flex-row border-[1px] border-[solid] w-full p-2 items-center gap-[12px] rounded-[4px]`}
                >
                  <div className="relative w-[20px] h-[20px]">
                    <Image
                      src={darkMode ? ContactEmailIconWhite : ContactEmailIcon}
                      alt="Contact Email"
                      fill
                      style={{ objectFit: "cover" }}
                    />
                  </div>
                  <input
                    type="text"
                    placeholder="Email"
                    className={`text-start font-[Montserrat] text-[12px] not-italic font-normal leading-[normal] bg-transparent border-none outline-none w-full ${
                      darkMode ? "text-[#F6F6F6]" : "text-[#003649]"
                    }`}
                    value={contactsData.email || ""}
                    onChange={(e) => {
                      const newValue = e.target.value;
                      setContactsData((prev) => ({
                        ...prev,
                        email: newValue,
                      }));
                    }}
                  />
                </div>
                <div
                  className={`flex flex-row border-[1px] border-[solid] w-full p-2 items-center gap-[12px] rounded-[4px] ${
                    darkMode ? "bg-capx-dark-box-bg" : "bg-[#FFF]"
                  }`}
                >
                  <div className="relative w-[20px] h-[20px]">
                    <Image
                      src={
                        darkMode ? ContactPortalIconWhite : ContactPortalIcon
                      }
                      alt="Contact Website"
                      fill
                      style={{ objectFit: "cover" }}
                    />
                  </div>
                  <input
                    type="text"
                    placeholder="Website"
                    className={`text-start font-[Montserrat] text-[12px] not-italic font-normal leading-[normal] bg-transparent border-none outline-none w-full ${
                      darkMode ? "text-[#F6F6F6]" : "text-[#003649]"
                    }`}
                    value={contactsData.website || ""}
                    onChange={(e) => {
                      const newValue = e.target.value;
                      setContactsData((prev) => ({
                        ...prev,
                        website: newValue,
                      }));
                    }}
                  />
                </div>
              </div>

              <p
                className={`text-[20px] ${
                  darkMode ? "text-white" : "text-[#053749]"
                } mt-1`}
              ></p>
            </section>

            {/* Save/Cancel Buttons */}
            <div className="flex flex-row gap-2">
              <BaseButton
                onClick={handleSubmit}
                label={pageContent["edit-profile-save"]}
                customClass="flex border w-full rounded-[4px] border-[1.5px] border-[solid] border-capx-dark-box-bg bg-[#851970]  items-center justify-between text-white !px-[13px] !py-[6px] rounded-md font-[Montserrat] text-[14px] font-bold pb-[6px]"
                imageUrl={SaveIcon}
                imageAlt="Save icon"
                imageWidth={20}
                imageHeight={20}
              />
              <BaseButton
                onClick={() => router.back()}
                label={pageContent["edit-profile-cancel"]}
                customClass="flex border w-full rounded-[4px] border-[1.5px] border-[solid] border-capx-dark-box-bg bg-[#FFF] items-center justify-between text-capx-dark-box-bg !px-[13px] !py-[6px] rounded-md font-[Montserrat] text-[14px] font-bold pb-[6px]"
                imageUrl={CancelIcon}
                imageAlt="Cancel icon"
                imageWidth={20}
                imageHeight={20}
              />
            </div>
          </div>
        </section>
        <CapacitySelectionModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSelect={handleCapacitySelect}
          title={`Select ${currentCapacityType} capacities`}
        />
      </div>
    );
  }
  return (
    <div
      className={`relative w-full overflow-x-hidden min-h-screen ${
        darkMode ? "bg-capx-dark-box-bg text-white" : "bg-white text-[#053749]"
      }`}
    >
      <section
        className={`flex w-full h-full justify-between pb-6 pt-10 px-4 md:px-8 lg:px-12 max-w-screen-xl mx-auto`}
      >
        <div className="flex flex-col gap-6 mx-auto">
          {/* Header */}
          <div className="flex flex-row gap-12">
            {/* Logo Section */}
            <div className="w-1/2">
              <div className="rounded-[16px] h-full items-center justify-center flex bg-[#EFEFEF]">
                <div className="relative w-[300px] h-[165px]">
                  <Image
                    src={formatWikiImageUrl(formData?.profile_image || "")}
                    alt="Organization logo"
                    className="object-contain w-full rounded-lg"
                    fill
                    sizes="300px"
                    priority
                  />
                </div>
              </div>
            </div>
            <div className="w-1/2">
              <div className="relative w-[114px] h-[114px] mb-[24px]">
                <Image
                  src={getProfileImage(
                    userProfile?.profile_image,
                    userProfile?.avatar,
                    avatars
                  )}
                  alt="User Profile Image"
                  fill
                  sizes="114px"
                  priority
                  className="object-contain w-full rounded-lg"
                />
              </div>
              <div
                className={`flex flex-col gap-2 text-[30px] mb-[24px] ${
                  darkMode ? "text-white" : "text-[#053749]"
                }`}
              >
                <h1
                  className={`font-[Montserrat] not-italic font-normal leading-[29px] ${
                    darkMode ? "text-white" : "text-[#053749]"
                  }`}
                >
                  {pageContent["edit-profile-welcome"]}
                </h1>
                <h2
                  className={`font-[Montserrat] not-italic font-extrabold leading-[normal] ${
                    darkMode ? "text-white" : "text-[#053749]"
                  }`}
                >
                  {session?.user?.name}
                </h2>
              </div>

              <div className="flex items-center gap-2">
                <div className="relative w-[42px] h-[42px]">
                  <Image
                    src={darkMode ? UserCircleIconWhite : UserCircleIcon}
                    alt="User circle icon"
                    className="object-contain"
                  />
                </div>

                <span
                  className={`text-start font-[Montserrat] text-[24px] font-extrabold ${
                    darkMode ? "text-white" : "text-[#053749]"
                  }`}
                >
                  {formData?.display_name}
                </span>
              </div>

              {/* <p
                className={`font-[Montserrat] text-[20px] mt-3 mb-6 ${
                  darkMode ? "text-white" : "text-[#053749]"
                }`}
              >
                {formData?.acronym}
              </p> */}

              {/* Save/Cancel Buttons */}
              <div className="flex flex-col gap-4 mt-4">
                <BaseButton
                  onClick={handleSubmit}
                  label={pageContent["edit-profile-save"]}
                  customClass="flex bg-[#851970] items-center justify-between text-white px-4 py-2 rounded-[8px] font-[Montserrat] text-[24px] font-bold !px-[32px] !py-[16px] !w-3/4 h-auto !mb-0"
                  imageUrl={SaveIcon}
                  imageAlt="Save icon"
                  imageWidth={32}
                  imageHeight={32}
                />
                <BaseButton
                  onClick={() => router.back()}
                  label={pageContent["edit-profile-cancel"]}
                  customClass="flex border rounded-[4px] border-[1.5px] border-[solid] border-capx-dark-box-bg bg-[#FFF] items-center justify-between text-capx-dark-box-bg !px-[32px] !py-[16px] rounded-[8px] font-[Montserrat] text-[24px] w-3/4 font-bold pb-[6px]"
                  imageUrl={CancelIcon}
                  imageAlt="Cancel icon"
                  imageWidth={32}
                  imageHeight={32}
                />
              </div>
            </div>
          </div>
          <div className="mt-6">
  <div className="flex items-center gap-2 mb-4">
    <div className="relative w-[48px] h-[48px]">
      <Image
        src={darkMode ? WikimediaIconWhite : WikimediaIcon}
        alt="Organization logo"
        className="object-contain"
      />
    </div>
    <h2 className={`font-[Montserrat] text-[14px] md:text-[24px] font-bold`}>
      {pageContent["edit-profile-organization-logo"]}
    </h2>
  </div>

  <div className={`flex flex-col gap-4 ${darkMode ? "text-white" : "text-[#053749]"}`}>
    <input
      type="text"
      placeholder="Wikimedia Commons image's link (ex: File:Example.jpg)"
      className={`w-full p-2 md:p-3 text-[14px] md:text-[24px] border rounded-md ${
        darkMode
          ? "bg-transparent border-white text-white placeholder-gray-400"
          : "border-gray-300 text-[#829BA4]"
      }`}
      value={formData.profile_image || ""}
      onChange={(e) =>
        setFormData({
          ...formData,
          profile_image: e.target.value,
        })
      }
    />
    <p className={`text-[12px] md:text-[20px] ${darkMode ? "text-white" : "text-[#053749]"} mt-1`}>
      {pageContent["edit-profile-organization-logo-help"]}
    </p>

    {/* Preview da imagem */}
    <div className="w-full h-[200px] bg-[#EFEFEF] rounded-md flex items-center justify-center overflow-hidden">
      {formData.profile_image ? (
        <div className="relative w-full h-full">
          <Image
            src={formatWikiImageUrl(formData.profile_image)}
            alt="Organization logo preview"
            className="object-contain"
            fill
            onError={(e) => {
              console.error('Erro ao carregar preview:', e);
              e.currentTarget.src = NoAvatarIcon;
            }}
          />
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center">
          <Image
            src={NoAvatarIcon}
            alt="Sem imagem"
            width={100}
            height={100}
            className="opacity-50"
          />
          <span className="text-gray-500 mt-2">
            {pageContent["edit-profile-no-image"]}
          </span>
        </div>
      )}
    </div>
  </div>
</div>
          {/* Report of Activities Section */}
          <div className="mt-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="relative w-[48px] h-[48px]">
                <Image
                  src={darkMode ? ReportIconWhite : ReportIcon}
                  alt="Report icon"
                  className="object-contain"
                  fill
                />
              </div>
              <h2
                className={`font-[Montserrat] text-[14px] md:text-[24px] font-bold`}
              >
                {pageContent["organization-profile-report-activities-title"]}
              </h2>
            </div>
            <input
              type="text"
              placeholder={pageContent["edit-profile-insert-link"]}
              className={`w-full p-2 md:p-3 text-[24px] border rounded-md ${
                darkMode
                  ? "bg-transparent border-white text-white placeholder-gray-400"
                  : "border-gray-300 text-[#829BA4]"
              }`}
              value={formData.meta_page || ""}
              onChange={(e) =>
                setFormData({ ...formData, meta_page: e.target.value })
              }
            />
            <p
              className={`text-[20px] ${
                darkMode ? "text-white" : "text-[#053749]"
              } mt-1`}
            >
              {pageContent["organization-profile-provide-meta-link"]}
            </p>
          </div>

          {/* Capacities Sections */}
          <div className="space-y-6 mt-8">
            {/* Known Capacities */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="relative w-[48px] h-[48px]">
                  <Image
                    src={darkMode ? NeurologyIconWhite : NeurologyIcon}
                    alt="Neurology icon"
                    className="object-contain"
                  />
                </div>
                <h2
                  className={`font-[Montserrat] text-[14px] md:text-[24px] font-bold flex items-center gap-2 ${
                    darkMode ? "text-white" : "text-[#053749]"
                  }`}
                >
                  {pageContent["body-profile-known-capacities-title"]}
                </h2>
              </div>
              <div
                className={`flex flex-wrap gap-2 mt-2 px-[12px] py-[24px] rounded-[16px] ${
                  darkMode
                    ? "text-white bg-[#04222F]"
                    : "text-[#053749] bg-transparent"
                }`}
              >
                {formData.known_capacities?.map((capacity, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-1 rounded-md"
                  >
                    <BaseButton
                      onClick={() =>
                        handleRemoveCapacity(currentCapacityType, index)
                      }
                      label={getCapacityName(capacity)}
                      customClass={`rounded-[4px] border-[1px] border-[solid] border-[#0070B9] flex p-[4px] justify-center items-center gap-[4px] font-[Montserrat] text-[24px] not-italic font-normal leading-[normal]`}
                      imageUrl={darkMode ? CloseIconWhite : CloseIcon}
                      imageAlt="Close icon"
                      imageWidth={16}
                      imageHeight={16}
                    />
                  </div>
                ))}
              </div>

              <BaseButton
                onClick={() => handleAddCapacity("known")}
                label={pageContent["edit-profile-add-capacities"]}
                customClass={`rounded-[8px] !w-fit mt-2 flex !px-[32px] !py-[16px] !pb-[16px] items-center gap-3 text-center font-[Montserrat] text-[24px] not-italic font-extrabold leading-[normal] ${
                  darkMode
                    ? "text-[#053749] bg-[#EFEFEF]"
                    : "text-white bg-capx-dark-box-bg"
                }`}
                imageUrl={darkMode ? AddIcon : AddIconWhite}
                imageAlt="Add icon"
                imageWidth={32}
                imageHeight={32}
              />
              <p
                className={`text-[20px] ${
                  darkMode ? "text-white" : "text-[#053749]"
                } mt-1`}
              >
                {pageContent["edit-profile-select-skills"]}
              </p>
            </div>

            {/* Available Capacities */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="relative w-[48px] h-[48px]">
                  <Image
                    src={darkMode ? EmojiIconWhite : EmojiIcon}
                    alt="Emoji icon"
                    className="object-contain"
                  />
                </div>
                <h2
                  className={`font-[Montserrat] text-[14px] md:text-[24px] font-bold flex items-center gap-2 ${
                    darkMode ? "text-white" : "text-[#053749]"
                  }`}
                >
                  {pageContent["body-profile-available-capacities-title"]}
                </h2>
              </div>
              <div
                className={`flex flex-wrap gap-2 mt-2 px-[12px] py-[24px] rounded-[16px] ${
                  darkMode
                    ? "text-white bg-[#04222F]"
                    : "text-[#053749] bg-transparent"
                }`}
              >
                {formData.available_capacities?.map((capacity, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-1 rounded-md"
                  >
                    <BaseButton
                      onClick={() =>
                        handleRemoveCapacity(currentCapacityType, index)
                      }
                      label={getCapacityName(capacity)}
                      customClass={`rounded-[4px] border-[1px] border-[solid] border-[#05A300] flex p-[4px] justify-center items-center gap-[4px] font-[Montserrat] text-[24px] not-italic font-normal leading-[normal]`}
                      imageUrl={darkMode ? CloseIconWhite : CloseIcon}
                      imageAlt="Close icon"
                      imageWidth={16}
                      imageHeight={16}
                    />
                  </div>
                ))}
              </div>

              <BaseButton
                onClick={() => handleAddCapacity("available")}
                label={pageContent["edit-profile-add-capacities"]}
                customClass={`rounded-[8px] w-fit mt-2 flex !px-[32px] !py-[16px] !pb-[16px] items-center gap-3 text-center font-[Montserrat] text-[24px] not-italic font-extrabold leading-[normal] ${
                  darkMode
                    ? "text-[#053749] bg-[#EFEFEF]"
                    : "text-white bg-capx-dark-box-bg"
                }`}
                imageUrl={darkMode ? AddIcon : AddIconWhite}
                imageAlt="Add icon"
                imageWidth={32}
                imageHeight={32}
              />
              <p
                className={`text-[20px] ${
                  darkMode ? "text-white" : "text-[#053749]"
                } mt-1`}
              >
                {pageContent["body-profile-choose-skills"]}
              </p>
            </div>

            {/* Wanted Capacities */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="relative w-[48px] h-[48px]">
                  <Image
                    src={darkMode ? TargetIconWhite : TargetIcon}
                    alt="Target icon"
                    className="object-contain"
                  />
                </div>
                <h2
                  className={`font-[Montserrat] text-[14px] md:text-[24px] font-bold flex items-center gap-2 ${
                    darkMode ? "text-white" : "text-[#053749]"
                  }`}
                >
                  {pageContent["body-profile-wanted-capacities-title"]}
                </h2>
              </div>
              <div
                className={`flex flex-wrap gap-2 mt-2 px-[12px] py-[24px] rounded-[16px] ${
                  darkMode
                    ? "text-white bg-[#04222F]"
                    : "text-[#053749] bg-transparent"
                }`}
              >
                {formData.wanted_capacities?.map((capacity, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-1 rounded-md"
                  >
                    <BaseButton
                      onClick={() =>
                        handleRemoveCapacity(currentCapacityType, index)
                      }
                      label={getCapacityName(capacity)}
                      customClass={`rounded-[4px] border-[1px] border-[solid] border-[#D43831] flex p-[4px] justify-center items-center gap-[4px] font-[Montserrat] text-[24px] not-italic font-normal leading-[normal]`}
                      imageUrl={darkMode ? CloseIconWhite : CloseIcon}
                      imageAlt="Close icon"
                      imageWidth={16}
                      imageHeight={16}
                    />
                  </div>
                ))}
              </div>

              <BaseButton
                onClick={() => handleAddCapacity("wanted")}
                label={pageContent["edit-profile-add-capacities"]}
                customClass={`rounded-[8px] mt-2 flex w-fit !px-[32px] !py-[16px] !pb-[16px] items-center gap-3 text-center font-[Montserrat] text-[24px] not-italic font-extrabold leading-[normal] ${
                  darkMode
                    ? "text-[#053749] bg-[#EFEFEF]"
                    : "text-white bg-capx-dark-box-bg"
                }`}
                imageUrl={darkMode ? AddIcon : AddIconWhite}
                imageAlt="Add icon"
                imageWidth={32}
                imageHeight={32}
              />
              <p
                className={`text-[20px] ${
                  darkMode ? "text-white" : "text-[#053749]"
                } mt-1`}
              >
                {pageContent["edit-profile-wanted-capacities"]}
              </p>
            </div>
          </div>

          {/* Projects Section */}
          <div className="mt-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="relative w-[48px] h-[48px]">
                <Image
                  src={darkMode ? WikimediaIconWhite : WikimediaIcon}
                  alt="Project icon"
                  className="object-contain"
                  fill
                />
              </div>
              <h2
                className={`font-[Montserrat] text-[24px] font-bold ${
                  darkMode ? "text-white" : "text-[#053749]"
                }`}
              >
                {pageContent["edit-profile-main-projects"]}
              </h2>
            </div>

            <div className="flex w-full gap-2 mb-2 flex-col">
              {projectsData.map((project, index) => (
                <ProjectsFormItem
                  key={project.id === 0 ? `new-${index}` : project.id}
                  project={project}
                  index={index}
                  onDelete={handleDeleteProject}
                  onChange={handleProjectChange}
                />
              ))}
              <BaseButton
                onClick={() => {
                  handleAddProject();
                }}
                label={pageContent["edit-profile-add-projects"]}
                customClass={`rounded-[8px] mt-2 flex w-fit !px-[32px] !py-[16px] !pb-[16px] items-center gap-3 text-center font-[Montserrat] text-[24px] not-italic font-extrabold leading-[normal] ${
                  darkMode
                    ? "text-[#053749] bg-[#EFEFEF]"
                    : "text-white bg-capx-dark-box-bg"
                }`}
                imageUrl={darkMode ? AddIcon : AddIconWhite}
                imageAlt="Add icon"
                imageWidth={32}
                imageHeight={32}
              />
            </div>
            <p
              className={`text-[20px] ${
                darkMode ? "text-white" : "text-[#053749]"
              } mt-1`}
            >
              {pageContent["edit-profile-display-links"]}
            </p>
          </div>

          {/* Events Section */}
          {/*           <div className="mt-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="relative w-[48px] h-[48px]">
                <Image
                  src={darkMode ? WikimediaIconWhite : WikimediaIcon}
                  alt="Event icon"
                  fill
                  className="object-contain"
                />
              </div>
              <h2
                className={`font-[Montserrat] text-[14px] md:text-[24px] font-bold ${
                  darkMode ? "text-white" : "text-[#053749]"
                }`}
              >
                {pageContent["body-profile-section-title-events"]}
              </h2>
            </div>

            <div className="flex w-full flex-col mb-2 gap-2">
              {eventsData?.map((event, index) => (
                <EventsFormItem
                  key={event.id === 0 ? `new-${index}` : event.id}
                  eventData={event}
                  index={index}
                  onDelete={handleDeleteEvent}
                  onChange={handleEventChange}
                />
              ))}
              <BaseButton
                onClick={handleAddEvent}
                label={pageContent["edit-profile-add-events"]}
                customClass={`rounded-[8px] mt-2 flex w-fit !px-[32px] !py-[16px] !pb-[16px] items-center gap-3 text-center font-[Montserrat] text-[24px] not-italic font-extrabold leading-[normal] ${
                  darkMode
                    ? "text-[#053749] bg-[#EFEFEF]"
                    : "text-white bg-capx-dark-box-bg"
                }`}
                imageUrl={darkMode ? AddIcon : AddIconWhite}
                imageAlt="Add icon"
                imageWidth={32}
                imageHeight={32}
              />
            </div>
            <p
              className={`text-[20px] ${
                darkMode ? "text-white" : "text-[#053749]"
              } mt-1`}
            >
              {pageContent["edit-profile-display-events"]}
            </p>
          </div> */}

          {/* News Section */}
          <div className="mt-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="relative w-[48px] h-[48px]">
                <Image
                  src={darkMode ? WikimediaIconWhite : WikimediaIcon}
                  alt="News icon"
                  className="object-contain"
                  fill
                />
              </div>
              <h2
                className={`font-[Montserrat] text-[14px] md:text-[24px] font-bold ${
                  darkMode ? "text-white" : "text-[#053749]"
                }`}
              >
                {pageContent["edit-profile-news"]}
              </h2>
            </div>

            <div className="flex flex-col w-full gap-2 mb-2">
              {diffTagsData?.map((tag, index) => (
                <NewsFormItem
                  key={tag.id === 0 ? `new-${index}` : tag.id}
                  news={tag}
                  index={index}
                  onDelete={handleDeleteDiffTag}
                  onChange={handleDiffTagChange}
                />
              ))}
            </div>

            <BaseButton
              onClick={handleAddDiffTag}
              label={pageContent["edit-profile-add-diff-tags"]}
              customClass={`rounded-[8px] mt-2 flex w-fit !px-[32px] !py-[16px] !pb-[16px] items-center gap-3 text-center font-[Montserrat] text-[24px] not-italic font-extrabold leading-[normal] ${
                darkMode
                  ? "text-[#053749] bg-[#EFEFEF]"
                  : "text-white bg-capx-dark-box-bg"
              }`}
              imageUrl={darkMode ? AddIcon : AddIconWhite}
              imageAlt="Add icon"
              imageWidth={32}
              imageHeight={32}
            />
            <p
              className={`text-[20px] ${
                darkMode ? "text-white" : "text-[#053749]"
              } mt-1`}
            >
              {pageContent["edit-profile-enter-diff-tags"]}
            </p>
          </div>

          {/* Documents Section */}
          <div className="mt-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="relative w-[48px] h-[48px]">
                <Image
                  src={darkMode ? WikimediaIconWhite : WikimediaIcon}
                  alt="Document icon"
                  className="object-contain"
                  fill
                />
              </div>
              <h2
                className={`font-[Montserrat] text-[14px] md:text-[24px] font-bold ${
                  darkMode ? "text-white" : "text-[#053749]"
                }`}
              >
                {pageContent["body-profile-section-title-documents"]}
              </h2>
            </div>

            <div className="flex flex-col w-full gap-2 mb-2">
              {documentsData?.map((document, index) => (
                <DocumentFormItem
                  key={index}
                  document={document}
                  index={index}
                  onDelete={handleDeleteDocument}
                  onChange={handleDocumentChange}
                />
              ))}
            </div>

            <BaseButton
              onClick={handleAddDocument}
              label={pageContent["edit-profile-add-more-links"]}
              customClass={`rounded-[8px] mt-2 flex w-fit !px-[32px] !py-[16px] !pb-[16px] items-center gap-3 text-center font-[Montserrat] text-[24px] not-italic font-extrabold leading-[normal] ${
                darkMode
                  ? "text-[#053749] bg-[#EFEFEF]"
                  : "text-white bg-capx-dark-box-bg"
              }`}
              imageUrl={darkMode ? AddIcon : AddIconWhite}
              imageAlt="Add icon"
              imageWidth={32}
              imageHeight={32}
            />
            <p
              className={`text-[20px] ${
                darkMode ? "text-white" : "text-[#053749]"
              } mt-1`}
            >
              {pageContent["edit-profile-share-documents-tooltop"]}
            </p>
          </div>

          {/* Contacts Section */}

          <section className="w-full max-w-screen-xl py-8">
            <div className="flex flex-row flex pl-0 pr-[13px] py-[6px] items-center gap-[4px] rounded-[8px] mb-6">
              <div className="relative w-[48px] h-[48px]">
                <Image
                  src={darkMode ? WikimediaIconWhite : WikimediaIcon}
                  alt="Wikimedia"
                  fill
                  style={{ objectFit: "contain" }}
                />
              </div>
              <h2
                className={`font-[Montserrat] text-[24px] not-italic font-extrabold leading-[normal] ${
                  darkMode ? "text-[#F6F6F6]" : "text-[#003649]"
                }`}
              >
                {pageContent["body-profile-section-title-contacts"]}
              </h2>
            </div>
            <div className="flex flex-col gap-4">
              <div
                className={`flex flex-row border-[1px] border-[solid] w-full px-[12px] py-[24px] items-center gap-[12px] rounded-[16px] ${
                  darkMode
                    ? "bg-capx-dark-box-bg border-white"
                    : "bg-[#FFF] border-capx-dark-box-bg"
                }`}
              >
                <div className="relative w-[48px] h-[48px]">
                  <Image
                    src={darkMode ? ContactMetaIconWhite : ContactMetaIcon}
                    alt="Contact Meta"
                    fill
                    className={`object-contain ${
                      darkMode ? "bg-capx-dark-box-bg" : "bg-white"
                    }`}
                  />
                </div>
                <input
                  type="text"
                  placeholder="Metawiki"
                  className={`text-start font-[Montserrat] text-[24px] not-italic font-normal leading-[normal] bg-transparent border-none outline-none w-full ${
                    darkMode ? "text-[#F6F6F6]" : "text-[#003649]"
                  }`}
                  value={contactsData.meta_page || ""}
                  onChange={(e) => {
                    const newValue = e.target.value;
                    setContactsData((prev) => ({
                      ...prev,
                      meta_page: newValue,
                    }));
                  }}
                />
              </div>
              <div
                className={`flex flex-row border-[1px] border-[solid] w-full px-[12px] py-[24px] items-center gap-[12px] rounded-[16px] ${
                  darkMode
                    ? "bg-capx-dark-box-bg border-white"
                    : "bg-[#FFF] border-capx-dark-box-bg"
                }`}
              >
                <div className="relative w-[48px] h-[48px]">
                  <Image
                    src={darkMode ? ContactEmailIconWhite : ContactEmailIcon}
                    alt="Contact Email"
                    fill
                    style={{ objectFit: "cover" }}
                  />
                </div>
                <input
                  type="text"
                  placeholder="Email"
                  className={`text-start font-[Montserrat] text-[24px] not-italic font-normal leading-[normal] bg-transparent border-none outline-none w-full ${
                    darkMode ? "text-[#F6F6F6]" : "text-[#003649]"
                  }`}
                  value={contactsData.email || ""}
                  onChange={(e) => {
                    const newValue = e.target.value;
                    setContactsData((prev) => ({
                      ...prev,
                      email: newValue,
                    }));
                  }}
                />
              </div>
              <div
                className={`flex flex-row border-[1px] border-[solid] w-full px-[12px] py-[24px] items-center gap-[12px] rounded-[16px] ${
                  darkMode
                    ? "bg-capx-dark-box-bg border-white"
                    : "bg-[#FFF] border-capx-dark-box-bg"
                }`}
              >
                <div className="relative w-[48px] h-[48px]">
                  <Image
                    src={darkMode ? ContactPortalIconWhite : ContactPortalIcon}
                    alt="Contact Website"
                    fill
                    style={{ objectFit: "cover" }}
                  />
                </div>
                <input
                  type="text"
                  placeholder="Website"
                  className={`text-start font-[Montserrat] text-[24px] not-italic font-normal leading-[normal] bg-transparent border-none outline-none w-full ${
                    darkMode ? "text-[#F6F6F6]" : "text-[#003649]"
                  }`}
                  value={contactsData.website || ""}
                  onChange={(e) => {
                    const newValue = e.target.value;
                    setContactsData((prev) => ({
                      ...prev,
                      website: newValue,
                    }));
                  }}
                />
              </div>
            </div>

            <p
              className={`text-[20px] ${
                darkMode ? "text-white" : "text-[#053749]"
              } mt-1`}
            ></p>
          </section>

          {/* Save/Cancel Buttons */}
          <div className="flex flex-row gap-2 mt-6 w-[50%] md:w-[75%] lg:w-[50%]">
            <BaseButton
              onClick={handleSubmit}
              label={pageContent["edit-profile-save"]}
              customClass="flex border w-1/2 rounded-[4px] border-[1.5px] border-[solid] border-capx-dark-box-bg bg-[#851970]  items-center justify-between text-white !px-[32px] !py-[16px] rounded-md font-[Montserrat] text-[24px] font-bold pb-[6px]"
              imageUrl={SaveIcon}
              imageAlt="Save icon"
              imageWidth={32}
              imageHeight={32}
            />
            <BaseButton
              onClick={() => router.back()}
              label={pageContent["edit-profile-cancel"]}
              customClass="flex border w-1/2 rounded-[4px] border-[1.5px] border-[solid] border-capx-dark-box-bg bg-[#FFF] items-center justify-between text-capx-dark-box-bg !px-[32px] !py-[16px] rounded-md font-[Montserrat] text-[24px] font-bold pb-[6px]"
              imageUrl={CancelIcon}
              imageAlt="Cancel icon"
              imageWidth={32}
              imageHeight={32}
            />
          </div>
        </div>
      </section>
      <CapacitySelectionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSelect={handleCapacitySelect}
        title={pageContent["edit-profile-select-capacities"]?.replace(
          "$1",
          pageContent[currentCapacityType]
        )}
      />
    </div>
  );
}
