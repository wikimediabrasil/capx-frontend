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

const validateImageUrl = (url: string) => {
  if (!url) return url;

  try {
    url = url.replace(/^@/, "");

    const urlObj = new URL(url);

    if (
      urlObj.hostname === "commons.wikimedia.org" &&
      url.includes("/wiki/File:")
    ) {
      return url;
    } else if (
      urlObj.hostname === "upload.wikimedia.org" &&
      url.includes("/wikipedia/commons/")
    ) {
      return url;
    }
    return "";
  } catch {
    return "";
  }
};

export default function EventFormItem({
  eventData,
  index,
  onDelete,
  onChange,
}: EventFormItemProps) {
  const { darkMode } = useTheme();
  const { isMobile, pageContent } = useApp();

  if (isMobile) {
    return (
      <div className="flex flex-row gap-2">
        <div className="flex flex-col gap-2 w-full">
          <div className="flex flex-row gap-2 w-full items-center text-[12px] md:text-[24px] text-[16px] p-2 border rounded-md bg-transparent">
            <input
              type="text"
              placeholder={pageContent["organization-profile-event-name"]}
              value={eventData.name || ""}
              onChange={(e) => onChange(index, "name", e.target.value)}
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
              <input
                type="text"
                placeholder={pageContent["organization-profile-project-image"]}
                className={`w-full bg-transparent border-none outline-none text-[12px] md:text-[24px] ${
                  darkMode
                    ? "text-white placeholder-gray-400"
                    : "text-[#829BA4] placeholder-[#829BA4]"
                }`}
                value={eventData.image_url}
                onChange={(e) => {
                  const validatedUrl = validateImageUrl(e.target.value);
                  onChange(index, "image_url", validatedUrl);
                }}
              />
            </div>
            <div className="flex items-center gap-2 p-2 text-[12px] md:text-[24px] border rounded-md w-full md:w-1/2 bg-transparent">
              <div className="relative w-[24px] h-[24px]">
                <Image
                  src={AddLinkIcon}
                  alt="Add link icon"
                  className="object-contain"
                  width={24}
                  height={24}
                />
              </div>
              <input
                type="text"
                placeholder={pageContent["organization-profile-project-link"]}
                className={`w-full bg-transparent border-none outline-none text-[12px] md:text-[24px] ${
                  darkMode
                    ? "text-white placeholder-gray-400"
                    : "text-[#829BA4] placeholder-[#829BA4]"
                }`}
                value={eventData.url}
                onChange={(e) => onChange(index, "url", e.target.value)}
              />
            </div>
          </div>
        </div>
        <button onClick={() => onDelete(eventData.id)}>
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
          {pageContent["organization-profile-event-title"]}
        </h2>
        <div className="flex flex-row gap-2 w-full items-center text-[24px] p-2 border rounded-md bg-transparent">
          <input
            type="text"
            placeholder={pageContent["organization-profile-event-name"]}
            value={eventData.name || ""}
            onChange={(e) => onChange(index, "name", e.target.value)}
            className={`w-full bg-transparent border-none outline-none text-[12px] md:text-[24px] ${
              darkMode
                ? "text-white placeholder-gray-400"
                : "text-[#053749] placeholder-[#829BA4]"
            }`}
          />
        </div>
        {/* <div className="flex flex-row gap-2">
          <div className="flex items-center gap-2 p-2 text-[24px] border rounded-md w-1/2 bg-transparent">
            <Image
              src={ImagesModeIcon}
              alt="Project image icon"
              width={32}
              height={32}
              className="opacity-50"
            />
            <input
              type="text"
              placeholder={pageContent["organization-profile-project-image"]}
              className={`w-full text-[24px] bg-transparent border-none outline-none ${
                darkMode
                  ? "text-white placeholder-gray-400"
                  : "text-[#829BA4] placeholder-[#829BA4]"
              }`}
              value={eventData.image_url}
              onChange={(e) => {
                const validatedUrl = validateImageUrl(e.target.value);
                onChange(index, "image_url", validatedUrl);
              }}
            />
          </div>
          <div className="flex items-center gap-2 p-2 text-[24px] border rounded-md items-center w-1/2 bg-transparent">
            <div className="relative w-[32px] h-[32px]">
              <Image
                src={AddLinkIcon}
                alt="Add link icon"
                className="object-contain"
                width={32}
                height={32}
              />
            </div>
            <input
              type="text"
              placeholder={pageContent["organization-profile-project-link"]}
              className={`w-full bg-transparent border-none items-center text-[24px] outline-none ${
                darkMode
                  ? "text-white placeholder-gray-400"
                  : "text-[#829BA4] placeholder-[#829BA4]"
              }`}
              value={eventData.url}
              onChange={(e) => onChange(index, "url", e.target.value)}
            />
          </div>
        </div> */}
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
              placeholder={
                pageContent["organization-profile-event-organized-by"]
              }
              className={`w-full bg-transparent border-none outline-none ${
                darkMode
                  ? "text-white placeholder-gray-400"
                  : "text-[#829BA4] placeholder-[#829BA4]"
              }`}
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
                type="date"
                placeholder={
                  pageContent["organization-profile-event-start-date"]
                }
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
                type="date"
                placeholder={pageContent["organization-profile-event-end-date"]}
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
            <input
              type="text"
              placeholder={pageContent["organization-profile-event-format"]}
              className={`w-full bg-transparent border-none outline-none ${
                darkMode
                  ? "text-white placeholder-gray-400"
                  : "text-[#829BA4] placeholder-[#829BA4]"
              }`}
            />
          </div>
        </div>
        <div className="flex flex-col border-none">
          <h2
            className={`text-[24px] font-Montserrat font-bold py-2 ${
              darkMode ? "text-white" : "text-capx-dark-box-bg"
            }`}
          >
            {pageContent["organization-profile-event-choose-capacities"]}
          </h2>
          <div className="flex flex-row gap-2 w-full items-center text-[24px] bg-transparent">
            <BaseSelect
              options={[
                "communication",
                "leadership",
                "organization",
                "problem-solving",
                "team-work",
              ]}
              onChange={() => {}}
              value={""}
              placeholder={
                pageContent["organization-profile-event-choose-capacities"]
              }
              name={""}
              isMobile={false}
              darkMode={darkMode}
              className="w-full"
            />
          </div>
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

      <button onClick={() => onDelete(eventData.id)}>
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
