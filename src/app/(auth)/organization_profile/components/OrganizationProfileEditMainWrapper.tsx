'use client';

import { useSnackbar } from '@/app/providers/SnackbarProvider';
import LoadingState from '@/components/LoadingState';
import { useApp } from '@/contexts/AppContext';
import { useCapacityCache } from '@/contexts/CapacityCacheContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useAvatars } from '@/hooks/useAvatars';
import { useFormCapacitySelection } from '@/hooks/useCapacitySelection';
import { useDocument } from '@/hooks/useDocument';
import { useOrganizationEvents } from '@/hooks/useOrganizationEvents';
import { useOrganization } from '@/hooks/useOrganizationProfile';
import { useProject, useProjects } from '@/hooks/useProjects';
import { useTagDiff } from '@/hooks/useTagDiff';
import { useTerritories } from '@/hooks/useTerritories';
import { useUserProfile } from '@/hooks/useUserProfile';
import {
  getCapacityValidationErrorMessage,
  isCapacityValidationError,
  validateCapacitiesBeforeSave,
} from '@/lib/utils/capacityValidation';
import { formatWikiImageUrl } from '@/lib/utils/fetchWikimediaData';
import { getProfileImage } from '@/lib/utils/getProfileImage';
import { ensureArray } from '@/lib/utils/safeDataAccess';
import NoAvatarIcon from '@/public/static/images/no_avatar.svg';
import { Contacts } from '@/types/contacts';
import { OrganizationDocument } from '@/types/document';
import { Event } from '@/types/event';
import { Organization } from '@/types/organization';
import { Project } from '@/types/project';
import { tagDiff } from '@/types/tagDiff';
import { useSession } from 'next-auth/react';
import { useParams, useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import EventsForm from './EventsEditForm';
import OrganizationProfileEditDesktopView from './OrganizationProfileEditDesktopView';
import OrganizationProfileEditMobileView from './OrganizationProfileEditMobileView';

interface ProfileOption {
  value: string;
  label: string | null | undefined;
  image: any | string;
}

export default function EditOrganizationProfilePage() {
  const router = useRouter();
  const params = useParams();
  const organizationId = params?.id as string;
  const { data: session } = useSession();
  const token = session?.user?.token;
  const { isMobile, pageContent, language } = useApp();
  const [isInitialized, setIsInitialized] = useState(false);
  const { darkMode } = useTheme();
  const { showSnackbar } = useSnackbar();
  const { userProfile, isLoading: isUserLoading } = useUserProfile();
  const { avatars } = useAvatars();
  const capacityCache = useCapacityCache();
  const { isLoadingTranslations } = capacityCache;
  const { territories, loading: territoriesLoading } = useTerritories(token);

  /* State Management*/

  // State for profile options
  const [profileOptions, setProfileOptions] = useState<ProfileOption[]>([]);
  const [selectedProfile, setSelectedProfile] = useState<ProfileOption | null>(null);

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
  const [currentEditingEvent, setCurrentEditingEvent] = useState<Event | null>(null);
  const [editedEvents, setEditedEvents] = useState<{
    [key: number]: boolean;
  }>({});
  const [eventsData, setEventsData] = useState<Event[]>([]);
  const eventsLoaded = useRef(false);
  const [loadingChooseEvent, setLoadingChooseEvent] = useState(false);

  // State for capacities
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentCapacityType, setCurrentCapacityType] = useState<'known' | 'available' | 'wanted'>(
    'known'
  );

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

  const { createProject, updateProject, deleteProject } = useProject(projectId, token);

  // Tags setters
  const { tagDiff, loading, fetchTags, fetchSingleTag, createTag, deleteTag } = useTagDiff(token);

  // Documents setters
  const [documentsData, setDocumentsData] = useState<OrganizationDocument[]>([]);

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
    id: '',
    email: '',
    meta_page: '',
    website: '',
  });

  // Monitor language changes and update capacity cache
  useEffect(() => {
    const updateCacheLanguage = async () => {
      if (language && token) {
        try {
          await capacityCache?.updateLanguage?.(language);
        } catch (error) {
          console.error('Error updating capacity cache language:', error);
        }
      }
    };

    updateCacheLanguage();
  }, [language, token, capacityCache]);

  // Combine all loading states for better UI experience
  const isLoading = useMemo(() => {
    return isOrganizationLoading || isUserLoading || isLoadingTranslations;
  }, [isOrganizationLoading, isUserLoading, isLoadingTranslations]);

  // Effect to load profile options
  useEffect(() => {
    if (userProfile && organizations) {
      const managedOrgOptions = (userProfile.is_manager || [])
        .map(orgId => {
          const org = organizations.find(o => o.id === orgId);
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
        ...managedOrgOptions,
      ];

      setProfileOptions(options);

      const currentOrgOption = options.find(opt => opt.value === `org_${organizationId}`);
      if (currentOrgOption) {
        setSelectedProfile(currentOrgOption);
      }
    }
  }, [userProfile, organizations, organizationId, session?.user?.name, avatars]);

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
      if (!organization || !organization.events || !token) {
        setEventsData([]);
        eventsLoaded.current = true;
        return;
      }

      // Ensure events is an array
      const eventsArray = Array.isArray(organization.events) ? organization.events : [];

      if (eventsArray.length === 0) {
        setEventsData([]);
        eventsLoaded.current = true;
        return;
      }

      if (!eventsLoaded.current && !isEventsLoading) {
        try {
          const validEventIds = eventsArray.filter(id => id !== null && id !== undefined);

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
          console.error('Erro ao carregar eventos:', error);
          setEventsData([]);
          eventsLoaded.current = true;
        }
      }
    };

    loadEvents();
  }, [organization, organization?.events, token, isEventsLoading, fetchEventsByIds]);

  // Effect to load documents
  useEffect(() => {
    const loadDocuments = async () => {
      if (!organization?.documents || !documents) return;

      if (
        organization.documents &&
        Array.isArray(organization.documents) &&
        organization.documents.length > 0 &&
        documents
      ) {
        try {
          const validDocIds = organization.documents.filter(id => id !== null && id !== undefined);

          if (validDocIds.length === 0) {
            setDocumentsData([]);
            return;
          }

          const existingDocuments = validDocIds.map(docId => ({
            id: docId,
            url: documents?.find(d => d && d.id === docId)?.url || '',
          }));
          setDocumentsData(existingDocuments);
        } catch (error) {
          console.error('Error loading documents:', error);
          setDocumentsData([]);
        }
      } else {
        setDocumentsData([]);
      }
    };

    loadDocuments();
  }, [organization?.documents, documents]);

  // Form data
  const [formData, setFormData] = useState<Partial<Organization>>({
    display_name: organization?.display_name || '',
    report: organization?.report || '',
    profile_image: organization?.profile_image || '',
    acronym: organization?.acronym || '',
    meta_page: organization?.meta_page || '',
    mastodon: organization?.mastodon || '',
    tag_diff: Array.isArray(organization?.tag_diff) ? organization?.tag_diff : [],
    events: Array.isArray(organization?.events) ? organization?.events : [],
    documents: Array.isArray(organization?.documents) ? organization?.documents : [],
    projects: Array.isArray(organization?.projects) ? organization?.projects : [],
    home_project: organization?.home_project || '',
    type: organization?.type || 0,
    territory: Array.isArray(organization?.territory) ? organization?.territory : [],
    managers: Array.isArray(organization?.managers) ? organization?.managers : [],
    known_capacities: Array.isArray(organization?.known_capacities)
      ? organization?.known_capacities
      : [],
    available_capacities: Array.isArray(organization?.available_capacities)
      ? organization?.available_capacities
      : [],
    wanted_capacities: Array.isArray(organization?.wanted_capacities)
      ? organization?.wanted_capacities
      : [],
    choose_events: Array.isArray(organization?.choose_events) ? organization?.choose_events : [],
  });

  // Use effect to initialize the form data
  useEffect(() => {
    if (organization && !isInitialized) {
      setFormData({
        display_name: organization.display_name || '',
        report: organization.report || '',
        profile_image: organization.profile_image || '',
        acronym: organization.acronym || '',
        meta_page: organization.meta_page || '',
        email: organization.email || '',
        website: organization.website || '',
        mastodon: organization.mastodon || '',
        tag_diff: Array.isArray(organization.tag_diff) ? organization.tag_diff : [],
        projects: Array.isArray(organization.projects) ? organization.projects : [],
        events: Array.isArray(organization.events) ? organization.events : [],
        documents: Array.isArray(organization.documents) ? organization.documents : [],
        home_project: organization.home_project || '',
        type: organization.type || 0,
        territory: Array.isArray(organization.territory) ? organization.territory : [],
        managers: Array.isArray(organization.managers) ? organization.managers : [],
        known_capacities: Array.isArray(organization.known_capacities)
          ? organization.known_capacities
          : [],
        available_capacities: Array.isArray(organization.available_capacities)
          ? organization.available_capacities
          : [],
        wanted_capacities: Array.isArray(organization.wanted_capacities)
          ? organization.wanted_capacities
          : [],
        choose_events: Array.isArray(organization.choose_events) ? organization.choose_events : [],
      });

      // Initialize projects data
      if (
        organization.tag_diff &&
        Array.isArray(organization.tag_diff) &&
        organization.tag_diff.length > 0
      ) {
        const fetchTagsData = async () => {
          try {
            // Ensure tag_diff is an array and has valid values
            const validTagIds =
              organization.tag_diff?.filter(id => id !== null && id !== undefined) || [];

            if (validTagIds.length === 0) {
              setDiffTagsData([]);
              return;
            }

            const tagPromises = validTagIds.map(tagId => fetchSingleTag(tagId));

            const tagsResults = await Promise.all(tagPromises);
            const validTags = tagsResults
              .filter((tag): tag is NonNullable<typeof tag> => tag !== undefined && tag !== null)
              .map(tagData => ({
                id: tagData.id,
                tag: tagData.tag,
                created_at: tagData.created_at || new Date().toISOString(),
                updated_at: tagData.updated_at || new Date().toISOString(),
              }));
            setDiffTagsData(validTags);
          } catch (error) {
            showSnackbar(
              pageContent['snackbar-edit-profile-organization-fetch-tags-failed'],
              'error'
            );
            console.error('Error fetching tags:', error);
            setDiffTagsData([]);
          }
        };

        fetchTagsData();
      } else {
        setDiffTagsData([]);
      }

      // Initialize documents data
      if (organization.documents && organization.documents.length > 0 && documents) {
        const existingDocuments = organization.documents.map(docId => ({
          id: docId,
          url: documents?.find(d => d.id === docId)?.url || '',
        }));
        setDocumentsData(existingDocuments);
      }

      // Initialize contacts data
      if (organization) {
        setContactsData({
          id: organization.id?.toString() || '',
          email: organization.email || '',
          meta_page: organization.meta_page || '',
          website: organization.website || '',
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
    updateOrganization,
    pageContent,
    showSnackbar,
    setFormData,
  ]);

  // Use cached capacity names
  const getCapacityName = useCallback(
    (id: any) => {
      return capacityCache.getName(Number(id));
    },
    [capacityCache]
  );

  /* Handlers */

  // Submit handler
  const handleSubmit = async () => {
    try {
      if (!token || !organizationId) {
        return;
      }

      // Validate capacities before saving
      const validationResult = validateCapacitiesBeforeSave(
        ensureArray<number>(formData.known_capacities),
        ensureArray<number>(formData.available_capacities),
        pageContent
      );

      if (!validationResult.isValid) {
        // Show validation error
        showSnackbar(validationResult.errors[0], 'error');
        return;
      }

      // Create a copy of the form data for updating
      const updatedFormData = { ...formData };

      // Include contacts data in the organization update
      updatedFormData.email = contactsData.email;
      updatedFormData.meta_page = contactsData.meta_page;
      updatedFormData.website = contactsData.website;

      // Process documents data - create/update documents via API
      const validDocuments = documentsData.filter(doc => doc.url && doc.url.trim() !== '');

      // Create new documents and collect existing document IDs
      const documentPromises = validDocuments.map(async doc => {
        if (doc.id === 0 || doc.id === null) {
          // Create new document
          try {
            const documentPayload = {
              url: doc.url,
              ...(organizationId && { organization: Number(organizationId) }),
              ...(session?.user?.id && { creator: Number(session.user.id) }),
            };

            const newDoc = await createDocument(documentPayload);
            return newDoc?.id;
          } catch (error: any) {
            console.error('❌ Error creating document - Full details:', {
              error: error.message,
              status: error.response?.status,
              data: error.response?.data,
              documentUrl: doc.url,
              organizationId,
              userId: session?.user?.id,
            });
            return null;
          }
        } else {
          // Keep existing document ID
          return doc.id;
        }
      });

      const documentIds = await Promise.all(documentPromises);
      const validDocumentIds = documentIds.filter(
        (id): id is number => id !== null && id !== undefined
      );

      updatedFormData.documents = validDocumentIds;

      // Process DiffTags data - create new tags and collect existing tag IDs
      const validTags = diffTagsData.filter(tag => tag.tag && tag.tag.trim() !== '');

      const tagPromises = validTags.map(async tag => {
        if (tag.id < 0 || tag.id === 0) {
          // Create new tag
          try {
            const newTag = await createTag({
              tag: tag.tag,
              creator: Number(session?.user?.id),
            });
            return newTag?.id;
          } catch (error) {
            console.error('Error creating tag:', error);
            return null;
          }
        } else {
          // Keep existing tag ID
          return tag.id;
        }
      });

      const tagIds = await Promise.all(tagPromises);
      const validTagIds = tagIds.filter((id): id is number => id !== null && id !== undefined);

      updatedFormData.tag_diff = validTagIds;

      // Ensure valid project IDs are included
      const validProjectIds = projectsData
        .filter(
          project => project.id !== 0 && project.display_name && project.display_name.trim() !== ''
        )
        .map(project => project.id);
      updatedFormData.projects = validProjectIds;

      // Create/update projects without valid IDs
      const newProjects = projectsData.filter(
        project => project.id === 0 && project.display_name && project.display_name.trim() !== ''
      );

      if (newProjects.length > 0) {
        const createdProjects = await Promise.all(
          newProjects.map(project =>
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
            .map(project => project?.id)
            .filter((id): id is number => id !== undefined),
        ];
      }

      // Update existing events
      const updateEventPromises = eventsData
        .filter(event => event.id !== 0)
        .map(event => updateEvent(event.id, event));

      // Create new events
      const createEventPromises = eventsData
        .filter(event => event.id === 0)
        .map(event =>
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
        ...(Array.isArray(updatedEvents)
          ? updatedEvents.map(event => event?.id).filter(Boolean)
          : []),
        ...(Array.isArray(newEvents) ? newEvents.map(event => event?.id).filter(Boolean) : []),
      ].filter(id => id !== undefined && id !== null) as number[];

      // Update the events list in formData
      if (allEventIds.length > 0) {
        // Start with the events that already existed in the organization
        let updatedEventIds = [...(organization?.events || [])];

        // Add new events that are not already in the list
        allEventIds.forEach(eventId => {
          if (!updatedEventIds.includes(eventId)) {
            updatedEventIds.push(eventId);
          }
        });

        // Update the formData with the complete list of events
        updatedFormData.events = updatedEventIds;
      }

      // Garantir que choose_events é mantido na atualização
      updatedFormData.choose_events = formData.choose_events || [];

      await updateOrganization(updatedFormData);
      showSnackbar(pageContent['snackbar-edit-profile-organization-success'], 'success');
      router.back();
    } catch (error: any) {
      console.error('Error updating organization profile:', error);

      // Check if this is a capacity validation error from backend
      if (isCapacityValidationError(error)) {
        const errorMessage = getCapacityValidationErrorMessage(error, pageContent);
        showSnackbar(errorMessage, 'error');
        return;
      }

      // Check if error is a validation error with a translation key
      const errorMessage = error?.message || '';
      const isTranslationKey = errorMessage && errorMessage.startsWith('snackbar-');

      if (isTranslationKey && pageContent[errorMessage]) {
        showSnackbar(pageContent[errorMessage], 'error');
      } else {
        showSnackbar(
          pageContent['snackbar-edit-profile-organization-error'] || 'Error saving profile',
          'error'
        );
      }
    }
  };

  // Projects handlers
  const handleAddProject = () => {
    const newProject: Project = {
      id: 0,
      display_name: '',
      profile_image: '',
      url: '',
      description: '',
      organization: Number(organizationId),
      creation_date: new Date().toISOString(),
      creator: Number(session?.user?.id),
      related_skills: [],
    };

    setProjectsData(prev => [...prev, newProject]);
  };

  const handleDeleteProject = async (projectId: number) => {
    try {
      if (projectId === 0) {
        setProjectsData(prev => {
          const index = prev.findIndex(p => p.id === 0);
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
      setProjectsData(prev => prev.filter(p => p.id !== projectId));
      showSnackbar(
        pageContent['snackbar-edit-profile-organization-delete-project-success'],
        'success'
      );
    } catch (error) {
      showSnackbar(
        pageContent['snackbar-edit-profile-organization-delete-project-failed'],
        'error'
      );
      console.error('Error deleting project:', error);
    }
  };

  const handleProjectChange = (index: number, field: keyof Project, value: string) => {
    setProjectsData(prev => {
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
      name: '',
      type_of_location: 'virtual',
      url: '',
      image_url: '',
      time_begin: new Date().toISOString(),
      time_end: new Date().toISOString(),
      organization: Number(organizationId),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      creator: Number(session?.user?.id),
      team: [],
      description: '',
      related_skills: [],
      openstreetmap_id: '',
      wikidata_qid: '',
    };
    editingEventRef.current = eventData;
    setCurrentEditingEvent(eventData);
    setShowEventModal(true);
  };

  const handleEditEvent = (event: Event) => {
    // Ensure that the event has the related_skills property defined as an array
    const eventToEdit = {
      ...event,
      related_skills: Array.isArray(event.related_skills)
        ? event.related_skills
        : typeof event.related_skills === 'string'
          ? JSON.parse(event.related_skills)
          : [],
    };

    editingEventRef.current = eventToEdit;
    setCurrentEditingEvent(eventToEdit);
    setShowEventModal(true);
  };

  const handleChooseEvent = useCallback(
    async (event: Event) => {
      if (!event || !event.id) {
        console.error('Invalid event object in handleChooseEvent', event);
        return;
      }

      try {
        setLoadingChooseEvent(true);

        // Make sure organization exists
        if (!organization) {
          console.error('Organization is undefined in handleChooseEvent');
          return;
        }

        // Ensure choose_events exists and is an array
        const chooseEvents = Array.isArray(organization.choose_events)
          ? organization.choose_events
          : [];

        // Update local state immediately for visual feedback
        const isAlreadySelected = chooseEvents.some(chosenEvent => chosenEvent === event.id);

        // Create an updated copy of the organization
        const updatedOrg = { ...organization };

        // Set choose_events array safely
        updatedOrg.choose_events = isAlreadySelected
          ? chooseEvents.filter(chosenEvent => chosenEvent !== event.id)
          : [...chooseEvents, event.id];

        // Send update to the backend
        await updateOrganization({
          choose_events: updatedOrg.choose_events,
        });

        // Update form data too to keep UI in sync
        setFormData(prev => ({
          ...prev,
          choose_events: updatedOrg.choose_events,
        }));

        showSnackbar(
          isAlreadySelected
            ? pageContent['snackbar-edit-profile-organization-remove-event-success'] ||
                'Event removed successfully'
            : pageContent['snackbar-edit-profile-organization-add-event-success'] ||
                'Event added successfully',
          'success'
        );
      } catch (error) {
        console.error('Error in handleChooseEvent:', error);
        showSnackbar(
          pageContent['snackbar-edit-profile-organization-update-event-failed'] ||
            'Failed to update event',
          'error'
        );
      } finally {
        setLoadingChooseEvent(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [organization, updateOrganization, pageContent]
  );

  const handleDeleteEvent = async (eventId: number) => {
    try {
      // If it's a new event (id = 0), just remove it from the list
      if (eventId === 0) {
        setEventsData(prev => prev.filter(e => e.id !== 0));
        return;
      }

      // For existing events, delete in the backend
      await deleteEvent(eventId);

      // Remove the event from the list of events displayed
      setEventsData(prev => prev.filter(e => e.id !== eventId));

      // Update the formData to remove the deleted event ID
      setFormData(prev => ({
        ...prev,
        events: (prev.events || []).filter(id => id !== eventId),
      }));

      // Update the organization in the backend to remove the event
      if (organization) {
        const updatedOrgData = {
          ...organization,
          events: (organization.events || []).filter(id => id !== eventId),
        };

        await updateOrganization(updatedOrgData);
      }

      showSnackbar(
        pageContent['snackbar-edit-profile-organization-delete-event-success'] ||
          'Evento excluído com sucesso',
        'success'
      );
    } catch (error) {
      console.error('Erro ao excluir evento:', error);
      showSnackbar(
        pageContent['snackbar-edit-profile-organization-delete-event-failed'] ||
          'Erro ao excluir evento',
        'error'
      );
    }
  };

  // Optimize handleEventChange to use useCallback
  const handleEventChange = useCallback(
    async (index: number, field: keyof Event, value: string) => {
      // Ensure eventsData is an array before trying to modify it
      if (!Array.isArray(eventsData)) {
        console.error('eventsData is not an array:', eventsData);
        return;
      }

      // Use functional updates to prevent unnecessary re-renders
      setEventsData(prev => {
        // Additional array check
        if (!Array.isArray(prev)) {
          console.error('prev is not an array in handleEventChange:', prev);
          return prev;
        }

        const updated = [...prev];

        if (!updated[index]) {
          console.error(`Index ${index} out of range of events:`, updated);
          return prev;
        }

        // Special treatment for fields that may need conversion
        if (field === 'related_skills') {
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

      // Batch state updates by using a timeout
      if (eventsData[index] && eventsData[index].id) {
        setTimeout(() => {
          setEditedEvents(prev => ({
            ...prev,
            [eventsData[index].id]: true,
          }));
        }, 0);
      }
    },
    [eventsData]
  );

  // Use ref to maintain stable reference to the editing event
  const editingEventRef = useRef<Event | null>(null);

  // Handler to listen to event changes on the modal
  const handleModalEventChange = useCallback((index: number, field: keyof Event, value: string) => {
    if (!editingEventRef.current) return;

    let updatedValue: any = value;

    // Special treatment for specific fields
    if (field === 'time_begin' || field === 'time_end') {
      // Don't convert if it's already an ISO string
      if (value && !value.includes('T')) {
        updatedValue = new Date(value).toISOString();
      } else {
        updatedValue = value;
      }
    } else if (field === 'related_skills') {
      try {
        // If the value is a JSON string, parse it
        const parsedValue = JSON.parse(value);
        updatedValue = Array.isArray(parsedValue) ? parsedValue : [];
      } catch (e) {
        // If it's not a valid JSON, use empty array
        updatedValue = [];
      }
    }

    // Update the ref directly to avoid triggering re-renders
    editingEventRef.current = {
      ...editingEventRef.current,
      [field]: updatedValue,
    };

    // DON'T update the state to prevent re-renders
    // The ref maintains the current data and the form handles its own state
  }, []);

  const handleSaveEventChanges = async () => {
    try {
      if (!editingEventRef.current) return;

      if (editingEventRef.current.id === 0) {
        // Create new event - only include safe fields
        const newEventData = {
          name: editingEventRef.current.name,
          time_begin: editingEventRef.current.time_begin,
          organization: Number(organizationId),
          type_of_location: editingEventRef.current.type_of_location || 'virtual',
          creator: Number(session?.user?.id),
          // Only include optional fields if they have valid values
          ...(editingEventRef.current.url && { url: editingEventRef.current.url }),
          ...(editingEventRef.current.image_url && {
            image_url: editingEventRef.current.image_url,
          }),
          ...(editingEventRef.current.description && {
            description: editingEventRef.current.description,
          }),
          ...(editingEventRef.current.related_skills &&
            Array.isArray(editingEventRef.current.related_skills) &&
            editingEventRef.current.related_skills.length > 0 && {
              related_skills: editingEventRef.current.related_skills,
            }),
          ...(editingEventRef.current.time_end && { time_end: editingEventRef.current.time_end }),
          ...(editingEventRef.current.wikidata_qid && {
            wikidata_qid: editingEventRef.current.wikidata_qid,
          }),
          ...(editingEventRef.current.openstreetmap_id && {
            openstreetmap_id: editingEventRef.current.openstreetmap_id,
          }),
        };

        try {
          const createdEvent = await createEvent(newEventData);

          if (createdEvent && createdEvent.id) {
            setEventsData(prev => [...prev, createdEvent]);

            // Update the formData with the new event
            const updatedEvents = [...(formData.events || [])];
            if (!updatedEvents.includes(createdEvent.id)) {
              updatedEvents.push(createdEvent.id);
            }

            setFormData(prev => ({
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
              console.error('Error updating organization with new event:', updateOrgError);
            }

            showSnackbar(
              pageContent['snackbar-edit-profile-organization-create-event-success'],
              'success'
            );
          }
        } catch (createError) {
          console.error('Error creating event:', createError);
          showSnackbar(
            pageContent['snackbar-edit-profile-organization-create-event-failed'],
            'error'
          );
        }
      } else {
        // Update existing event
        try {
          const updatedEvent = await updateEvent(
            editingEventRef.current.id,
            editingEventRef.current
          );

          if (updatedEvent) {
            // Update the events list
            setEventsData(prev =>
              prev.map(event => (event.id === updatedEvent.id ? updatedEvent : event))
            );

            showSnackbar(
              pageContent['snackbar-edit-profile-organization-update-event-success'] ||
                'Evento atualizado com sucesso',
              'success'
            );
          }
        } catch (updateError) {
          console.error('Erro ao atualizar evento:', updateError);
          showSnackbar(
            pageContent['snackbar-edit-profile-organization-update-event-failed'] ||
              'Erro ao atualizar evento',
            'error'
          );
        }
      }

      // Close the modal and clear the event in edit
      setShowEventModal(false);
      setCurrentEditingEvent(null);
      editingEventRef.current = null;
    } catch (error) {
      console.error('Erro ao salvar evento:', error);
      showSnackbar(
        pageContent['snackbar-edit-profile-organization-save-event-failed'] ||
          'Erro ao salvar evento',
        'error'
      );
    }
  };

  const handleViewAllEvents = () => {
    router.push(`/events`);
  };

  // Diff tags handlers
  const handleAddDiffTag = () => {
    const newTag = {
      id: Math.floor(Math.random() * -1000), // Temporary negative ID for new tags
      tag: '', // Empty string instead of default text
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      creator: Number(session?.user?.id),
    };
    setDiffTagsData(prev => [...(prev || []), newTag]);
  };

  const handleDiffTagChange = async (index: number, field: string, value: string) => {
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
  const handleAddCapacity = (type: 'known' | 'available' | 'wanted') => {
    setCurrentCapacityType(type);
    setIsModalOpen(true);
  };

  // Memoize the current capacities to avoid hook dependency changes
  const currentCapacities = useMemo(() => {
    const capacityField = `${currentCapacityType}_capacities` as keyof typeof formData;
    return (formData[capacityField] as number[]) || [];
  }, [formData, currentCapacityType]);

  // Memoize the update function to avoid recreating it on every render
  const updateCapacities = useCallback(
    (updatedCapacities: number[]) => {
      const capacityField = `${currentCapacityType}_capacities` as keyof typeof formData;
      setFormData(prev => ({
        ...prev,
        [capacityField]: updatedCapacities,
      }));
    },
    [currentCapacityType, setFormData]
  );

  const { handleCapacitySelect } = useFormCapacitySelection(
    currentCapacities,
    updateCapacities,
    () => setIsModalOpen(false)
  );

  const handleRemoveCapacity = (type: 'known' | 'available' | 'wanted', index: number) => {
    setFormData(prev => {
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
    // Check if we've reached the maximum limit of 4 documents
    if (documentsData.length >= 4) {
      showSnackbar(
        pageContent['snackbar-edit-profile-organization-max-documents-reached'],
        'error'
      );
      return;
    }

    const newDocument: OrganizationDocument = {
      id: 0,
      url: '',
    };
    setDocumentsData(prev => [...(prev || []), newDocument]);
  };

  const handleDeleteDocument = (index: number) => {
    setDocumentsData(prev => {
      const newDocs = [...prev];
      newDocs.splice(index, 1);
      return newDocs;
    });
  };

  const handleDocumentChange = (index: number, field: string, value: string) => {
    if (!Array.isArray(documentsData)) {
      setDocumentsData([]);
      return;
    }

    setDocumentsData(prev => {
      const newDocuments = [...prev];
      newDocuments[index] = {
        ...newDocuments[index],
        [field]: value,
      };
      return newDocuments;
    });
  };

  if (isLoading) {
    return <LoadingState fullScreen={true} />;
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
          handleDeleteDocument={handleDeleteDocument}
          handleDocumentChange={handleDocumentChange}
          capacities={capacityCache.getRootCapacities()}
          handleChooseEvent={handleChooseEvent}
          handleViewAllEvents={handleViewAllEvents}
          handleEditEvent={handleEditEvent}
          territories={territories || {}}
        />

        {showEventModal && editingEventRef.current && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div
              className="absolute inset-0 bg-black bg-opacity-50"
              onClick={() => {
                setShowEventModal(false);
                setCurrentEditingEvent(null);
                editingEventRef.current = null;
              }}
            />
            <div
              className={`relative rounded-lg p-6 w-11/12 max-w-2xl max-h-[90vh] overflow-y-auto ${
                darkMode ? 'bg-capx-dark-box-bg' : 'bg-white'
              }`}
            >
              <button
                onClick={() => {
                  setShowEventModal(false);
                  setCurrentEditingEvent(null);
                  editingEventRef.current = null;
                }}
                className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>

              <div className="mb-6">
                <EventsForm
                  key={`${editingEventRef.current.id}-${editingEventRef.current.organization}`}
                  eventData={editingEventRef.current}
                  index={0}
                  onDelete={() => {
                    setShowEventModal(false);
                    setCurrentEditingEvent(null);
                    editingEventRef.current = null;
                  }}
                  onChange={handleModalEventChange}
                  eventType={editingEventRef.current?.id === 0 ? 'new' : 'edit'}
                />
              </div>

              <div className="flex justify-end gap-4 mt-6 border-t pt-4">
                <button
                  onClick={() => {
                    setShowEventModal(false);
                    setCurrentEditingEvent(null);
                    editingEventRef.current = null;
                  }}
                  className={`px-4 py-2 font-extrabold rounded-md border border-gray-300 hover:border-gray-400 ${
                    darkMode
                      ? 'bg-capx-dark-box-bg text-white hover:text-black hover:bg-white'
                      : 'bg-white border-capx-dark-box-bg text-capx-dark-box-bg hover:text-capx-dark-box-bg'
                  }`}
                >
                  {pageContent['organization-profile-event-popup-cancel'] || 'Cancel'}
                </button>
                <button
                  onClick={handleSaveEventChanges}
                  className="px-4 py-2 bg-capx-secondary-purple text-white hover:bg-capx-primary-green hover:text-black font-extrabold rounded-md"
                >
                  {editingEventRef.current?.id === 0
                    ? pageContent['organization-profile-event-popup-create-event'] || 'Create event'
                    : pageContent['organization-profile-event-popup-save-changes'] ||
                      'Save changes'}
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
        capacities={capacityCache.getRootCapacities()}
        handleEditEvent={handleEditEvent}
        handleChooseEvent={handleChooseEvent}
        handleViewAllEvents={handleViewAllEvents}
        territories={territories || {}}
      />

      {showEventModal && editingEventRef.current && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black bg-opacity-50"
            onClick={() => {
              setShowEventModal(false);
              setCurrentEditingEvent(null);
              editingEventRef.current = null;
            }}
          />
          <div
            className={`relative rounded-lg p-6 w-11/12 max-w-2xl max-h-[90vh] overflow-y-auto ${
              darkMode ? 'bg-capx-dark-box-bg' : 'bg-white'
            }`}
          >
            <button
              onClick={() => {
                setShowEventModal(false);
                setCurrentEditingEvent(null);
                editingEventRef.current = null;
              }}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>

            <div className="mb-6">
              <EventsForm
                key={`${editingEventRef.current.id}-${editingEventRef.current.organization}`}
                eventData={editingEventRef.current}
                index={0}
                onDelete={() => {
                  setShowEventModal(false);
                  setCurrentEditingEvent(null);
                  editingEventRef.current = null;
                }}
                onChange={handleModalEventChange}
                eventType={editingEventRef.current?.id === 0 ? 'new' : 'edit'}
              />
            </div>

            <div className="flex justify-end gap-4 mt-6 border-t pt-4">
              <button
                onClick={() => {
                  setShowEventModal(false);
                  setCurrentEditingEvent(null);
                  editingEventRef.current = null;
                }}
                className={`px-4 py-2 font-extrabold rounded-md border border-gray-300 hover:border-gray-400 ${
                  darkMode
                    ? 'bg-capx-dark-box-bg text-white hover:text-black hover:bg-white'
                    : 'bg-white border-capx-dark-box-bg text-capx-dark-box-bg hover:text-capx-dark-box-bg'
                }`}
              >
                {pageContent['organization-profile-event-popup-cancel'] || 'Cancel'}
              </button>
              <button
                onClick={handleSaveEventChanges}
                className="px-4 py-2 bg-capx-secondary-purple text-white hover:bg-capx-primary-green hover:text-black font-extrabold rounded-md"
              >
                {editingEventRef.current?.id === 0
                  ? pageContent['organization-profile-event-popup-create-event'] || 'Create event'
                  : pageContent['organization-profile-event-popup-save-changes'] || 'Save changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
