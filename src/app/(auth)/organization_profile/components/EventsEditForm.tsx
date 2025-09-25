'use client';

import CapacitySelectionModal from '@/components/CapacitySelectionModal';
import CustomDatePicker from '@/components/CustomDatePicker';
import { useApp } from '@/contexts/AppContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useCapacityDetails } from '@/hooks/useCapacityDetails';
import { dateTimeLocalToDate, dateToDateTimeLocal } from '@/lib/utils/dateLocale';
import {
  fetchEventDataByGenericURL,
  fetchEventDataByQID,
  fetchEventDataByURL,
  isValidEventURL,
} from '@/services/metabaseService';
import { organizationProfileService } from '@/services/organizationProfileService';
import { Capacity } from '@/types/capacity';
import { Event } from '@/types/event';
import { useSession } from 'next-auth/react';
import React, {
  memo,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

interface EventFormItemProps {
  eventData: Event;
  index: number;
  onDelete: (id: number) => void;
  onChange: (index: number, field: keyof Event, value: string) => void;
  eventType: string;
}

// Component with debounce for input memoized
const MemoizedInput = memo(
  ({
    value,
    onChange,
    placeholder,
    className,
    type = 'text',
    disabled = false,
    onKeyDown,
  }: {
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    placeholder: string;
    className: string;
    type?: string;
    disabled?: boolean;
    onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  }) => {
    // Use useRef to maintain input reference
    const inputRef = useRef<HTMLInputElement>(null);
    // Local state to control internal value
    const [localValue, setLocalValue] = useState(value);
    const [isEditing, setIsEditing] = useState(false);
    const lastUpdateTimeRef = useRef(0);
    const debounceTimerRef = useRef<number | null>(null);

    // Sync local state with external value only when needed
    useEffect(() => {
      // Only update local state if the external value has changed significantly
      // and we're not actively editing the field
      if (value !== localValue && !isEditing) {
        setLocalValue(value);
      }
    }, [value, localValue, isEditing]);

    // Handler to update local state
    const handleLocalChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value;
        setLocalValue(newValue);

        // Clear any existing timer
        if (debounceTimerRef.current !== null) {
          clearTimeout(debounceTimerRef.current);
        }

        // Implement debouncing for propagating changes
        debounceTimerRef.current = window.setTimeout(() => {
          // Only propagate if time since last update is sufficient
          const now = Date.now();
          if (now - lastUpdateTimeRef.current > 300) {
            onChange(e);
            lastUpdateTimeRef.current = now;
          }
          debounceTimerRef.current = null;
        }, 300);
      },
      [onChange]
    );

    // Edit state controllers
    const handleFocus = useCallback(() => {
      setIsEditing(true);
    }, []);

    const handleBlur = useCallback(() => {
      setIsEditing(false);

      // Clear any pending debounce timer
      if (debounceTimerRef.current !== null) {
        clearTimeout(debounceTimerRef.current);
        debounceTimerRef.current = null;
      }

      // Ensure final value is propagated
      const syntheticEvent = {
        target: { value: localValue },
      } as React.ChangeEvent<HTMLInputElement>;
      onChange(syntheticEvent);
    }, [localValue, onChange]);

    // Keep the text box responsive using useLayoutEffect
    useLayoutEffect(() => {
      if (document.activeElement === inputRef.current) {
        // Preserve cursor position if the element is focused
        const cursorPosition = inputRef.current?.selectionStart || 0;
        setTimeout(() => {
          if (inputRef.current) {
            inputRef.current.selectionStart = cursorPosition;
            inputRef.current.selectionEnd = cursorPosition;
          }
        }, 0);
      }
    }, [localValue]);

    return (
      <input
        ref={inputRef}
        type={type}
        placeholder={placeholder}
        value={localValue}
        onChange={handleLocalChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        className={className}
        disabled={disabled}
        onKeyDown={onKeyDown}
      />
    );
  },
  // Custom comparator to avoid unnecessary re-renders
  (prevProps, nextProps) => {
    // Render again only if important props change
    // Ignore value changes during editing (handled with local state)
    if (document.activeElement?.tagName === 'INPUT' && prevProps.value !== nextProps.value) {
      // If the field is focused, ignore external value changes
      return true; // avoid re-render
    }

    return (
      prevProps.className === nextProps.className &&
      prevProps.disabled === nextProps.disabled &&
      prevProps.placeholder === nextProps.placeholder
    );
  }
);
MemoizedInput.displayName = 'MemoizedInput';

