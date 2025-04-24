import { Event } from "@/types/event";
import BaseButton from "@/components/BaseButton";
import Image from "next/image";
import CheckBoxOutlineBlankIcon from "@/public/static/images/check_box_outline_blank.svg";
import CheckBoxOutlineBlankIconLight from "@/public/static/images/check_box_outline_blank_light.svg";
import CheckBoxIcon from "@/public/static/images/check_box.svg";
import CheckBoxIconLight from "@/public/static/images/check_box_light.svg";
import MoreHorizIcon from "@/public/static/images/more_horiz.svg";
import { useTheme } from "@/contexts/ThemeContext";
import { useApp } from "@/contexts/AppContext";
import { useEffect, useState, useRef } from "react";
import { useOrganization } from "@/hooks/useOrganizationProfile";
import { useSession } from "next-auth/react";
import { useCapacityDetails } from "@/hooks/useCapacityDetails";

interface EventCardProps {
  event: Partial<Event>;
  isHorizontalScroll?: boolean;
  isFeatured?: boolean;
  isEditMode?: boolean;
  onChoose?: (event: Event) => void;
}

export function EventCard({
  event,
  isHorizontalScroll = false,
  isEditMode = false,
  onChoose,
}: EventCardProps) {
  const { darkMode } = useTheme();
  const { pageContent } = useApp();
  const { data: session } = useSession();
  const token = session?.user?.token;
  const [isSelected, setIsSelected] = useState(false);
  const [showAllCapacities, setShowAllCapacities] = useState(false);
  const [visibleCapacities, setVisibleCapacities] = useState(3);
  const [overflowing, setOverflowing] = useState(false);
  const capacitiesContainerRef = useRef<HTMLDivElement>(null);

  const { organization } = useOrganization(token, event.organization as number);
  const { getCapacityName } = useCapacityDetails(
    event.related_skills as number[]
  );

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
          // Try to find the optimal number of visible capacities that fit in one line
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

  // Verificar se o evento está na lista choose_events da organização
  useEffect(() => {
    if (organization && event.id) {
      const isEventChosen =
        Array.isArray(organization.choose_events) &&
        organization.choose_events.includes(event.id);
      setIsSelected(isEventChosen);
    }
  }, [organization, event.id]);

  // Toggle capacities view (expand/collapse)
  const toggleCapacitiesView = () => {
    setShowAllCapacities(!showAllCapacities);
  };

  // Handle clicking the "Choose Event" button
  const handleChooseEvent = () => {
    // Update local state immediately for visual feedback
    setIsSelected(!isSelected);

    if (onChoose && event.id) {
      onChoose(event as Event);
    }
  };

  return (
    <div
      className={`flex flex-col bg-capx-light-box-bg rounded rounded-[4px] p-4 min-w-[300px] max-w-[350px] h-fit relative ${
        darkMode ? "text-white" : "text-capx-dark-box-bg"
      }`}
    >
      <div className="flex flex-col gap-4 pr-5 mx-4 my-4">
        <div className="flex flex-col gap-2">
          <div className="flex flex-row min-h-[110px] py-2">
            <h2 className="text-xl font-extrabold mb-2 text-capx-dark-box-bg font-Montserrat">
              {event.name}
            </h2>
          </div>

          {/* Display related capacities/skills */}
          {event.related_skills && event.related_skills.length > 0 && (
            <>
              <p className="text-md font-extrabold text-[#507380] mb-2">
                {pageContent["events-available-capacities"] ||
                  "Available capacities"}
              </p>
              <div className="flex flex-row gap-2 justify-between">
                <div
                  ref={capacitiesContainerRef}
                  className={`flex flex-row flex-wrap gap-2 overflow-hidden ${
                    showAllCapacities ? "" : "max-h-[40px]"
                  }`}
                >
                  {event.related_skills
                    .slice(
                      0,
                      showAllCapacities
                        ? event.related_skills.length
                        : visibleCapacities
                    )
                    .map((skillId, index) => (
                      <span
                        key={index}
                        className="text-sm px-2 py-1 rounded-[8px] bg-capx-dark-box-bg text-white w-fit"
                      >
                        {getCapacityName(skillId)}
                      </span>
                    ))}
                </div>
                {event.related_skills &&
                  (event.related_skills.length > visibleCapacities ||
                    overflowing) && (
                    <button
                      onClick={toggleCapacitiesView}
                      className="flex items-center w-fit mr-2 shrink-0"
                    >
                      <Image
                        src={MoreHorizIcon}
                        alt={showAllCapacities ? "Show less" : "Show more"}
                        className="cursor-pointer"
                        width={24}
                        height={24}
                      />
                    </button>
                  )}
              </div>
            </>
          )}
        </div>

        <div className="flex flex-col gap-2">
          {isEditMode && onChoose && (
            <BaseButton
              label={
                isSelected
                  ? pageContent["organization-profile-remove-featured"] ||
                    "Remover destaque"
                  : pageContent["organization-profile-add-featured"] ||
                    "Destacar evento"
              }
              onClick={handleChooseEvent}
              customClass={`${
                isSelected
                  ? "bg-transparent border border-capx-dark-box-bg text-capx-dark-box-bg"
                  : "bg-capx-dark-box-bg text-white"
              } py-2 px-3 rounded-md text-md font-extrabold text-start flex flex-row items-center hover:opacity-90 transition-opacity !pb-2 !mb-2`}
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
          )}

          <BaseButton
            onClick={() =>
              event.url && window.open(event.url as string, "_blank")
            }
            customClass={`flex justify-center items-center gap-2 px-8 py-4 rounded-lg text-white font-extrabold rounded-lg bg-capx-secondary-purple text-center not-italic leading-[normal] text-lg mt-auto`}
            label={
              pageContent["organization-profile-view-event"] || "View Event"
            }
          />
        </div>
      </div>
    </div>
  );
}
