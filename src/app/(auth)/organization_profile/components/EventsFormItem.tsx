"use client";

import { useTheme } from "@/contexts/ThemeContext";
import ImagesModeIcon from "@/public/static/images/images_mode.svg";
import AddLinkIcon from "@/public/static/images/add_link.svg";
import CancelIcon from "@/public/static/images/cancel.svg";
import CancelIconWhite from "@/public/static/images/cancel_white.svg";
import Image from "next/image";
import { Event } from "@/types/event";
import { useApp } from "@/contexts/AppContext";
import BaseSelect from "@/components/BaseSelect";
import { useState, useEffect } from "react";
import CapacitySelectionModal from "@/components/CapacitySelectionModal";
import { Capacity } from "@/types/capacity";
import BaseButton from "@/components/BaseButton";
import ArrowDownIcon from "@/public/static/images/keyboard_arrow_down.svg";

interface EventFormItemProps {
  eventData: Event;
  index: number;
  onDelete: (id: number) => void;
  onChange: (index: number, field: keyof Event, value: string) => void;
}

const DateSelector = ({ length }: { length: number }) => {
  const { darkMode } = useTheme();
  return (
    <select
      className={`w-full bg-transparent mx-2 border border-2 rounded-md p-2 
    appearance-none 
    bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20width%3D%2224%22%20height%3D%2224%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cpath%20d%3D%22M7%2010l5%205%205-5z%22%20fill%3D%22%23${
      darkMode ? "fff" : "053749"
    }%22%2F%3E%3C%2Fsvg%3E')] 
    bg-no-repeat 
    bg-[length:32px] 
    bg-[position:right_10px_center]
    pr-12
    ${
      darkMode ? "border-white text-white" : "border-[#053749] text-[#053749]"
    }`}
    >
      {Array.from({ length: length }, (_, i) => (
        <option key={i} value={i}>
          {i.toString().padStart(2, "0")}
        </option>
      ))}
    </select>
  );
};