// Memoized textarea component
const MemoizedTextarea = memo(
  ({
    value,
    onChange,
    className,
  }: {
    value: string;
    onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
    className: string;
  }) => {
    // Use refs to manage local state and prevent unnecessary re-renders
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const [localValue, setLocalValue] = useState(value);
    const [isEditing, setIsEditing] = useState(false);
    const prevValueRef = useRef(value);
    const lastPropagationRef = useRef(0);

    // Sync with external value when needed
    useEffect(() => {
      if (value !== localValue && !isEditing) {
        // Only update if the value has actually changed and we're not editing
        setLocalValue(value);
        prevValueRef.current = value;
      }
    }, [value, localValue, isEditing]);

    // Local change handler with state management
    const handleLocalChange = useCallback(
      (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const newValue = e.target.value;
        setLocalValue(newValue);

        // Only propagate changes if significantly different to avoid loops
        if (
          Math.abs(newValue.length - prevValueRef.current.length) > 1 ||
          Date.now() - lastPropagationRef.current > 500
        ) {
          onChange(e);
          lastPropagationRef.current = Date.now();
        }
      },
      [onChange]
    );

    // Editing state controllers
    const handleFocus = useCallback(() => {
      setIsEditing(true);
    }, []);

    const handleBlur = useCallback(() => {
      setIsEditing(false);
      // Ensure value is synced on blur
      if (localValue !== prevValueRef.current) {
        // Create a synthetic event to propagate the final value
        const syntheticEvent = {
          target: { value: localValue },
        } as React.ChangeEvent<HTMLTextAreaElement>;
        onChange(syntheticEvent);
        prevValueRef.current = localValue;
      }
    }, [localValue, onChange]);

    return (
      <textarea
        ref={textareaRef}
        value={localValue}
        onChange={handleLocalChange}
        className={className}
        onFocus={handleFocus}
        onBlur={handleBlur}
      />
    );
  },
  // Custom comparison to prevent unnecessary re-renders
  (prevProps, nextProps) => {
    if (document.activeElement?.tagName === 'TEXTAREA' && prevProps.value !== nextProps.value) {
      // If the textarea is in focus, ignore external value changes
      return true; // prevent re-render
    }

    return prevProps.className === nextProps.className;
  }
);
MemoizedTextarea.displayName = 'MemoizedTextarea';

// Separate component to handle organization loading
const OrganizationLoader = memo(
  ({
    organizationId,
    onOrganizationLoaded,
  }: {
    organizationId: number;
    onOrganizationLoaded: (name: string) => void;
  }) => {
    const { data: session } = useSession();
    const [loadedOrgId, setLoadedOrgId] = useState<number | null>(null);
    const isMountedRef = useRef(true);
    const isLoadingRef = useRef(false);

    // Update mount status
    useEffect(() => {
      isMountedRef.current = true;
      return () => {
        isMountedRef.current = false;
      };
    }, []);

    // Stable callback reference
    const callbackRef = useRef(onOrganizationLoaded);
    useEffect(() => {
      callbackRef.current = onOrganizationLoaded;
    }, [onOrganizationLoaded]);

    // Stabilize token reference to prevent unnecessary re-renders
    const tokenRef = useRef(session?.user?.token);
    useEffect(() => {
      tokenRef.current = session?.user?.token;
    }, [session?.user?.token]);

    // Only load once when organization ID changes and we haven't loaded it yet
    useEffect(() => {
      const abortController = new AbortController();

      // Skip if we don't have the required data or if we've already loaded this org
      const token = tokenRef.current;
      if (!organizationId || !token || loadedOrgId === organizationId) {
        return;
      }

      // Prevent multiple simultaneous loads
      if (isLoadingRef.current) {
        return;
      }

      const loadOrg = async () => {
        isLoadingRef.current = true;

        try {
          const response = await organizationProfileService.getOrganizationById(
            token,
            organizationId
          );

          if (isMountedRef.current && response?.display_name) {
            callbackRef.current(response.display_name);
            setLoadedOrgId(organizationId); // Mark this org as loaded
          } else {
            if (isMountedRef.current) {
              callbackRef.current(''); // Clear organization name if no display_name
            }
          }
        } catch (error) {
          console.error('🏢 Error loading organization:', error);
          if (isMountedRef.current) {
            callbackRef.current(''); // Clear organization name on error
          }
        } finally {
          isLoadingRef.current = false;
        }
      };

      loadOrg();

      return () => {
        abortController.abort();
      };
    }, [organizationId, loadedOrgId]); // Removed session?.user?.token dependency

    // This component doesn't render anything visible
    return null;
  }
);
OrganizationLoader.displayName = 'OrganizationLoader';

