"use client";

import { useEffect, useState } from "react";
import { useApp } from "@/contexts/AppContext";
import { useTheme } from "@/contexts/ThemeContext";
import Image from "next/image";
import { EventFilterState, EventFilterType, EventLocationType } from "../types";
import ArrowBackIcon from "@/public/static/images/arrow_back_icon.svg";
import ArrowBackIconWhite from "@/public/static/images/arrow_back_icon_white.svg";
import CapxIcon from "@/public/static/images/capx_icon.svg";
import CapxIconWhite from "@/public/static/images/capx_icon_white.svg";
import CloseIcon from "@/public/static/images/close_mobile_menu_icon_light_mode.svg";
import CloseIconWhite from "@/public/static/images/close_mobile_menu_icon_dark_mode.svg";
import SearchIcon from "@/public/static/images/search_icon.svg";
import SearchIconWhite from "@/public/static/images/search_icon_white.svg";
import LocationIcon from "@/public/static/images/location_on_dark.svg";
import LocationIconWhite from "@/public/static/images/location_on.svg";
import CheckBoxOutlineBlankIcon from "@/public/static/images/check_box_outline_blank.svg";
import CheckBoxOutlineBlankIconWhite from "@/public/static/images/check_box_outline_blank_light.svg";
import CheckBoxIcon from "@/public/static/images/check_box.svg";
import CheckBoxIconWhite from "@/public/static/images/check_box_light.svg";
import { useSession } from "next-auth/react";
import BaseButton from "@/components/BaseButton";
import { Capacity } from "@/types/capacity";
import CapacitySelectionModal from "@/components/CapacitySelectionModal";

interface EventsFiltersProps {
  onClose: () => void;
  onApplyFilters: (filters: EventFilterState) => void;
  initialFilters: EventFilterState;
}