export default function EventsFormItem({
  eventData,
  index,
  onDelete,
  onChange,
}: EventFormItemProps) {
  const { darkMode } = useTheme();
  const { isMobile, pageContent } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCapacities, setSelectedCapacities] = useState<Capacity[]>([]);

  useEffect(() => {
    // Initialize selected capacities from eventData
    if (eventData.related_skills && eventData.related_skills.length > 0) {
      // const capacities = eventData.related_skills.map(id => getCapacityById(id));
      // setSelectedCapacities(capacities);
    }
  }, [eventData.related_skills]);

  const handleCapacitySelect = (capacity: Capacity) => {
    if (!selectedCapacities.find((cap) => cap.code === capacity.code)) {
      const newCapacities = [...selectedCapacities, capacity];
      setSelectedCapacities(newCapacities);

      // Update related_skills in event
      const skillIds = newCapacities.map((cap) => cap.code);
      onChange(index, "related_skills", JSON.stringify(skillIds));
    }
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

  if (isMobile) {
    return (
      <div className="flex flex-row gap-2">
        <div className="flex flex-col gap-2 w-full">
          <div className="flex flex-row gap-2 w-full items-center text-[12px] md:text-[24px] text-[16px] p-2 border rounded-md bg-transparent">
            <input
              type="text"
              placeholder={pageContent["organization-profile-event-name"]}
              value={eventData.name || ""}
              onChange={(e) => handleChange("name", e.target.value)}
              className={`w-full bg-transparent border-none outline-none text-[12px] md:text-[24px] ${
                darkMode
                  ? "text-white placeholder-gray-400"
                  : "text-[#053749] placeholder-[#829BA4]"
              }`}
            />
          </div>
          <div className="flex flex-col md:flex-row gap-2">
            <div className="flex items-center gap-2 p-2 text-[12px] md:text-[24px] border rounded-md w-full md:w-1/2 bg-transparent">
              <div className="relative w-[24px] h-[24px]">
                <Image
                  src={ImagesModeIcon}
                  alt="Project image icon"
                  width={24}
                  height={24}
                />
              </div>
            </div>
            <div className="flex items-center gap-2 p-2 text-[12px] md:text-[24px] border rounded-md w-full md:w-1/2 bg-transparent"></div>
          </div>
        </div>
        <button onClick={() => onDelete(eventData.id || 0)}>
          <div className="relative w-[24px] h-[24px]">
            <Image
              src={darkMode ? CancelIconWhite : CancelIcon}
              alt="Delete icon"
              className="object-contain"
              width={24}
              height={24}
            />
          </div>
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-row gap-2">
      <div className="flex flex-col gap-2 w-full">
        <h1 className="text-[24px] text-capx-dark-box-bg font-Montserrat font-extrabold text-center py-2">
          {pageContent["organization-profile-event-title"]}
        </h1>
        <h2
          className={`text-[24px] font-Montserrat font-bold py-2 ${
            darkMode ? "text-white" : "text-[#053749]"
          }`}
        >
          {pageContent["organization-profile-event-url-title"]}
        </h2>
        <div className="flex flex-row gap-2 w-full items-center text-[24px] p-2 border rounded-md bg-transparent">
          <input
            type="text"
            placeholder={
              pageContent["organization-profile-event-url-placeholder"]
            }
            className={`w-full bg-transparent border-none outline-none ${
              darkMode
                ? "text-white placeholder-gray-400"
                : "text-[#829BA4] placeholder-[#829BA4]"
            }`}
            value={eventData.url || ""}
            onChange={(e) => handleChange("url", e.target.value)}
          />
        </div>
        <p
          className={`text-[20px] ${
            darkMode ? "text-white" : "text-[#829BA4]"
          }`}
        >
          {pageContent["organization-profile-event-url-tooltip"]}
        </p>
        <h2
          className={`text-[24px] font-Montserrat font-bold py-2 ${
            darkMode ? "text-white" : "text-[#053749]"
          }`}
        >
          {pageContent["organization-profile-event-title-of-event"]}
        </h2>
        <div className="flex flex-row gap-2 w-full items-center text-[24px] p-2 border rounded-md bg-transparent">
          <input
            type="text"
            placeholder={pageContent["organization-profile-event-name"]}
            value={eventData.name || ""}
            onChange={(e) => handleChange("name", e.target.value)}
            className={`w-full bg-transparent border-none outline-none text-[12px] md:text-[24px] ${
              darkMode
                ? "text-white placeholder-gray-400"
                : "text-[#053749] placeholder-[#829BA4]"
            }`}
          />
        </div>
        <div className="flex flex-col">
          <h2
            className={`text-[24px] font-Montserrat font-bold py-2 ${
              darkMode ? "text-white" : "text-capx-dark-box-bg"
            }`}
          >
            {pageContent["organization-profile-event-organized-by"]}
          </h2>
          <div className="flex flex-row gap-2 w-full items-center text-[24px] p-2 border rounded-md bg-transparent">
            <input
              type="text"
              disabled={true}
              className={`w-full bg-transparent border-none outline-none ${
                darkMode
                  ? "text-white placeholder-gray-400"
                  : "text-[#829BA4] placeholder-[#829BA4]"
              }`}
              value={eventData.organization || ""}
            />
          </div>
        </div>
        <div className="flex flex-col">
          <h2
            className={`text-[24px] font-Montserrat font-bold py-2 ${
              darkMode ? "text-white" : "text-capx-dark-box-bg"
            }`}
          >
            {pageContent["organization-profile-event-start-date"]}
          </h2>
          <div className="flex flex-row gap-2 w-full items-center text-[24px]">
            <div className="flex w-1/2 flex-row gap-2 border-capx-dark-box-bg rounded-md">
              <input
                type="datetime-local"
                value={
                  eventData.time_begin
                    ? new Date(eventData.time_begin).toISOString().slice(0, 16)
                    : ""
                }
                onChange={(e) => handleChange("time_begin", e.target.value)}
                className={`w-full bg-transparent border border-capx-dark-box-bg border-2 rounded-md p-2 outline-none ${
                  darkMode
                    ? "text-white placeholder-gray-400"
                    : "text-[#829BA4] placeholder-[#829BA4]"
                }`}
              />
            </div>
            <div className="flex w-[120px] flex-row gap-2">
              <DateSelector length={24} />
            </div>
            <div className="flex w-[120px] flex-row gap-2 ">
              <DateSelector length={60} />
            </div>
          </div>
          <p
            className={`text-[20px] ${
              darkMode ? "text-white" : "text-[#829BA4]"
            }`}
          >
            {pageContent["organization-profile-event-start-date-tooltip"]}
          </p>
        </div>
        <div className="flex flex-col">
          <h2
            className={`text-[24px] font-Montserrat font-bold py-2 ${
              darkMode ? "text-white" : "text-capx-dark-box-bg"
            }`}
          >
            {pageContent["organization-profile-event-end-date"]}
          </h2>
          <div className="flex flex-row gap-2 w-full items-center text-[24px]">
            <div className="flex w-1/2 flex-row gap-2 border-capx-dark-box-bg rounded-md">
              <input
                type="datetime-local"
                value={
                  eventData.time_end
                    ? new Date(eventData.time_end).toISOString().slice(0, 16)
                    : ""
                }
                onChange={(e) => handleChange("time_end", e.target.value)}
                className={`w-full bg-transparent border border-capx-dark-box-bg border-2 rounded-md p-2 outline-none ${
                  darkMode
                    ? "text-white placeholder-gray-400"
                    : "text-[#829BA4] placeholder-[#829BA4]"
                }`}
              />
            </div>
            <div className="flex w-[120px] flex-row gap-2">
              <DateSelector length={24} />
            </div>
            <div className="flex w-[120px] flex-row gap-2 ">
              <DateSelector length={60} />
            </div>
          </div>
          <p
            className={`text-[20px] ${
              darkMode ? "text-white" : "text-[#829BA4]"
            }`}
          >
            {pageContent["organization-profile-event-end-date-tooltip"]}
          </p>
        </div>
        <div className="flex flex-col">
          <h2
            className={`text-[24px] font-Montserrat font-bold py-2 ${
              darkMode ? "text-white" : "text-capx-dark-box-bg"
            }`}
          >
            {pageContent["organization-profile-event-date"]}
          </h2>
          <div className="flex flex-row gap-2 w-full items-center text-[24px] p-2 border rounded-md bg-transparent">
            <input
              type="date"
              placeholder={pageContent["organization-profile-event-date"]}
              className={`w-full bg-transparent border-none outline-none ${
                darkMode
                  ? "text-white placeholder-gray-400"
                  : "text-[#829BA4] placeholder-[#829BA4]"
              }`}
              value={
                eventData.time_begin
                  ? new Date(eventData.time_begin).toISOString().split("T")[0]
                  : ""
              }
              onChange={(e) => handleChange("time_begin", e.target.value)}
            />
          </div>
          <p
            className={`text-[20px] ${
              darkMode ? "text-white" : "text-[#829BA4]"
            }`}
          >
            {pageContent["organization-profile-event-date-tooltip"]}
          </p>
        </div>
        <div className="flex flex-col">
          <h2
            className={`text-[24px] font-Montserrat font-bold py-2 ${
              darkMode ? "text-white" : "text-capx-dark-box-bg"
            }`}
          >
            {pageContent["organization-profile-event-format"]}
          </h2>
          <div className="flex flex-row gap-2 w-full items-center text-[24px] p-2 border rounded-md bg-transparent">
            <select
              className={`w-full bg-transparent border-none outline-none ${
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
        <div className="flex flex-col gap-4 w-full border-none">
          <h2
            className={`text-[24px] font-Montserrat font-bold py-2 ${
              darkMode ? "text-white" : "text-capx-dark-box-bg"
            }`}
          >
            {pageContent["organization-profile-event-choose-capacities"]}
          </h2>

          <div className="flex flex-col w-full">
            <div
              onClick={() => setIsModalOpen(true)}
              className={`flex items-center justify-between w-full px-4 py-3 border rounded-lg cursor-pointer ${
                darkMode
                  ? "bg-transparent border-white text-white"
                  : "bg-white border-gray-300 text-gray-700"
              }`}
            >
              <div className="flex-1 flex flex-wrap gap-2">
                {selectedCapacities.length > 0 ? (
                  selectedCapacities.map((capacity) => (
                    <div
                      key={capacity.code}
                      className={`flex items-center gap-2 px-3 py-1 rounded-full ${
                        darkMode ? "bg-gray-700" : "bg-gray-100"
                      }`}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <span
                        className={`text-sm ${
                          darkMode ? "text-white" : "text-gray-800"
                        }`}
                      >
                        {capacity.name}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveCapacity(capacity.code);
                        }}
                        className={`w-4 h-4 flex items-center justify-center rounded-full hover:bg-opacity-80 ${
                          darkMode
                            ? "text-white hover:bg-gray-600"
                            : "text-gray-600 hover:bg-gray-200"
                        }`}
                      >
                        ×
                      </button>
                    </div>
                  ))
                ) : (
                  <span
                    className={`${
                      darkMode ? "text-gray-400" : "text-gray-500"
                    }`}
                  >
                    {
                      pageContent[
                        "organization-profile-event-choose-capacities"
                      ]
                    }
                  </span>
                )}
              </div>
              <div className="flex-shrink-0 ml-2">
                <Image
                  src={ArrowDownIcon}
                  alt="Expand"
                  width={24}
                  height={24}
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
            className={`text-[24px] font-Montserrat font-bold py-2 ${
              darkMode ? "text-white" : "text-capx-dark-box-bg"
            }`}
          >
            {pageContent["organization-profile-event-description"]}
          </h2>
          <div className="flex flex-col gap-2 w-full items-center text-[24px] p-2 border rounded-md bg-transparent">
            <textarea
              className={`w-full bg-transparent border-none outline-none ${
                darkMode
                  ? "text-white placeholder-gray-400"
                  : "text-[#829BA4] placeholder-[#829BA4]"
              }`}
              value={eventData.description || ""}
              onChange={(e) => handleChange("description", e.target.value)}
            />
          </div>
          <p
            className={`text-[20px] ${
              darkMode ? "text-white" : "text-[#829BA4]"
            }`}
          >
            {pageContent["organization-profile-event-description-tooltip"]}
          </p>
        </div>
      </div>

      <button onClick={() => onDelete(eventData.id || 0)}>
        <div className="relative w-[32px] h-[32px] items-center">
          <Image
            src={darkMode ? CancelIconWhite : CancelIcon}
            alt="Delete icon"
            className="object-contain"
            width={32}
            height={32}
          />
        </div>
      </button>
    </div>
  );
}
