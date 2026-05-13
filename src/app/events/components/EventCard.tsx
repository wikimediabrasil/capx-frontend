'use client';

import BaseButton from '@/components/BaseButton';
import DeleteConfirmationModal from '@/components/DeleteConfirmationModal';
import { useOrganizationNames } from '@/hooks/useOrganizationNames';
import { useOrganization } from '@/hooks/useOrganizationProfile';
import { getLocaleFromLanguage } from '@/lib/utils/dateLocale';
import { getOrganizationDisplayName } from '@/lib/utils/getOrganizationDisplayName';
import CheckBoxIcon from '@/public/static/images/check_box.svg';
import CheckBoxOutlineBlankIconLight from '@/public/static/images/check_box_outline_blank_light.svg';
import DeleteIcon from '@/public/static/images/delete.svg';
import EditIcon from '@/public/static/images/edit.svg';
import EditIconLight from '@/public/static/images/edit_white.svg';
import MoreHorizIcon from '@/public/static/images/more_horiz.svg';
import MoreHorizIconLight from '@/public/static/images/more_horiz_light.svg';
import { useCapacityStore, useDarkMode, useIsMobile, useLanguage, usePageContent } from '@/stores';
import { Event } from '@/types/event';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import EventCardSkeleton from './EventCardSkeleton';

interface EventCardProps {
  event: Partial<Event>;
  isHorizontalScroll?: boolean;
  onEdit?: (event: Event) => void;
  onDelete?: (eventId: number) => void;
  onChoose?: (event: Event) => void;
  isLoading?: boolean;
  error?: boolean;
}

