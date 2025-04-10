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
    fetchEventsByIds,
    createEvent,
    updateEvent,
    deleteEvent
  } = useOrganizationEvents(organizationId, token);

  // State for events
  const [eventsData, setEventsData] = useState<Event[]>([]);
  const eventsLoaded = useRef(false);

  // State for existing and new events
  const [newEvent, setNewEvent] = useState<Event>();
  const [showEventModal, setShowEventModal] = useState(false);

  const [editedEvents, setEditedEvents] = useState<{
    [key: number]: boolean;
  }>({});

  // Adicione este log para verificar os IDs dos eventos
  useEffect(() => {
    if (organization) {
      console.log('IDs de eventos da organização:', organization.events);
      // Sempre que os eventos da organização mudarem, resetar a flag para forçar recarregamento
      eventsLoaded.current = false;
    }
  }, [organization?.events]);

  // Modificar o useEffect de carregamento de eventos para usar o novo hook
  useEffect(() => {
    const loadEvents = async () => {
      if (!organization?.events || !token) {
        console.log('Sem organização, eventos ou token para carregar');
        return;
      }
      
      if (organization.events.length === 0) {
        console.log('Lista de eventos da organização está vazia');
        setEventsData([]);
        eventsLoaded.current = true;
        return;
      }
      
      if (!eventsLoaded.current && !isEventsLoading) {
        console.log('Tentando carregar eventos, status de carregamento atual:', {
          eventsLoaded: eventsLoaded.current,
          isEventsLoading
        });
        
        try {
          // Use the new hook method to load events by IDs
          const validEventIds = organization.events.filter(id => id !== null && id !== undefined);
          console.log('Carregando eventos com IDs:', validEventIds);
          
          if (validEventIds.length === 0) {
            console.log('Nenhum ID de evento válido para carregar');
            setEventsData([]);
            eventsLoaded.current = true; // Marcar como carregado mesmo quando não há IDs válidos
            return;
          }
          
          const loadedEvents = await fetchEventsByIds(validEventIds);
          console.log('Eventos carregados:', loadedEvents);
                    
          // Definir eventos mesmo que a lista esteja vazia, e marcar como carregado de qualquer forma
          setEventsData(loadedEvents || []);
          eventsLoaded.current = true;
          
          if (!loadedEvents || loadedEvents.length === 0) {
            console.log('Nenhum evento encontrado com os IDs fornecidos');
          } else {
            console.log(`Carregados ${loadedEvents.length} eventos com sucesso`);
          }
        } catch (error) {
          console.error('Erro ao carregar eventos:', error);
          setEventsData([]);
          eventsLoaded.current = true; // Marcar como carregado mesmo em caso de erro
        }
      } else {
        console.log('Pulando carregamento de eventos porque:', {
          eventsLoaded: eventsLoaded.current,
          isEventsLoading
        });
      }
    };
    
    loadEvents();
  }, [organization?.events, token, isEventsLoading, fetchEventsByIds]);

  // Adicionar um useEffect para debug
  useEffect(() => {
    console.log('Estado atual dos eventos:', eventsData);
  }, [eventsData]);

  // Adicionar um debug para o evento no modal
  useEffect(() => {
    console.log('Estado atual do newEvent:', newEvent);
  }, [newEvent]);

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
      if (!token || !organizationId) {
        return;
      }

      // Criar cópia dos dados do formulário para atualização
      const updatedFormData = { ...formData };

      // Garantir que os IDs dos projetos válidos sejam incluídos
      const validProjectIds = projectsData
        .filter(
          (project) =>
            project.id !== 0 && project.name && project.name.trim() !== ""
        )
        .map((project) => project.id);
      updatedFormData.projects = validProjectIds;

      // Criar/atualizar projetos sem IDs válidos
      const newProjects = projectsData.filter(
        (project) => project.id === 0 && project.name && project.name.trim() !== ""
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

        // Adicionar os IDs dos novos projetos ao array de projetos
        updatedFormData.projects = [
          ...updatedFormData.projects,
          ...createdProjects.map((project) => project.id),
        ];
      }

      // Atualizar eventos existentes
      const updateEventPromises = eventsData
      .filter((event) => event.id !== 0)
      .map((event) => updateEvent(event.id, event));

      // Criar novos eventos
      const createEventPromises = eventsData
      .filter((event) => event.id === 0)
      .map((event) => createEvent({
        ...event,
        organizations: [Number(organizationId)],
          organization: Number(organizationId),
        creator: Number(session?.user?.id),
      }));

      const [updatedEvents, newEvents] = await Promise.all([
      Promise.all(updateEventPromises),
      Promise.all(createEventPromises),
      ]);

      // Coletar todos os IDs de eventos (existentes e novos)
      const allEventIds = [
      ...updatedEvents.map(event => event.id),
      ...newEvents.map(event => event.id),
      ].filter(id => id !== undefined && id !== null) as number[];

      // Atualizar a lista de eventos no formData
      if (allEventIds.length > 0) {
        // Começar com os eventos que já existiam na organização
        let updatedEventIds = [...(organization?.events || [])];
        
        // Adicionar novos eventos que não estejam já na lista
        allEventIds.forEach(eventId => {
          if (!updatedEventIds.includes(eventId)) {
            updatedEventIds.push(eventId);
          }
        });
        
        // Atualizar o formData com a lista completa de eventos
        updatedFormData.events = updatedEventIds;
        
        console.log('Lista atualizada de eventos da organização:', updatedEventIds);
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
      organized_by: organization?.display_name || "",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      creator: Number(session?.user?.id),
      team: [],
      description: "",
      related_skills: [],
      organizations: [Number(organizationId)],
      openstreetmap_id: "",
      wikidata_qid: "",
    };
    setNewEvent(eventData);
    setShowEventModal(true);
  };

  const handleDeleteEvent = async (eventId: number) => {
    try {
      console.log(`Tentando excluir evento com ID ${eventId}`);
      
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
        console.log('Organização atualizada após exclusão de evento:', updatedOrgData);
      }
      
        showSnackbar(
        pageContent["snackbar-edit-profile-organization-delete-event-success"] || 
        "Evento excluído com sucesso",
          "success"
        );
    } catch (error) {
      console.error('Erro ao excluir evento:', error);
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
    // Garantir que eventsData é um array antes de tentar modificá-lo
    if (!Array.isArray(eventsData)) {
      console.error('eventsData não é um array:', eventsData);
      return;
    }

    console.log(`Alterando evento ${index}, campo ${field} para ${value}`);
    
    setEventsData((prev) => {
      // Verificação de array adicional
      if (!Array.isArray(prev)) {
        console.error('prev não é um array em handleEventChange:', prev);
        return prev;
      }

      const updated = [...prev];
      
      if (!updated[index]) {
        console.error(`Índice ${index} fora do range de eventos:`, updated);
        return prev;
      }
      
      // Tratamento especial para campos que podem precisar de conversão
      if (field === 'related_skills') {
        try {
          // Se o valor é uma string JSON, analisá-la
          const parsedValue = JSON.parse(value);
          updated[index] = {
            ...updated[index],
            [field]: parsedValue,
          };
          } catch (e) {
          // Se não for JSON válido, apenas atribuir como está
          updated[index] = {
            ...updated[index],
            [field]: value,
          };
        }
      } else {
        // Para outros campos, atribuir diretamente
        updated[index] = {
          ...updated[index],
          [field]: value,
        };
      }
      
      return updated;
    });

    // Marcar este evento como editado para acompanhamento
    if (eventsData[index] && eventsData[index].id) {
      setEditedEvents((prev) => ({
          ...prev,
        [eventsData[index].id]: true,
      }));
    }
  };
  
  // Handler específico para alterações no evento do modal
  const handleModalEventChange = (
    index: number,
    field: keyof Event,
    value: string
  ) => {
    console.log(`Alterando evento no modal, campo ${field} para ${value}`);
    
    setNewEvent(prev => {
      if (!prev) return prev;
        
        let updatedValue = value;
        
        // Tratamento especial para campos específicos
        if (field === 'time_begin' || field === 'time_end') {
          updatedValue = new Date(value).toISOString();
      } else if (field === 'related_skills' && typeof value === 'string' && value.startsWith('[')) {
          try {
            updatedValue = JSON.parse(value);
          } catch (e) {
            console.error('Erro ao analisar related_skills:', e);
          }
        }
        
      return {
        ...prev,
          [field]: updatedValue,
          updated_at: new Date().toISOString()
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

  const handleCreateEvent = async () => {
    try {
      if (!newEvent) return;
      
      console.log('Tentando criar evento com dados:', newEvent);
      
      // Garantir que todos os campos necessários estejam presentes
      const organizationIdNum = Number(organizationId);
      const newEventData = {
        ...newEvent,
        organizations: [organizationIdNum], // Ensure the current organization is in the array
        creator: Number(session?.user?.id),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        team: newEvent.team || [Number(session?.user?.id)],
        type_of_location: newEvent.type_of_location || "virtual",
        url: newEvent.url || "",
        image_url: newEvent.image_url || "",
        organized_by: newEvent.organized_by || organization?.display_name || "",
        description: newEvent.description || "",
        related_skills: newEvent.related_skills || [],
        openstreetmap_id: newEvent.openstreetmap_id || "",
        wikidata_qid: newEvent.wikidata_qid || "",
        organization: organizationIdNum, // Garantir que o campo organization tenha o ID da organização
      };
      
      // Log detalhado dos campos críticos para debug
      console.log('Dados do evento a serem enviados para API:', {
        ...newEventData,
        organizations_debug: {
          value: newEventData.organizations,
          type: typeof newEventData.organizations,
          isArray: Array.isArray(newEventData.organizations),
          organizationIdNum
        }
      });
      
      try {
        // Usar o método do novo hook para criar o evento
        const createdEvent = await createEvent(newEventData);
        console.log('Resposta da API após criar evento:', createdEvent);
        
        if (createdEvent && createdEvent.id) {
          // Verificar se o campo organizations foi corretamente configurado na resposta
          console.log('Campo organizations na resposta:', createdEvent.organizations);
          
          // Atualizar o estado dos eventos
          setEventsData(prev => [...prev, createdEvent]);
          
          // Atualizar o formData com o novo evento
          const updatedEvents = [...(formData.events || [])];
          if (!updatedEvents.includes(createdEvent.id)) {
            updatedEvents.push(createdEvent.id);
          }
          
          setFormData(prev => ({
            ...prev,
            events: updatedEvents
          }));
          
          // Agora atualizamos a organização com o novo evento
          try {
            const updatedOrgData = {
              ...organization,
              events: updatedEvents
            };
            
            await updateOrganization(updatedOrgData);
            console.log('Organização atualizada com novo evento:', updatedOrgData);
          } catch (updateOrgError) {
            console.error('Erro ao atualizar organização com novo evento:', updateOrgError);
          }
          
          setShowEventModal(false);
          setNewEvent(undefined);
          
          showSnackbar(
            pageContent["snackbar-edit-profile-organization-create-event-success"],
            "success"
          );
        }
      } catch (createError) {
        console.error('Erro ao criar evento:', createError);
        // Log adicional para entender a natureza do erro
        if (createError.response) {
          console.error('Detalhes do erro da API:', {
            status: createError.response.status,
            data: createError.response.data
          });
        }
        
        showSnackbar(
          pageContent["snackbar-edit-profile-organization-create-event-failed"],
          "error"
        );
      }
    } catch (error) {
      console.error('Erro ao criar evento:', error);
      showSnackbar(
        pageContent["snackbar-edit-profile-organization-create-event-failed"],
        "error"
      );
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
                onChange={handleModalEventChange}
              />
            </div>

            <div className="flex justify-end gap-4 mt-6 border-t pt-4">
              <button
                onClick={() => setShowEventModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium rounded-md border border-gray-300 hover:border-gray-400"
              >
                {pageContent["organization-profile-event-popup-cancel"]}
              </button>
              <button
                onClick={handleCreateEvent}
                className="px-4 py-2 bg-[#851970] text-white font-medium rounded-md hover:bg-[#6d145c]"
              >
                {pageContent["organization-profile-event-popup-create-event"]}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
