import { Event } from "@/types/event";
import EventCard from "./EventCard";

interface EventsListProps {
  events: Event[];
}

export default function EventsList({ events }: EventsListProps) {
  console.log("events no list: ", events);
  return (
    <div className="flex flex-col gap-4">
      {events.map((event) => (
        <EventCard key={event.id} event={event} />
      ))}
    </div>
  );
}
