"use client";

import { EventsBanner } from "./EventsBanner";
import EventsList from "./EventsList";
import { useEvents } from "@/hooks/useEvents";
import { Session } from "next-auth";
import { useSession } from "next-auth/react";

export default function EventsMainWrapper() {
  const { data: session } = useSession();
  const token = session?.user?.token;
  const { events, isLoading: isEventsLoading, error: eventsError } = useEvents(token, 10, 0);
  return (
    <div className="flex flex-col gap-4 mx-12">
      <EventsBanner />
      <EventsList events={events} />
    </div>
  );
}
