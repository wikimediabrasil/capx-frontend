import { Event } from "@/types/event";
import BaseButton from "@/components/BaseButton";
import Image from "next/image";
import AlarmDarkIcon from "@/public/static/images/alarm_dark.svg";
import AlarmLightIcon from "@/public/static/images/alarm.svg";
import LocationDarkIcon from "@/public/static/images/location_on_dark.svg";
import LocationLightIcon from "@/public/static/images/location_on.svg";
import CalendarDarkIcon from "@/public/static/images/calendar_month_dark.svg";
import CalendarLightIcon from "@/public/static/images/calendar_month.svg";
import EmojiObjectsDarkIcon from "@/public/static/images/emoji_objects_events.svg";
import EmojiObjectsLightIcon from "@/public/static/images/emoji_objects_white.svg";
import { useSession } from "next-auth/react";
import { useApp } from "@/contexts/AppContext";
import { useCapacityDetails } from "@/hooks/useCapacityDetails";
import { useOrganization } from "@/hooks/useOrganizationProfile";
import MoreHorizIcon from "@/public/static/images/more_horiz.svg";
import ArrowDropDownIcon from "@/public/static/images/arrow_drop_down_circle.svg";
import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import LoadingState from "@/components/LoadingState";
import CheckBoxOutlineBlankIconLight from "@/public/static/images/check_box_outline_blank_light.svg";
import CheckBoxIcon from "@/public/static/images/check_box.svg";
import EditIcon from "@/public/static/images/edit.svg";
import EditIconLight from "@/public/static/images/edit_white.svg";
import DeleteIcon from "@/public/static/images/delete.svg";
import DeleteConfirmationModal from "@/components/DeleteConfirmationModal";
import { useTheme } from "@/contexts/ThemeContext";

interface EventCardProps {
  event: Partial<Event>;
  isHorizontalScroll?: boolean;
  onEdit?: (event: Event) => void;
  onDelete?: (eventId: number) => void;
  onChoose?: (event: Event) => void;
  isLoading?: boolean;
  error?: boolean;
}

