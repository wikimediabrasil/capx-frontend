"use client";

import { useTheme } from "@/contexts/ThemeContext";
import { Event } from "@/types/event";
import { Capacity } from "@/types/capacity";
import EventCard from "./EventCard";
import { useApp } from "@/contexts/AppContext";
import Image from "next/image";
import AddIcon from "@/public/static/images/add_dark.svg";
import AddIconWhite from "@/public/static/images/add.svg";

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

  // Ordenar eventos do mais recente para o mais antigo com base na data de atualização
  const sortedEvents = [...events].sort((a, b) => 
    new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
  );

  return (
    <div className="flex flex-col w-full">
      <div className="flex justify-between items-center mb-4">
        <h2 className={`text-2xl font-bold ${darkMode ? "text-white" : "text-[#053749]"}`}>
          {pageContent["organization-profile-events"]}
        </h2>
        
      </div>

      <div className="overflow-x-auto scrollbar-hide pb-4">
        <div className="flex flex-nowrap gap-2">
          {sortedEvents && sortedEvents.length > 0 ? (
            sortedEvents.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                capacities={capacities}
                onEdit={onEdit}
                onDelete={onDelete}
                onChoose={onChoose}
              />
            ))
          ) : (
            <div className={`w-full py-8 text-center ${darkMode ? "text-white" : "text-[#053749]"}`}>
              {pageContent["organization-profile-no-events"]}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 