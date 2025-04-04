import { Event } from "@/app/api/events/types/Event";
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
import { useSession } from "next-auth/react";
import { useTheme } from "@/contexts/ThemeContext";
import { useApp } from "@/contexts/AppContext";

interface EventCardProps {
    event: Partial<Event>;
}

export default function EventCard({ event }: EventCardProps) {
  const { darkMode } = useTheme();
  const { pageContent, isMobile } = useApp();
  
  console.log("event no card: ", event);


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
        const ampm = hours >= 12 ? 'PM' : 'AM';
        
        // Converter para formato 12h
        hours = hours % 12;
        hours = hours ? hours : 12; // Se for 0, mostrar como 12
        
        // Adicionar zero à esquerda para minutos < 10
        const minutesStr = minutes < 10 ? '0' + minutes : minutes;
        
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
      const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      
      // Array com os nomes abreviados dos meses
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      
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

  return (
    <div className={`"flex flex-col gap-4 border border-[#8B97A8] 
    rounded-[4px] p-4" ${darkMode ? "text-white" : "bg-white text-gray-800"}`}>
      <div className="flex flex-col md:flex-row gap-4 mx-4 my-4"> 
        <div className="flex-1">
          <h2 className="text-xl font-bold mb-2">{event.name}</h2>
          
          {event.organized_by && (
            <p className="text-lg mb-2">
              <span className="font-semibold">Organized by:</span> {event.organized_by}
            </p>
          )}
          
          <div className="flex flex-col gap-2 mb-4">
            {event.time_begin && event.time_end && (
              <div className="flex flex-row gap-2">
                <Image src={darkMode ?  AlarmIcon :  AlarmDarkIcon} 
                  alt="Alarm" />
                <p className="text-lg font-extrabold">
                  {formatTimeRange(event.time_begin, event.time_end)}
                </p>
              </div>
            )}

            {event.time_begin && (
              <div className="flex flex-row gap-2">
                <Image src={darkMode ? CalendarIcon : CalendarDarkIcon} 
                  alt="Calendar" />
                <p className="text-lg font-extrabold">
                  {formatMonthYear(event.time_begin)}
                </p>
              </div>
            )}
            {event.type_of_location && (
              <div className="flex flex-row gap-2">
                <Image src={darkMode ?  LocationIcon :  LocationDarkIcon} 
                  alt="Location" />
                <p className="text-lg font-extrabold">
                  {event.type_of_location === "virtual" ? "Online event" : event.type_of_location === "in-person" ? "In-person event" : "Hybrid event"}
                </p>
              </div>
            )}

            {event.related_tags && (
              <div className="flex flex-row gap-2">
                <Image src={darkMode ?  TagIcon :  TagDarkIcon} 
                  alt="Tag" />
                <p className="text-lg font-extrabold">
                  {event.related_tags}
                </p>
              </div>
            )}
          </div>
          
          
        </div>
      </div>
      <div className="flex flex-row gap-2 my-4 mx-4">
        <BaseButton customClass={` bg-white text-capx-dark-bg border border-capx-dark-bg ${isMobile ? "text-sm" : "text-md"}`} label="Contact" />
        <BaseButton customClass={`text-md ${isMobile ? "text-sm" : "text-md"}`} label="View Event" />
      </div>
      
    </div>
  );
}
