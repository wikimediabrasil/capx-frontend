'use client';

import Image from 'next/image';
import { useTheme } from '@/contexts/ThemeContext';
import { useApp } from '@/contexts/AppContext';
import BaseButton from '@/components/BaseButton';
import { MentorshipProgram } from '@/types/mentorship';
import { useState } from 'react';
import RoleSelectionModal from './RoleSelectionModal';
import DynamicForm from './DynamicForm';
import ConfirmationModal from './ConfirmationModal';
import TerritoryIcon from '@/public/static/images/territory.svg';
import TerritoryIconWhite from '@/public/static/images/territory_white.svg';
import LanguageIcon from '@/public/static/images/language.svg';
import LanguageIconWhite from '@/public/static/images/language_white.svg';
import EmojiIcon from '@/public/static/images/emoji_objects.svg';
import EmojiIconWhite from '@/public/static/images/emoji_objects_white.svg';

interface MentorshipProgramCardProps {
  program: MentorshipProgram;
  onSubscribe?: (programId: number, role: 'mentor' | 'mentee') => void;
  onLearnMore?: (programId: number) => void;
}

export default function MentorshipProgramCard({
  program,
  onSubscribe,
  onLearnMore,
}: MentorshipProgramCardProps) {
  const { darkMode } = useTheme();
  const { pageContent } = useApp();
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [selectedRole, setSelectedRole] = useState<'mentor' | 'mentee' | null>(null);

  const handleSubscribe = () => {
    setShowRoleModal(true);
  };

  const handleRoleSelect = (role: 'mentor' | 'mentee', program: MentorshipProgram) => {
    setShowRoleModal(false);
    setSelectedRole(role);
    setShowForm(true);
  };

  const handleFormSubmit = (data: Record<string, any>) => {
    setShowForm(false);
    setShowConfirmation(true);
    if (onSubscribe && selectedRole) {
      onSubscribe(program.id, selectedRole);
    }
    // Here you would typically send the form data to the API
    console.log('Form submitted:', { role: selectedRole, data });
  };

  const handleLearnMore = () => {
    if (onLearnMore) {
      onLearnMore(program.id);
    }
  };

  const statusColor =
    program.status === 'open'
      ? 'bg-capx-primary-green text-white'
      : 'bg-capx-primary-red text-white';

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
        {/* Logo */}
        <div className="mb-4">
          <div className="relative w-20 h-20 md:w-24 md:h-24">
            {program.logo && program.logo.trim() !== '' ? (
              <Image src={program.logo} alt={program.name} fill className="object-contain" />
            ) : (
              <div
                className={`w-full h-full rounded-lg flex items-center justify-center border-2 ${
                  darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-300'
                }`}
              >
                <span
                  className={`text-xl md:text-2xl font-bold ${
                    darkMode ? 'text-gray-300' : 'text-gray-600'
                  }`}
                >
                  {program.name.charAt(0)}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Location and Status */}
        <div className="flex items-center justify-between mb-3">
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
            {program.status}
          </span>
        </div>

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

          {/* Capacities */}
          {program.capacities.length > 0 && (
            <div className="flex items-start gap-2">
              <div className="relative w-4 h-4 flex-shrink-0 mt-0.5">
                <Image
                  src={darkMode ? EmojiIconWhite : EmojiIcon}
                  alt="Capacities"
                  fill
                  className="object-contain"
                />
              </div>
              <div className="flex-1">
                <span
                  className={`text-xs font-semibold block mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}
                >
                  Capacities:
                </span>
                <div className="flex flex-wrap gap-1">
                  {program.capacities.slice(0, 2).map((capacity, index) => (
                    <span
                      key={index}
                      className={`text-xs px-2 py-0.5 rounded ${
                        darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {capacity}
                    </span>
                  ))}
                  {program.capacities.length > 2 && (
                    <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      ...
                    </span>
                  )}
                </div>
              </div>
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
          <BaseButton
            onClick={handleSubscribe}
            customClass="flex-1 px-4 py-2 rounded-lg text-sm font-extrabold bg-[#851970] hover:bg-capx-primary-green text-white"
            label={pageContent['subscribe'] || 'Subscribe'}
          />
          <BaseButton
            onClick={handleLearnMore}
            customClass={`flex-1 px-4 py-2 rounded-lg text-sm font-extrabold border-2 border-[#053749] ${
              darkMode
                ? 'bg-transparent text-white hover:bg-[#053749]'
                : 'bg-white text-[#053749] hover:bg-[#053749] hover:text-white'
            }`}
            label={pageContent['learn-more'] || 'Learn more'}
          />
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
