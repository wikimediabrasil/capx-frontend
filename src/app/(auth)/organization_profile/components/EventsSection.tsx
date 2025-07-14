import Image from 'next/image';
import WikimediaIcon from '@/public/static/images/wikimedia_logo_black.svg';
import WikimediaIconWhite from '@/public/static/images/wikimedia_logo_white.svg';
import { useApp } from '@/contexts/AppContext';
import { useTheme } from '@/contexts/ThemeContext';
import { EventCard } from './EventCard';
import { useEffect, useState } from 'react';
import { Event } from '@/types/event';
import axios from 'axios';
import LoadingState from '@/components/LoadingState';

interface EventsSectionProps {
  title: string;
  itemIds?: number[];
  token?: string;
  isFeatured?: boolean;
}

export default function EventsSection({
  title,
  itemIds = [],
  token,
  isFeatured = false,
}: EventsSectionProps) {
  const { darkMode } = useTheme();
  const { isMobile, pageContent } = useApp();
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEvents = async () => {
      if (!itemIds.length || !token) return;

      setIsLoading(true);
      setError(null);

      try {
        const validEventIds = itemIds.filter(id => id !== null && id !== undefined);

        if (validEventIds.length === 0) {
          setEvents([]);
          setIsLoading(false);
          return;
        }

        const eventsPromises = validEventIds.map(id =>
          axios.get(`/api/events/${id}/`, {
            headers: { Authorization: `Token ${token}` },
          })
        );

        const results = await Promise.all(eventsPromises);
        const loadedEvents = results.map(res => res.data).filter(Boolean);

        setEvents(loadedEvents);
      } catch (err) {
        console.error(`Error fetching ${isFeatured ? 'featured' : ''} events:`, err);
        setError(`Failed to load ${isFeatured ? 'featured' : ''} events`);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvents();
  }, [itemIds, token, isFeatured]);

  if (itemIds.length === 0) {
    return null;
  }

  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-row gap-4 items-center">
        <div className={`relative ${isMobile ? 'w-[20px] h-[20px]' : 'w-[42px] h-[42px]'}`}>
          <Image
            src={darkMode ? WikimediaIconWhite : WikimediaIcon}
            alt="Wikimedia icon"
            style={{ width: 'auto', height: 'auto' }}
          />
        </div>
        <h2
          className={`text-center not-italic font-extrabold leading-[29px] font-[Montserrat] ${
            darkMode ? 'text-[#F6F6F6]' : 'text-[#003649]'
          } ${isMobile ? 'text-[14px]' : 'text-[24px]'}`}
        >
          {title}
        </h2>
      </div>
      <div
        className={`flex flex-row gap-8 justify-start overflow-x-auto scrollbar-hide ${
          isFeatured ? 'bg-capx-primary-purple bg-opacity-10 p-4 rounded-lg' : ''
        }`}
      >
        {isLoading ? (
          <LoadingState />
        ) : error ? (
          <p className="text-center py-4 text-red-500">{error}</p>
        ) : events && events.length > 0 ? (
          events.map(event => (
            <EventCard
              key={event.id}
              event={event}
              isHorizontalScroll={true}
              isFeatured={isFeatured}
            />
          ))
        ) : (
          <p className="text-center py-4">
            {pageContent['no-events-found'] || 'Nenhum evento encontrado'}
          </p>
        )}
      </div>
    </section>
  );
}
