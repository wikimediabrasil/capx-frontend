"use client";

import { useTheme } from "@/contexts/ThemeContext";
import Image from "next/image";
import { Event } from "@/types/event";
import { useApp } from "@/contexts/AppContext";
import { useState, useEffect, useCallback } from "react";
import CapacitySelectionModal from "@/components/CapacitySelectionModal";
import { Capacity } from "@/types/capacity";
import ArrowDownIcon from "@/public/static/images/keyboard_arrow_down.svg";
import {
  fetchEventDataByURL,
  fetchEventDataByQID,
  fetchEventDataByGenericURL,
} from "@/services/metabaseService";
import { useOrganization } from "@/hooks/useOrganizationProfile";
import { useSession } from "next-auth/react";
import { useCapacityDetails } from "@/hooks/useCapacityDetails";

interface EventFormItemProps {
  eventData: Event;
  index: number;
  onDelete: (id: number) => void;
  onChange: (index: number, field: keyof Event, value: string) => void;
}

export default function EventsForm({
  eventData,
  index,
  onDelete,
  onChange,
}: EventFormItemProps) {
  const { darkMode } = useTheme();
  const { isMobile, pageContent } = useApp();
  const { data: session } = useSession();
  const token = session?.user?.token;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCapacities, setSelectedCapacities] = useState<Capacity[]>([]);
  const [showMobile, setShowMobile] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [urlError, setUrlError] = useState<string | null>(null);
  const [urlInput, setUrlInput] = useState(eventData.url || "");

  // Extrair os IDs das capacidades do evento de forma mais robusta
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
      console.error("Error parsing related_skills:", error);
    }

    return [];
  }, [eventData.related_skills]);

  const capacityIds = parseRelatedSkills();

  // Use the hook to get capacity details
  const { capacityNames } = useCapacityDetails(capacityIds);

  useEffect(() => {
    setShowMobile(isMobile);
  }, [isMobile]);

  // Effect to sync the input with eventData when it changes externally
  useEffect(() => {
    if (eventData.url !== urlInput) {
      setUrlInput(eventData.url || "");
    }
  }, [eventData.url]);

  const { organization: organizationName } = useOrganization(
    token,
    eventData.organization
  );

  // Update the logic of initializing the selected capacities
  useEffect(() => {
    const skillIds = parseRelatedSkills();

    // If we don't have capacities, there's nothing to do
    if (!skillIds.length) return;

    // Check if we already have a capacity object for each ID
    const existingCodes = new Set(selectedCapacities.map((cap) => cap.code));
    const needsUpdate =
      skillIds.some((id) => !existingCodes.has(id)) ||
      selectedCapacities.length !== skillIds.length;

    // If we don't need to update the capacities and we don't have new names, do nothing
    if (
      !needsUpdate &&
      !Object.keys(capacityNames).some((codeStr) => {
        const code = Number(codeStr);
        const existingCap = selectedCapacities.find((cap) => cap.code === code);
        return existingCap && existingCap.name !== capacityNames[codeStr];
      })
    ) {
      return;
    }

    // If we need to update the list of selected capacities
    const existingCapacities = new Map(
      selectedCapacities.map((cap) => [cap.code, cap])
    );

    const capacities = skillIds.map((id: number) => {
      // If we already have this capacity, keep its existing data
      if (existingCapacities.has(id)) {
        const existing = existingCapacities.get(id);
        // Make sure existing exists before accessing its properties
        if (existing) {
          // Update the name only if we have a server name and it's different
          if (
            capacityNames[id.toString()] &&
            capacityNames[id.toString()] !== existing.name
          ) {
            return {
              ...existing,
              name: capacityNames[id.toString()],
            };
          }
          return existing;
        }
      }

      // Otherwise, create a new capacity
      return {
        code: id,
        name: capacityNames[id.toString()] || `Capacity ${id}`,
        skill_type: 0,
        skill_wikidata_item: "",
        icon: "",
        color: "",
        hasChildren: false,
      };
    });

    setSelectedCapacities(capacities);
  }, [capacityIds, capacityNames]);

  // This function forces a new search for capacity names if they haven't been loaded
  const forceCapacityNamesUpdate = useCallback(() => {
    const skillIds = parseRelatedSkills();
    if (skillIds.length > 0 && selectedCapacities.length === 0) {
      // Create temporary capacities only with code and placeholder name
      const tempCapacities = skillIds.map((id: number) => ({
        code: id,
        name: `Capacity ${id}`,
        skill_type: 0,
        skill_wikidata_item: "",
        icon: "",
        color: "",
        hasChildren: false,
      }));

      setSelectedCapacities(tempCapacities);
    }
  }, [parseRelatedSkills, selectedCapacities.length]);

  // Execute the force update once after the component mounts
  useEffect(() => {
    forceCapacityNamesUpdate();
  }, [forceCapacityNamesUpdate]);

  const handleCapacitySelect = (capacity: Capacity) => {
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
  };

  const handleRemoveCapacity = (capacityCode: number) => {
    const newCapacities = selectedCapacities.filter(
      (cap) => cap.code !== capacityCode
    );
    setSelectedCapacities(newCapacities);

    // Update related_skills in event
    const skillIds = newCapacities.map((cap) => cap.code);
    onChange(index, "related_skills", JSON.stringify(skillIds));
  };

  const handleChange = (field: keyof Event, value: string) => {
    onChange(index, field, value);
  };

  const handleUrlInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newUrl = e.target.value;
    setUrlInput(newUrl);
  };

  const handleUrlSubmit = () => {
    // Update the eventData.url
    handleChange("url", urlInput);
    // Search for the data of the URL
    if (urlInput && urlInput.trim() !== "") {
      fetchEventData(urlInput);
    }
  };

  // Function to search for event data from a URL
  const fetchEventData = async (url: string) => {
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
        updateEventDataFromFetch(data);
      } else {
        setUrlError(
          pageContent["event-form-wikidata-not-found"] ||
            "It was not possible to find event data for this URL"
        );
      }
    } catch (error) {
      console.error("Error fetching event data:", error);
      setUrlError(
        pageContent["event-form-wikidata-error"] ||
          "An error occurred while searching for event data"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const updateEventDataFromFetch = (data: Partial<Event>) => {
    // Update all fields except URL (which has already been updated)
    if (data.name) {
      handleChange("name", data.name);
    }
    if (data.description) {
      handleChange("description", data.description);
    }
    if (data.image_url) {
      handleChange("image_url", data.image_url);
    }
    if (data.time_begin) {
      handleChange("time_begin", data.time_begin);
    }
    if (data.time_end) {
      handleChange("time_end", data.time_end);
    }
    if (data.type_of_location) {
      handleChange("type_of_location", data.type_of_location);
    }
    if (data.wikidata_qid) {
      handleChange("wikidata_qid", data.wikidata_qid);
    }

    // Update the URL only if it's different from the one we just inserted
    if (data.url && data.url !== urlInput) {
      setUrlInput(data.url);
      handleChange("url", data.url);
    }
  };

  // Function to render the selected capacities
  const renderSelectedCapacities = () => {
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
        className={`${
          isMobile ? "text-xs" : "text-sm"
        } px-2 py-1 rounded-[4px] bg-capx-dark-box-bg text-white rounded-[8px] w-fit flex items-center gap-1`}
      >
        <span>{capacity.name}</span>
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleRemoveCapacity(capacity.code);
          }}
          className={`${
            isMobile ? "w-4 h-4" : "w-5 h-5"
          } flex items-center justify-center rounded-full hover:bg-gray-700 ml-1`}
        >
          ×
        </button>
      </div>
    ));
  };

  return (
    <div className="flex flex-row gap-2">
      <div className={`flex flex-col gap-2 w-full ${isMobile ? "p-2" : "p-4"}`}>
        <h1
          className={`${
            isMobile ? "text-xl" : "text-[24px]"
          } text-capx-dark-box-bg font-Montserrat font-extrabold text-center py-2`}
        >
          {pageContent["organization-profile-event-title"]}
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
              className={`flex-1 p-2 ${
                isMobile ? "text-sm" : "text-[24px]"
              } border border-capx-dark-box-bg rounded-md bg-transparent`}
            >
              <input
                type="text"
                placeholder={
                  pageContent["organization-profile-event-url-placeholder"] ||
                  "Insert an URL"
                }
                className={`w-full bg-transparent outline-none ${
                  darkMode
                    ? "text-white placeholder-gray-400"
                    : "text-[#829BA4] placeholder-[#829BA4]"
                }`}
                value={urlInput}
                onChange={handleUrlInputChange}
                onKeyDown={(e) => e.key === "Enter" && handleUrlSubmit()}
              />
            </div>

            <button
              onClick={handleUrlSubmit}
              disabled={isLoading}
              className={`${
                isMobile ? "px-3 py-1.5 text-sm" : "px-4 py-2 text-base"
              } rounded text-white ${
                isLoading
                  ? "bg-gray-500"
                  : "bg-capx-dark-box-bg hover:bg-opacity-90"
              }`}
            >
              {isLoading ? "..." : "Search"}
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
          } p-2 border border-capx-dark-box-bg rounded-md bg-transparent`}
        >
          <input
            type="text"
            placeholder={pageContent["organization-profile-event-name"]}
            value={eventData.name || ""}
            onChange={(e) => handleChange("name", e.target.value)}
            className={`w-full bg-transparent outline-none ${
              darkMode
                ? "text-white placeholder-gray-400"
                : "text-[#053749] placeholder-[#829BA4]"
            }`}
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
            {pageContent["organization-profile-event-organized-by"]}
          </h2>
          <div
            className={`flex flex-row gap-2 w-full items-center ${
              isMobile ? "text-sm" : "text-[24px]"
            } p-2 border border-capx-dark-box-bg rounded-md bg-transparent`}
          >
            <input
              type="text"
              disabled={true}
              className={`w-full bg-transparent outline-none ${
                darkMode
                  ? "text-white placeholder-gray-400"
                  : "text-[#829BA4] placeholder-[#829BA4]"
              }`}
              value={organizationName?.display_name || ""}
            />
          </div>
        </div>

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
              } flex-row gap-2 border border-capx-dark-box-bg rounded-md`}
            >
              <input
                type="datetime-local"
                value={
                  eventData.time_begin
                    ? new Date(eventData.time_begin).toISOString().slice(0, 16)
                    : ""
                }
                onChange={(e) => handleChange("time_begin", e.target.value)}
                className={`w-full bg-transparent border border-capx-dark-box-bg rounded-md p-2 outline-none ${
                  darkMode
                    ? "text-white placeholder-gray-400"
                    : "text-[#829BA4] placeholder-[#829BA4]"
                }`}
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
              } flex-row gap-2 border border-capx-dark-box-bg rounded-md`}
            >
              <input
                type="datetime-local"
                value={
                  eventData.time_end
                    ? new Date(eventData.time_end).toISOString().slice(0, 16)
                    : ""
                }
                onChange={(e) => handleChange("time_end", e.target.value)}
                className={`w-full bg-transparent rounded-md p-2 outline-none ${
                  darkMode
                    ? "text-white placeholder-gray-400"
                    : "text-[#829BA4] placeholder-[#829BA4]"
                }`}
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
            } p-2 border border-capx-dark-box-bg rounded-md bg-transparent`}
          >
            <select
              className={`w-full bg-transparent outline-none ${
                darkMode
                  ? "text-white placeholder-gray-400"
                  : "text-[#829BA4] placeholder-[#829BA4]"
              }`}
              value={eventData.type_of_location || "virtual"}
              onChange={(e) => handleChange("type_of_location", e.target.value)}
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
                  : "bg-white border-gray-300 text-gray-700"
              }`}
            >
              <div className="flex-1 flex flex-wrap gap-2">
                {renderSelectedCapacities()}
              </div>
              <div className="flex-shrink-0 ml-2">
                <Image
                  src={ArrowDownIcon}
                  alt="Expand"
                  width={isMobile ? 20 : 24}
                  height={isMobile ? 20 : 24}
                  className={darkMode ? "filter invert" : ""}
                />
              </div>
            </div>
          </div>

          <CapacitySelectionModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onSelect={handleCapacitySelect}
            title={pageContent["organization-profile-event-choose-capacities"]}
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
            } p-2 border border-capx-dark-box-bg rounded-md bg-transparent`}
          >
            <textarea
              className={`w-full bg-transparent rounded-md outline-none ${
                isMobile ? "min-h-[100px]" : "min-h-[150px]"
              } ${
                darkMode
                  ? "text-white placeholder-gray-400"
                  : "text-capx-dark-box-bg placeholder-[#829BA4]"
              }`}
              value={eventData.description || ""}
              onChange={(e) => handleChange("description", e.target.value)}
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
}
