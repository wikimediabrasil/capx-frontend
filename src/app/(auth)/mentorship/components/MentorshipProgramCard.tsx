'use client';

import Image from 'next/image';
import { useTheme } from '@/contexts/ThemeContext';
import { useApp } from '@/contexts/AppContext';
import BaseButton from '@/components/BaseButton';
import { MentorshipProgram } from '@/types/mentorship';
import { useState } from 'react';
import RoleSelectionModal from './RoleSelectionModal';

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

  const handleSubscribe = () => {
    setShowRoleModal(true);
  };

  const handleRoleSelect = (role: 'mentor' | 'mentee') => {
    setShowRoleModal(false);
    if (onSubscribe) {
      onSubscribe(program.id, role);
    }
  };

  const handleLearnMore = () => {
    if (onLearnMore) {
      onLearnMore(program.id);
    }
  };

  const statusColor =
    program.status === 'open'
      ? 'bg-green-500 text-white'
      : 'bg-red-500 text-white';

  const formatLabel =
    program.format === 'in-person'
      ? 'In person'
      : program.format === 'online'
        ? 'Online event'
        : 'Hybrid';

  return (
    <>
      <div
        className={`flex flex-col p-6 rounded-lg border ${
          darkMode
            ? 'bg-gray-800 border-gray-700'
            : 'bg-white border-gray-200'
        }`}
      >
        {/* Logo */}
        <div className="mb-4">
          <div className="relative w-24 h-24 md:w-32 md:h-32">
            {program.logo && program.logo.trim() !== '' ? (
              <Image
                src={program.logo}
                alt={program.name}
                fill
                className="object-contain"
              />
            ) : (
              <div
                className={`w-full h-full rounded-lg flex items-center justify-center ${
                  darkMode ? 'bg-gray-700' : 'bg-gray-200'
                }`}
              >
                <span className="text-2xl font-bold text-gray-500">
                  {program.name.charAt(0)}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Location and Status */}
        <div className="flex items-center justify-between mb-2">
          <span
            className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}
          >
            {program.location}
          </span>
          <span
            className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColor}`}
          >
            {program.status}
          </span>
        </div>

        {/* Description */}
        <p
          className={`text-sm mb-4 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}
        >
          {program.description}
        </p>

        {/* Attributes */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2">
            <span
              className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}
            >
              {formatLabel}
            </span>
          </div>

          {program.capacities.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className={`text-xs font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}
              >
                Capacities:
              </span>
              {program.capacities.map((capacity, index) => (
                <span
                  key={index}
                  className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}
                >
                  {capacity}
                  {index < program.capacities.length - 1 && ','}
                </span>
              ))}
            </div>
          )}

          {program.languages.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className={`text-xs font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}
              >
                Languages:
              </span>
              {program.languages.map((language, index) => (
                <span
                  key={index}
                  className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}
                >
                  {language}
                  {index < program.languages.length - 1 && ','}
                </span>
              ))}
            </div>
          )}

          <div className="flex items-center gap-2">
            <span
              className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}
            >
              {program.subscribers} Subscribers
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 mt-auto">
          <BaseButton
            onClick={handleSubscribe}
            customClass="flex-1 px-4 py-2 rounded-lg text-sm font-extrabold bg-[#7B2CBF] hover:bg-[#6A1B9A] text-white"
            label={pageContent['subscribe'] || 'Subscribe'}
          />
          <BaseButton
            onClick={handleLearnMore}
            customClass="flex-1 px-4 py-2 rounded-lg text-sm font-extrabold border-2 border-[#7B2CBF] text-[#7B2CBF] bg-transparent hover:bg-[#7B2CBF] hover:text-white"
            label={pageContent['learn-more'] || 'Learn more'}
          />
        </div>
      </div>

      <RoleSelectionModal
        isOpen={showRoleModal}
        onClose={() => setShowRoleModal(false)}
        onSelect={handleRoleSelect}
        programName={program.name}
        programLogo={program.logo}
      />
    </>
  );
}

