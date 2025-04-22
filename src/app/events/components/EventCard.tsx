import { Event } from "@/types/event";
import BaseButton from "@/components/BaseButton";
import Image from "next/image";
import AlarmIcon from "@/public/static/images/alarm.svg";
import LocationIcon from "@/public/static/images/location_on.svg";
import CalendarIcon from "@/public/static/images/calendar_month.svg";
import HourglassIcon from "@/public/static/images/hourglass.svg";
import AlarmDarkIcon from "@/public/static/images/alarm_dark.svg";
import LocationDarkIcon from "@/public/static/images/location_on_dark.svg";
import CalendarDarkIcon from "@/public/static/images/calendar_month_dark.svg";
import HourglassDarkIcon from "@/public/static/images/hourglass_dark.svg";
import EmojiObjectsDarkIcon from "@/public/static/images/emoji_objects_events.svg";
import EmojiObjectsIcon from "@/public/static/images/emoji_objects_white.svg";
import { useSession } from "next-auth/react";
import { useTheme } from "@/contexts/ThemeContext";
import { useApp } from "@/contexts/AppContext";
import { useCapacityDetails } from "@/hooks/useCapacityDetails";
import { useOrganization } from "@/hooks/useOrganizationProfile";
import MoreHorizIcon from "@/public/static/images/more_horiz.svg";
import ArrowDropDownIcon from "@/public/static/images/arrow_drop_down_circle.svg";
import ArrowDropDownWhiteIcon from "@/public/static/images/arrow_drop_down_circle_white.svg";
import Link from "next/link";

interface EventCardProps {
  event: Partial<Event>;
}