// Memoize the EventsForm component to avoid unnecessary renders
const EventsForm = memo(
  ({ eventData, index, onChange, eventType }: EventFormItemProps) => {
    const { darkMode } = useTheme();
    const { isMobile, pageContent } = useApp();
    const { capacityNames } = useCapacityDetails();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedCapacities, setSelectedCapacities] = useState<Capacity[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [urlError, setUrlError] = useState<string | null>(null);
    const [urlInput, setUrlInput] = useState(eventData.url || '');
    const [organizationName, setOrganizationName] = useState<string>('');
    const [organizationLoading, setOrganizationLoading] = useState<boolean>(false);

    // Calculate organizationId once
    const organizationId = useMemo(() => {
      return eventData.organization;
    }, [eventData.organization]);

    // Handle organization loading through the separate component
    const handleOrganizationLoaded = useCallback((name: string) => {
      setOrganizationName(name || '');
      setOrganizationLoading(false);
    }, []);

    // Set loading state only when organizationId changes
    useEffect(() => {
      if (organizationId) {
        setOrganizationLoading(true);
        setOrganizationName(''); // Clear previous name
      }
    }, [organizationId]); // Only depend on organizationId

    // Parse related skills from eventData.related_skills
    const parseRelatedSkills = useCallback(() => {
      if (!eventData.related_skills || eventData.related_skills.length === 0) {
        return [];
      }

      try {
        // Check if it's already an array
        if (Array.isArray(eventData.related_skills)) {
          return eventData.related_skills.map(Number).filter(Boolean);
        }

        // Try to parse as JSON string
        const parsedRelatedSkills = JSON.parse(eventData.related_skills as string);
        if (Array.isArray(parsedRelatedSkills)) {
          return parsedRelatedSkills.map(Number).filter(Boolean);
        }

        return [];
      } catch (error) {
        console.error('Error parsing related_skills:', error);
        return [];
      }
    }, [eventData.related_skills]);

    const capacityIds = useMemo(() => parseRelatedSkills(), [parseRelatedSkills]);

    // Sincronizar capacidades quando as IDs ou nomes mudarem
    useEffect(() => {
      // Skip if no capacity IDs
      if (!capacityIds || capacityIds.length === 0) {
        setSelectedCapacities([]);
        return;
      }

      // Create the new capacities
      let newCapacities: Capacity[];

      if (capacityNames && Object.keys(capacityNames).length > 0) {
        // Create real capacities with names
        newCapacities = capacityIds.map(id => ({
          code: id,
          name: capacityNames[id.toString()] || `Capacity ${id}`,
          skill_type: 0,
          skill_wikidata_item: '',
          icon: '',
          color: '',
          hasChildren: false,
        }));
      } else {
        // Create placeholder capacities
        newCapacities = capacityIds.map(id => ({
          code: id,
          name: `Loading... (${id})`,
          skill_type: 0,
          skill_wikidata_item: '',
          icon: '',
          color: '',
          hasChildren: false,
        }));
      }

      setSelectedCapacities(newCapacities);
    }, [capacityIds, capacityNames]); // Simplified dependencies

    // Helper function for debounce
    const handleChange = useCallback(
      (field: keyof Event, value: string) => {
        // Direct update without debounce for immediate feedback
        onChange(index, field, value);
      },
      [onChange, index]
    );

    // Function to fetch event data from a URL
    const fetchEventData = useCallback(
      async (url: string) => {
        if (!url || url.trim() === '') {
          return;
        }

        // Validate URL format first
        const isValid = isValidEventURL(url);

        if (!isValid) {
          setUrlError(
            pageContent['organization-profile-event-url-invalid'] ||
              'URL inválida. Use URLs do Meta Wikimedia (ex: meta.wikimedia.org/wiki/Event) ou WikiLearn (app.learn.wiki/learning/course/...)'
          );
          setIsLoading(false);
          return;
        }

        setIsLoading(true);
        setUrlError(null);

        try {
          let data;

          // Check if the input is a QID or a URL
          if (url.startsWith('Q')) {
            data = await fetchEventDataByQID(url);
          } else if (url.includes('wikidata.org')) {
            data = await fetchEventDataByURL(url);
          } else {
            // For URLs that are not Wikidata (metawiki, learn.wiki, etc)
            data = await fetchEventDataByGenericURL(url);
          }

          if (data) {
            // Update the event data with the new information
            if (data.name) {
              setLocalName(data.name); // Update local state immediately
              handleChange('name', data.name);
            }
            if (data.description) {
              setLocalDescription(data.description); // Update local state immediately
              handleChange('description', data.description);
            }
            if (data.image_url) {
              handleChange('image_url', data.image_url);
            }
            if (data.time_begin) {
              setLocalStartDate(dateToDateTimeLocal(new Date(data.time_begin)));
              handleChange('time_begin', data.time_begin);
            } else {
              setLocalEndDate(dateToDateTimeLocal(new Date(data.time_end)));
              handleChange('time_end', data.time_end);
            }
            if (data.type_of_location) {
              setLocalLocationType(data.type_of_location);
              handleChange('type_of_location', data.type_of_location);
            }
            if (data.wikidata_qid) {
              handleChange('wikidata_qid', data.wikidata_qid);
            }

            // Update URL only if it's different
            if (data.url && data.url !== urlInput) {
              setUrlInput(data.url);
              handleChange('url', data.url);
            }

            // Show success message
          } else {
            setUrlError(
              pageContent['event-form-wikidata-not-found'] ||
                'Não foi possível encontrar dados do evento para esta URL'
            );
          }
        } catch (error) {
          console.error('Error fetching event data:', error);
          setUrlError(
            pageContent['event-form-wikidata-error'] || 'Ocorreu um erro ao buscar dados do evento'
          );
        } finally {
          setIsLoading(false);
        }
      },
      [urlInput, handleChange, pageContent]
    );

    // Local state for name to avoid re-renders
    const [localName, setLocalName] = useState(eventData.name || '');

    // Update local name when eventData changes externally
    useEffect(() => {
      setLocalName(eventData.name || '');
    }, [eventData.name]);

    // Simple name change handler with local state
    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      setLocalName(newValue);
      onChange(index, 'name', newValue);
    };

    // handleCapacitySelect should use useCallback to avoid re-renders
    const handleCapacitySelect = useCallback(
      (capacities: Capacity[]) => {
        let newCapacities = [...selectedCapacities];

        capacities.forEach(capacity => {
          if (!newCapacities.find(cap => cap.code === capacity.code)) {
            // Add the full capacity with its real name
            // Make sure we preserve the full capacity object
            newCapacities.push(capacity);
          }
        });

        setSelectedCapacities(newCapacities);

        // Update related_skills in event (only the IDs)
        const skillIds = newCapacities.map(cap => cap.code);
        onChange(index, 'related_skills', JSON.stringify(skillIds));

        setIsModalOpen(false);
      },
      [selectedCapacities, onChange, index]
    );

    const handleRemoveCapacity = useCallback(
      (capacityCode: number) => {
        const newCapacities = selectedCapacities.filter(cap => cap.code !== capacityCode);
        setSelectedCapacities(newCapacities);

        // Update related_skills in event
        const skillIds = newCapacities.map(cap => cap.code);
        onChange(index, 'related_skills', JSON.stringify(skillIds));
      },
      [selectedCapacities, onChange, index]
    );

    // Optimize other field handlers for use of debounce
    const handleUrlInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      setUrlInput(newValue);
    }, []);

    const handleUrlSubmit = useCallback(() => {
      // Get the current value from the input element directly
      const inputElement = document.querySelector(
        'input[placeholder*="Insert an URL"]'
      ) as HTMLInputElement;
      const currentInputValue = inputElement?.value || '';

      const finalUrl = currentInputValue || urlInput;

      // Debounce to avoid multiple calls
      handleChange('url', finalUrl);
      if (finalUrl && finalUrl.trim() !== '') {
        fetchEventData(finalUrl);
      }
    }, [urlInput, handleChange, fetchEventData, eventData.url]);

    // Add handler for Enter key
    const handleUrlKeyDown = useCallback(
      (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
          e.preventDefault(); // Prevent focus loss
          handleUrlSubmit();
        }
      },
      [handleUrlSubmit]
    );

    // Local state for description to avoid re-renders
    const [localDescription, setLocalDescription] = useState(eventData.description || '');

    // Update local description when eventData changes externally
    useEffect(() => {
      setLocalDescription(eventData.description || '');
    }, [eventData.description]);

    const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const newValue = e.target.value;
      setLocalDescription(newValue);
      onChange(index, 'description', newValue);
    };

    // Local state for dates to avoid re-renders
    const [localStartDate, setLocalStartDate] = useState(
      eventData.time_begin ? dateToDateTimeLocal(new Date(eventData.time_begin)) : ''
    );
    const [localEndDate, setLocalEndDate] = useState(
      eventData.time_end ? dateToDateTimeLocal(new Date(eventData.time_end)) : ''
    );

    // Update local dates when eventData changes externally
    useEffect(() => {
      setLocalStartDate(
        eventData.time_begin ? dateToDateTimeLocal(new Date(eventData.time_begin)) : ''
      );
    }, [eventData.time_begin]);

    useEffect(() => {
      setLocalEndDate(eventData.time_end ? dateToDateTimeLocal(new Date(eventData.time_end)) : '');
    }, [eventData.time_end]);

    // Local state for location type to avoid re-renders
    const [localLocationType, setLocalLocationType] = useState(
      eventData.type_of_location || 'virtual'
    );

    // Update local location type when eventData changes externally
    useEffect(() => {
      setLocalLocationType(eventData.type_of_location || 'virtual');
    }, [eventData.type_of_location]);

    const handleLocationTypeChange = useCallback(
      (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value;
        setLocalLocationType(value);
        handleChange('type_of_location', value);
      },
      [handleChange]
    );

    // Effect to sync the input with eventData when it changes externally
    useEffect(() => {
      // Only sync if eventData.url has actually changed and is different from current input
      if (eventData.url && eventData.url !== urlInput) {
        setUrlInput(eventData.url);
      }
    }, [eventData.url]); // Only depend on eventData.url to avoid loops

    // Memoized rendering of capacities
    const renderSelectedCapacities = useCallback(() => {
      if (selectedCapacities.length === 0) {
        return (
          <span
            className={`${isMobile ? 'text-sm' : 'text-base'} ${
              darkMode ? 'text-gray-400' : 'text-gray-500'
            }`}
          >
            {pageContent['organization-profile-event-choose-capacities']}
          </span>
        );
      }

      return selectedCapacities.map(capacity => (
        <div
          key={capacity.code}
          className={`${isMobile ? 'text-xs' : 'text-sm'} ${
            darkMode ? 'text-capx-dark-box-bg bg-white' : 'text-white bg-capx-dark-box-bg'
          } px-2 py-1 rounded-[4px] rounded-[8px] w-fit flex items-center gap-1`}
        >
          <span>{capacity.name}</span>
          <button
            onClick={e => {
              e.stopPropagation();
              handleRemoveCapacity(capacity.code);
            }}
            className={`${
              isMobile ? 'w-4 h-4' : 'w-5 h-5'
            } flex items-center justify-center rounded-full hover:bg-capx-secondary-green ml-1`}
          >
            ×
          </button>
        </div>
      ));
    }, [selectedCapacities, isMobile, darkMode, pageContent, handleRemoveCapacity]);

    const organizationSectionContent = (
      <div className="flex flex-col">
        <h2
          className={`${isMobile ? 'text-lg' : 'text-[24px]'} font-Montserrat font-bold py-2 ${
            darkMode ? 'text-white' : 'text-capx-dark-box-bg'
          }`}
        >
          {pageContent['organization-profile-event-organized-by']}
        </h2>
        <div
          className={`flex flex-row gap-2 w-full items-center ${
            isMobile ? 'text-sm' : 'text-[24px]'
          } p-2 border ${
            darkMode ? 'border-white' : 'border-capx-dark-box-bg'
          } rounded-md bg-transparent`}
        >
          {/* Hidden loader component that handles the API call */}
          <OrganizationLoader
            organizationId={organizationId}
            onOrganizationLoaded={handleOrganizationLoaded}
          />

          {/* Display organization name or loading state */}
          <span
            className={`w-full outline-none ${
              organizationName ? (darkMode ? 'text-white' : 'text-[#829BA4]') : 'text-gray-400'
            }`}
          >
            {organizationName ||
              (organizationLoading
                ? pageContent['loading'] || 'Loading...'
                : pageContent['organization-not-found'] || 'Organization not found')}
          </span>
        </div>
      </div>
    );

    return (
      <div className={`${darkMode ? 'dark' : ''} ${isMobile ? 'mobile' : ''}`}>
        <div className="flex flex-row gap-2">
          <div className={`flex flex-col gap-2 w-full ${isMobile ? 'p-2' : 'p-4'}`}>
            <h1
              className={`${
                isMobile ? 'text-xl' : 'text-[24px]'
              } text-capx-dark-box-bg font-Montserrat font-extrabold text-center py-2
            ${darkMode ? 'text-white' : 'text-capx-dark-box-bg'}
            `}
            >
              {eventType === 'new'
                ? pageContent['organization-profile-new-event']
                : pageContent['organization-profile-edit-event']}
            </h1>

            <h2
              className={`${isMobile ? 'text-lg' : 'text-[24px]'} font-Montserrat font-bold py-2 ${
                darkMode ? 'text-white' : 'text-[#053749]'
              }`}
            >
              {pageContent['organization-profile-event-url-title']}
            </h2>

            <div className="flex flex-col gap-2 w-full">
              <div className="flex gap-2 items-center">
                <div
                  className={`flex-1 ${isMobile ? 'text-sm' : 'text-[24px]'} ${
                    darkMode ? 'border-white' : 'border-capx-dark-box-bg'
                  } rounded-md bg-transparent`}
                >
                  <input
                    type="text"
                    placeholder={
                      pageContent['organization-profile-event-url-placeholder'] || 'Insert an URL'
                    }
                    className={`w-full bg-transparent outline-none border p-2 rounded rounded-[4px] ${
                      darkMode
                        ? 'text-white placeholder-gray-400 border-white'
                        : 'text-[#829BA4] placeholder-[#829BA4] border-capx-dark-box-bg'
                    }`}
                    value={urlInput}
                    onChange={handleUrlInputChange}
                    onKeyDown={handleUrlKeyDown}
                  />
                </div>

                <button
                  onClick={handleUrlSubmit}
                  disabled={isLoading}
                  className={`${isMobile ? 'px-3 py-1.5 text-sm' : 'px-4 py-2 text-base'} rounded ${
                    darkMode ? 'text-capx-dark-box-bg bg-white' : 'text-white bg-capx-dark-box-bg'
                  }
                `}
                >
                  {isLoading ? '...' : pageContent['organization-profile-event-search']}
                </button>
              </div>

              {isLoading && (
                <p
                  className={`${isMobile ? 'text-sm' : 'text-[16px]'} ${
                    darkMode ? 'text-yellow-300' : 'text-yellow-700'
                  }`}
                >
                  {pageContent['event-form-wikidata-loading'] || 'Searching for event data...'}
                </p>
              )}

              {urlError && (
                <p
                  className={`${isMobile ? 'text-sm' : 'text-[16px]'} ${
                    darkMode ? 'text-red-300' : 'text-red-700'
                  }`}
                >
                  {urlError}
                </p>
              )}

              <p
                className={`${isMobile ? 'text-sm' : 'text-[20px]'} ${
                  darkMode ? 'text-white' : 'text-[#829BA4]'
                }`}
              >
                {pageContent['organization-profile-event-url-tooltip-updated'] ||
                  'Paste a URL from a Meta Wikimedia event page or a WikiLearn course. The tool will automatically fill in the event details.'}
              </p>
            </div>

            <h2
              className={`${isMobile ? 'text-lg' : 'text-[24px]'} font-Montserrat font-bold py-2 ${
                darkMode ? 'text-white' : 'text-[#053749]'
              }`}
            >
              {pageContent['organization-profile-event-title-of-event']}
            </h2>
            <div
              className={`flex flex-row gap-2 w-full items-center ${
                isMobile ? 'text-sm' : 'text-[24px]'
              } ${darkMode ? 'border-white' : 'border-capx-dark-box-bg'} rounded-md bg-transparent`}
            >
              <input
                type="text"
                value={localName}
                onChange={handleNameChange}
                placeholder={pageContent['organization-profile-event-name']}
                className={`w-full bg-transparent outline-none border p-2 rounded rounded-[4px] ${
                  darkMode
                    ? 'text-white placeholder-gray-400 border-white'
                    : 'text-[#053749] placeholder-[#829BA4] border-capx-dark-box-bg'
                }`}
              />
            </div>

            {/* Render the organization section */}
            {organizationSectionContent}

            <div className="flex flex-col">
              <h2
                className={`${isMobile ? 'text-lg' : 'text-[24px]'} font-Montserrat font-bold py-2 ${
                  darkMode ? 'text-white' : 'text-capx-dark-box-bg'
                }`}
              >
                {pageContent['organization-profile-event-start-date']}
              </h2>
              <div
                className={`flex ${isMobile ? 'flex-col' : 'flex-row'} gap-2 w-full items-center ${
                  isMobile ? 'text-sm' : 'text-[24px]'
                }`}
              >
                <div className={`flex ${isMobile ? 'w-full' : 'w-1/2'} flex-row gap-2`}>
                  <CustomDatePicker
                    value={localStartDate}
                    onChange={value => {
                      setLocalStartDate(value);
                      if (value) {
                        const date = dateTimeLocalToDate(value);
                        handleChange('time_begin', date.toISOString());
                      } else {
                        handleChange('time_begin', '');
                      }
                    }}
                    className={`w-full bg-transparent border rounded-md p-2 outline-none
                    ${
                      darkMode
                        ? 'text-white placeholder-gray-400 border-white'
                        : 'text-[#829BA4] placeholder-[#829BA4] border-capx-dark-box-bg'
                    }
                  `}
                    placeholder={
                      pageContent['organization-profile-event-start-date'] || 'Data de início'
                    }
                  />
                </div>
              </div>
              <p
                className={`${isMobile ? 'text-sm' : 'text-[20px]'} ${
                  darkMode ? 'text-white' : 'text-[#829BA4]'
                }`}
              >
                {pageContent['organization-profile-event-start-date-tooltip']}
              </p>
            </div>

            <div className="flex flex-col">
              <h2
                className={`${isMobile ? 'text-lg' : 'text-[24px]'} font-Montserrat font-bold py-2 ${
                  darkMode ? 'text-white' : 'text-capx-dark-box-bg'
                }`}
              >
                {pageContent['organization-profile-event-end-date']}
              </h2>
              <div
                className={`flex ${isMobile ? 'flex-col' : 'flex-row'} gap-2 w-full items-center ${
                  isMobile ? 'text-sm' : 'text-[24px]'
                }`}
              >
                <div
                  className={`flex ${isMobile ? 'w-full' : 'w-1/2'} flex-row gap-2 border ${
                    darkMode ? 'border-white' : 'border-capx-dark-box-bg'
                  } rounded-md`}
                >
                  <CustomDatePicker
                    value={localEndDate}
                    onChange={value => {
                      setLocalEndDate(value);
                      if (value) {
                        const date = dateTimeLocalToDate(value);
                        handleChange('time_end', date.toISOString());
                      } else {
                        handleChange('time_end', '');
                      }
                    }}
                    className={`w-full bg-transparent rounded-md p-2 outline-none
                    ${
                      darkMode
                        ? 'text-white placeholder-gray-400 border-white'
                        : 'text-[#829BA4] placeholder-[#829BA4] border-capx-dark-box-bg'
                    }
                  `}
                    placeholder={
                      pageContent['organization-profile-event-end-date'] || 'Data de fim'
                    }
                  />
                </div>
              </div>
              <p
                className={`${isMobile ? 'text-sm' : 'text-[20px]'} ${
                  darkMode ? 'text-white' : 'text-[#829BA4]'
                }`}
              >
                {pageContent['organization-profile-event-end-date-tooltip']}
              </p>
            </div>

            <div className="flex flex-col">
              <h2
                className={`${isMobile ? 'text-lg' : 'text-[24px]'} font-Montserrat font-bold py-2 ${
                  darkMode ? 'text-white' : 'text-capx-dark-box-bg'
                }`}
              >
                {pageContent['organization-profile-event-format']}
              </h2>
              <div
                className={`flex flex-row gap-2 w-full items-center ${
                  isMobile ? 'text-sm' : 'text-[24px]'
                } p-2 border ${
                  darkMode ? 'border-white' : 'border-capx-dark-box-bg'
                } rounded-md bg-transparent`}
              >
                <select
                  className={`w-full bg-transparent outline-none ${
                    darkMode
                      ? 'text-white placeholder-gray-400'
                      : 'text-[#829BA4] placeholder-[#829BA4]'
                  }`}
                  value={localLocationType}
                  onChange={handleLocationTypeChange}
                >
                  <option value="virtual">Virtual</option>
                  <option value="in_person">In person</option>
                  <option value="hybrid">Hybrid</option>
                </select>
              </div>
            </div>

            <div className={`flex flex-col gap-4 w-full border-none ${isMobile ? 'mt-2' : 'mt-4'}`}>
              <h2
                className={`${isMobile ? 'text-lg' : 'text-[24px]'} font-Montserrat font-bold py-2 ${
                  darkMode ? 'text-white' : 'text-capx-dark-box-bg'
                }`}
              >
                {pageContent['organization-profile-event-choose-capacities']}
              </h2>

              <div className="flex flex-col w-full">
                <div
                  onClick={() => setIsModalOpen(true)}
                  className={`flex items-center justify-between w-full ${
                    isMobile ? 'px-3 py-2' : 'px-4 py-3'
                  } border rounded-lg cursor-pointer ${
                    darkMode
                      ? 'bg-transparent border-white text-white'
                      : 'bg-white border-capx-dark-box-bg text-capx-dark-box-bg'
                  }`}
                >
                  <div className="flex-1 flex flex-wrap gap-2">{renderSelectedCapacities()}</div>

                  <div className="flex-shrink-0 ml-2">
                    <div
                      className={`w-5 h-5 flex items-center justify-center pointer-events-none ${
                        darkMode ? 'text-white' : 'text-gray-800'
                      }`}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        className="w-5 h-5"
                      >
                        <path
                          fillRule="evenodd"
                          d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              <CapacitySelectionModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSelect={handleCapacitySelect}
                title={pageContent['organization-profile-event-choose-capacities']}
              />
            </div>

            <div className="flex flex-col">
              <h2
                className={`${isMobile ? 'text-lg' : 'text-[24px]'} font-Montserrat font-bold py-2 ${
                  darkMode ? 'text-white' : 'text-capx-dark-box-bg'
                }`}
              >
                {pageContent['organization-profile-event-description']}
              </h2>
              <div
                className={`flex flex-col gap-2 w-full items-center ${
                  isMobile ? 'text-sm' : 'text-[24px]'
                } p-2 border ${
                  darkMode ? 'border-white' : 'border-capx-dark-box-bg'
                } rounded-md bg-transparent`}
              >
                <textarea
                  value={localDescription}
                  onChange={handleDescriptionChange}
                  className={`w-full bg-transparent rounded-md outline-none ${
                    isMobile ? 'min-h-[100px]' : 'min-h-[150px]'
                  } ${
                    darkMode
                      ? 'text-white placeholder-gray-400'
                      : 'text-capx-dark-box-bg placeholder-[#829BA4]'
                  }`}
                />
              </div>
              <p
                className={`${isMobile ? 'text-sm' : 'text-[20px]'} ${
                  darkMode ? 'text-white' : 'text-[#829BA4]'
                }`}
              >
                {pageContent['organization-profile-event-description-tooltip']}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  },
  (prevProps, nextProps) => {
    // Enhanced comparator to prevent unnecessary re-renders
    if (prevProps.index !== nextProps.index) return false;
    if (prevProps.eventType !== nextProps.eventType) return false;

    // Deep comparison of event data
    const prevEvent = prevProps.eventData;
    const nextEvent = nextProps.eventData;

    // Compare essential fields
    if (prevEvent.id !== nextEvent.id) return false;
    if (prevEvent.organization !== nextEvent.organization) return false;
    if (prevEvent.name !== nextEvent.name) return false;
    if (prevEvent.description !== nextEvent.description) return false;
    if (prevEvent.url !== nextEvent.url) return false;
    if (prevEvent.time_begin !== nextEvent.time_begin) return false;
    if (prevEvent.time_end !== nextEvent.time_end) return false;
    if (prevEvent.type_of_location !== nextEvent.type_of_location) return false;

    // Compare related_skills arrays
    const prevSkills = JSON.stringify(prevEvent.related_skills);
    const nextSkills = JSON.stringify(nextEvent.related_skills);
    if (prevSkills !== nextSkills) return false;

    // Compare callback functions by reference
    if (prevProps.onChange !== nextProps.onChange) return false;
    if (prevProps.onDelete !== nextProps.onDelete) return false;

    return true; // Props are equal, prevent re-render
  }
);

// Add displayName to avoid warnings
EventsForm.displayName = 'EventsForm';

export default EventsForm;
