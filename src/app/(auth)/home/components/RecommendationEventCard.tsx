'use client';

import Image from 'next/image';
import { useApp } from '@/contexts/AppContext';
import { useTheme } from '@/contexts/ThemeContext';
import BaseButton from '@/components/BaseButton';
import { EventRecommendation } from '@/types/recommendation';
import { formatWikiImageUrl } from '@/lib/utils/fetchWikimediaData';
import lamp_purple from '@/public/static/images/lamp_purple.svg';
import CalendarLightIcon from '@/public/static/images/calendar_month.svg';
import CalendarDarkIcon from '@/public/static/images/calendar_month_dark.svg';
import AlarmLightIcon from '@/public/static/images/alarm.svg';
import AlarmDarkIcon from '@/public/static/images/alarm_dark.svg';
import LocationLightIcon from '@/public/static/images/location_on.svg';
import LocationDarkIcon from '@/public/static/images/location_on_dark.svg';
import { useRouter } from 'next/navigation';
import { getLocaleFromLanguage } from '@/lib/utils/dateLocale';
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { organizationProfileService } from '@/services/organizationProfileService';
import LanguageIcon from '@/public/static/images/language.svg';
import LanguageIconWhite from '@/public/static/images/language_white.svg';

interface RecommendationEventCardProps {
  recommendation: EventRecommendation;
  onSave?: (id: number) => void;
  hintMessage?: string;
}

export default function RecommendationEventCard({
  recommendation,
  onSave,
  hintMessage,
}: RecommendationEventCardProps) {
  const { pageContent, language } = useApp();
  const { darkMode } = useTheme();
  const router = useRouter();
  const { data: session } = useSession();
  const [organizationName, setOrganizationName] = useState<string | null>(recommendation.organization_name || null);

  // Fetch organization name if we have organization ID but no name
  useEffect(() => {
    const fetchOrganizationName = async () => {
      if (recommendation.organization && !organizationName && session?.user?.token) {
        try {
          const orgData = await organizationProfileService.getOrganizationById(
            session.user.token,
            recommendation.organization
          );
          if (orgData?.display_name) {
            setOrganizationName(orgData.display_name);
          }
        } catch (error) {
          console.error('Error fetching organization name:', error);
        }
      }
    };

    fetchOrganizationName();
  }, [recommendation.organization, organizationName, session?.user?.token]);

  const handleViewEvent = () => {
    if (recommendation.url) {
      window.open(recommendation.url, '_blank', 'noopener,noreferrer');
    } else if (recommendation.view_event_link) {
      router.push(recommendation.view_event_link);
    } else if (recommendation.id) {
      router.push(`/events/${recommendation.id}`);
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
      className={`flex h-full flex-col justify-between items-start p-4 rounded-md w-[270px] md:w-[370px] border min-h-[350px] md:min-h-[400px] ${
        darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      }`}
    >
      {hintMessage && (
        <div className="flex items-center justify-start gap-2 mb-4">
          <div className="relative w-[15px] h-[15px] md:w-[20px] md:h-[20px]">
            <Image src={lamp_purple} alt="" fill className="object-contain" priority />
          </div>
          <p
            className={`text-[10px] md:text-[14px] ${
              darkMode ? 'text-gray-300' : 'text-gray-500'
            }`}
          >
            {hintMessage}
          </p>
        </div>
      )}

      <div className="flex items-start gap-4 mb-3 w-full">
        <div className="relative w-[60px] h-[60px] md:w-[80px] md:h-[80px] flex-shrink-0">
          <Image
            src={darkMode ? CalendarLightIcon : CalendarDarkIcon}
            alt={recommendation.name}
            fill
            className="object-contain"
            priority
          />
        </div>
        <div className="flex-1 min-w-0">
          <h3
            className={`text-[16px] md:text-[24px] font-bold mb-2 break-words ${
              darkMode ? 'text-white' : 'text-capx-dark-box-bg'
            }`}
          >
            {recommendation.name}
          </h3>
          {organizationName && (
            <p
              className={`text-[12px] md:text-[16px] mb-2 truncate ${
                darkMode ? 'text-gray-300' : 'text-[#053749]'
              }`}
            >
              by: {organizationName}
            </p>
          )}
        </div>
      </div>

      <div
        className={`flex flex-col gap-2 mb-2 w-full text-[12px] md:text-[14px] ${
          darkMode ? 'text-gray-300' : 'text-gray-600'
        }`}
      >
        {timeRange && (
          <div className="flex items-center gap-2">
            <div className="relative w-[16px] h-[16px]">
              <Image 
                src={darkMode ? AlarmLightIcon : AlarmDarkIcon} 
                alt="" 
                fill 
                className="object-contain" 
              />
            </div>
            <span>{timeRange}</span>
          </div>
        )}
        {recommendation.time_begin && (
          <div className="flex items-center gap-2">
            <div className="relative w-[16px] h-[16px]">
              <Image 
                src={darkMode ? CalendarLightIcon : CalendarDarkIcon} 
                alt="" 
                fill 
                className="object-contain" 
              />
            </div>
            <span>{formatDate(recommendation.time_begin)}</span>
          </div>
        )}
        {recommendation.type_of_location && (
          <div className="flex items-center gap-2">
            <div className="relative w-[16px] h-[16px]">
              <Image 
                src={darkMode ? LocationLightIcon : LocationDarkIcon} 
                alt="" 
                fill 
                className="object-contain" 
              />
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
            <div className="relative w-[16px] h-[16px]">
              <Image 
                src={darkMode ? LanguageIconWhite : LanguageIcon} 
                alt="" 
                fill 
                className="object-contain" 
              />
            </div>
            <span>{recommendation.language}</span>
          </div>
        )}
      </div>

      <div className="flex items-center justify-start gap-2 w-full mt-auto pt-2">
        <BaseButton
          onClick={handleViewEvent}
          customClass="flex justify-center items-center gap-2 px-4 py-2 rounded-lg text-[14px] text-white font-extrabold bg-[#053749] hover:bg-[#04222F] md:text-[16px] md:px-6 md:py-3 flex-shrink-0"
          label={pageContent['view-event'] || 'View Event'}
        />
      </div>
    </div>
  );
}

