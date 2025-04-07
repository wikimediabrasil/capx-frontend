"use client";

import { EventsBanner } from "./EventsBanner";
import { EventsSearch } from "./EventsSearch";
import { useSession } from "next-auth/react";
import { useState } from "react";

export default function EventsMainWrapper() {
  const { data: session } = useSession();
  const [isSearching, setIsSearching] = useState(false);

  const handleSearchStart = () => {
    setIsSearching(true);
  };

  const handleSearchEnd = () => {
    setIsSearching(false);
  };

  return (
    <div className="flex flex-col gap-4 mx-12">
      <EventsBanner />
      <EventsSearch 
        onSearchStart={handleSearchStart}
        onSearchEnd={handleSearchEnd}
      />
    </div>
  );
}
