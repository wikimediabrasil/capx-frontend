'use client';

import { CapacitySearch } from '@/app/(auth)/capacity/components/CapacitySearch';
import BaseButton from '@/components/BaseButton';
import ArrowBackIcon from '@/public/static/images/arrow_back_icon.svg';
import ArrowBackIconWhite from '@/public/static/images/arrow_back_icon_white.svg';
import CapxIcon from '@/public/static/images/capx_icon.svg';
import CapxIconWhite from '@/public/static/images/capx_icon_white.svg';
import CheckBoxIcon from '@/public/static/images/check_box.svg';
import CheckBoxIconWhite from '@/public/static/images/check_box_light.svg';
import CheckBoxOutlineBlankIcon from '@/public/static/images/check_box_outline_blank.svg';
import CheckBoxOutlineBlankIconWhite from '@/public/static/images/check_box_outline_blank_light.svg';
import LocationIconWhite from '@/public/static/images/location_on.svg';
import LocationIcon from '@/public/static/images/location_on_dark.svg';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { EventFilterState, EventFilterType, EventLocationType } from '../types';

import { useDarkMode, usePageContent } from '@/stores';

const eventFormatOptions = [
  { type: EventLocationType.All, labelKey: 'filters-all-formats', fallback: 'All formats' },
  { type: EventLocationType.Online, labelKey: 'filters-online-event', fallback: 'Online event' },
  { type: EventLocationType.InPerson, labelKey: 'filters-onsite-event', fallback: 'On-site event' },
  { type: EventLocationType.Hybrid, labelKey: 'filters-hybrid-event', fallback: 'Hybrid event' },
];

interface EventsFiltersProps {
  onClose: () => void;
  onApplyFilters: (filters: EventFilterState) => void;
  initialFilters: EventFilterState;
}

export function EventsFilters({ onClose, onApplyFilters, initialFilters }: Readonly<EventsFiltersProps>) {
  const darkMode = useDarkMode();
  const pageContent = usePageContent();

  const [filters, setFilters] = useState<EventFilterState>(initialFilters);

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

  const getCheckboxIcon = (checked: boolean) => {
    if (checked) return darkMode ? CheckBoxIconWhite : CheckBoxIcon;
    return darkMode ? CheckBoxOutlineBlankIconWhite : CheckBoxOutlineBlankIcon;
  };

  const handleEventFormatChange = (format: EventLocationType) => {
    setFilters(prev => ({
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
  };

  // Avoid multiple scrolls when the modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';

    // Cleanup: restore scroll when the modal closes
    return () => {
      document.body.style.overflow = 'auto';
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
        ${darkMode ? 'bg-capx-dark-bg' : 'bg-white'}
        flex flex-col overflow-hidden
      `}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b shrink-0">
          <div className="flex items-center gap-2">
            <button onClick={onClose}>
              <Image
                src={darkMode ? ArrowBackIconWhite : ArrowBackIcon}
                alt={pageContent['filters-back-icon'] || 'Back'}
                width={24}
                height={24}
              />
            </button>
            <h1
              className={`text-xl font-medium leading-[normal] font-Montserrat ${
                darkMode ? 'text-white' : 'text-black'
              }`}
            >
              {pageContent['filters-title'] || 'Filters'}
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
                  alt={pageContent['filters-capacities'] || 'Capacities'}
                  width={24}
                  height={24}
                />
                <h2 className={`font-medium ${darkMode ? 'text-white' : 'text-black'}`}>
                  {pageContent['filters-capacities'] || 'Capacities'}
                </h2>
              </div>

              <CapacitySearch
                onSelect={capacities => setFilters(prev => ({ ...prev, capacities }))}
                selectedCapacities={filters.capacities}
                allowMultipleSelection={true}
                showSelectedChips={true}
                compact={true}
              />
            </div>

            {/* Territory Section */}
            {/* TODO: Add territory section */}
            {/* <div className="p-4 space-y-3">
              <div className="flex items-center gap-2">
                <Image
                  src={darkMode ? LocationIconWhite : LocationIcon}
                  alt={pageContent['filters-territory'] || 'Territory'}
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
                    alt={pageContent['add'] || 'Add'}
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
                          alt={pageContent['filters-remove-item-alt-icon'] || 'Remove'}
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
                  alt={pageContent['filters-event-format'] || 'Event format'}
                  width={24}
                  height={24}
                />
                <h2 className={`font-medium ${darkMode ? 'text-white' : 'text-black'}`}>
                  {pageContent['filters-event-format'] || 'Event format'}
                </h2>
              </div>

              <div className="space-y-2">
                {eventFormatOptions.map(({ type, labelKey, fallback }) => {
                  const isSelected = filters.locationType === type;
                  return (
                    <button
                      key={type}
                      onClick={() => handleEventFormatChange(type)}
                      className={`
                        w-full p-3 border rounded-lg flex items-center
                        ${
                          isSelected
                            ? 'border-blue-600'
                            : darkMode
                              ? 'border-gray-700'
                              : 'border-gray-300'
                        }
                      `}
                    >
                      <div className="flex items-center justify-between w-full">
                        <span className={`${darkMode ? 'text-white' : 'text-black'}`}>
                          {pageContent[labelKey] || fallback}
                        </span>
                        <Image
                          src={getCheckboxIcon(isSelected)}
                          alt={
                            isSelected
                              ? pageContent['alt-checked'] || 'Checked'
                              : pageContent['alt-unchecked'] || 'Unchecked'
                          }
                          width={24}
                          height={24}
                        />
                      </div>
                    </button>
                  );
                })}
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
              ${darkMode ? 'border-gray-700 text-white' : 'border-gray-300 text-gray-700'}
            `}
          >
            {pageContent['filters-clear-all'] || 'Clear all'}
          </button>

          <BaseButton
            label={pageContent['filters-show-results'] || 'Show results'}
            onClick={handleApply}
            customClass="flex-1 px-4 py-3 rounded-lg font-medium bg-capx-secondary-purple hover:bg-capx-primary-green text-white hover:text-black"
          />
        </div>
      </div>
    </div>
  );
}
