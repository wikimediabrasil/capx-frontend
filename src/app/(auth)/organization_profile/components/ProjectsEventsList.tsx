import Image from "next/image";
import WikimediaIcon from "@/public/static/images/wikimedia_logo_black.svg";
import WikimediaIconWhite from "@/public/static/images/wikimedia_logo_white.svg";
import { useApp } from "@/contexts/AppContext";
import { useTheme } from "@/contexts/ThemeContext";
import { ProjectCard } from "./ProjectCard";
import EventCard from "./EventCard";

interface ProjectsEventsListProps {
  title: string;
  type: "projects" | "events";
  itemIds?: number[];
  token?: string;
}

export const ProjectsEventsList = ({
  title,
  type,
  itemIds = [],
  token,
}: ProjectsEventsListProps) => {
  const { darkMode } = useTheme();
  const { isMobile } = useApp();

  if (itemIds.length === 0) {
    return null;
  }

  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-row gap-4 items-center">
        <div
          className={`relative ${
            isMobile ? "w-[20px] h-[20px]" : "w-[42px] h-[42px]"
          }`}
        >
          <Image
            src={darkMode ? WikimediaIconWhite : WikimediaIcon}
            alt="Wikimedia icon"
            style={{ width: "auto", height: "auto" }}
          />
        </div>
        <h2
          className={`text-center not-italic font-extrabold leading-[29px] font-[Montserrat] ${
            darkMode ? "text-[#F6F6F6]" : "text-[#003649]"
          } ${isMobile ? "text-[14px]" : "text-[24px]"}`}
        >
          {title}
        </h2>
      </div>
      <div className="flex flex-row gap-8 justify-start overflow-x-auto scrollbar-hide">
        {itemIds.map((id) =>
          type === "projects" ? (
            <ProjectCard key={id} projectId={id} token={token} />
          ) : (
            <EventCard key={id} eventId={id} token={token} />
          )
        )}
      </div>
    </section>
  );
};
