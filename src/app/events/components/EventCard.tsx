import { Event } from "@/app/api/events/types/Event";
import BaseButton from "@/components/BaseButton";
import Image from "next/image";
import AlarmIcon from "@/public/static/images/alarm.svg";
import LocationIcon from "@/public/static/images/location_on.svg";
import CalendarIcon from "@/public/static/images/calendar_month.svg";
import HourglassIcon from "@/public/static/images/hourglass.svg";

interface EventCardProps {
    event: Partial<Event>;
}

export default function EventCard({ event }: EventCardProps) {
  console.log("event no card: ", event);
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <h2 className="text-lg font-bold">{event.name}</h2>
        <p className="text-sm text-gray-500">Organized by {event.organized_by}</p>
        <div className="flex flex-row gap-2">
          <Image src={AlarmIcon} alt="Alarm" />
          <p className="text-sm text-gray-500">{event.time_begin}</p>
          <p className="text-sm text-gray-500">{event.time_end}</p>
        </div>
        <div className="flex flex-row gap-2">
          <Image src={LocationIcon} alt="Location" />
          <p className="text-sm text-gray-500">{event.location}</p>
        </div>
        <div className="flex flex-row gap-2">
          <Image src={CalendarIcon} alt="Calendar" />
          <p className="text-sm text-gray-500">{event.date}</p>
        </div>
        <div className="flex flex-row gap-2">
          <Image src={HourglassIcon} alt="Hourglass" />
          <p className="text-sm text-gray-500">{event.type_of_location}</p>
        </div>
      </div>
      
      <BaseButton>View Event</BaseButton>
    </div>
  );
}
