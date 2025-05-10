import { Event } from "@/types/event";
import EventCard from "./EventCard";

interface EventsListProps {
  events: Event[];
  isHorizontalScroll?: boolean;
  onDelete?: (eventId: number) => void;
  onEdit?: (event: Event) => void;
  onChoose?: (event: Event) => void;
}

export default function EventsList({
  events,
  isHorizontalScroll,
  onDelete,
  onEdit,
  onChoose,
}: EventsListProps) {
  return (
    <div className="flex flex-col gap-4">
      <div
        className={`${
          isHorizontalScroll ? "overflow-x-auto scrollbar-hide pb-4" : ""
        }`}
      >
        <div
          className={`flex flex-nowrap gap-2 ${
            isHorizontalScroll ? "" : "flex flex-col w-full"
          }`}
        >
          {events.map((event) => (
            <EventCard
              key={event.id}
              event={event}
              isHorizontalScroll={isHorizontalScroll}
              onDelete={onDelete}
              onEdit={onEdit}
              onChoose={onChoose}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