export default function EventCard({ event }: EventCardProps) {
  const { darkMode } = useTheme();
  const { pageContent, isMobile } = useApp();
  const { data: session } = useSession();
  const token = session?.user?.token;

  // Função para formatar horário no formato desejado (2:00 PM - 2:40 PM (UTC))
  const formatTimeRange = (startDateStr: string, endDateStr: string) => {
    try {
      // Criar objetos de data a partir das strings
      const startDate = new Date(startDateStr);
      const endDate = new Date(endDateStr);

      // Verificar se as datas são válidas
      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        throw new Error("Data inválida");
      }

      // Formatar horários no formato 12h (AM/PM)
      const formatTime = (date: Date) => {
        let hours = date.getUTCHours();
        const minutes = date.getUTCMinutes();
        const ampm = hours >= 12 ? "PM" : "AM";

        // Converter para formato 12h
        hours = hours % 12;
        hours = hours ? hours : 12; // Se for 0, mostrar como 12

        // Adicionar zero à esquerda para minutos < 10
        const minutesStr = minutes < 10 ? "0" + minutes : minutes;

        return `${hours}:${minutesStr} ${ampm}`;
      };

      // Formatar os horários de início e fim
      const startTime = formatTime(startDate);
      const endTime = formatTime(endDate);

      // Retornar o formato desejado
      return `${startTime} - ${endTime} (UTC)`;
    } catch (error) {
      console.error("Erro ao formatar datas:", error);
      return `${startDateStr} - ${endDateStr}`;
    }
  };

  // Função para formatar data como "Mon, Sep 2023"
  const formatMonthYear = (dateString: string) => {
    try {
      const date = new Date(dateString);

      // Verificar se a data é válida
      if (isNaN(date.getTime())) {
        throw new Error("Data inválida");
      }

      // Array com os nomes abreviados dos dias da semana
      const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

      // Array com os nomes abreviados dos meses
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

      // Obter o dia da semana abreviado
      const weekday = weekdays[date.getDay()];

      // Obter o mês abreviado
      const month = months[date.getMonth()];

      // Obter o ano
      const year = date.getFullYear();

      // Retornar no formato "Mon, Sep 2023"
      return `${weekday}, ${month} ${year}`;
    } catch (error) {
      console.error("Erro ao formatar data:", error);
      return dateString;
    }
  };

  const { capacityNames } = useCapacityDetails(event.related_skills || []);

  const { organization } = useOrganization(token, event.organization);

  return (
    <div
      className={`flex flex-col bg-capx-light-box-bg rounded rounded-[4px] p-4 ${
        darkMode ? "text-white" : "text-capx-dark-box-bg"
      }`}
    >
      <div className="flex gap-4 mx-4 my-4 w-full justify-between">
        <div className="flex flex-col gap-2">
          <h2 className="text-xl font-extrabold mb-2 text-capx-dark-box-bg font-Montserrat">
            {event.name}
          </h2>

          {organization && (
            <p className="text-md mb-2">
              <span className="font-Montserrat">
                {pageContent["organization-profile-event-organized-by"] ||
                  "Organized by: "}
              </span>
              <Link
                href={`/organization_profile/${organization.id}`}
                className="text-blue-600 hover:text-blue-800 visited:text-blue-800"
              >
                {" "}
                {organization.display_name}
              </Link>
            </p>
          )}

          <div className={`flex gap-4 ${isMobile ? "flex-col" : "flex-row"}`}>
            <div className="flex flex-col gap-4 mb-2">
              {event.time_begin && event.time_end && (
                <div className="flex flex-row gap-2">
                  <Image
                    src={darkMode ? AlarmIcon : AlarmDarkIcon}
                    width={24}
                    height={24}
                    alt="Alarm"
                  />
                  <p className="text-md font-extrabold text-[#507380]">
                    {formatTimeRange(event.time_begin, event.time_end)}
                  </p>
                </div>
              )}

              {event.time_begin && (
                <div className="flex flex-row gap-2">
                  <Image
                    src={darkMode ? CalendarIcon : CalendarDarkIcon}
                    width={24}
                    height={24}
                    alt="Calendar"
                  />
                  <p className="text-md font-extrabold text-[#507380]">
                    {formatMonthYear(event.time_begin)}
                  </p>
                </div>
              )}
              {event.type_of_location && (
                <div className="flex flex-row gap-2">
                  <Image
                    src={darkMode ? LocationIcon : LocationDarkIcon}
                    width={24}
                    height={24}
                    alt="Location"
                  />
                  <p className="text-md font-extrabold text-[#507380]">
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
                    src={darkMode ? EmojiObjectsIcon : EmojiObjectsDarkIcon}
                    width={24}
                    height={24}
                    alt="Emoji"
                  />
                  <p className="text-md font-extrabold text-[#507380]">
                    {pageContent["events-available-capacities"] ||
                      "Available capacities"}
                  </p>
                </div>
              )}
              <div className="flex flex-row gap-2 justify-between">
                <div className="flex flex-row gap-2">
                  {event.related_skills &&
                    event.related_skills.map((skill) => (
                      <p
                        key={skill}
                        className="text-sm px-2 py-1 rounded-[4px] bg-capx-dark-box-bg text-white rounded-[8px] w-fit"
                      >
                        {capacityNames[skill]}
                      </p>
                    ))}
                  {isMobile && <Image src={MoreHorizIcon} alt="More" />}
                </div>
              </div>
              {isMobile && (
                <div className="flex flex-row gap-2 justify-between">
                  <Link
                    className="flex flex-row gap-2"
                    href={`/organization_profile/${event.organization}`}
                  >
                    <p className="text-md font-extrabold text-[#507380]">
                      {pageContent["events-details-of-event"] ||
                        "Details of event"}
                    </p>
                    <Image src={ArrowDropDownIcon} alt="Expand" />
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <div className="flex flex-row gap-2 my-4 mx-4">
        <BaseButton
          onClick={() => {}}
          customClass={`flex justify-center items-center gap-2 px-8 py-4 rounded-lg text-white font-extrabold rounded-lg bg-capx-dark-box-bg text-center not-italic leading-[normal] ${
            isMobile ? "text-[14px]" : "text-lg"
          }`}
          label="Contact"
        />
        <BaseButton
          onClick={() => {}}
          customClass={`flex justify-center items-center gap-2 px-8 py-4 rounded-lg bg-capx-secondary-purple hover:bg-capx-primary-green text-[#F6F6F6] hover:text-capx-dark-bg font-extrabold text-3.5 sm:text-3.5 rounded-lg text-center not-italic leading-[normal] ${
            isMobile ? "text-[14px]" : "text-lg"
          }`}
          label="View Event"
        />
      </div>
    </div>
  );
}
