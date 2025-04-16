"use client";

import { useTheme } from "@/contexts/ThemeContext";
import { Event } from "@/types/event";
import { Capacity } from "@/types/capacity";
import EventCard from "./EventCard";
import { useApp } from "@/contexts/AppContext";
import Image from "next/image";
import AddIcon from "@/public/static/images/add_dark.svg";
import AddIconWhite from "@/public/static/images/add.svg";
import { useMemo } from "react";

interface EventsCardListProps {
  events: Event[];
  capacities: Capacity[];
  onEdit: (event: Event) => void;
  onDelete: (eventId: number) => void;
  onChoose: (event: Event) => void;
  onAdd?: () => void;
}

export default function EventsCardList({ 
  events, 
  capacities, 
  onEdit, 
  onDelete, 
  onChoose, 
  onAdd 
}: EventsCardListProps) {
  const { darkMode } = useTheme();
  const { pageContent } = useApp();

  // Usar useMemo para ordenar eventos apenas quando a lista mudar
  const sortedEvents = useMemo(() => 
    [...events].sort((a, b) => 
      new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
    ),
    [events]
  );

  // Renderizar a mensagem de "sem eventos" como um componente separado
  const NoEventsMessage = () => (
    <div className={`w-full py-8 text-center ${darkMode ? "text-white" : "text-[#053749]"}`}>
      {pageContent["organization-profile-no-events"] || "Não há eventos"}
    </div>
  );

  return (
    <div className="flex flex-col w-full">
      <div className="flex justify-between items-center mb-4">
        <h2 className={`text-2xl font-bold ${darkMode ? "text-white" : "text-[#053749]"}`}>
          {pageContent["organization-profile-events"] || "Eventos"}
        </h2>
      </div>

      <div className="overflow-x-auto scrollbar-hide pb-4">
        <div className="flex flex-nowrap gap-2">
          {sortedEvents.length > 0 ? (
            sortedEvents.map((event) => (
              <EventCard
                key={event.id || `temp-${event.name}`}
                event={event}
                capacities={capacities}
                onEdit={onEdit}
                onDelete={onDelete}
                onChoose={onChoose}
              />
            ))
          ) : (
            <NoEventsMessage />
          )}
        </div>
      </div>
    </div>
  );
} 