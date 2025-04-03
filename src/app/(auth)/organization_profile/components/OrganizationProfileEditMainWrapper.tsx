"use client";

import { useRouter, useParams } from "next/navigation";
import { useEffect, useMemo, useState, useRef } from "react";
import { useSession } from "next-auth/react";
import { useOrganization } from "@/hooks/useOrganizationProfile";
import { useApp } from "@/contexts/AppContext";
import { Organization, OrganizationType } from "@/types/organization";
import { Capacity } from "@/types/capacity";
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
import { formatWikiImageUrl } from "@/lib/utils/fetchWikimediaData";
import LoadingState from "@/components/LoadingState";
import NoAvatarIcon from "@/public/static/images/no_avatar.svg";
import { getProfileImage } from "@/lib/utils/getProfileImage";
import { useAvatars } from "@/hooks/useAvatars";
import { useSnackbar } from "@/app/providers/SnackbarProvider";
import OrganizationProfileEditMobileView from "./OrganizationProfileEditMobileView";
import OrganizationProfileEditDesktopView from "./OrganizationProfileEditDesktopView";
import EventsFormItem from "./EventsFormItem";
import { useTheme } from "@/contexts/ThemeContext";

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
  const { isMobile, pageContent } = useApp();
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { darkMode } = useTheme();

  const [profileOptions, setProfileOptions] = useState<ProfileOption[]>([]);
  const [selectedProfile, setSelectedProfile] = useState<ProfileOption | null>(
    null
  );
  const { showSnackbar } = useSnackbar();

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
  const [newEvent, setNewEvent] = useState<Event>();
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
            showSnackbar(
              pageContent[
                "snackbar-edit-profile-organization-fetch-tags-failed"
              ],
              "error"
            );
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
        showSnackbar(
          pageContent["snackbar-edit-profile-organization-not-authenticated"],
          "error"
        );
        console.error("No authentication token found");
        return;
      }

      if (!organizationId) {
        showSnackbar(
          pageContent["snackbar-edit-profile-organization-no-organization"],
          "error"
        );
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
            showSnackbar(
              pageContent["snackbar-edit-profile-organization-success"],
              "success"
            );
            return project.id;
          } catch (error) {
            showSnackbar(
              pageContent[
                "snackbar-edit-profile-organization-update-project-failed"
              ],
              "error"
            );
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
              showSnackbar(
                pageContent[
                  "snackbar-edit-profile-organization-processing-document-failed"
                ],
                "error"
              );
              console.error("Invalid project response:", newProject);
              return null;
            }
            showSnackbar(
              pageContent["snackbar-edit-profile-organization-success"],
              "success"
            );
            return newProject?.id;
          } catch (error) {
            showSnackbar(
              pageContent[
                "snackbar-edit-profile-organization-create-project-failed"
              ],
              "error"
            );
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
            showSnackbar(
              pageContent["snackbar-edit-profile-organization-success"],
              "success"
            );
            return event.id;
          } catch (error) {
            showSnackbar(
              pageContent[
                "snackbar-edit-profile-organization-update-event-failed"
              ],
              "error"
            );
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
              organized_by: organization?.display_name || "",
              team: [],
              related_skills: [],
              type_of_location: "virtual",
              openstreetmap_id: event.openstreetmap_id || "",
              wikidata_qid: event.wikidata_qid || "",
            });

            if (!newEvent || !newEvent.id) {
              // TODO confirm this snackbar error message
              showSnackbar(
                pageContent[
                  "snackbar-edit-profile-organization-processing-document-failed"
                ],
                "error"
              );
              console.error("Invalid event response:", newEvent);
              return null;
            }
            showSnackbar(
              pageContent["snackbar-edit-profile-organization-success"],
              "success"
            );
            return newEvent.id;
          } catch (error) {
            showSnackbar(
              pageContent[
                "snackbar-edit-profile-organization-create-event-failed"
              ],
              "error"
            );
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
                showSnackbar(
                  pageContent[
                    "snackbar-edit-profile-organization-create-tag-failed"
                  ],
                  "error"
                );
                console.error("Invalid tag response:", response);
                throw new Error("Invalid response from tag creation");
              }
              showSnackbar(
                pageContent["snackbar-edit-profile-organization-success"],
                "success"
              );
              return response.id;
            } else {
              // If it's an existing tag, just return its ID
              return tag.id;
            }
          } catch (error) {
            showSnackbar(
              pageContent[
                "snackbar-edit-profile-organization-processing-tag-failed"
              ],
              "error"
            );
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
                showSnackbar(
                  pageContent[
                    "snackbar-edit-profile-organization-create-document-failed"
                  ],
                  "error"
                );
                console.error("Invalid document response:", response);
                throw new Error("Invalid response from document creation");
              }

              return response.id;
            } else {
              return document.id;
            }
          } catch (error) {
            showSnackbar(
              pageContent[
                "snackbar-edit-profile-organization-processing-document-failed"
              ],
              "error"
            );
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
      if (error.response.status == 409) {
        showSnackbar(
          pageContent["snackbar-edit-profile-failed-capacities"],
          "error"
        );
      } else {
        showSnackbar(
          pageContent[
            "snackbar-edit-profile-organization-processing-form-failed"
          ],
          "error"
        );
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
      showSnackbar(
        pageContent[
          "snackbar-edit-profile-organization-delete-project-success"
        ],
        "success"
      );
    } catch (error) {
      showSnackbar(
        pageContent["snackbar-edit-profile-organization-delete-project-failed"],
        "error"
      );
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
  const [showEventModal, setShowEventModal] = useState(false);

  const handleAddEvent = () => {
    const eventData = {
      id: 0,
      name: "New Event",
      type_of_location: "virtual",
      url: "https://example.com",
      image_url: "https://commons.wikimedia.org/wiki/File:example.svg",
      time_begin: new Date().toISOString(),
      time_end: new Date().toISOString(),
      organization: Number(organizationId),
      organized_by: organization?.display_name || "",
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
    setNewEvent(eventData);
    setShowEventModal(true);
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
      showSnackbar(
        pageContent["snackbar-edit-profile-organization-delete-event-success"],
        "success"
      );
      setEventsData((prev) => prev.filter((e) => e.id !== eventId));
    } catch (error) {
      showSnackbar(
        pageContent["snackbar-edit-profile-organization-delete-event-failed"],
        "error"
      );
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
      const capacityField =
        `${currentCapacityType}_capacities` as keyof typeof prev;
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
            label: org.display_name || "",
            image: org.profile_image
              ? formatWikiImageUrl(org.profile_image)
              : NoAvatarIcon,
          };
        })
        .filter((item): item is NonNullable<typeof item> => item !== null);

      const options: ProfileOption[] = [
        {
          value: "user",
          label: userProfile.display_name || session?.user?.name || "",
          image: getProfileImage(
            userProfile?.profile_image,
            userProfile?.avatar,
            avatars
          ),
        },
        ...managedOrgOptions,
      ];

      setProfileOptions(options);

      const currentOrgOption = options.find(
        (opt) => opt.value === `org_${organizationId}`
      );
      if (currentOrgOption) {
        setSelectedProfile(currentOrgOption);
      }
    }
  }, [
    userProfile,
    organizations,
    organizationId,
    session?.user?.name,
    avatars,
  ]);

  const handleCreateEvent = () => {
    if (newEvent) {
      setEventsData((prev) => [...prev, newEvent]);
      setShowEventModal(false);
    }
  };

  if (isUserLoading || isOrganizationLoading) {
    return <LoadingState />;
  }

  if (isMobile) {
    return (
      <OrganizationProfileEditMobileView
        handleSubmit={handleSubmit}
        handleRemoveCapacity={handleRemoveCapacity}
        handleAddCapacity={handleAddCapacity}
        handleAddDocument={handleAddDocument}
        handleDeleteEvent={handleDeleteEvent}
        getCapacityName={getCapacityName}
        formData={formData}
        setFormData={setFormData}
        contactsData={contactsData}
        setContactsData={setContactsData}
        documentsData={documentsData}
        setDocumentsData={setDocumentsData}
        isModalOpen={isModalOpen}
        setIsModalOpen={setIsModalOpen}
        currentCapacityType={currentCapacityType}
        handleCapacitySelect={handleCapacitySelect}
        projectsData={projectsData}
        handleDeleteProject={handleDeleteProject}
        handleProjectChange={handleProjectChange}
        handleAddProject={handleAddProject}
        diffTagsData={diffTagsData}
        handleDeleteDiffTag={handleDeleteDiffTag}
        handleDiffTagChange={handleDiffTagChange}
        handleAddDiffTag={handleAddDiffTag}
        eventsData={eventsData}
        handleEventChange={handleEventChange}
        handleAddEvent={handleAddEvent}
      />
    );
  }
  return (
    <>
      <OrganizationProfileEditDesktopView
        handleSubmit={handleSubmit}
        handleRemoveCapacity={handleRemoveCapacity}
        handleAddCapacity={handleAddCapacity}
        handleAddDocument={handleAddDocument}
        handleDeleteEvent={handleDeleteEvent}
        getCapacityName={getCapacityName}
        formData={formData}
        setFormData={setFormData}
        contactsData={contactsData}
        setContactsData={setContactsData}
        documentsData={documentsData}
        setDocumentsData={setDocumentsData}
        isModalOpen={isModalOpen}
        setIsModalOpen={setIsModalOpen}
        currentCapacityType={currentCapacityType}
        handleCapacitySelect={handleCapacitySelect}
        projectsData={projectsData}
        handleDeleteProject={handleDeleteProject}
        handleProjectChange={handleProjectChange}
        handleAddProject={handleAddProject}
        diffTagsData={diffTagsData}
        handleDeleteDiffTag={handleDeleteDiffTag}
        handleDiffTagChange={handleDiffTagChange}
        handleAddDiffTag={handleAddDiffTag}
        eventsData={eventsData}
        handleEventChange={handleEventChange}
        handleAddEvent={handleAddEvent}
        handleDeleteDocument={handleDeleteDocument}
        handleDocumentChange={handleDocumentChange}
      />
      {showEventModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black bg-opacity-50"
            onClick={() => setShowEventModal(false)}
          />
          <div
            className={`relative rounded-lg p-6 w-11/12 max-w-2xl max-h-[90vh] overflow-y-auto ${
              darkMode ? "bg-capx-dark-box-bg" : "bg-white"
            }`}
          >
            <button
              onClick={() => setShowEventModal(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>

            <div className="mb-6">
              <h2 className="text-2xl font-bold text-[#053749] dark:text-white mb-4">
                {pageContent["organization-profile-new-event"]}
              </h2>
              <EventsFormItem
                eventData={newEvent as Event}
                index={eventsData.length}
                onDelete={() => setShowEventModal(false)}
                onChange={handleEventChange}
              />
            </div>

            <div className="flex justify-end gap-4 mt-6 border-t pt-4">
              <button
                onClick={() => setShowEventModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium rounded-md border border-gray-300 hover:border-gray-400"
              >
                {pageContent["cancel"]}
              </button>
              <button
                onClick={handleCreateEvent}
                className="px-4 py-2 bg-[#851970] text-white font-medium rounded-md hover:bg-[#6d145c]"
              >
                {pageContent["create-event"]}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
