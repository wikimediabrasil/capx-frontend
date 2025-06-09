"use client";

import { useTheme } from "@/contexts/ThemeContext";
import Image from "next/image"; // TODO
import { Event } from "@/types/event";
import { useApp } from "@/contexts/AppContext";
import {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
  useLayoutEffect,
} from "react";
import CapacitySelectionModal from "@/components/CapacitySelectionModal";
import { Capacity } from "@/types/capacity";
import ArrowDownIcon from "@/public/static/images/keyboard_arrow_down.svg"; //TODO
import {
  fetchEventDataByURL,
  fetchEventDataByQID,
  fetchEventDataByGenericURL,
} from "@/services/metabaseService";
import { useSession } from "next-auth/react";
import { useCapacityDetails } from "@/hooks/useCapacityDetails";
import React, { memo } from "react";
import { organizationProfileService } from "@/services/organizationProfileService";

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
    type = "text",
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
    if (
      document.activeElement?.tagName === "INPUT" &&
      prevProps.value !== nextProps.value
    ) {
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
MemoizedInput.displayName = "MemoizedInput";

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

    // Use ref to track last propagation time
    const lastPropagationRef = useRef(0);

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
    if (
      document.activeElement?.tagName === "TEXTAREA" &&
      prevProps.value !== nextProps.value
    ) {
      // If the textarea is in focus, ignore external value changes
      return true; // prevent re-render
    }

    return prevProps.className === nextProps.className;
  }
);
MemoizedTextarea.displayName = "MemoizedTextarea";

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
    const [attemptedLoad, setAttemptedLoad] = useState(false);
    const prevOrgIdRef = useRef<number | null>(null);
    const prevTokenRef = useRef<string | null>(null);

    // Only load once when component mounts or when dependencies genuinely change
    useEffect(() => {
      let isMounted = true;
      const abortController = new AbortController();

      // Skip if we've already attempted to load with these parameters
      const token = session?.user?.token;
      if (
        !organizationId ||
        !token ||
        (attemptedLoad &&
          prevOrgIdRef.current === organizationId &&
          prevTokenRef.current === token)
      ) {
        return;
      }

      const loadOrg = async () => {
        try {
          const response = await organizationProfileService.getOrganizationById(
            token,
            organizationId
          );

          if (isMounted && response?.display_name) {
            onOrganizationLoaded(response.display_name);
            // Record that we've attempted to load with these parameters
            prevOrgIdRef.current = organizationId;
            prevTokenRef.current = token;
            setAttemptedLoad(true);
          }
        } catch (error) {
          // Silently handle error
        }
      };

      loadOrg();

      return () => {
        isMounted = false;
        abortController.abort();
      };
    }, [
      organizationId,
      session?.user?.token,
      onOrganizationLoaded,
      attemptedLoad,
    ]);

    // This component doesn't render anything visible
    return null;
  }
);
OrganizationLoader.displayName = "OrganizationLoader";