export default function EventCard({
  event,
  isHorizontalScroll,
  onEdit,
  onDelete,
  onChoose,
  isLoading,
  error,
}: EventCardProps) {
  const { isMobile, pageContent } = useApp();
  const { data: session } = useSession();
  const { darkMode } = useTheme();
  const token = session?.user?.token;

  const { capacityNames } = useCapacityDetails(event.related_skills || []);
  const { organization } = useOrganization(token, event.organization);

  const [showAllCapacities, setShowAllCapacities] = useState(false);
  const [isSelected, setIsSelected] = useState(false);
  const [visibleCapacities, setVisibleCapacities] = useState(3);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [showEventDetails, setShowEventDetails] = useState(false);

  const capacitiesContainerRef = useRef<HTMLDivElement>(null);
  const [overflowing, setOverflowing] = useState(false);

  // Check if the event is in the organization's choose_events list
  useEffect(() => {
    if (organization && event.id) {
      const isEventChosen =
        Array.isArray(organization.choose_events) &&
        organization.choose_events.includes(event.id);
      setIsSelected(isEventChosen);
    }
  }, [organization, event.id]);

  // Detect overflow of capacities
  useEffect(() => {
    const checkOverflow = () => {
      if (capacitiesContainerRef.current) {
        const container = capacitiesContainerRef.current;
        setOverflowing(
          container.scrollHeight > container.clientHeight ||
            container.scrollWidth > container.clientWidth
        );

        if (
          !showAllCapacities &&
          event.related_skills &&
          event.related_skills.length > 2
        ) {
          let optimal = event.related_skills.length;
          for (let i = event.related_skills.length; i > 0; i--) {
            setVisibleCapacities(i);
            setTimeout(() => {
              if (
                container.scrollHeight <= container.clientHeight &&
                container.scrollWidth <= container.clientWidth
              ) {
                optimal = i;
              }
            }, 0);
          }
          if (optimal < event.related_skills.length) {
            setVisibleCapacities(Math.max(1, optimal - 1));
          }
        }
      }
    };

    checkOverflow();
    window.addEventListener("resize", checkOverflow);

    return () => {
      window.removeEventListener("resize", checkOverflow);
    };
  }, [event.related_skills, showAllCapacities]);

  // Function to format time in the desired format (2:00 PM - 2:40 PM (UTC))
  const formatTimeRange = (startDateStr: string, endDateStr: string) => {
    try {
      // Create date objects from the strings
      const startDate = new Date(startDateStr);
      const endDate = new Date(endDateStr);

      // Verify if the dates are valid
      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        throw new Error("Invalid date");
      }

      // Format time in 12h (AM/PM) format
      const formatTime = (date: Date) => {
        let hours = date.getUTCHours();
        const minutes = date.getUTCMinutes();
        const ampm = hours >= 12 ? "PM" : "AM";

        // Convert to 12h format
        hours = hours % 12;
        hours = hours ? hours : 12; // If it's 0, show as 12

        // Add zero to the left for minutes < 10
        const minutesStr = minutes < 10 ? "0" + minutes : minutes;

        return `${hours}:${minutesStr} ${ampm}`;
      };

      // Format start and end times
      const startTime = formatTime(startDate);
      const endTime = formatTime(endDate);

      // Return the desired format
      return `${startTime} - ${endTime} (UTC)`;
    } catch (error) {
      console.error("Error formatting dates:", error);
      return `${startDateStr} - ${endDateStr}`;
    }
  };

  // Function to format date as "Mon, Sep 2023"
  const formatMonthYear = (dateString: string) => {
    try {
      const date = new Date(dateString);

      // Verify if the date is valid
      if (isNaN(date.getTime())) {
        throw new Error("Invalid date");
      }

      // Array with the abbreviated names of the weekdays
      const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

      // Array with the abbreviated names of the months
      const months = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ];

      // Get the abbreviated weekday
      const weekday = weekdays[date.getDay()];

      // Get the abbreviated month
      const month = months[date.getMonth()];

      // Get the day
      const day = date.getDate();

      // Get the year
      const year = date.getFullYear();

      // Return in the format "Mon, 15 Sep 2023"
      return `${weekday}, ${day} ${month} ${year}`;
    } catch (error) {
      console.error("Error formatting date:", error);
      return dateString;
    }
  };

  // Function to handle the event choice
  const handleChoose = (event: Event) => {
    if (!event.id) return;

    // Update local state immediately for visual feedback
    setIsSelected(!isSelected);

    // If the onChoose callback is available, use it to update the organization
    if (onChoose) {
      onChoose(event);
    }
  };

  const toggleCapacitiesView = () => {
    setShowAllCapacities(!showAllCapacities);
  };

  const handleDeleteClick = () => {
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (onDelete && event.id) {
      onDelete(event.id);
    }
  };

  const handleDetailsEvent = (clicked: boolean) => {
    setShowEventDetails(clicked);
  };

  const handleContactClick = () => {
    if (organization?.email) {
      const subject = encodeURIComponent(`About event: ${event.name || ""}`);

      // Try to detect if we're in a browser that handles mailto links
      const isChrome =
        /Chrome/.test(navigator.userAgent) &&
        /Google Inc/.test(navigator.vendor);

      if (isChrome) {
        // For Chrome, open Gmail directly
        window.open(
          `https://mail.google.com/mail/?view=cm&fs=1&to=${organization.email}&su=${subject}`,
          "_blank"
        );
      } else {
        // For other browsers, try the mailto protocol
        window.location.href = `mailto:${organization.email}?subject=${subject}`;
      }
    }
  };

  if (isLoading) {
    return (
      <div className="min-w-[280px] max-w-[320px] h-[300px] flex items-center justify-center">
        <LoadingState />
      </div>
    );
  }

  if (error || !event) {
    return null;
  }

  return (
    <>
      <div
        className={`flex flex-col ${
          darkMode
            ? "bg-capx-dark-box-bg text-white border border-white"
            : "bg-capx-light-box-bg text-capx-dark-box-bg"
        } rounded rounded-[4px] p-4 min-w-[300px] h-fit`}
      >
        <div className="flex flex-col gap-4 pr-5 mx-4 my-4 w-full">
          <div className="flex flex-col gap-2">
            <div className="flex flex-row py-2">
              <h2
                className={`font-extrabold mb-2 ${
                  isMobile ? "text-md" : "text-xl"
                } ${isHorizontalScroll ? "min-h-[60px]" : ""} font-Montserrat ${
                  darkMode ? "text-white" : "text-capx-dark-box-bg"
                }`}
              >
                {event.name}
              </h2>
            </div>
            {organization && !isHorizontalScroll && (
              <p
                className={`text-md mb-2 ${isMobile ? "text-sm" : "text-md"} ${
                  darkMode ? "text-white" : "text-capx-dark-box-bg"
                }`}
              >
                <span className="font-Montserrat">
                  {pageContent["organization-profile-event-organized-by"] ||
                    "Organized by: "}{" "}
                  {""}
                </span>
                <Link
                  href={`/organization_profile/${organization.id}`}
                  className={`${
                    darkMode
                      ? "text-capx-dark-link hover:text-capx-light-bg"
                      : "text-blue-600 hover:text-blue-800 visited:text-blue-800"
                  }`}
                >
                  {organization.display_name}
                </Link>
              </p>
            )}

            <div
              className={`flex ${
                !isHorizontalScroll && !isMobile
                  ? "flex-row gap-8"
                  : "flex-col gap-4"
              }`}
            >
              <div className={`flex gap-4 flex-col`}>
                {event.time_begin && event.time_end && (
                  <div className="flex flex-row gap-2">
                    <Image
                      src={darkMode ? AlarmLightIcon : AlarmDarkIcon}
                      width={isMobile ? 16 : 24}
                      height={isMobile ? 16 : 24}
                      alt="Alarm"
                    />
                    <p
                      className={`font-extrabold ${
                        darkMode ? "text-white" : "text-[#507380]"
                      } ${isMobile ? "text-sm" : "text-md"}`}
                    >
                      {formatTimeRange(event.time_begin, event.time_end)}
                    </p>
                  </div>
                )}

                {event.time_begin && (
                  <div className="flex flex-row gap-2">
                    <Image
                      src={darkMode ? CalendarLightIcon : CalendarDarkIcon}
                      width={isMobile ? 16 : 24}
                      height={isMobile ? 16 : 24}
                      alt="Calendar"
                    />
                    <p
                      className={`font-extrabold ${
                        darkMode ? "text-white" : "text-[#507380]"
                      } ${isMobile ? "text-sm" : "text-md"}`}
                    >
                      {formatMonthYear(event.time_begin)}
                    </p>
                  </div>
                )}
                {event.type_of_location && (
                  <div className="flex flex-row gap-2">
                    <Image
                      src={darkMode ? LocationLightIcon : LocationDarkIcon}
                      width={isMobile ? 16 : 24}
                      height={isMobile ? 16 : 24}
                      alt="Location"
                    />
                    <p
                      className={`font-extrabold ${
                        darkMode ? "text-white" : "text-[#507380]"
                      } ${isMobile ? "text-sm" : "text-md"}`}
                    >
                      {event.type_of_location === "virtual"
                        ? "Online event"
                        : event.type_of_location === "in-person"
                        ? "In-person event"
                        : "Hybrid event"}
                    </p>
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-4 mb-2">
                {event.related_skills && (
                  <div className="flex flex-row gap-2">
                    <Image
                      src={
                        darkMode ? EmojiObjectsLightIcon : EmojiObjectsDarkIcon
                      }
                      width={isMobile ? 16 : 24}
                      height={isMobile ? 16 : 24}
                      alt="Emoji"
                    />
                    <p
                      className={`font-extrabold ${
                        darkMode ? "text-white" : "text-[#507380]"
                      } ${isMobile ? "text-sm" : "text-md"}`}
                    >
                      {pageContent["events-available-capacities"] ||
                        "Available capacities"}
                    </p>
                  </div>
                )}
                <div className="flex flex-row gap-2 justify-between min-h-[30px]">
                  <div
                    ref={capacitiesContainerRef}
                    className={`flex flex-row flex-wrap gap-2 overflow-hidden ${
                      showAllCapacities ? "" : "max-h-[40px]"
                    }`}
                  >
                    {(isMobile || isHorizontalScroll) &&
                      event.related_skills &&
                      event.related_skills
                        .slice(
                          0,
                          showAllCapacities
                            ? event.related_skills.length
                            : visibleCapacities
                        )
                        .map((skill) => (
                          <p
                            key={skill}
                            className={`text-sm px-2 py-1 rounded-[4px] ${
                              darkMode
                                ? "bg-capx-dark-bg text-white"
                                : "bg-capx-dark-box-bg text-white"
                            } rounded-[8px] w-fit ${
                              isMobile ? "text-xs" : "text-sm"
                            }`}
                          >
                            {capacityNames[skill]}
                          </p>
                        ))}

                    {!isMobile &&
                      !isHorizontalScroll &&
                      event.related_skills &&
                      event.related_skills.map((skill) => (
                        <p
                          key={skill}
                          className={`text-sm px-2 py-1 rounded-[4px] ${
                            darkMode
                              ? "bg-capx-dark-bg text-white"
                              : "bg-capx-dark-box-bg text-white"
                          } rounded-[8px] w-fit ${
                            isMobile ? "text-xs" : "text-sm"
                          }`}
                        >
                          {capacityNames[skill]}
                        </p>
                      ))}
                  </div>
                  {(isMobile || isHorizontalScroll) &&
                    event.related_skills &&
                    (event.related_skills.length > visibleCapacities ||
                      overflowing) && (
                      <button
                        onClick={toggleCapacitiesView}
                        className="flex items-center w-fit mr-8"
                      >
                        <Image
                          src={MoreHorizIcon}
                          alt={showAllCapacities ? "Show less" : "Show more"}
                          className="cursor-pointer"
                        />
                      </button>
                    )}
                </div>

                <div
                  className={`flex flex-col gap-2 ${
                    showEventDetails ? "min-h-[100px]" : ""
                  }`}
                >
                  <button
                    className="flex flex-row gap-2 justify-between mr-4"
                    onClick={() => handleDetailsEvent(!showEventDetails)}
                  >
                    <p
                      className={`font-extrabold ${
                        darkMode ? "text-white" : "text-[#507380]"
                      } ${isMobile ? "text-sm" : "text-md"}`}
                    >
                      {pageContent["events-details-of-event"] ||
                        "Details of event"}
                    </p>
                    <Image
                      src={ArrowDropDownIcon}
                      alt="Expand"
                      style={{
                        transform: showEventDetails
                          ? "rotate(180deg)"
                          : "rotate(0deg)",
                        transition: "transform 0.3s ease",
                      }}
                    />
                  </button>
                  {showEventDetails && event.description && (
                    <div
                      className={`flex flex-col gap-4 mt-2 ${
                        darkMode
                          ? "bg-capx-dark-bg bg-opacity-10"
                          : "bg-white bg-opacity-10"
                      } rounded`}
                    >
                      <p
                        className={`text-sm ${
                          darkMode ? "text-white" : "text-[#507380]"
                        } ${isMobile ? "text-xs" : "text-sm"}`}
                      >
                        {event.description}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          {onEdit && onDelete && onChoose && (
            <div className="flex flex-col gap-2 mt-auto mr-2">
              <BaseButton
                label={pageContent["organization-profile-edit-event"] || "Edit"}
                onClick={() => onEdit(event as Event)}
                customClass={`py-2 px-3 rounded-md text-md font-extrabold border ${
                  darkMode
                    ? "border-white text-white hover:bg-capx-dark-bg"
                    : "border-capx-dark-box-bg text-capx-dark-box-bg hover:opacity-90"
                } text-start bg-transparent flex flex-row items-center !mb-0 transition-opacity !pb-2 ${
                  isMobile ? "text-xs" : "text-md"
                }`}
                imageUrl={darkMode ? EditIconLight : EditIcon}
                imageAlt="Edit icon"
                imageWidth={isMobile ? 16 : 24}
                imageHeight={isMobile ? 16 : 24}
              />

              <BaseButton
                label={
                  isSelected
                    ? pageContent["organization-profile-hide-event"] ||
                      "Hide event"
                    : pageContent["organization-profile-choose-event"] ||
                      "Choose event"
                }
                onClick={() => handleChoose(event as Event)}
                customClass={`${
                  isSelected
                    ? darkMode
                      ? "bg-transparent border border-white text-white hover:bg-capx-dark-bg"
                      : "bg-transparent border border-capx-dark-box-bg text-capx-dark-box-bg"
                    : darkMode
                    ? "bg-capx-dark-bg text-white hover:bg-capx-dark-box-bg"
                    : "bg-capx-dark-box-bg text-white"
                } py-2 px-3 rounded-md text-md font-extrabold text-start flex flex-row items-center transition-opacity !pb-2 !mb-0 ${
                  isMobile ? "text-xs" : "text-md"
                }`}
                imageUrl={
                  isSelected ? CheckBoxIcon : CheckBoxOutlineBlankIconLight
                }
                imageAlt="Checkbox icon"
                imageWidth={isMobile ? 16 : 24}
                imageHeight={isMobile ? 16 : 24}
              />

              <BaseButton
                label={
                  pageContent["organization-profile-delete-event"] || "Delete"
                }
                onClick={handleDeleteClick}
                customClass={`py-2 px-3 rounded-md text-md bg-capx-primary-orange flex flex-row items-center !mb-0 text-start text-white font-extrabold hover:opacity-90 transition-opacity !pb-2 ${
                  isMobile ? "text-xs" : "text-md"
                }`}
                imageUrl={DeleteIcon}
                imageAlt="Delete icon"
                imageWidth={isMobile ? 16 : 24}
                imageHeight={isMobile ? 16 : 24}
              />
            </div>
          )}

          {!isHorizontalScroll && (
            <div className="flex flex-row gap-2 my-4">
              <BaseButton
                onClick={handleContactClick}
                customClass={`flex justify-center items-center gap-2 px-8 py-4 rounded-lg text-white font-extrabold rounded-lg ${
                  organization?.email
                    ? darkMode
                      ? "bg-capx-dark-bg hover:bg-white hover:text-capx-dark-bg"
                      : "bg-capx-dark-box-bg"
                    : "bg-gray-400 cursor-not-allowed"
                } text-center not-italic leading-[normal] ${
                  isMobile ? "text-[14px]" : "text-lg"
                }`}
                label={
                  organization?.email ? "Contact" : "No contact email available"
                }
                disabled={!organization?.email}
              />
              <BaseButton
                onClick={() =>
                  event.url && window.open(event.url as string, "_blank")
                }
                customClass={`flex justify-center items-center gap-2 px-8 py-4 rounded-lg ${
                  darkMode
                    ? "bg-capx-secondary-purple hover:bg-capx-primary-green text-white hover:text-capx-dark-bg"
                    : "bg-capx-secondary-purple hover:bg-capx-primary-green text-[#F6F6F6] hover:text-capx-dark-bg"
                } font-extrabold text-3.5 sm:text-3.5 rounded-lg text-center not-italic leading-[normal] ${
                  isMobile ? "text-[14px]" : "text-lg"
                }`}
                label={
                  pageContent["organization-profile-view-event"] || "View Event"
                }
              />
            </div>
          )}
        </div>
      </div>

      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        itemName={event.name || ""}
        itemType="event"
      />
    </>
  );
}
