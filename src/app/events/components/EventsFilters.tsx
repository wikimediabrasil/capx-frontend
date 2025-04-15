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
import CalendarIcon from "@/public/static/images/calendar_month_dark.svg";
import CalendarIconWhite from "@/public/static/images/calendar_month.svg";
import LocationIcon from "@/public/static/images/cake.svg";//TODO: change to location icon
import LocationIconWhite from "@/public/static/images/cake.svg";//TODO: change to location icon
import OrganizationIcon from "@/public/static/images/supervised_user_circle.svg";
import OrganizationIconWhite from "@/public/static/images/supervised_user_circle_white.svg";

import { useOrganizations } from "@/hooks/useOrganizationProfile";
import { useSession } from "next-auth/react";
import BaseButton from "@/components/BaseButton";
import { Capacity } from "@/types/capacity";
import CapacitySelectionModal from "@/components/CapacitySelectionModal";
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

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
  const [showSkillModal, setShowSkillModal] = useState(false);
  
  // Fetch organizations for the organization filter
  const { organizations } = useOrganizations(100, 0);

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
  };

  const handleRemoveCapacity = (capacityCode: number) => {
    setFilters((prev) => ({
      ...prev,
      capacities: prev.capacities.filter((cap) => cap.code !== capacityCode),
    }));
  };

  const handleApply = () => {
    onApplyFilters(filters);
  };

  const handleClearAll = () => {
    setFilters({
      capacities: [],
      territories: [],
      eventType: EventFilterType.All,
      locationType: EventLocationType.All,
      dateRange: undefined,
      organizationId: undefined
    });
    setSearchCapacity("");
  };

  const handleLocationTypeChange = (type: EventLocationType) => {
    setFilters((prev) => ({
      ...prev,
      locationType: type,
    }));
  };
  
  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters((prev) => ({
      ...prev,
      dateRange: {
        ...prev.dateRange,
        startDate: e.target.value || undefined
      }
    }));
  };
  
  const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters((prev) => ({
      ...prev,
      dateRange: {
        ...prev.dateRange,
        endDate: e.target.value || undefined
      }
    }));
  };
  
  const handleOrganizationChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const orgId = e.target.value ? Number(e.target.value) : undefined;
    setFilters((prev) => ({
      ...prev,
      organizationId: orgId
    }));
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
        relative w-full h-full md:w-[800px] md:max-h-[80vh] md:mt-20 md:rounded-lg
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
              className={`text-xl font-bold ${
                darkMode ? "text-white" : "text-black"
              }`}
            >
              {pageContent["filters-title"] || "Filtros"}
            </h1>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto min-h-0">
          <div className="p-4 space-y-6">
            {/* Capacities */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Image
                  src={darkMode ? CapxIconWhite : CapxIcon}
                  alt={pageContent["filters-capacities-alt-icon"] || "Capacities"}
                  width={24}
                  height={24}
                />
                <h2
                  className={`font-bold ${
                    darkMode ? "text-white" : "text-black"
                  }`}
                >
                  {pageContent["filters-capacities"] || "Capacidades"}
                </h2>
              </div>
              <div className="relative">
                <input
                  type="text"
                  readOnly
                  value={searchCapacity}
                  onFocus={() => setShowSkillModal(true)}
                  placeholder={pageContent["filters-search-by-capacities"] || "Buscar por capacidades"}
                  className={`
                    w-full p-2 rounded-lg border
                    ${
                      darkMode
                        ? "bg-capx-dark-box-bg text-white border-gray-700 placeholder-gray-400"
                        : "bg-white border-gray-300 placeholder-gray-500"
                    }
                  `}
                />
                <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                  <Image
                    src={darkMode ? SearchIconWhite : SearchIcon}
                    alt={pageContent["filters-search-icon"] || "Search"}
                    width={20}
                    height={20}
                  />
                </div>
              </div>

              {/* Selected Capacities */}
              {filters.capacities.length > 0 && (
                <div className="flex flex-wrap gap-2">
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
                          alt={pageContent["filters-remove-item-alt-icon"] || "Remove"}
                          width={16}
                          height={16}
                        />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <CapacitySelectionModal
              isOpen={showSkillModal}
              onClose={() => setShowSkillModal(false)}
              onSelect={handleCapacitySelect}
              title={pageContent["select-capacity"] || "Selecionar capacidade"}
            />
            
            {/* Event Date Range */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Image
                  src={darkMode ? CalendarIconWhite : CalendarIcon}
                  alt={pageContent["filters-date-alt-icon"] || "Date"}
                  width={24}
                  height={24}
                />
                <h2
                  className={`font-bold ${
                    darkMode ? "text-white" : "text-black"
                  }`}
                >
                  {pageContent["filters-date"] || "Data do evento"}
                </h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                    {pageContent["filters-start-date"] || "Data inicial"}
                  </label>
                  <input
                    type="date"
                    value={filters.dateRange?.startDate || ""}
                    onChange={handleStartDateChange}
                    className={`
                      w-full p-2 rounded-lg border
                      ${
                        darkMode
                          ? "bg-capx-dark-box-bg text-white border-gray-700"
                          : "bg-white border-gray-300 text-gray-900"
                      }
                    `}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                    {pageContent["filters-end-date"] || "Data final"}
                  </label>
                  <input
                    type="date"
                    value={filters.dateRange?.endDate || ""}
                    onChange={handleEndDateChange}
                    className={`
                      w-full p-2 rounded-lg border
                      ${
                        darkMode
                          ? "bg-capx-dark-box-bg text-white border-gray-700"
                          : "bg-white border-gray-300 text-gray-900"
                      }
                    `}
                  />
                </div>
              </div>
            </div>

            {/* Event Location Type */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Image
                  src={darkMode ? LocationIconWhite : LocationIcon}
                  alt={pageContent["filters-location-alt-icon"] || "Location"}
                  width={24}
                  height={24}
                />
                <h2
                  className={`font-bold ${
                    darkMode ? "text-white" : "text-black"
                  }`}
                >
                  {pageContent["filters-location-type"] || "Tipo de local"}
                </h2>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                <button
                  onClick={() => handleLocationTypeChange(EventLocationType.All)}
                  className={`
                    p-2 border rounded-lg flex items-center justify-center gap-2
                    ${
                      filters.locationType === EventLocationType.All
                        ? darkMode
                          ? "bg-blue-900 border-blue-700"
                          : "bg-blue-50 border-blue-200"
                        : darkMode
                        ? "bg-capx-dark-box-bg border-gray-700"
                        : "bg-white border-gray-300"
                    }
                  `}
                >
                  <span
                    className={`${darkMode ? "text-white" : "text-black"}`}
                  >
                    {pageContent["filters-location-all"] || "Todos"}
                  </span>
                </button>

                <button
                  onClick={() => handleLocationTypeChange(EventLocationType.Online)}
                  className={`
                    p-2 border rounded-lg flex items-center justify-center gap-2
                    ${
                      filters.locationType === EventLocationType.Online
                        ? darkMode
                          ? "bg-blue-900 border-blue-700"
                          : "bg-blue-50 border-blue-200"
                        : darkMode
                        ? "bg-capx-dark-box-bg border-gray-700"
                        : "bg-white border-gray-300"
                    }
                  `}
                >
                  <span
                    className={`${darkMode ? "text-white" : "text-black"}`}
                  >
                    {pageContent["filters-location-online"] || "Online"}
                  </span>
                </button>
                
                <button
                  onClick={() => handleLocationTypeChange(EventLocationType.InPerson)}
                  className={`
                    p-2 border rounded-lg flex items-center justify-center gap-2
                    ${
                      filters.locationType === EventLocationType.InPerson
                        ? darkMode
                          ? "bg-blue-900 border-blue-700"
                          : "bg-blue-50 border-blue-200"
                        : darkMode
                        ? "bg-capx-dark-box-bg border-gray-700"
                        : "bg-white border-gray-300"
                    }
                  `}
                >
                  <span
                    className={`${darkMode ? "text-white" : "text-black"}`}
                  >
                    {pageContent["filters-location-in-person"] || "Presencial"}
                  </span>
                </button>
                
                <button
                  onClick={() => handleLocationTypeChange(EventLocationType.Hybrid)}
                  className={`
                    p-2 border rounded-lg flex items-center justify-center gap-2
                    ${
                      filters.locationType === EventLocationType.Hybrid
                        ? darkMode
                          ? "bg-blue-900 border-blue-700"
                          : "bg-blue-50 border-blue-200"
                        : darkMode
                        ? "bg-capx-dark-box-bg border-gray-700"
                        : "bg-white border-gray-300"
                    }
                  `}
                >
                  <span
                    className={`${darkMode ? "text-white" : "text-black"}`}
                  >
                    {pageContent["filters-location-hybrid"] || "Híbrido"}
                  </span>
                </button>
              </div>
            </div>

            {/* Organization Filter */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Image
                  src={darkMode ? OrganizationIconWhite : OrganizationIcon}
                  alt={pageContent["filters-organization-alt-icon"] || "Organization"}
                  width={24}
                  height={24}
                />
                <h2
                  className={`font-bold ${
                    darkMode ? "text-white" : "text-black"
                  }`}
                >
                  {pageContent["filters-organization"] || "Organização"}
                </h2>
              </div>
              
              <select
                value={filters.organizationId || ""}
                onChange={handleOrganizationChange}
                className={`
                  w-full p-2 rounded-lg border
                  ${
                    darkMode
                      ? "bg-capx-dark-box-bg text-white border-gray-700"
                      : "bg-white border-gray-300 text-gray-900"
                  }
                `}
              >
                <option value="">
                  {pageContent["filters-select-organization"] || "Selecione uma organização"}
                </option>
                {organizations?.map((org) => (
                  <option key={org.id} value={org.id}>
                    {org.display_name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Footer with Apply and Clear All buttons */}
        <div className="p-4 border-t flex justify-between items-center shrink-0">
          <button
            onClick={handleClearAll}
            className={`
              px-4 py-2 text-sm
              ${
                darkMode
                  ? "text-gray-300 hover:text-white"
                  : "text-gray-600 hover:text-black"
              }
            `}
          >
            {pageContent["filters-clear-all"] || "Limpar filtros"}
          </button>

          <BaseButton
            label={pageContent["filters-apply"] || "Aplicar"}
            onClick={handleApply}
            customClass={`px-6 py-2 rounded-md font-medium ${
              darkMode
                ? "bg-blue-600 hover:bg-blue-700 text-white"
                : "bg-blue-600 hover:bg-blue-700 text-white"
            }`}
          />
        </div>
      </div>
    </div>
  );
} 