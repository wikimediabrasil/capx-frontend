"use client";

import { useRouter, useParams } from "next/navigation";
import { useEffect, useMemo, useState, useRef } from "react";
import { useSession } from "next-auth/react";
import { useOrganization } from "@/hooks/useOrganizationProfile";
import { useApp } from "@/contexts/AppContext";
import { Organization } from "@/types/organization";
import { Capacity } from "@/types/capacity";
import { useCapacityDetails } from "@/hooks/useCapacityDetails";
import { useCapacities } from "@/hooks/useCapacities";
import { useProject, useProjects } from "@/hooks/useProjects";
import { useDocument } from "@/hooks/useDocument";
import { Project } from "@/types/project";
import { Event } from "@/types/event";
import { useOrganizationEvents } from "@/hooks/useOrganizationEvents";
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
  const { darkMode } = useTheme();
  const { showSnackbar } = useSnackbar();
  const { userProfile, isLoading: isUserLoading } = useUserProfile();
  const { avatars } = useAvatars();

  /* State Management*/

  // State for profile options
  const [profileOptions, setProfileOptions] = useState<ProfileOption[]>([]);
  const [selectedProfile, setSelectedProfile] = useState<ProfileOption | null>(
    null
  );

  // State for projects
  const [projectsData, setProjectsData] = useState<Project[]>([]);
  const projectsLoaded = useRef(false);

  // State for existing and new projects
  const [newProjects, setNewProjects] = useState<Project[]>([]);
  const [projectId, setProjectId] = useState<number>(0);

  // State for diff tags
  const [diffTagsData, setDiffTagsData] = useState<tagDiff[]>([]);

  // State for events
  const [showEventModal, setShowEventModal] = useState(false);
  const [currentEditingEvent, setCurrentEditingEvent] = useState<Event | null>(
    null
  );
  const [editedEvents, setEditedEvents] = useState<{
    [key: number]: boolean;
  }>({});
  const [eventsData, setEventsData] = useState<Event[]>([]);
  const eventsLoaded = useRef(false);

  // State for capacities
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentCapacityType, setCurrentCapacityType] = useState<
    "known" | "available" | "wanted"
  >("known");

  /* Setters */

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

  const { createProject, updateProject, deleteProject } = useProject(
    projectId,
    token
  );

  // Tags setters
  const { tagDiff, loading, fetchTags, fetchSingleTag, createTag, deleteTag } =
    useTagDiff(token);

  // Documents setters
  const [documentsData, setDocumentsData] = useState<OrganizationDocument[]>(
    []
  );

  // Events setters
  const {
    events,
    isLoading: isEventsLoading,
    error: eventsError,
    fetchEventsByIds,
    createEvent,
    updateEvent,
    deleteEvent,
  } = useOrganizationEvents(organizationId, token);

  // Contacts setters
  const [contactsData, setContactsData] = useState<Contacts>({
    id: "",
    email: "",
    meta_page: "",
    website: "",
  });

  // Capacities setters
  const { capacities, isLoading: isCapacitiesLoading } = useCapacities();

  // Effect to load profile options
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

  // Effect to reset the events loaded flag
  useEffect(() => {
    if (organization) {
      eventsLoaded.current = false;
    }
  }, [organization?.events]);

  // Effect to load events
  useEffect(() => {
    const loadEvents = async () => {
      if (!organization?.events || !token) {
        return;
      }

      if (organization.events.length === 0) {
        setEventsData([]);
        eventsLoaded.current = true;
        return;
      }

      if (!eventsLoaded.current && !isEventsLoading) {
        try {
          const validEventIds = organization.events.filter(
            (id) => id !== null && id !== undefined
          );

          if (validEventIds.length === 0) {
            setEventsData([]);
            eventsLoaded.current = true;
            return;
          }

          const loadedEvents = await fetchEventsByIds(validEventIds);

          // Set events even if the list is empty, and mark as loaded regardless of whether there are valid IDs
          setEventsData(loadedEvents || []);
          eventsLoaded.current = true;
        } catch (error) {
          console.error("Erro ao carregar eventos:", error);
          setEventsData([]);
          eventsLoaded.current = true;
        }
      }
    };

    loadEvents();
  }, [organization?.events, token, isEventsLoading, fetchEventsByIds]);

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

  /* Capacity setters need formData to be initialized, therefore it's initialized here */
  // Capacity IDs setters
  const capacityIds = useMemo(
    () =>
      [
        ...(formData?.known_capacities || []),
        ...(formData?.available_capacities || []),
        ...(formData?.wanted_capacities || []),
      ].map((id) => Number(id)),
    [formData]
  );

  // Capacity details setters
  const { getCapacityName } = useCapacityDetails(capacityIds);

  /* Handlers */

  // Submit handler
  const handleSubmit = async () => {
    try {
      if (!token || !organizationId) {
        return;
      }

      // Create a copy of the form data for updating
      const updatedFormData = { ...formData };

      // Ensure valid project IDs are included
      const validProjectIds = projectsData
        .filter(
          (project) =>
            project.id !== 0 &&
            project.display_name &&
            project.display_name.trim() !== ""
        )
        .map((project) => project.id);
      updatedFormData.projects = validProjectIds;

      // Create/update projects without valid IDs
      const newProjects = projectsData.filter(
        (project) =>
          project.id === 0 &&
          project.display_name &&
          project.display_name.trim() !== ""
      );

      if (newProjects.length > 0) {
        const createdProjects = await Promise.all(
          newProjects.map((project) =>
            createProject({
              ...project,
              organization: Number(organizationId),
            })
          )
        );

        // Add the IDs of the new projects to the array of projects
        updatedFormData.projects = [
          ...updatedFormData.projects,
          ...createdProjects
            .map((project) => project?.id)
            .filter((id): id is number => id !== undefined),
        ];
      }

      // Update existing events
      const updateEventPromises = eventsData
        .filter((event) => event.id !== 0)
        .map((event) => updateEvent(event.id, event));

      // Create new events
      const createEventPromises = eventsData
        .filter((event) => event.id === 0)
        .map((event) =>
          createEvent({
            ...event,
            organization: Number(organizationId),
            creator: Number(session?.user?.id),
          })
        );

      const [updatedEvents, newEvents] = await Promise.all([
        Promise.all(updateEventPromises),
        Promise.all(createEventPromises),
      ]);

      // Collect all event IDs (existing and new)
      const allEventIds = [
        ...updatedEvents.map((event) => event.id),
        ...newEvents.map((event) => event.id),
      ].filter((id) => id !== undefined && id !== null) as number[];

      // Update the events list in formData
      if (allEventIds.length > 0) {
        // Start with the events that already existed in the organization
        let updatedEventIds = [...(organization?.events || [])];

        // Add new events that are not already in the list
        allEventIds.forEach((eventId) => {
          if (!updatedEventIds.includes(eventId)) {
            updatedEventIds.push(eventId);
          }
        });

        // Update the formData with the complete list of events
        updatedFormData.events = updatedEventIds;
      }

      await updateOrganization(updatedFormData);
      showSnackbar(
        pageContent["snackbar-edit-profile-organization-success"],
        "success"
      );
      router.back();
    } catch (error) {
      showSnackbar(
        pageContent["snackbar-edit-profile-organization-error"],
        "error"
      );
    }
  };

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
  const handleAddEvent = () => {
    const eventData: Event = {
      id: 0,
      name: "",
      type_of_location: "virtual",
      url: "",
      image_url: "",
      time_begin: new Date().toISOString(),
      time_end: new Date().toISOString(),
      organization: Number(organizationId),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      creator: Number(session?.user?.id),
      team: [],
      description: "",
      related_skills: [],
      openstreetmap_id: "",
      wikidata_qid: "",
    };
    setCurrentEditingEvent(eventData);
    setShowEventModal(true);
  };

  const handleEditEvent = (event: Event) => {
    // Assegurar que o evento tenha a propriedade related_skills definida como um array
    const eventToEdit = {
      ...event,
      related_skills: Array.isArray(event.related_skills)
        ? event.related_skills
        : typeof event.related_skills === "string"
        ? JSON.parse(event.related_skills)
        : [],
    };

    console.log("Evento para edição:", eventToEdit);
    setCurrentEditingEvent(eventToEdit);
    setShowEventModal(true);
  };

  const handleChooseEvent = (event: Event) => {
    // Implementar a lógica para escolha de evento como principal, se necessário
    showSnackbar(
      pageContent["organization-profile-event-selected"] ||
        "Evento selecionado com sucesso",
      "success"
    );
  };

  const handleDeleteEvent = async (eventId: number) => {
    try {
      // Se for um evento novo (id = 0), apenas remova-o da lista
      if (eventId === 0) {
        setEventsData((prev) => prev.filter((e) => e.id !== 0));
        return;
      }

      // Para eventos existentes, deletar no backend
      await deleteEvent(eventId);

      // Remover o evento da lista de eventos exibida
      setEventsData((prev) => prev.filter((e) => e.id !== eventId));

      // Atualizar o formData para remover o ID do evento excluído
      setFormData((prev) => ({
        ...prev,
        events: (prev.events || []).filter((id) => id !== eventId),
      }));

      // Atualizar a organização no backend para remover o evento
      if (organization) {
        const updatedOrgData = {
          ...organization,
          events: (organization.events || []).filter((id) => id !== eventId),
        };

        await updateOrganization(updatedOrgData);
      }

      showSnackbar(
        pageContent[
          "snackbar-edit-profile-organization-delete-event-success"
        ] || "Evento excluído com sucesso",
        "success"
      );
    } catch (error) {
      console.error("Erro ao excluir evento:", error);
      showSnackbar(
        pageContent["snackbar-edit-profile-organization-delete-event-failed"] ||
          "Erro ao excluir evento",
        "error"
      );
    }
  };

  const handleEventChange = async (
    index: number,
    field: keyof Event,
    value: string
  ) => {
    // Ensure eventsData is an array before trying to modify it
    if (!Array.isArray(eventsData)) {
      console.error("eventsData is not an array:", eventsData);
      return;
    }

    setEventsData((prev) => {
      // Additional array check
      if (!Array.isArray(prev)) {
        console.error("prev is not an array in handleEventChange:", prev);
        return prev;
      }

      const updated = [...prev];

      if (!updated[index]) {
        console.error(`Index ${index} out of range of events:`, updated);
        return prev;
      }

      // Special treatment for fields that may need conversion
      if (field === "related_skills") {
        try {
          // If the value is a JSON string, parse it
          const parsedValue = JSON.parse(value);
          updated[index] = {
            ...updated[index],
            [field]: Array.isArray(parsedValue) ? parsedValue : [],
          };
        } catch (e) {
          // If it's not a valid JSON, use empty array
          updated[index] = {
            ...updated[index],
            [field]: [],
          };
        }
      } else {
        // For other fields, assign directly
        updated[index] = {
          ...updated[index],
          [field]: value,
        };
      }

      return updated;
    });

    // Mark this event as edited for tracking
    if (eventsData[index] && eventsData[index].id) {
      setEditedEvents((prev) => ({
        ...prev,
        [eventsData[index].id]: true,
      }));
    }
  };

  const handleSaveEventChanges = async () => {
    try {
      if (!currentEditingEvent) return;

      if (currentEditingEvent.id === 0) {
        // Create new event
        const newEventData = {
          ...currentEditingEvent,
          organizations: [Number(organizationId)],
          creator: Number(session?.user?.id),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          team: currentEditingEvent.team || [Number(session?.user?.id)],
          type_of_location: currentEditingEvent.type_of_location || "virtual",
          url: currentEditingEvent.url || "",
          image_url: currentEditingEvent.image_url || "",
          description: currentEditingEvent.description || "",
          related_skills: currentEditingEvent.related_skills || [],
          organization: Number(organizationId),
        };

        try {
          const createdEvent = await createEvent(newEventData);

          if (createdEvent && createdEvent.id) {
            setEventsData((prev) => [...prev, createdEvent]);

            // Update the formData with the new event
            const updatedEvents = [...(formData.events || [])];
            if (!updatedEvents.includes(createdEvent.id)) {
              updatedEvents.push(createdEvent.id);
            }

            setFormData((prev) => ({
              ...prev,
              events: updatedEvents,
            }));

            // Update the organization with the new event
            try {
              const updatedOrgData = {
                ...organization,
                events: updatedEvents,
              };

              await updateOrganization(updatedOrgData);
            } catch (updateOrgError) {
              console.error(
                "Error updating organization with new event:",
                updateOrgError
              );
            }

            showSnackbar(
              pageContent[
                "snackbar-edit-profile-organization-create-event-success"
              ],
              "success"
            );
          }
        } catch (createError) {
          console.error("Error creating event:", createError);
          showSnackbar(
            pageContent[
              "snackbar-edit-profile-organization-create-event-failed"
            ],
            "error"
          );
        }
      } else {
        // Update existing event
        try {
          const updatedEvent = await updateEvent(
            currentEditingEvent.id,
            currentEditingEvent
          );

          if (updatedEvent) {
            // Update the events list
            setEventsData((prev) =>
              prev.map((event) =>
                event.id === updatedEvent.id ? updatedEvent : event
              )
            );

            showSnackbar(
              pageContent[
                "snackbar-edit-profile-organization-update-event-success"
              ] || "Evento atualizado com sucesso",
              "success"
            );
          }
        } catch (updateError) {
          console.error("Erro ao atualizar evento:", updateError);
          showSnackbar(
            pageContent[
              "snackbar-edit-profile-organization-update-event-failed"
            ] || "Erro ao atualizar evento",
            "error"
          );
        }
      }

      // Close the modal and clear the event in edit
      setShowEventModal(false);
      setCurrentEditingEvent(null);
    } catch (error) {
      console.error("Erro ao salvar evento:", error);
      showSnackbar(
        pageContent["snackbar-edit-profile-organization-save-event-failed"] ||
          "Erro ao salvar evento",
        "error"
      );
    }
  };

  const handleViewAllEvents = () => {
    router.push(`/organization_profile/${organizationId}/edit/events`);
  };

  // Handler to listen to event changes on the modal
  const handleModalEventChange = (
    index: number,
    field: keyof Event,
    value: string
  ) => {
    if (!currentEditingEvent) return;

    setCurrentEditingEvent((prev) => {
      if (!prev) return prev;

      let updatedValue: any = value;

      // Special treatment for specific fields
      if (field === "time_begin" || field === "time_end") {
        updatedValue = new Date(value).toISOString();
      } else if (field === "related_skills") {
        try {
          // If the value is a JSON string, parse it
          if (typeof value === "string" && value.startsWith("[")) {
            const parsedArray = JSON.parse(value);
            updatedValue = Array.isArray(parsedArray) ? parsedArray : [];
          } else {
            // Keep the existing value if it's not a valid JSON
            updatedValue = prev.related_skills || [];
          }
        } catch (e) {
          console.error("Error parsing related_skills:", e);
          // Keep the existing value if there's an error
          updatedValue = prev.related_skills || [];
        }
      }

      return {
        ...prev,
        [field]: updatedValue,
        updated_at: new Date().toISOString(),
      };
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

  if (isUserLoading || isOrganizationLoading) {
    return <LoadingState />;
  }

  if (isMobile) {
    return (
      <>
        <OrganizationProfileEditMobileView
          handleSubmit={handleSubmit}
          handleRemoveCapacity={handleRemoveCapacity}
          handleAddCapacity={handleAddCapacity}
          handleAddDocument={handleAddDocument}
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
          handleDeleteEvent={handleDeleteEvent}
          capacities={capacities || []}
          handleChooseEvent={handleChooseEvent}
          handleViewAllEvents={handleViewAllEvents}
          handleEditEvent={handleEditEvent}
        />

        {showEventModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div
              className="absolute inset-0 bg-black bg-opacity-50"
              onClick={() => {
                setShowEventModal(false);
                setCurrentEditingEvent(null);
              }}
            />
            <div
              className={`relative rounded-lg p-6 w-11/12 max-w-2xl max-h-[90vh] overflow-y-auto ${
                darkMode ? "bg-capx-dark-box-bg" : "bg-white"
              }`}
            >
              <button
                onClick={() => {
                  setShowEventModal(false);
                  setCurrentEditingEvent(null);
                }}
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
                  {currentEditingEvent?.id === 0
                    ? pageContent["organization-profile-new-event"]
                    : pageContent["organization-profile-edit-event"]}
                </h2>
                {currentEditingEvent && (
                  <>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                      {currentEditingEvent.related_skills &&
                        Array.isArray(currentEditingEvent.related_skills) &&
                        `Evento com ${currentEditingEvent.related_skills.length} capacidades`}
                    </p>
                    <EventsFormItem
                      eventData={currentEditingEvent}
                      index={0}
                      onDelete={() => {
                        setShowEventModal(false);
                        setCurrentEditingEvent(null);
                      }}
                      onChange={handleModalEventChange}
                    />
                  </>
                )}
              </div>

              <div className="flex justify-end gap-4 mt-6 border-t pt-4">
                <button
                  onClick={() => {
                    setShowEventModal(false);
                    setCurrentEditingEvent(null);
                  }}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium rounded-md border border-gray-300 hover:border-gray-400"
                >
                  {pageContent["organization-profile-event-popup-cancel"] ||
                    "Cancel"}
                </button>
                <button
                  onClick={handleSaveEventChanges}
                  className="px-4 py-2 bg-[#851970] text-white font-medium rounded-md hover:bg-[#6d145c]"
                >
                  {currentEditingEvent?.id === 0
                    ? pageContent[
                        "organization-profile-event-popup-create-event"
                      ] || "Create event"
                    : pageContent[
                        "organization-profile-event-popup-save-changes"
                      ] || "Save changes"}
                </button>
              </div>
            </div>
          </div>
        )}
      </>
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
        capacities={capacities || []}
        handleEditEvent={handleEditEvent}
        handleChooseEvent={handleChooseEvent}
        handleViewAllEvents={handleViewAllEvents}
      />

      {showEventModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black bg-opacity-50"
            onClick={() => {
              setShowEventModal(false);
              setCurrentEditingEvent(null);
            }}
          />
          <div
            className={`relative rounded-lg p-6 w-11/12 max-w-2xl max-h-[90vh] overflow-y-auto ${
              darkMode ? "bg-capx-dark-box-bg" : "bg-white"
            }`}
          >
            <button
              onClick={() => {
                setShowEventModal(false);
                setCurrentEditingEvent(null);
              }}
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
                {currentEditingEvent?.id === 0
                  ? pageContent["organization-profile-new-event"]
                  : pageContent["organization-profile-edit-event"]}
              </h2>
              {currentEditingEvent && (
                <>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                    {currentEditingEvent.related_skills &&
                      Array.isArray(currentEditingEvent.related_skills) &&
                      `Evento com ${currentEditingEvent.related_skills.length} capacidades`}
                  </p>
                  <EventsFormItem
                    eventData={currentEditingEvent}
                    index={0}
                    onDelete={() => {
                      setShowEventModal(false);
                      setCurrentEditingEvent(null);
                    }}
                    onChange={handleModalEventChange}
                  />
                </>
              )}
            </div>

            <div className="flex justify-end gap-4 mt-6 border-t pt-4">
              <button
                onClick={() => {
                  setShowEventModal(false);
                  setCurrentEditingEvent(null);
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium rounded-md border border-gray-300 hover:border-gray-400"
              >
                {pageContent["organization-profile-event-popup-cancel"] ||
                  "Cancel"}
              </button>
              <button
                onClick={handleSaveEventChanges}
                className="px-4 py-2 bg-[#851970] text-white font-medium rounded-md hover:bg-[#6d145c]"
              >
                {currentEditingEvent?.id === 0
                  ? pageContent[
                      "organization-profile-event-popup-create-event"
                    ] || "Create event"
                  : pageContent[
                      "organization-profile-event-popup-save-changes"
                    ] || "Save changes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
