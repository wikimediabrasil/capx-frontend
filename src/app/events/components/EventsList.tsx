import { Event } from '@/types/event';
import EventCard from './EventCard';

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
    <div className={isHorizontalScroll ? 'overflow-x-auto scrollbar-hide pb-2' : ''}>
      <div className={isHorizontalScroll ? 'flex flex-nowrap gap-3' : 'flex flex-col gap-4'}>
        {events.map(event => (
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
  );
}