export default function EventCard({
  event,
  isHorizontalScroll,
  onEdit,
  onDelete,
  onChoose,
  isLoading,
  error,
}: EventCardProps) {
  const isMobile = useIsMobile();
  const pageContent = usePageContent();
  const language = useLanguage();
  const { data: session } = useSession();
  const darkMode = useDarkMode();
  const token = session?.user?.token;

  const { getName: getCapacityName, updateLanguage, isLoaded: _isLoaded } = useCapacityStore();
  const { organization } = useOrganization(token, event.organization);
  const { names: organizationNames } = useOrganizationNames({
    organizationId: organization?.id,
    token,
  });

  const [showAllCapacities, setShowAllCapacities] = useState(false);
  const [isSelected, setIsSelected] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const capacitiesContainerRef = useRef<HTMLDivElement>(null);
  const [overflowing, setOverflowing] = useState(false);

  const visibleCapacities = 3;

  useEffect(() => {
    if (language && token) updateLanguage(language, token);
  }, [language, token, updateLanguage]);

  useEffect(() => {
    if (organization && event.id) {
      setIsSelected(
        Array.isArray(organization.choose_events) && organization.choose_events.includes(event.id)
      );
    }
  }, [organization, event.id]);

  useEffect(() => {
    const checkOverflow = () => {
      if (capacitiesContainerRef.current) {
        const c = capacitiesContainerRef.current;
        setOverflowing(c.scrollHeight > c.clientHeight || c.scrollWidth > c.clientWidth);
      }
    };
    checkOverflow();
    window.addEventListener('resize', checkOverflow);
    return () => window.removeEventListener('resize', checkOverflow);
  }, [event.related_skills, showAllCapacities]);

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return dateString;
      const locale = getLocaleFromLanguage(language);
      return date.toLocaleDateString(locale, {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        timeZone: 'UTC',
      });
    } catch {
      return dateString;
    }
  };

  const formatTimeRange = (startDateStr: string, endDateStr: string) => {
    try {
      const startDate = new Date(startDateStr);
      const endDate = new Date(endDateStr);
      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) throw new Error('Invalid date');
      const locale = getLocaleFromLanguage(language);
      const use12Hour = locale.startsWith('en-');
      const fmt = (d: Date) =>
        d.toLocaleTimeString(locale, {
          hour: '2-digit',
          minute: '2-digit',
          hour12: use12Hour,
          timeZone: 'UTC',
        });
      return `${fmt(startDate)} – ${fmt(endDate)} (UTC)`;
    } catch (err) {
      console.error('Error formatting dates:', err);
      return `${startDateStr} – ${endDateStr}`;
    }
  };

  const handleChoose = (evt: Event) => {
    if (!evt.id) return;
    setIsSelected(!isSelected);
    if (onChoose) onChoose(evt);
  };

  const toggleCapacitiesView = () => setShowAllCapacities(v => !v);
  const handleDeleteClick = () => setIsDeleteModalOpen(true);
  const handleConfirmDelete = () => {
    if (onDelete && event.id) onDelete(event.id);
  };

  const handleContactClick = () => {
    if (organization?.email) {
      const subject = encodeURIComponent(`About event: ${event.name || ''}`);
      const isChrome = /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor);
      if (isChrome) {
        window.open(
          `https://mail.google.com/mail/?view=cm&fs=1&to=${organization.email}&su=${subject}`,
          '_blank'
        );
      } else {
        window.location.href = `mailto:${organization.email}?subject=${subject}`;
      }
    }
  };

  if (isLoading) {
    return <EventCardSkeleton isHorizontalScroll={isHorizontalScroll} />;
  }

  if (error || !event) return null;

  const loc = event.type_of_location;

  const locationLabel =
    loc === 'virtual'
      ? pageContent['events-location-online'] || 'Online'
      : loc === 'in_person'
        ? pageContent['events-location-in-person'] || 'In-person'
        : pageContent['events-location-hybrid'] || 'Hybrid';

  const showAllSkills = showAllCapacities || (!isMobile && !isHorizontalScroll);

  return (
    <>
      <div
        className={`
          flex flex-col rounded-[4px] p-4 relative
          ${isHorizontalScroll ? 'min-w-[300px] max-w-[350px] flex-shrink-0' : 'w-full'}
          ${
            darkMode
              ? 'bg-capx-dark-bg text-white'
              : 'bg-[#EFEFEF] text-capx-dark-box-bg'
          }
        `}
      >
        {/* Admin controls */}
        {onEdit && onDelete && onChoose && (
          <div className="flex gap-2 mb-3 flex-wrap">
            <BaseButton
              label={pageContent['organization-profile-edit-event'] || 'Edit'}
              onClick={() => onEdit(event as Event)}
              customClass={`font-Montserrat py-1.5 px-3 rounded-[8px] text-sm font-extrabold flex flex-row items-center gap-1 !mb-0 transition-opacity hover:opacity-90 ${
                darkMode
                  ? 'bg-transparent border border-white/20 text-white'
                  : 'bg-transparent border border-capx-dark-box-bg text-capx-dark-box-bg'
              }`}
              imageUrl={darkMode ? EditIconLight : EditIcon}
              imageAlt={pageContent['alt-edit-event'] || 'Edit event'}
              imageWidth={16}
              imageHeight={16}
            />
            <BaseButton
              label={
                isSelected
                  ? pageContent['organization-profile-hide-event'] || 'Hide'
                  : pageContent['organization-profile-choose-event'] || 'Feature'
              }
              onClick={() => handleChoose(event as Event)}
              customClass={`font-Montserrat py-1.5 px-3 rounded-[8px] text-sm font-extrabold flex flex-row items-center gap-1 !mb-0 transition-opacity hover:opacity-90 ${
                isSelected
                  ? 'bg-transparent border border-capx-dark-box-bg text-capx-dark-box-bg'
                  : 'bg-capx-dark-box-bg text-white'
              }`}
              imageUrl={isSelected ? CheckBoxIcon : CheckBoxOutlineBlankIconLight}
              imageAlt={
                isSelected
                  ? pageContent['alt-checked'] || 'Option is selected'
                  : pageContent['alt-unchecked'] || 'Option is not selected'
              }
              imageWidth={16}
              imageHeight={16}
            />
            <BaseButton
              label={pageContent['organization-profile-delete-event'] || 'Delete'}
              onClick={handleDeleteClick}
              customClass="font-Montserrat py-1.5 px-3 rounded-[8px] text-sm font-extrabold bg-red-500 hover:bg-red-600 flex flex-row items-center gap-1 !mb-0 text-white transition-colors"
              imageUrl={DeleteIcon}
              imageAlt={pageContent['alt-delete-event'] || 'Delete event'}
              imageWidth={16}
              imageHeight={16}
            />
          </div>
        )}

        {/* Card content */}
        <div className="flex flex-col gap-4 flex-1">
          {/* Title */}
          <div className={`flex flex-col gap-1 ${isHorizontalScroll ? 'min-h-[80px]' : ''}`}>
            <h2
              className={`font-Montserrat font-extrabold ${
                isMobile ? 'text-lg' : 'text-xl'
              } ${darkMode ? 'text-white' : 'text-capx-dark-box-bg'} ${
                isHorizontalScroll ? 'line-clamp-3' : ''
              }`}
            >
              {event.name}
            </h2>

            {organization && !isHorizontalScroll && (
              <Link
                href={`/organization_profile/${organization.id}`}
                className={`font-Montserrat text-sm hover:underline underline-offset-2 ${
                  darkMode ? 'text-white/60' : 'text-[#507380]'
                }`}
              >
                {getOrganizationDisplayName(
                  organization.display_name || '',
                  organizationNames,
                  language
                )}
              </Link>
            )}
          </div>

          {/* Date and location info */}
          <div className="flex flex-wrap items-center gap-2">
            {event.time_begin && (
              <span
                className={`font-Montserrat text-sm font-medium ${
                  darkMode ? 'text-white/70' : 'text-capx-dark-box-bg/70'
                }`}
              >
                {formatDate(event.time_begin)}
                {event.time_end && ` – ${formatDate(event.time_end)}`}
              </span>
            )}
            {loc && (
              <span className="font-Montserrat text-xs font-extrabold px-2 py-1 rounded-[8px] bg-capx-dark-box-bg text-white">
                {locationLabel}
              </span>
            )}
          </div>

          {/* Time range */}
          {event.time_begin && event.time_end && !isHorizontalScroll && (
            <p
              className={`font-Montserrat text-sm ${
                darkMode ? 'text-white/50' : 'text-[#507380]'
              }`}
            >
              {formatTimeRange(event.time_begin, event.time_end)}
            </p>
          )}

          {/* Capacities */}
          {event.related_skills && event.related_skills.length > 0 && (
            <div className="flex flex-col gap-2">
              <p
                className={`font-Montserrat text-md font-extrabold ${
                  darkMode ? 'text-white' : 'text-[#507380]'
                }`}
              >
                {pageContent['events-available-capacities'] || 'Available capacities'}
              </p>
              <div className="flex flex-row gap-2 items-start">
                <div
                  ref={capacitiesContainerRef}
                  className={`flex flex-row flex-wrap gap-2 overflow-hidden flex-1 ${
                    showAllSkills ? '' : 'max-h-[30px]'
                  }`}
                >
                  {event.related_skills
                    .slice(0, showAllSkills ? event.related_skills.length : visibleCapacities)
                    .map(skill => (
                      <span
                        key={skill}
                        className="font-Montserrat text-sm px-2 py-1 rounded-[8px] text-white bg-capx-dark-box-bg w-fit whitespace-nowrap"
                      >
                        {getCapacityName(skill)}
                      </span>
                    ))}
                </div>
                {(isMobile || isHorizontalScroll) &&
                  event.related_skills &&
                  (event.related_skills.length > visibleCapacities || overflowing) && (
                    <button
                      onClick={toggleCapacitiesView}
                      className="flex items-center shrink-0 pt-0.5"
                    >
                      <Image
                        src={darkMode ? MoreHorizIconLight : MoreHorizIcon}
                        alt={showAllCapacities ? 'Show less' : 'Show more'}
                        className="cursor-pointer"
                        width={24}
                        height={24}
                      />
                    </button>
                  )}
              </div>
            </div>
          )}

          {/* Description */}
          {!isHorizontalScroll && event.description && (
            <p
              className={`font-Montserrat text-sm leading-relaxed ${
                darkMode ? 'text-white/60' : 'text-[#507380]'
              }`}
            >
              {event.description}
            </p>
          )}

          {/* Action buttons */}
          {!isHorizontalScroll && (
            <div className="flex flex-row gap-2 mt-auto">
              {organization?.email && (
                <BaseButton
                  label={pageContent['events-contact'] || 'Contact'}
                  onClick={handleContactClick}
                  customClass={`flex justify-center items-center gap-2 px-4 py-3 rounded-[8px] font-Montserrat font-extrabold text-md transition-opacity hover:opacity-90 flex-1 ${
                    darkMode
                      ? 'bg-transparent border border-white text-white'
                      : 'bg-transparent border border-capx-dark-box-bg text-capx-dark-box-bg'
                  }`}
                />
              )}
              <BaseButton
                onClick={() => event.url && window.open(event.url as string, '_blank')}
                customClass="flex justify-center items-center gap-2 px-4 py-3 rounded-[8px] bg-capx-secondary-purple hover:bg-capx-primary-green text-white hover:text-capx-dark-bg font-Montserrat font-extrabold text-md transition-colors flex-1"
                label={pageContent['organization-profile-view-event'] || 'View Event'}
              />
            </div>
          )}
        </div>
      </div>

      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title={event.name || ''}
        capacities={event.related_skills?.map(skill => getCapacityName(skill)) || []}
        description={event.description || ''}
      />
    </>
  );
}
