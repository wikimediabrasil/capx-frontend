'use client';

import Image from 'next/image';
import BaseButton from '@/components/BaseButton';
import { MentorshipProgram } from '@/types/mentorship';
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import RoleSelectionModal from './RoleSelectionModal';
import DynamicForm from './DynamicForm';
import ConfirmationModal from './ConfirmationModal';
import TerritoryIcon from '@/public/static/images/territory.svg';
import TerritoryIconWhite from '@/public/static/images/territory_white.svg';
import LanguageIcon from '@/public/static/images/language.svg';
import LanguageIconWhite from '@/public/static/images/language_white.svg';
import EmojiIcon from '@/public/static/images/emoji_objects.svg';
import EmojiIconWhite from '@/public/static/images/emoji_objects_white.svg';
import { mentorshipService } from '@/services/mentorshipService';
import { useSnackbar } from '@/app/providers/SnackbarProvider';

import { useDarkMode, usePageContent, useCapacityStore } from '@/stores';
import { formatWikiImageUrl } from '@/lib/utils/fetchWikimediaData';

interface MentorshipProgramCardProps {
  program: MentorshipProgram;
  onSubscribe?: (programId: number, role: 'mentor' | 'mentee') => void;
}

export default function MentorshipProgramCard({
  program,
  onSubscribe,
}: MentorshipProgramCardProps) {
  const darkMode = useDarkMode();
  const pageContent = usePageContent();
  const { data: session } = useSession();
  const { showSnackbar } = useSnackbar();
  const token = (session?.user as { token?: string } | undefined)?.token;
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [selectedRole, setSelectedRole] = useState<'mentor' | 'mentee' | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const { getName, preloadCapacities } = useCapacityStore();
  const [showAllCapacities, setShowAllCapacities] = useState(false);

  useEffect(() => {
    if (program.capacities.length > 0 && token) {
      preloadCapacities(token);
    }
  }, [program.capacities, preloadCapacities, token]);

  const hasAnyForm = program.forms?.mentor || program.forms?.mentee;

  const handleSubscribe = () => {
    if (!token) {
      showSnackbar(
        pageContent['mentorship-sign-in-required'] || 'Please sign in to apply for mentorship.',
        'error'
      );
      return;
    }
    if (!hasAnyForm) {
      showSnackbar(
        pageContent['no-mentorship-programs-found'] ||
          'No application form available for this program.',
        'success'
      );
      return;
    }
    setShowRoleModal(true);
  };

  const handleRoleSelect = (role: 'mentor' | 'mentee', _program: MentorshipProgram) => {
    const form = program.forms?.[role];
    if (!form) return;
    setShowRoleModal(false);
    setSelectedRole(role);
    setShowForm(true);
  };

  const handleFormSubmit = async (data: Record<string, unknown>) => {
    const form = selectedRole ? program.forms?.[selectedRole] : undefined;
    const formId = form && 'formId' in form ? (form as { formId: number }).formId : undefined;

    if (!token) {
      showSnackbar(
        pageContent['mentorship-sign-in-required'] || 'Please sign in to apply for mentorship.',
        'error'
      );
      return;
    }

    if (formId != null) {
      setSubmitting(true);
      try {
        if (selectedRole === 'mentor') {
          await mentorshipService.submitMentorResponse(formId, data, token);
        } else {
          await mentorshipService.submitMenteeResponse(formId, data, token);
        }
        setShowForm(false);
        setShowConfirmation(true);
        if (onSubscribe && selectedRole) {
          onSubscribe(program.id, selectedRole);
        }
        showSnackbar(
          pageContent['mentorship-application-forwarded'] ||
            'Application submitted. The program will contact you directly soon.',
          'success'
        );
      } catch (err: unknown) {
        const message =
          (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ||
          (err as Error)?.message ||
          'Failed to submit application';
        showSnackbar(message, 'error');
      } finally {
        setSubmitting(false);
      }
    } else {
      setShowForm(false);
      setShowConfirmation(true);
      if (onSubscribe && selectedRole) {
        onSubscribe(program.id, selectedRole);
      }
      showSnackbar(
        pageContent['mentorship-application-forwarded'] ||
          'Application submitted. The program will contact you directly soon.',
        'success'
      );
    }
  };

  const statusColor =
    program.status === 'open'
      ? 'bg-capx-primary-green text-white'
      : program.status === 'upcoming'
        ? 'bg-yellow-500 text-white'
        : 'bg-capx-primary-red text-white';

  const statusLabelMap: Record<string, string> = {
    open: pageContent['mentorship-status-open'] || 'Open',
    upcoming: pageContent['mentorship-status-upcoming'] || 'Upcoming',
    closed: pageContent['mentorship-status-closed'] || 'Closed',
  };

  const formatLabel =
    program.format === 'in-person'
      ? 'In person'
      : program.format === 'online'
        ? 'Online event'
        : 'Hybrid';

  return (
    <>
      <div
        className={`flex flex-col p-4 md:p-6 rounded-lg border ${
          darkMode ? 'bg-capx-dark-box-bg border-gray-700' : 'bg-white border-gray-200'
        }`}
      >
        {/* Logo: organization profile_image from partner_mentorship_settings (Commons URL) */}
        <div className="mb-4 flex justify-center">
          <div className="relative w-20 h-20 md:w-24 md:h-24">
            {program.logo && program.logo.trim() !== '' ? (
              <div className="absolute inset-0 rounded-lg bg-white overflow-hidden">
                <Image
                  src={formatWikiImageUrl(program.logo)}
                  alt={program.name}
                  fill
                  className="object-contain"
                />
              </div>
            ) : null}
            <div
              className={`absolute inset-0 w-full h-full rounded-lg flex items-center justify-center border-2 ${
                darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-300'
              }`}
              style={{
                display: program.logo && program.logo.trim() !== '' ? 'none' : 'flex',
              }}
            >
              <span
                className={`text-xl md:text-2xl font-bold ${
                  darkMode ? 'text-gray-300' : 'text-gray-600'
                }`}
              >
                {program.name.charAt(0)}
              </span>
            </div>
          </div>
        </div>

        {/* Location and Status */}
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <div className="relative w-4 h-4">
              <Image
                src={darkMode ? TerritoryIconWhite : TerritoryIcon}
                alt="Location"
                fill
                className="object-contain"
              />
            </div>
            <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              {program.location}
            </span>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColor}`}>
            {statusLabelMap[program.status] ?? program.status}
          </span>
        </div>

        {/* Registration period */}
        {(program.openDate || program.closeDate) && (
          <div className="mb-3">
            <span
              className={`block text-xs font-semibold ${
                darkMode ? 'text-gray-200' : 'text-gray-800'
              }`}
            >
              Registration period
            </span>
            <span className={`text-xs ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              {program.openDate && program.closeDate
                ? `${program.openDate} → ${program.closeDate}`
                : program.openDate
                  ? program.openDate
                  : program.closeDate}
            </span>
          </div>
        )}

        {/* Description */}
        <p
          className={`text-xs md:text-sm mb-4 leading-relaxed ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}
        >
          {program.description}
        </p>

        {/* Attributes */}
        <div className="space-y-3 mb-4">
          {/* Format */}
          <div className="flex items-center gap-2">
            <div className="relative w-4 h-4 flex-shrink-0">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                className={darkMode ? 'text-gray-300' : 'text-gray-600'}
              >
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
                <path
                  d="M12 6V12L16 14"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </div>
            <span className={`text-xs ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              {formatLabel}
            </span>
          </div>

          {/* Capacities (skills) */}
          {program.capacities.length > 0 && (
            <div className="mb-1">
              <span
                className={`block text-xs font-semibold mb-1 ${
                  darkMode ? 'text-gray-200' : 'text-gray-800'
                }`}
              >
                {pageContent['filters-capacities'] || 'Capacities'}
              </span>
              <div className="flex flex-wrap gap-2">
                {(showAllCapacities ? program.capacities : program.capacities.slice(0, 8)).map(
                  (capacity, index) => {
                    const code = Number(capacity);
                    const label = Number.isNaN(code) ? String(capacity) : getName(code);
                    return (
                      <span
                        key={index}
                        className="inline-flex px-3 py-1 rounded-md bg-capx-primary-green text-white text-xs md:text-sm"
                      >
                        {label}
                      </span>
                    );
                  }
                )}
              </div>
              {program.capacities.length > 8 && (
                <button
                  type="button"
                  className={`mt-1 text-xs font-semibold underline ${
                    darkMode ? 'text-gray-300' : 'text-gray-600'
                  }`}
                  onClick={() => setShowAllCapacities(prev => !prev)}
                >
                  {showAllCapacities
                    ? pageContent['capacity-list-scroll-previous'] || 'Show less'
                    : pageContent['capacity-list-scroll-next'] || 'Show more'}
                </button>
              )}
            </div>
          )}

          {/* Languages */}
          {program.languages.length > 0 && (
            <div className="flex items-start gap-2">
              <div className="relative w-4 h-4 flex-shrink-0 mt-0.5">
                <Image
                  src={darkMode ? LanguageIconWhite : LanguageIcon}
                  alt="Languages"
                  fill
                  className="object-contain"
                />
              </div>
              <div className="flex-1">
                <span
                  className={`text-xs font-semibold block mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}
                >
                  Languages:
                </span>
                <div className="flex flex-wrap gap-1">
                  {program.languages.slice(0, 2).map((language, index) => (
                    <span
                      key={index}
                      className={`text-xs px-2 py-0.5 rounded ${
                        darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {language}
                    </span>
                  ))}
                  {program.languages.length > 2 && (
                    <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      ...
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Subscribers */}
          <div className="flex items-center gap-2">
            <div className="relative w-4 h-4 flex-shrink-0">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                className={darkMode ? 'text-gray-300' : 'text-gray-600'}
              >
                <path
                  d="M16 7C16 9.20914 14.2091 11 12 11C9.79086 11 8 9.20914 8 7C8 4.79086 9.79086 3 12 3C14.2091 3 16 4.79086 16 7Z"
                  stroke="currentColor"
                  strokeWidth="2"
                />
                <path
                  d="M12 14C8.13401 14 5 17.134 5 21H19C19 17.134 15.866 14 12 14Z"
                  stroke="currentColor"
                  strokeWidth="2"
                />
                <path
                  d="M8 11C8 12.6569 6.65685 14 5 14C3.34315 14 2 12.6569 2 11C2 9.34315 3.34315 8 5 8C6.65685 8 8 9.34315 8 11Z"
                  stroke="currentColor"
                  strokeWidth="2"
                />
                <path
                  d="M22 11C22 12.6569 20.6569 14 19 14C17.3431 14 16 12.6569 16 11C16 9.34315 17.3431 8 19 8C20.6569 8 22 9.34315 22 11Z"
                  stroke="currentColor"
                  strokeWidth="2"
                />
              </svg>
            </div>
            <span className={`text-xs ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              {program.subscribers} Subscribers
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 mt-auto">
          {hasAnyForm && (
            <BaseButton
              onClick={handleSubscribe}
              customClass="flex-1 px-4 py-2 rounded-lg text-sm font-extrabold bg-[#851970] hover:bg-capx-primary-green text-white"
              label={pageContent['subscribe'] || 'Subscribe'}
            />
          )}
        </div>
      </div>

      <RoleSelectionModal
        isOpen={showRoleModal}
        onClose={() => setShowRoleModal(false)}
        onSelect={handleRoleSelect}
        program={program}
      />

      {showForm && selectedRole && program.forms?.[selectedRole] && (
        <DynamicForm
          form={program.forms[selectedRole]}
          programName={program.name}
          programLogo={program.logo}
          onSubmit={handleFormSubmit}
          onClose={() => {
            setShowForm(false);
            setSelectedRole(null);
          }}
          submitting={submitting}
        />
      )}

      <ConfirmationModal
        isOpen={showConfirmation}
        onClose={() => {
          setShowConfirmation(false);
          setSelectedRole(null);
        }}
        programName={program.name}
        programLogo={program.logo}
      />
    </>
  );
}