// Memoize the EventsForm component to avoid unnecessary renders
const EventsForm = memo(
  ({ eventData, index, onDelete, onChange, eventType }: EventFormItemProps) => {
    const { darkMode } = useTheme();
    const { isMobile, pageContent } = useApp();
    const { data: session, status: sessionStatus } = useSession();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedCapacities, setSelectedCapacities] = useState<Capacity[]>(
      []
    );
    const [showMobile, setShowMobile] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [urlError, setUrlError] = useState<string | null>(null);
    const [urlInput, setUrlInput] = useState(eventData.url || "");
    const [organizationName, setOrganizationName] = useState<string>("");
    const [isEditingAnyField, setIsEditingAnyField] = useState<boolean>(false);

    // Refs to maintain local state
    const eventNameRef = useRef(eventData.name || "");
    const debounceTimerRef = useRef<number | null>(null);

    // Calculate organizationId once
    const organizationId = useMemo(
      () => eventData.organization,
      [eventData.organization]
    );

    // Handle organization loading through the separate component
    const handleOrganizationLoaded = useCallback((name: string) => {
      if (name) {
        setOrganizationName(name);
      }
    }, []);

    // Extract capacity IDs from event data more robustly
    const parseRelatedSkills = useCallback(() => {
      if (!eventData.related_skills) return [];

      try {
        if (Array.isArray(eventData.related_skills)) {
          return eventData.related_skills;
        } else if (typeof eventData.related_skills === "string") {
          const parsed = JSON.parse(eventData.related_skills);
          return parsed;
        }
      } catch (error) {
        // Error silently handled
      }

      return [];
    }, [eventData.related_skills]);

    // Memoize capacityIds
    const capacityIds = useMemo(
      () => parseRelatedSkills(),
      [parseRelatedSkills]
    );

    // Use the hook to get capacity details
    const { capacityNames } = useCapacityDetails(capacityIds);

    // Sincronizar capacidades quando as IDs ou nomes mudarem
    useEffect(() => {
      // Skip if no capacity IDs
      if (!capacityIds || capacityIds.length === 0) {
        // Only update if there are currently selected capacities (prevent unnecessary state update)
        if (selectedCapacities.length > 0) {
          setSelectedCapacities([]);
        }
        return;
      }

      // Skip if no capacity names are available yet and we don't need placeholder capacities
      if (
        (!capacityNames || Object.keys(capacityNames).length === 0) &&
        selectedCapacities.length > 0
      ) {
        return;
      }

      // Create a stable reference to the current selectedCapacities to avoid dependency issues
      const currentCapacities = selectedCapacities;

      // Create the new capacities
      let newCapacities: Capacity[];

      if (capacityNames && Object.keys(capacityNames).length > 0) {
        // Create real capacities with names
        newCapacities = capacityIds.map((id) => ({
          code: id,
          name: capacityNames[id.toString()] || `Capacity ${id}`,
          skill_type: 0,
          skill_wikidata_item: "",
          icon: "",
          color: "",
          hasChildren: false,
        }));
      } else {
        // Create placeholder capacities
        newCapacities = capacityIds.map((id) => ({
          code: id,
          name: `Loading... (${id})`,
          skill_type: 0,
          skill_wikidata_item: "",
          icon: "",
          color: "",
          hasChildren: false,
        }));
      }

      // Check if we need to update (optimization to prevent unnecessary renders)
      let needsUpdate = newCapacities.length !== currentCapacities.length;

      if (!needsUpdate) {
        // Check if any capacity has changed
        const currentCodesMap = new Map(
          currentCapacities.map((cap) => [cap.code, cap.name])
        );

        needsUpdate = newCapacities.some((newCap) => {
          const currentName = currentCodesMap.get(newCap.code);
          return currentName === undefined || currentName !== newCap.name;
        });
      }

      // Only update state if necessary
      if (needsUpdate) {
        setSelectedCapacities(newCapacities);
      }
    }, [capacityIds, capacityNames]); // Removed selectedCapacities from the dependency array

    // Change the event name locally before propagating
    useEffect(() => {
      eventNameRef.current = eventData.name || "";
    }, [eventData.name]);

    // Helper function for debounce
    const handleChange = useCallback(
      (field: keyof Event, value: string) => {
        // Use debounce to reduce updates
        onChange(index, field, value);
      },
      [onChange, index]
    );

    // Function to fetch event data from a URL
    const fetchEventData = useCallback(
      async (url: string) => {
        if (!url || url.trim() === "") return;

        setIsLoading(true);
        setUrlError(null);

        try {
          let data;

          // Check if the input is a QID or a URL
          if (url.startsWith("Q")) {
            data = await fetchEventDataByQID(url);
          } else if (url.includes("wikidata.org")) {
            data = await fetchEventDataByURL(url);
          } else {
            // For URLs that are not Wikidata (metawiki, learn.wiki, etc)
            data = await fetchEventDataByGenericURL(url);
          }

          if (data) {
            // Update the event data with the new information
            if (data.name) handleChange("name", data.name);
            if (data.description) handleChange("description", data.description);
            if (data.image_url) handleChange("image_url", data.image_url);
            if (data.time_begin) handleChange("time_begin", data.time_begin);
            if (data.time_end) handleChange("time_end", data.time_end);
            if (data.type_of_location)
              handleChange("type_of_location", data.type_of_location);
            if (data.wikidata_qid)
              handleChange("wikidata_qid", data.wikidata_qid);

            // Update URL only if it's different
            if (data.url && data.url !== urlInput) {
              setUrlInput(data.url);
              handleChange("url", data.url);
            }
          } else {
            setUrlError(
              pageContent["event-form-wikidata-not-found"] ||
                "It was not possible to find event data for this URL"
            );
          }
        } catch (error) {
          setUrlError(
            pageContent["event-form-wikidata-error"] ||
              "An error occurred while searching for event data"
          );
        } finally {
          setIsLoading(false);
        }
      },
      [urlInput, handleChange, pageContent]
    );

    // Define global listeners to detect when the user is editing
    useEffect(() => {
      const handleFocusIn = (e: FocusEvent) => {
        const target = e.target as HTMLElement;
        if (
          (target.tagName === "INPUT" &&
            target.getAttribute("type") === "text") ||
          target.tagName === "TEXTAREA"
        ) {
          setIsEditingAnyField(true);
        }
      };

      const handleFocusOut = (e: FocusEvent) => {
        const target = e.target as HTMLElement;
        if (
          (target.tagName === "INPUT" &&
            target.getAttribute("type") === "text") ||
          target.tagName === "TEXTAREA"
        ) {
          setIsEditingAnyField(false);
        }
      };

      // Add listeners
      document.addEventListener("focusin", handleFocusIn);
      document.addEventListener("focusout", handleFocusOut);

      return () => {
        // Remove listeners on unmount
        document.removeEventListener("focusin", handleFocusIn);
        document.removeEventListener("focusout", handleFocusOut);
      };
    }, []);

    // Event handlers with optimization to avoid rendering
    const handleNameChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        // Update the ref immediately to have the most current value
        eventNameRef.current = e.target.value;

        // Clear previous timer if it exists
        if (debounceTimerRef.current !== null) {
          clearTimeout(debounceTimerRef.current);
        }

        // Mark that we are in edit mode to avoid API calls
        setIsEditingAnyField(true);

        // Implement debounce to reduce API calls
        const newValue = e.target.value;

        // We use a reference to maintain the timer
        debounceTimerRef.current = window.setTimeout(() => {
          // Update the value
          onChange(index, "name", newValue);
          // Reset the edit state after debounce
          setIsEditingAnyField(false);
          // Clear the timer reference
          debounceTimerRef.current = null;
        }, 500); // Wait 500ms of inactivity before propagating the change
      },
      [onChange, index, setIsEditingAnyField]
    );

    // handleCapacitySelect should use useCallback to avoid re-renders
    const handleCapacitySelect = useCallback(
      (capacity: Capacity) => {
        if (!selectedCapacities.find((cap) => cap.code === capacity.code)) {
          // Add the full capacity with its real name
          // Make sure we preserve the full capacity object
          const newCapacities = [...selectedCapacities, capacity];

          setSelectedCapacities(newCapacities);

          // Update related_skills in event (only the IDs)
          const skillIds = newCapacities.map((cap) => cap.code);
          onChange(index, "related_skills", JSON.stringify(skillIds));
        }

        setIsModalOpen(false);
      },
      [selectedCapacities, onChange, index]
    );

    const handleRemoveCapacity = useCallback(
      (capacityCode: number) => {
        const newCapacities = selectedCapacities.filter(
          (cap) => cap.code !== capacityCode
        );
        setSelectedCapacities(newCapacities);

        // Update related_skills in event
        const skillIds = newCapacities.map((cap) => cap.code);
        onChange(index, "related_skills", JSON.stringify(skillIds));
      },
      [selectedCapacities, onChange, index]
    );

    // Optimize other field handlers for use of debounce
    const handleUrlInputChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        setUrlInput(e.target.value);
      },
      []
    );

    const handleUrlSubmit = useCallback(() => {
      // Debounce to avoid multiple calls
      handleChange("url", urlInput);
      if (urlInput && urlInput.trim() !== "") {
        fetchEventData(urlInput);
      }
    }, [urlInput, handleChange, fetchEventData]);

    // Add handler for Enter key
    const handleUrlKeyDown = useCallback(
      (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
          e.preventDefault(); // Prevent focus loss
          handleUrlSubmit();
        }
      },
      [handleUrlSubmit]
    );

    const handleDescriptionChange = useCallback(
      (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const value = e.target.value;

        // Clear any existing debounce timer
        if (debounceTimerRef.current !== null) {
          clearTimeout(debounceTimerRef.current);
        }

        // Set editing state to prevent API calls
        setIsEditingAnyField(true);

        // Store value locally instead of updating state immediately
        // Use a stable reference to avoid capturing state in closure
        const descriptionValue = value;
        const fieldToUpdate = "description";
        const indexCopy = index;

        // Debounce the update to reduce API calls
        debounceTimerRef.current = window.setTimeout(() => {
          // Use the callback version of onChange to avoid closure over state
          onChange(indexCopy, fieldToUpdate, descriptionValue);

          // Reset editing state after debounce
          // Use setTimeout to break potential call stack cycles
          window.setTimeout(() => {
            setIsEditingAnyField(false);
          }, 0);

          // Clear the timer reference
          debounceTimerRef.current = null;
        }, 800); // Longer delay for description field
      },
      [index, onChange]
    );

    const handleStartDateChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        handleChange("time_begin", value);
      },
      [handleChange]
    );

    const handleEndDateChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        handleChange("time_end", value);
      },
      [handleChange]
    );

    const handleLocationTypeChange = useCallback(
      (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value;
        handleChange("type_of_location", value);
      },
      [handleChange]
    );

    // Effect to sync the input with eventData when it changes externally
    useEffect(() => {
      if (eventData.url !== urlInput) {
        setUrlInput(eventData.url || "");
      }
    }, [eventData.url, urlInput]);

    useEffect(() => {
      setShowMobile(isMobile);
    }, [isMobile]);

    // Memoized rendering of capacities
    const renderSelectedCapacities = useCallback(() => {
      if (selectedCapacities.length === 0) {
        return (
          <span
            className={`${isMobile ? "text-sm" : "text-base"} ${
              darkMode ? "text-gray-400" : "text-gray-500"
            }`}
          >
            {pageContent["organization-profile-event-choose-capacities"]}
          </span>
        );
      }

      return selectedCapacities.map((capacity) => (
        <div
          key={capacity.code}
          className={`${isMobile ? "text-xs" : "text-sm"} ${
            darkMode
              ? "text-capx-dark-box-bg bg-white"
              : "text-white bg-capx-dark-box-bg"
          } px-2 py-1 rounded-[4px] rounded-[8px] w-fit flex items-center gap-1`}
        >
          <span>{capacity.name}</span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleRemoveCapacity(capacity.code);
            }}
            className={`${
              isMobile ? "w-4 h-4" : "w-5 h-5"
            } flex items-center justify-center rounded-full hover:bg-capx-secondary-green ml-1`}
          >
            ×
          </button>
        </div>
      ));
    }, [
      selectedCapacities,
      isMobile,
      darkMode,
      pageContent,
      handleRemoveCapacity,
    ]);

    const organizationSectionContent = useMemo(
      () => (
        <div className="flex flex-col">
          <h2
            className={`${
              isMobile ? "text-lg" : "text-[24px]"
            } font-Montserrat font-bold py-2 ${
              darkMode ? "text-white" : "text-capx-dark-box-bg"
            }`}
          >
            {pageContent["organization-profile-event-organized-by"]}
          </h2>
          <div
            className={`flex flex-row gap-2 w-full items-center ${
              isMobile ? "text-sm" : "text-[24px]"
            } p-2 border ${
              darkMode ? "border-white" : "border-capx-dark-box-bg"
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
                organizationName
                  ? darkMode
                    ? "text-white"
                    : "text-[#829BA4]"
                  : "text-gray-400"
              }`}
            >
              {organizationName || pageContent["loading"] || "Loading..."}
            </span>
          </div>
        </div>
      ),
      [
        organizationId,
        handleOrganizationLoaded,
        organizationName,
        isMobile,
        darkMode,
        pageContent,
      ]
    );

    return (
      <div className="flex flex-row gap-2">
        <div
          className={`flex flex-col gap-2 w-full ${isMobile ? "p-2" : "p-4"}`}
        >
          <h1
            className={`${
              isMobile ? "text-xl" : "text-[24px]"
            } text-capx-dark-box-bg font-Montserrat font-extrabold text-center py-2
            ${darkMode ? "text-white" : "text-capx-dark-box-bg"}
            `}
          >
            {eventType === "new"
              ? pageContent["organization-profile-new-event"]
              : pageContent["organization-profile-edit-event"]}
          </h1>

          <h2
            className={`${
              isMobile ? "text-lg" : "text-[24px]"
            } font-Montserrat font-bold py-2 ${
              darkMode ? "text-white" : "text-[#053749]"
            }`}
          >
            {pageContent["organization-profile-event-url-title"]}
          </h2>

          <div className="flex flex-col gap-2 w-full">
            <div className="flex gap-2 items-center">
              <div
                className={`flex-1 ${isMobile ? "text-sm" : "text-[24px]"} ${
                  darkMode ? "border-white" : "border-capx-dark-box-bg"
                } rounded-md bg-transparent`}
              >
                <MemoizedInput
                  type="text"
                  placeholder={
                    pageContent["organization-profile-event-url-placeholder"] ||
                    "Insert an URL"
                  }
                  className={`w-full bg-transparent outline-none border p-2 rounded rounded-[4px] ${
                    darkMode
                      ? "text-white placeholder-gray-400 border-white"
                      : "text-[#829BA4] placeholder-[#829BA4] border-capx-dark-box-bg"
                  }`}
                  value={urlInput}
                  onChange={handleUrlInputChange}
                  onKeyDown={handleUrlKeyDown}
                />
              </div>

              <button
                onClick={handleUrlSubmit}
                disabled={isLoading}
                className={`${
                  isMobile ? "px-3 py-1.5 text-sm" : "px-4 py-2 text-base"
                } rounded ${
                  darkMode
                    ? "text-capx-dark-box-bg bg-white"
                    : "text-white bg-capx-dark-box-bg"
                }
                `}
              >
                {isLoading
                  ? "..."
                  : pageContent["organization-profile-event-search"]}
              </button>
            </div>

            {isLoading && (
              <p
                className={`${isMobile ? "text-sm" : "text-[16px]"} ${
                  darkMode ? "text-yellow-300" : "text-yellow-700"
                }`}
              >
                {pageContent["event-form-wikidata-loading"] ||
                  "Searching for event data..."}
              </p>
            )}

            {urlError && (
              <p
                className={`${isMobile ? "text-sm" : "text-[16px]"} ${
                  darkMode ? "text-red-300" : "text-red-700"
                }`}
              >
                {urlError}
              </p>
            )}

            <p
              className={`${isMobile ? "text-sm" : "text-[20px]"} ${
                darkMode ? "text-white" : "text-[#829BA4]"
              }`}
            >
              {pageContent["organization-profile-event-url-tooltip"] ||
                "If your URL is a Meta event or a WikiLearn course, the tool will sync some fields automatically."}
            </p>
          </div>

          <h2
            className={`${
              isMobile ? "text-lg" : "text-[24px]"
            } font-Montserrat font-bold py-2 ${
              darkMode ? "text-white" : "text-[#053749]"
            }`}
          >
            {pageContent["organization-profile-event-title-of-event"]}
          </h2>
          <div
            className={`flex flex-row gap-2 w-full items-center ${
              isMobile ? "text-sm" : "text-[24px]"
            } ${
              darkMode ? "border-white" : "border-capx-dark-box-bg"
            } rounded-md bg-transparent`}
          >
            <MemoizedInput
              value={eventData.name || ""}
              onChange={handleNameChange}
              placeholder={pageContent["organization-profile-event-name"]}
              className={`w-full bg-transparent outline-none border p-2 rounded rounded-[4px] ${
                darkMode
                  ? "text-white placeholder-gray-400 border-white"
                  : "text-[#053749] placeholder-[#829BA4] border-capx-dark-box-bg"
              }`}
            />
          </div>

          {/* Render the organization section */}
          {organizationSectionContent}

          <div className="flex flex-col">
            <h2
              className={`${
                isMobile ? "text-lg" : "text-[24px]"
              } font-Montserrat font-bold py-2 ${
                darkMode ? "text-white" : "text-capx-dark-box-bg"
              }`}
            >
              {pageContent["organization-profile-event-start-date"]}
            </h2>
            <div
              className={`flex ${
                isMobile ? "flex-col" : "flex-row"
              } gap-2 w-full items-center ${
                isMobile ? "text-sm" : "text-[24px]"
              }`}
            >
              <div
                className={`flex ${
                  isMobile ? "w-full" : "w-1/2"
                } flex-row gap-2 border ${
                  darkMode ? "border-white" : "border-capx-dark-box-bg"
                } rounded-md`}
              >
                <input
                  type="datetime-local"
                  value={
                    eventData.time_begin
                      ? new Date(eventData.time_begin)
                          .toISOString()
                          .slice(0, 16)
                      : ""
                  }
                  onChange={handleStartDateChange}
                  className={`w-full bg-transparent border rounded-md p-2 outline-none 
                    ${
                      darkMode
                        ? "text-white placeholder-gray-400 [&::-webkit-calendar-picker-indicator]:invert"
                        : "text-[#829BA4] placeholder-[#829BA4]"
                    }
                  `}
                />
              </div>
            </div>
            <p
              className={`${isMobile ? "text-sm" : "text-[20px]"} ${
                darkMode ? "text-white" : "text-[#829BA4]"
              }`}
            >
              {pageContent["organization-profile-event-start-date-tooltip"]}
            </p>
          </div>

          <div className="flex flex-col">
            <h2
              className={`${
                isMobile ? "text-lg" : "text-[24px]"
              } font-Montserrat font-bold py-2 ${
                darkMode ? "text-white" : "text-capx-dark-box-bg"
              }`}
            >
              {pageContent["organization-profile-event-end-date"]}
            </h2>
            <div
              className={`flex ${
                isMobile ? "flex-col" : "flex-row"
              } gap-2 w-full items-center ${
                isMobile ? "text-sm" : "text-[24px]"
              }`}
            >
              <div
                className={`flex ${
                  isMobile ? "w-full" : "w-1/2"
                } flex-row gap-2 border ${
                  darkMode ? "border-white" : "border-capx-dark-box-bg"
                } rounded-md`}
              >
                <input
                  type="datetime-local"
                  value={
                    eventData.time_end
                      ? new Date(eventData.time_end).toISOString().slice(0, 16)
                      : ""
                  }
                  onChange={handleEndDateChange}
                  className={`w-full bg-transparent rounded-md p-2 outline-none 
                    ${
                      darkMode
                        ? "text-white placeholder-gray-400 [&::-webkit-calendar-picker-indicator]:invert"
                        : "text-[#829BA4] placeholder-[#829BA4]"
                    }
                  `}
                />
              </div>
            </div>
            <p
              className={`${isMobile ? "text-sm" : "text-[20px]"} ${
                darkMode ? "text-white" : "text-[#829BA4]"
              }`}
            >
              {pageContent["organization-profile-event-end-date-tooltip"]}
            </p>
          </div>

          <div className="flex flex-col">
            <h2
              className={`${
                isMobile ? "text-lg" : "text-[24px]"
              } font-Montserrat font-bold py-2 ${
                darkMode ? "text-white" : "text-capx-dark-box-bg"
              }`}
            >
              {pageContent["organization-profile-event-format"]}
            </h2>
            <div
              className={`flex flex-row gap-2 w-full items-center ${
                isMobile ? "text-sm" : "text-[24px]"
              } p-2 border ${
                darkMode ? "border-white" : "border-capx-dark-box-bg"
              } rounded-md bg-transparent`}
            >
              <select
                className={`w-full bg-transparent outline-none ${
                  darkMode
                    ? "text-white placeholder-gray-400"
                    : "text-[#829BA4] placeholder-[#829BA4]"
                }`}
                value={eventData.type_of_location || "virtual"}
                onChange={handleLocationTypeChange}
              >
                <option value="virtual">Virtual</option>
                <option value="in_person">In person</option>
                <option value="hybrid">Hybrid</option>
              </select>
            </div>
          </div>

          <div
            className={`flex flex-col gap-4 w-full border-none ${
              isMobile ? "mt-2" : "mt-4"
            }`}
          >
            <h2
              className={`${
                isMobile ? "text-lg" : "text-[24px]"
              } font-Montserrat font-bold py-2 ${
                darkMode ? "text-white" : "text-capx-dark-box-bg"
              }`}
            >
              {pageContent["organization-profile-event-choose-capacities"]}
            </h2>

            <div className="flex flex-col w-full">
              <div
                onClick={() => setIsModalOpen(true)}
                className={`flex items-center justify-between w-full ${
                  isMobile ? "px-3 py-2" : "px-4 py-3"
                } border rounded-lg cursor-pointer ${
                  darkMode
                    ? "bg-transparent border-white text-white"
                    : "bg-white border-capx-dark-box-bg text-capx-dark-box-bg"
                }`}
              >
                <div className="flex-1 flex flex-wrap gap-2">
                  {renderSelectedCapacities()}
                </div>

                {/* SVG Arrow down icon to mantain UI consistency */}
                <div className="flex-shrink-0 ml-2">
                  <div
                    className={`w-5 h-5 flex items-center justify-center pointer-events-none ${
                      darkMode ? "text-white" : "text-gray-800"
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
              title={
                pageContent["organization-profile-event-choose-capacities"]
              }
            />
          </div>

          <div className="flex flex-col">
            <h2
              className={`${
                isMobile ? "text-lg" : "text-[24px]"
              } font-Montserrat font-bold py-2 ${
                darkMode ? "text-white" : "text-capx-dark-box-bg"
              }`}
            >
              {pageContent["organization-profile-event-description"]}
            </h2>
            <div
              className={`flex flex-col gap-2 w-full items-center ${
                isMobile ? "text-sm" : "text-[24px]"
              } p-2 border ${
                darkMode ? "border-white" : "border-capx-dark-box-bg"
              } rounded-md bg-transparent`}
            >
              <MemoizedTextarea
                value={eventData.description || ""}
                onChange={handleDescriptionChange}
                className={`w-full bg-transparent rounded-md outline-none ${
                  isMobile ? "min-h-[100px]" : "min-h-[150px]"
                } ${
                  darkMode
                    ? "text-white placeholder-gray-400"
                    : "text-capx-dark-box-bg placeholder-[#829BA4]"
                }`}
              />
            </div>
            <p
              className={`${isMobile ? "text-sm" : "text-[20px]"} ${
                darkMode ? "text-white" : "text-[#829BA4]"
              }`}
            >
              {pageContent["organization-profile-event-description-tooltip"]}
            </p>
          </div>
        </div>
      </div>
    );
  },
  // Custom comparator for React.memo
  (prevProps, nextProps) => {
    // Compare only the important props for rendering
    return (
      prevProps.index === nextProps.index &&
      prevProps.eventData.id === nextProps.eventData.id &&
      prevProps.eventData.name === nextProps.eventData.name &&
      prevProps.eventData.url === nextProps.eventData.url &&
      prevProps.eventData.description === nextProps.eventData.description &&
      JSON.stringify(prevProps.eventData.related_skills) ===
        JSON.stringify(nextProps.eventData.related_skills)
    );
  }
);

// Add displayName to avoid warnings
EventsForm.displayName = "EventsForm";

export default EventsForm;
