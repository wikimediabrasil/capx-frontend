"use client";

import { useTheme } from "@/contexts/ThemeContext";
import { Event } from "@/types/event";
import { Capacity } from "@/types/capacity";
import Image from "next/image";
import { useApp } from "@/contexts/AppContext";
import { formatDateToLocaleString } from "@/lib/utils/formatDate";
import { useEvent } from "@/hooks/useEvents";
import LoadingState from "@/components/LoadingState";
import EmojiObjectsIcon from "@/public/static/images/emoji_objects.svg";
import EmojiObjectsIconWhite from "@/public/static/images/emoji_objects_white.svg";
import CheckBoxOutlineBlankIcon from "@/public/static/images/check_box_outline_blank.svg";
import CheckBoxOutlineBlankIconLight from "@/public/static/images/check_box_outline_blank_light.svg";
import CheckBoxIcon from "@/public/static/images/check_box.svg";
import CheckBoxIconLight from "@/public/static/images/check_box_light.svg";
import EditIcon from "@/public/static/images/edit.svg";
import EditIconWhite from "@/public/static/images/edit_white.svg";
import DeleteIcon from "@/public/static/images/delete.svg";
import BaseButton from "@/components/BaseButton";
import { useState } from "react";

interface EventCardProps {
  event?: Event;
  eventId?: number;
  token: string;
  capacities?: Capacity[];
  onEdit?: (event: Event) => void;
  onDelete?: (eventId: number) => void;
  onChoose?: (event: Event) => void;
}

export default function EventCard({
  event: propEvent,
  eventId,
  token,
  capacities = [],
  onEdit,
  onDelete,
  onChoose,
}: EventCardProps) {
  const { darkMode } = useTheme();
  const { pageContent } = useApp();
  const [isSelected, setIsSelected] = useState(false);

  // Search for the event by ID if the event is not provided directly
  const { event: fetchedEvent, isLoading, error } = useEvent(eventId, token);

  // Use the provided event as a prop or the fetched event
  const event = propEvent || fetchedEvent;

  // Display loading state
  if (isLoading) {
    return (
      <div className="min-w-[280px] max-w-[320px] h-[300px] flex items-center justify-center">
        <LoadingState />
      </div>
    );
  }

  // If there is an error or no event, do not render anything
  if (error || !event) {
    return null;
  }

  // Find the capacities related to the event
  const eventCapacities = capacities.filter(
    (capacity) =>
      event.related_skills &&
      Array.isArray(event.related_skills) &&
      event.related_skills.includes(capacity.code)
  );

  // Function to handle the event choice
  const handleChoose = (event: Event) => {
    setIsSelected(!isSelected);
    if (onChoose) {
      onChoose(event);
    }
  };

  return (
    <div
      className={`flex flex-col p-4 rounded-[4px] border border-capx-dark-box-bg shadow-md min-w-[280px] max-w-[320px] h-[300px] m-2 ${
        darkMode ? "bg-capx-dark-box-bg text-white" : "bg-white text-[#053749]"
      }`}
    >
      <div className="flex flex-col flex-1">
        <h3 className="text-xl font-bold mb-2 truncate" title={event.name}>
          {event.name}
        </h3>

        {/* <div className="text-sm mb-2">
          {event.time_begin && (
            <p className="text-sm opacity-80">
              {formatDateToLocaleString(event.time_begin)}
            </p>
          )}
        </div> */}

        <div className="flex-1 overflow-y-auto mb-3">
          {capacities.length > 0 && (
            <>
              <div className="flex flex-row items-center gap-2">
                <Image
                  src={darkMode ? EmojiObjectsIconWhite : EmojiObjectsIcon}
                  alt="Emoji objects"
                  className="w-4 h-4"
                />
                <div className="text-sm font-semibold mb-1">
                  {pageContent[
                    "organization-profile-event-available-capacities"
                  ] || "Available capacities"}
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {eventCapacities.length > 0 ? (
                  eventCapacities.map((capacity) => (
                    <span
                      key={capacity.code}
                      className={`text-xs px-2 py-1 rounded-[4px] bg-capx-dark-box-bg text-white rounded-[8px]`}
                    >
                      {capacity.name}
                    </span>
                  ))
                ) : (
                  <span className="text-xs opacity-70">
                    {pageContent["organization-profile-no-capacities"] ||
                      "No capacities"}
                  </span>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {onEdit && onDelete && onChoose && (
        <div className="flex flex-col gap-1/2 mt-auto">
          <BaseButton
            label={pageContent["organization-profile-edit-event"] || "Edit"}
            onClick={() => onEdit(event)}
            customClass={`py-2 px-3 rounded-md text-sm font-extrabold border border-capx-dark-box-bg text-start text-capx-dark-box-bg bg-white flex flex-row items-center gap-2 hover:opacity-90 transition-opacity !pb-2`}
            imageUrl={darkMode ? EditIconWhite : EditIcon}
            imageAlt="Edit icon"
            imageWidth={24}
            imageHeight={24}
          />

          <BaseButton
            label={pageContent["organization-profile-choose-event"] || "Choose"}
            onClick={() => handleChoose(event)}
            customClass={`py-2 px-3 rounded-md border border-capx-dark-box-bg text-sm font-extrabold bg-white text-start text-capx-dark-box-bg flex flex-row items-center gap-2 hover:opacity-90 transition-opacity !pb-2`}
            imageUrl={
              isSelected
                ? darkMode
                  ? CheckBoxIconLight
                  : CheckBoxIcon
                : darkMode
                ? CheckBoxOutlineBlankIconLight
                : CheckBoxOutlineBlankIcon
            }
            imageAlt="Checkbox icon"
            imageWidth={24}
            imageHeight={24}
          />

          <BaseButton
            label={pageContent["organization-profile-delete-event"] || "Delete"}
            onClick={() => onDelete(event.id || 0)}
            customClass={`py-2 px-3 rounded-md text-sm bg-capx-primary-orange flex flex-row items-center gap-2 text-start text-white font-extrabold hover:opacity-90 transition-opacity !pb-2`}
            imageUrl={DeleteIcon}
            imageAlt="Delete icon"
            imageWidth={24}
            imageHeight={24}
          />
        </div>
      )}

      {(!onEdit || !onDelete || !onChoose) && event.url && (
        <div className="mt-auto">
          <a
            href={event.url}
            target="_blank"
            rel="noopener noreferrer"
            className={`block w-full py-2 px-3 text-center rounded-md text-sm font-medium ${
              darkMode ? "bg-white text-[#053749]" : "bg-[#053749] text-white"
            } hover:opacity-90 transition-opacity`}
          >
            {pageContent["organization-profile-view-event"] || "Ver evento"}
          </a>
        </div>
      )}
    </div>
  );
}
