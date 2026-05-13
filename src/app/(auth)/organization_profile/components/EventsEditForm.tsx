'use client';

import { CapacitySearch } from '@/app/(auth)/capacity/components/CapacitySearch';
import CustomDatePicker from '@/components/CustomDatePicker';
import { useCapacityDetails } from '@/hooks/useCapacityDetails';
import { dateTimeLocalToDate, dateToDateTimeLocal } from '@/lib/utils/dateLocale';
import {
  fetchEventDataByGenericURL,
  fetchEventDataByQID,
  fetchEventDataByURL,
  isValidEventURL,
} from '@/services/metabaseService';
import { organizationProfileService } from '@/services/organizationProfileService';
import { Event } from '@/types/event';
import { useSession } from 'next-auth/react';
import { useDarkMode, useIsMobile, usePageContent } from '@/stores';
import React, {
  memo,
  useCallback,
  useEffect,
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

    useEffect(() => {
      isMountedRef.current = true;
      return () => {
        isMountedRef.current = false;
      };
    }, []);

    const callbackRef = useRef(onOrganizationLoaded);
    useEffect(() => {
      callbackRef.current = onOrganizationLoaded;
    }, [onOrganizationLoaded]);

    const tokenRef = useRef(session?.user?.token);
    useEffect(() => {
      tokenRef.current = session?.user?.token;
    }, [session?.user?.token]);

    useEffect(() => {
      const abortController = new AbortController();
      const token = tokenRef.current;
      if (!organizationId || !token || loadedOrgId === organizationId) {
        return;
      }

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
            setLoadedOrgId(organizationId);
          } else {
            if (isMountedRef.current) {
              callbackRef.current('');
            }
          }
        } catch (error) {
          console.error('Error loading organization:', error);
          if (isMountedRef.current) {
            callbackRef.current('');
          }
        } finally {
          isLoadingRef.current = false;
        }
      };

      loadOrg();

      return () => {
        abortController.abort();
      };
    }, [organizationId, loadedOrgId]);

    return null;
  }
);
OrganizationLoader.displayName = 'OrganizationLoader';