export function EventsFilters({
  onClose,
  onApplyFilters,
  initialFilters,
}: EventsFiltersProps) {
  const { darkMode } = useTheme();
  const { pageContent } = useApp();
  const { data: session } = useSession();
  const token = session?.user?.token;

  const [searchCapacity, setSearchCapacity] = useState("");
  const [filters, setFilters] = useState<EventFilterState>(initialFilters);
  const [showCapacityModal, setShowCapacityModal] = useState(false);
  const [territory, setTerritory] = useState("");

  const handleCapacitySelect = (capacity: Capacity) => {
    const capacityExists = filters.capacities.some(
      (cap) => cap.code === capacity.code
    );

    if (capacityExists) {
      return;
    }

    setFilters((prev) => ({
      ...prev,
      capacities: [
        ...prev.capacities,
        {
          name: capacity.name,
          code: capacity.code,
        },
      ],
    }));

    // Close the modal after selection
    setShowCapacityModal(false);
  };

  const handleRemoveCapacity = (capacityCode: number) => {
    setFilters((prev) => ({
      ...prev,
      capacities: prev.capacities.filter((cap) => cap.code !== capacityCode),
    }));
  };

  // TODO: Add territory section
  /* const handleAddTerritory = () => {
    if (territory && !filters.territories.includes(territory)) {
      setFilters((prev) => ({
        ...prev,
        territories: [...prev.territories, territory],
      }));
      setTerritory("");
    }
  }; */

  // TODO: Add remove territory
  /* const handleRemoveTerritory = (territoryToRemove: string) => {
    setFilters((prev) => ({
      ...prev,
      territories: prev.territories.filter((t) => t !== territoryToRemove),
    }));
  }; */

  const handleEventFormatChange = (format: EventLocationType) => {
    setFilters((prev) => ({
      ...prev,
      locationType: format,
    }));
  };

  const handleApply = () => {
    onApplyFilters({ ...filters });
    onClose();
  };

  const handleClearAll = () => {
    const clearedFilters = {
      capacities: [],
      territories: [],
      eventType: EventFilterType.All,
      locationType: EventLocationType.All,
      dateRange: undefined,
      organizationId: undefined,
    };
    setFilters(clearedFilters);
    setTerritory("");
  };

  // Avoid multiple scrolls when the modal is open
  useEffect(() => {
    document.body.style.overflow = "hidden";

    // Cleanup: restore scroll when the modal closes
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center">
      {/* Dark Overlay */}
      <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose} />

      {/* Container's Modal */}
      <div
        className={`
        relative w-full h-full md:w-[420px] md:max-h-[80vh] md:mt-20 md:rounded-lg
        ${darkMode ? "bg-capx-dark-bg" : "bg-white"}
        flex flex-col overflow-hidden
      `}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b shrink-0">
          <div className="flex items-center gap-2">
            <button onClick={onClose}>
              <Image
                src={darkMode ? ArrowBackIconWhite : ArrowBackIcon}
                alt={pageContent["filters-back-icon"] || "Back"}
                width={24}
                height={24}
              />
            </button>
            <h1
              className={`text-xl font-medium leading-[normal] font-Montserrat ${
                darkMode ? "text-white" : "text-black"
              }`}
            >
              {pageContent["filters-title"] || "Filters"}
            </h1>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto min-h-0">
          <div className="divide-y">
            {/* Capacities Section */}
            <div className="p-4 space-y-3">
              <div className="flex items-center gap-2">
                <Image
                  src={darkMode ? CapxIconWhite : CapxIcon}
                  alt="Capacities"
                  width={24}
                  height={24}
                />
                <h2
                  className={`font-medium ${
                    darkMode ? "text-white" : "text-black"
                  }`}
                >
                  {pageContent["filters-capacities"] || "Capacities"}
                </h2>
              </div>

              <div className="relative">
                <input
                  type="text"
                  readOnly
                  value={searchCapacity}
                  onFocus={() => setShowCapacityModal(true)}
                  placeholder={
                    pageContent["filters-search-by-capacities"] ||
                    "Search by capacities"
                  }
                  className={`
                    w-full p-2 pl-3 pr-10 rounded-lg border
                    ${
                      darkMode
                        ? "bg-capx-dark-box-bg text-white border-gray-700 placeholder-gray-400"
                        : "bg-white border-gray-300 placeholder-gray-500"
                    }
                  `}
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <Image
                    src={darkMode ? SearchIconWhite : SearchIcon}
                    alt="Search"
                    width={20}
                    height={20}
                  />
                </div>
              </div>

              {/* Selected Capacities */}
              {filters.capacities.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {filters.capacities.map((capacity, index) => (
                    <div
                      key={index}
                      className={`
                        inline-flex items-center gap-1 px-2 py-1 rounded-md text-sm
                        max-w-[150px] shrink-0
                        ${darkMode ? "bg-gray-700" : "bg-gray-100"}
                      `}
                    >
                      <span className="truncate" title={capacity.name}>
                        {capacity.name}
                      </span>
                      <button
                        onClick={() => handleRemoveCapacity(capacity.code)}
                        className="hover:opacity-80 flex-shrink-0"
                      >
                        <Image
                          src={darkMode ? CloseIconWhite : CloseIcon}
                          alt="Remove"
                          width={16}
                          height={16}
                        />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Territory Section */}
            {/* TODO: Add territory section */}
            {/* <div className="p-4 space-y-3">
              <div className="flex items-center gap-2">
                <Image
                  src={darkMode ? LocationIconWhite : LocationIcon}
                  alt="Territory"
                  width={24}
                  height={24}
                />
                <h2
                  className={`font-medium ${
                    darkMode ? "text-white" : "text-black"
                  }`}
                >
                  {pageContent["filters-territory"] || "Territory"}
                </h2>
              </div>

              <div className="relative flex">
                <input
                  type="text"
                  value={territory}
                  onChange={(e) => setTerritory(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleAddTerritory();
                  }}
                  placeholder={
                    pageContent["filters-insert-item"] || "Insert item"
                  }
                  className={`
                    flex-1 p-2 pl-3 pr-10 rounded-lg border
                    ${
                      darkMode
                        ? "bg-capx-dark-box-bg text-white border-gray-700 placeholder-gray-400"
                        : "bg-white border-gray-300 placeholder-gray-500"
                    }
                  `}
                />
                <button
                  onClick={handleAddTerritory}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2"
                >
                  <Image
                    src={darkMode ? AddIconWhite : AddIcon}
                    alt="Add"
                    width={20}
                    height={20}
                  />
                </button>
              </div>

              {filters.territories.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {filters.territories.map((item, index) => (
                    <div
                      key={index}
                      className={`
                        inline-flex items-center gap-1 px-2 py-1 rounded-md text-sm
                        max-w-[150px] shrink-0
                        ${darkMode ? "bg-gray-700" : "bg-gray-100"}
                      `}
                    >
                      <span className="truncate" title={item}>
                        {item}
                      </span>
                      <button
                        onClick={() => handleRemoveTerritory(item)}
                        className="hover:opacity-80 flex-shrink-0"
                      >
                        <Image
                          src={darkMode ? CloseIconWhite : CloseIcon}
                          alt="Remove"
                          width={16}
                          height={16}
                        />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div> */}

            {/* Event Format Section */}
            <div className="p-4 space-y-4">
              <div className="flex items-center gap-2">
                <Image
                  src={darkMode ? LocationIconWhite : LocationIcon}
                  alt="Event format"
                  width={24}
                  height={24}
                />
                <h2
                  className={`font-medium ${
                    darkMode ? "text-white" : "text-black"
                  }`}
                >
                  {pageContent["filters-event-format"] || "Event format"}
                </h2>
              </div>

              <div className="space-y-2">
                <button
                  onClick={() => handleEventFormatChange(EventLocationType.All)}
                  className={`
                    w-full p-3 border rounded-lg flex items-center
                    ${
                      filters.locationType === EventLocationType.All
                        ? darkMode
                          ? "border-blue-600"
                          : "border-blue-600"
                        : darkMode
                        ? "border-gray-700"
                        : "border-gray-300"
                    }
                  `}
                >
                  <div className="flex items-center justify-between w-full">
                    <span
                      className={`${darkMode ? "text-white" : "text-black"}`}
                    >
                      {pageContent["filters-all-formats"] || "All formats"}
                    </span>
                    {filters.locationType === EventLocationType.All ? (
                      darkMode ? (
                        <Image
                          src={CheckBoxIconWhite}
                          alt="Checked"
                          width={24}
                          height={24}
                        />
                      ) : (
                        <Image
                          src={CheckBoxIcon}
                          alt="Checked"
                          width={24}
                          height={24}
                        />
                      )
                    ) : darkMode ? (
                      <Image
                        src={CheckBoxOutlineBlankIconWhite}
                        alt="Unchecked"
                        width={24}
                        height={24}
                      />
                    ) : (
                      <Image
                        src={CheckBoxOutlineBlankIcon}
                        alt="Unchecked"
                        width={24}
                        height={24}
                      />
                    )}
                  </div>
                </button>

                <button
                  onClick={() =>
                    handleEventFormatChange(EventLocationType.Online)
                  }
                  className={`
                    w-full p-3 border rounded-lg flex items-center
                    ${
                      filters.locationType === EventLocationType.Online
                        ? darkMode
                          ? "border-blue-600"
                          : "border-blue-600"
                        : darkMode
                        ? "border-gray-700"
                        : "border-gray-300"
                    }
                  `}
                >
                  <div className="flex items-center justify-between w-full">
                    <span
                      className={`${darkMode ? "text-white" : "text-black"}`}
                    >
                      {pageContent["filters-online-event"] || "Online event"}
                    </span>
                    {filters.locationType === EventLocationType.Online ? (
                      darkMode ? (
                        <Image
                          src={CheckBoxIconWhite}
                          alt="Checked"
                          width={24}
                          height={24}
                        />
                      ) : (
                        <Image
                          src={CheckBoxIcon}
                          alt="Checked"
                          width={24}
                          height={24}
                        />
                      )
                    ) : darkMode ? (
                      <Image
                        src={CheckBoxOutlineBlankIconWhite}
                        alt="Unchecked"
                        width={24}
                        height={24}
                      />
                    ) : (
                      <Image
                        src={CheckBoxOutlineBlankIcon}
                        alt="Unchecked"
                        width={24}
                        height={24}
                      />
                    )}
                  </div>
                </button>

                <button
                  onClick={() =>
                    handleEventFormatChange(EventLocationType.Hybrid)
                  }
                  className={`
                    w-full p-3 border rounded-lg flex items-center
                    ${
                      filters.locationType === EventLocationType.Hybrid
                        ? darkMode
                          ? "border-blue-600"
                          : "border-blue-600"
                        : darkMode
                        ? "border-gray-700"
                        : "border-gray-300"
                    }
                  `}
                >
                  <div className="flex items-center justify-between w-full">
                    <span
                      className={`${darkMode ? "text-white" : "text-black"}`}
                    >
                      {pageContent["filters-hybrid-event"] || "Hybrid event"}
                    </span>
                    {filters.locationType === EventLocationType.Hybrid ? (
                      darkMode ? (
                        <Image
                          src={CheckBoxIconWhite}
                          alt="Checked"
                          width={24}
                          height={24}
                        />
                      ) : (
                        <Image
                          src={CheckBoxIcon}
                          alt="Checked"
                          width={24}
                          height={24}
                        />
                      )
                    ) : darkMode ? (
                      <Image
                        src={CheckBoxOutlineBlankIconWhite}
                        alt="Unchecked"
                        width={24}
                        height={24}
                      />
                    ) : (
                      <Image
                        src={CheckBoxOutlineBlankIcon}
                        alt="Unchecked"
                        width={24}
                        height={24}
                      />
                    )}
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer with Apply and Clear All buttons */}
        <div className="p-4 border-t flex justify-between items-center gap-3 shrink-0">
          <button
            onClick={handleClearAll}
            className={`
              flex-1 px-4 py-3 border rounded-lg text-center
              ${
                darkMode
                  ? "border-gray-700 text-white"
                  : "border-gray-300 text-gray-700"
              }
            `}
          >
            {pageContent["filters-clear-all"] || "Clear all"}
          </button>

          <BaseButton
            label={pageContent["filters-show-results"] || "Show results"}
            onClick={handleApply}
            customClass={`flex-1 px-4 py-3 rounded-lg font-medium ${
              darkMode
                ? "bg-capx-secondary-purple hover:bg-capx-primary-green text-white hover:text-black"
                : "bg-capx-secondary-purple hover:bg-capx-primary-green text-white hover:text-black"
            }`}
          />
        </div>
      </div>

      {/* Capacity Selection Modal */}
      <CapacitySelectionModal
        isOpen={showCapacityModal}
        onClose={() => setShowCapacityModal(false)}
        onSelect={handleCapacitySelect}
        title={pageContent["select-capacity"] || "Select capacity"}
      />
    </div>
  );
}
