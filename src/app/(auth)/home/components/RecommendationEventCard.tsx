'use client';

import Image from 'next/image';
import { useApp } from '@/contexts/AppContext';
import { useTheme } from '@/contexts/ThemeContext';
import BaseButton from '@/components/BaseButton';
import { EventRecommendation } from '@/types/recommendation';
import { formatWikiImageUrl } from '@/lib/utils/fetchWikimediaData';
import lamp_purple from '@/public/static/images/lamp_purple.svg';
import CalendarLightIcon from '@/public/static/images/calendar_month.svg';
import AlarmLightIcon from '@/public/static/images/alarm.svg';
import LocationLightIcon from '@/public/static/images/location_on.svg';
import { useRouter } from 'next/navigation';
import { getLocaleFromLanguage } from '@/lib/utils/dateLocale';

interface RecommendationEventCardProps {
  recommendation: EventRecommendation;
  onSave?: (id: number) => void;
}

export default function RecommendationEventCard({
  recommendation,
  onSave,
}: RecommendationEventCardProps) {
  const { pageContent, language } = useApp();
  const { darkMode } = useTheme();
  const router = useRouter();

  const handleViewEvent = () => {
    if (recommendation.view_event_link) {
      router.push(recommendation.view_event_link);
    } else if (recommendation.id) {
      router.push(`/events/${recommendation.id}`);
    }
  };

  const handleSave = () => {
    if (onSave) {
      onSave(recommendation.id);
    }
  };

  const formatTime = (dateString: string) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        throw new Error('Invalid date');
      }
      const locale = getLocaleFromLanguage(language || 'en');
      return date.toLocaleTimeString(locale, {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      });
    } catch {
      return dateString;
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        throw new Error('Invalid date');
      }
      const locale = getLocaleFromLanguage(language || 'en');
      return date.toLocaleDateString(locale, {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return dateString;
    }
  };

  const timeRange =
    recommendation.time_begin && recommendation.time_end
      ? `${formatTime(recommendation.time_begin)} - ${formatTime(recommendation.time_end)} (UTC)`
      : recommendation.time_begin
        ? `${formatTime(recommendation.time_begin)} (UTC)`
        : '';

  return (
    <div
      className={`flex h-full flex-col justify-between items-start p-4 rounded-md w-[270px] md:w-[370px] border min-h-[400px] md:min-h-[450px] ${
        darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      }`}
    >
      {recommendation.capacities_hint && (
        <div className="flex items-center justify-start gap-2 mb-4">
          <div className="relative w-[15px] h-[15px] md:w-[30px] md:h-[30px]">
            <Image src={lamp_purple} alt="" fill className="object-contain" priority />
          </div>
          <p
            className={`text-[10px] md:text-[18px] ${
              darkMode ? 'text-gray-300' : 'text-gray-500'
            }`}
          >
            {pageContent['recommendation-based-on-capacities'] || 'Based on your capacities'}
          </p>
        </div>
      )}

      <div className="flex items-center gap-4 mb-4 w-full">
        <div className="relative w-[60px] h-[60px] md:w-[80px] md:h-[80px]">
          <Image
            src={CalendarLightIcon}
            alt={recommendation.name}
            fill
            className="object-contain"
            priority
          />
        </div>
        <div className="flex-1">
          <h3
            className={`text-[16px] md:text-[24px] font-bold mb-2 ${
              darkMode ? 'text-white' : 'text-capx-dark-box-bg'
            }`}
          >
            {recommendation.name}
          </h3>
          {recommendation.organization_name && (
            <p
              className={`text-[12px] md:text-[16px] mb-2 ${
                darkMode ? 'text-gray-300' : 'text-[#053749]'
              }`}
            >
              by: {recommendation.organization_name}
            </p>
          )}
        </div>
      </div>

      <div
        className={`flex flex-col gap-2 mb-4 w-full text-[12px] md:text-[14px] ${
          darkMode ? 'text-gray-300' : 'text-gray-600'
        }`}
      >
        {timeRange && (
          <div className="flex items-center gap-2">
            <div className="relative w-[16px] h-[16px]">
              <Image src={AlarmLightIcon} alt="" fill className="object-contain" />
            </div>
            <span>{timeRange}</span>
          </div>
        )}
        {recommendation.time_begin && (
          <div className="flex items-center gap-2">
            <div className="relative w-[16px] h-[16px]">
              <Image src={CalendarLightIcon} alt="" fill className="object-contain" />
            </div>
            <span>{formatDate(recommendation.time_begin)}</span>
          </div>
        )}
        {recommendation.type_of_location && (
          <div className="flex items-center gap-2">
            <div className="relative w-[16px] h-[16px]">
              <Image src={LocationLightIcon} alt="" fill className="object-contain" />
            </div>
            <span>
              {recommendation.type_of_location === 'virtual'
                ? 'Online event'
                : recommendation.type_of_location === 'in_person'
                  ? 'In-person event'
                  : recommendation.type_of_location}
            </span>
          </div>
        )}
        {recommendation.language && (
          <div className="flex items-center gap-2">
            <span className="text-[12px] md:text-[14px]">{recommendation.language}</span>
          </div>
        )}
      </div>

      <div className="flex items-center justify-start gap-2 w-full mt-auto">
        <BaseButton
          onClick={handleViewEvent}
          customClass="flex justify-center items-center gap-2 px-4 py-2 rounded-lg text-[14px] text-white font-extrabold bg-[#053749] hover:bg-[#04222F] md:text-[16px] md:px-6 md:py-3"
          label={pageContent['view-event'] || 'View Event'}
        />
        <BaseButton
          onClick={handleSave}
          customClass={`flex justify-center items-center gap-2 px-4 py-2 rounded-lg text-[14px] font-extrabold border-2 md:text-[16px] md:px-6 md:py-3 ${
            darkMode
              ? 'text-white border-white bg-transparent hover:bg-gray-700'
              : 'text-[#053749] border-[#053749] bg-white hover:bg-gray-50'
          }`}
          label={pageContent['save'] || 'Save'}
        />
      </div>
    </div>
  );
}