// Memoize the EventsForm component to avoid unnecessary renders
const EventsForm = memo(
  ({ eventData, index, onChange, eventType }: EventFormItemProps) => {
    const darkMode = useDarkMode();
    const isMobile = useIsMobile();
    const pageContent = usePageContent();
    const { capacityNames } = useCapacityDetails();
    const [selectedCapacities, setSelectedCapacities] = useState<Array<{ code: number; name: string }>>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [urlError, setUrlError] = useState<string | null>(null);
    const [urlInput, setUrlInput] = useState(eventData.url || '');
    const [organizationName, setOrganizationName] = useState<string>('');
    const [organizationLoading, setOrganizationLoading] = useState<boolean>(false);

    const organizationId = useMemo(() => {
      return eventData.organization;
    }, [eventData.organization]);

    const handleOrganizationLoaded = useCallback((name: string) => {
      setOrganizationName(name || '');
      setOrganizationLoading(false);
    }, []);

    useEffect(() => {
      if (organizationId) {
        setOrganizationLoading(true);
        setOrganizationName('');
      }
    }, [organizationId]);

    const parseRelatedSkills = useCallback(() => {
      if (!eventData.related_skills || eventData.related_skills.length === 0) {
        return [];
      }
      try {
        if (Array.isArray(eventData.related_skills)) {
          return eventData.related_skills.map(Number).filter(Boolean);
        }
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

    useEffect(() => {
      if (!capacityIds || capacityIds.length === 0) {
        setSelectedCapacities([]);
        return;
      }
      const newCapacities = capacityIds.map(id => ({
        code: id,
        name: (capacityNames && capacityNames[id.toString()]) || `Capacity ${id}`,
      }));
      setSelectedCapacities(newCapacities);
    }, [capacityIds, capacityNames]);

    const handleChange = useCallback(
      (field: keyof Event, value: string) => {
        onChange(index, field, value);
      },
      [onChange, index]
    );

    const [localName, setLocalName] = useState(eventData.name || '');
    useEffect(() => {
      setLocalName(eventData.name || '');
    }, [eventData.name]);

    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      setLocalName(newValue);
      onChange(index, 'name', newValue);
    };

    const [localDescription, setLocalDescription] = useState(eventData.description || '');
    useEffect(() => {
      setLocalDescription(eventData.description || '');
    }, [eventData.description]);

    const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const newValue = e.target.value;
      setLocalDescription(newValue);
      onChange(index, 'description', newValue);
    };

    const [localStartDate, setLocalStartDate] = useState(
      eventData.time_begin ? dateToDateTimeLocal(new Date(eventData.time_begin)) : ''
    );
    const [localEndDate, setLocalEndDate] = useState(
      eventData.time_end ? dateToDateTimeLocal(new Date(eventData.time_end)) : ''
    );

    useEffect(() => {
      setLocalStartDate(
        eventData.time_begin ? dateToDateTimeLocal(new Date(eventData.time_begin)) : ''
      );
    }, [eventData.time_begin]);

    useEffect(() => {
      setLocalEndDate(eventData.time_end ? dateToDateTimeLocal(new Date(eventData.time_end)) : '');
    }, [eventData.time_end]);

    const [localLocationType, setLocalLocationType] = useState(
      eventData.type_of_location || 'virtual'
    );
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

    useEffect(() => {
      if (eventData.url && eventData.url !== urlInput) {
        setUrlInput(eventData.url);
      }
    }, [eventData.url]);

    const fetchEventData = useCallback(
      async (url: string) => {
        if (!url || url.trim() === '') return;

        const isValid = isValidEventURL(url);
        if (!isValid) {
          setUrlError(
            pageContent['organization-profile-event-url-invalid'] ||
              'Invalid URL. Use Meta Wikimedia URLs (e.g.: meta.wikimedia.org/wiki/Event) or WikiLearn (app.learn.wiki/learning/course/...)'
          );
          setIsLoading(false);
          return;
        }

        setIsLoading(true);
        setUrlError(null);

        try {
          let data;
          if (url.startsWith('Q')) {
            data = await fetchEventDataByQID(url);
          } else if (url.includes('wikidata.org')) {
            data = await fetchEventDataByURL(url);
          } else {
            data = await fetchEventDataByGenericURL(url);
          }

          if (data) {
            if (data.name) {
              setLocalName(data.name);
              handleChange('name', data.name);
            }
            if (data.description) {
              setLocalDescription(data.description);
              handleChange('description', data.description);
            }
            if (data.image_url) {
              handleChange('image_url', data.image_url);
            }
            if (data.time_begin) {
              setLocalStartDate(dateToDateTimeLocal(new Date(data.time_begin)));
              handleChange('time_begin', data.time_begin);
            }
            if (data.time_end) {
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
            if (data.url && data.url !== urlInput) {
              setUrlInput(data.url);
              handleChange('url', data.url);
            }
          } else {
            setUrlError(
              pageContent['event-form-wikidata-not-found'] ||
                'Could not find event data for this URL'
            );
          }
        } catch (error) {
          console.error('Error fetching event data:', error);
          setUrlError(
            pageContent['event-form-wikidata-error'] || 'An error occurred while fetching event data'
          );
        } finally {
          setIsLoading(false);
        }
      },
      [urlInput, handleChange, pageContent]
    );

    const handleCapacitySelect = useCallback(
      (capacities: Array<{ code: number; name: string }>) => {
        setSelectedCapacities(capacities);
        const skillIds = capacities.map(cap => cap.code);
        onChange(index, 'related_skills', JSON.stringify(skillIds));
      },
      [onChange, index]
    );

    const handleUrlInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
      setUrlInput(e.target.value);
    }, []);

    const handleUrlSubmit = useCallback(() => {
      const inputElement = document.querySelector(
        'input[placeholder*="Insert an URL"]'
      ) as HTMLInputElement;
      const currentInputValue = inputElement?.value || '';
      const finalUrl = currentInputValue || urlInput;
      handleChange('url', finalUrl);
      if (finalUrl && finalUrl.trim() !== '') {
        fetchEventData(finalUrl);
      }
    }, [urlInput, handleChange, fetchEventData, eventData.url]);

    const handleUrlKeyDown = useCallback(
      (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          handleUrlSubmit();
        }
      },
      [handleUrlSubmit]
    );

    // --- Shared style tokens ---
    const labelClass = `text-base font-Montserrat font-bold ${
      darkMode ? 'text-white' : 'text-capx-dark-box-bg'
    }`;

    const inputClass = `w-full bg-transparent outline-none border rounded-[4px] px-3 py-2.5 text-sm transition-colors duration-150 ${
      darkMode
        ? 'text-white placeholder-white/40 border-white/30 focus:border-white/60'
        : 'text-capx-dark-box-bg placeholder-[#829BA4] border-capx-dark-box-bg/30 focus:border-capx-dark-box-bg/60'
    }`;

    const hintClass = `text-xs mt-1 ${
      darkMode ? 'text-white/50' : 'text-[#829BA4]'
    }`;

    return (
      <div className="flex flex-col gap-5">
        {/* --- URL Section --- */}
        <div className="flex flex-col gap-2">
          <label className={labelClass}>
            {pageContent['organization-profile-event-url-title']}
          </label>
          <div className="flex gap-2 items-stretch">
            <input
              type="text"
              placeholder={
                pageContent['organization-profile-event-url-placeholder'] || 'Insert an URL'
              }
              className={`${inputClass} flex-1`}
              value={urlInput}
              onChange={handleUrlInputChange}
              onKeyDown={handleUrlKeyDown}
            />
            <button
              onClick={handleUrlSubmit}
              disabled={isLoading}
              className={`shrink-0 px-4 py-2.5 rounded-[4px] text-sm font-bold transition-colors duration-150 ${
                darkMode
                  ? 'text-capx-dark-box-bg bg-white hover:bg-white/80'
                  : 'text-white bg-capx-dark-box-bg hover:bg-capx-dark-box-bg/80'
              } disabled:opacity-50`}
            >
              {isLoading ? '...' : pageContent['organization-profile-event-search'] || 'Search'}
            </button>
          </div>

          {isLoading && (
            <p className={`text-xs ${darkMode ? 'text-yellow-300' : 'text-yellow-700'}`}>
              {pageContent['event-form-wikidata-loading'] || 'Searching for event data...'}
            </p>
          )}
          {urlError && (
            <p className={`text-xs ${darkMode ? 'text-red-300' : 'text-red-600'}`}>
              {urlError}
            </p>
          )}
          <p className={hintClass}>
            {pageContent['organization-profile-event-url-tooltip-updated'] ||
              'Paste a URL from a Meta Wikimedia event page or a WikiLearn course. The tool will automatically fill in the event details.'}
          </p>
        </div>

        {/* --- Event Name --- */}
        <div className="flex flex-col gap-2">
          <label className={labelClass}>
            {pageContent['organization-profile-event-title-of-event']}
          </label>
          <input
            type="text"
            value={localName}
            onChange={handleNameChange}
            placeholder={pageContent['organization-profile-event-name']}
            className={inputClass}
          />
        </div>

        {/* --- Organization --- */}
        <div className="flex flex-col gap-2">
          <label className={labelClass}>
            {pageContent['organization-profile-event-organized-by']}
          </label>
          <OrganizationLoader
            organizationId={organizationId}
            onOrganizationLoaded={handleOrganizationLoaded}
          />
          <div
            className={`flex items-center px-3 py-2.5 border rounded-[4px] text-sm ${
              darkMode
                ? 'border-white/30 text-white/70'
                : 'border-capx-dark-box-bg/30 text-[#829BA4]'
            }`}
          >
            {organizationName ||
              (organizationLoading
                ? pageContent['loading'] || 'Loading...'
                : pageContent['organization-not-found'] || 'Organization not found')}
          </div>
        </div>

        {/* --- Dates Row --- */}
        <div className={`grid ${isMobile ? 'grid-cols-1' : 'grid-cols-2'} gap-4`}>
          {/* Start Date */}
          <div className="flex flex-col gap-2">
            <label className={labelClass}>
              {pageContent['organization-profile-event-start-date']}
            </label>
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
              className={inputClass}
              placeholder={
                pageContent['organization-profile-event-start-date'] || 'Start date'
              }
            />
            <p className={hintClass}>
              {pageContent['organization-profile-event-start-date-tooltip']}
            </p>
          </div>

          {/* End Date */}
          <div className="flex flex-col gap-2">
            <label className={labelClass}>
              {pageContent['organization-profile-event-end-date']}
            </label>
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
              className={inputClass}
              placeholder={
                pageContent['organization-profile-event-end-date'] || 'End date'
              }
            />
            <p className={hintClass}>
              {pageContent['organization-profile-event-end-date-tooltip']}
            </p>
          </div>
        </div>

        {/* --- Format --- */}
        <div className="flex flex-col gap-2">
          <label className={labelClass}>
            {pageContent['organization-profile-event-format']}
          </label>
          <select
            className={`${inputClass} cursor-pointer`}
            value={localLocationType}
            onChange={handleLocationTypeChange}
          >
            <option value="virtual">Virtual</option>
            <option value="in_person">In person</option>
            <option value="hybrid">Hybrid</option>
          </select>
        </div>

        {/* --- Capacities --- */}
        <div className="flex flex-col gap-2">
          <label className={labelClass}>
            {pageContent['organization-profile-event-choose-capacities']}
          </label>
          <CapacitySearch
            onSelect={handleCapacitySelect}
            selectedCapacities={selectedCapacities}
            allowMultipleSelection={true}
            showSelectedChips={true}
            compact={true}
          />
        </div>

        {/* --- Description --- */}
        <div className="flex flex-col gap-2">
          <label className={labelClass}>
            {pageContent['organization-profile-event-description']}
          </label>
          <textarea
            value={localDescription}
            onChange={handleDescriptionChange}
            className={`${inputClass} min-h-[120px] resize-none`}
          />
          <p className={hintClass}>
            {pageContent['organization-profile-event-description-tooltip']}
          </p>
        </div>
      </div>
    );
  },
  (prevProps, nextProps) => {
    if (prevProps.index !== nextProps.index) return false;
    if (prevProps.eventType !== nextProps.eventType) return false;

    const prevEvent = prevProps.eventData;
    const nextEvent = nextProps.eventData;

    if (prevEvent.id !== nextEvent.id) return false;
    if (prevEvent.organization !== nextEvent.organization) return false;
    if (prevEvent.name !== nextEvent.name) return false;
    if (prevEvent.description !== nextEvent.description) return false;
    if (prevEvent.url !== nextEvent.url) return false;
    if (prevEvent.time_begin !== nextEvent.time_begin) return false;
    if (prevEvent.time_end !== nextEvent.time_end) return false;
    if (prevEvent.type_of_location !== nextEvent.type_of_location) return false;

    const prevSkills = JSON.stringify(prevEvent.related_skills);
    const nextSkills = JSON.stringify(nextEvent.related_skills);
    if (prevSkills !== nextSkills) return false;

    if (prevProps.onChange !== nextProps.onChange) return false;
    if (prevProps.onDelete !== nextProps.onDelete) return false;

    return true;
  }
);

EventsForm.displayName = 'EventsForm';

export default EventsForm;
