'use client';

import Image from 'next/image';
import { useTheme } from '@/contexts/ThemeContext';
import { useApp } from '@/contexts/AppContext';
import BaseButton from '@/components/BaseButton';
import { MentorshipProgram } from '@/types/mentorship';

interface RoleSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (role: 'mentor' | 'mentee', program: MentorshipProgram) => void;
  program: MentorshipProgram;
}

export default function RoleSelectionModal({
  isOpen,
  onClose,
  onSelect,
  program,
}: RoleSelectionModalProps) {
  const { darkMode } = useTheme();
  const { pageContent } = useApp();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div
        className={`relative w-full max-w-md mx-4 rounded-lg shadow-xl ${
          darkMode ? 'bg-capx-dark-box-bg' : 'bg-white'
        }`}
      >
        {/* Modal Content */}
        <div className="p-6">
          {/* Logo */}
          <div className="flex justify-center mb-4">
            <div className="relative w-20 h-20">
              {program.logo && program.logo.trim() !== '' && program.logo !== null ? (
                <Image src={program.logo} alt={program.name} fill className="object-contain" />
              ) : (
                <div
                  className={`w-full h-full rounded-lg flex items-center justify-center ${
                    darkMode ? 'bg-gray-700' : 'bg-gray-200'
                  }`}
                >
                  <span className="text-xl font-bold text-gray-500">{program.name.charAt(0)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Title */}
          <h2
            className={`text-xl font-bold text-center mb-2 ${
              darkMode ? 'text-white' : 'text-capx-dark-box-bg'
            }`}
          >
            {pageContent['select-your-role'] || 'Select Your Role'}
          </h2>

          {/* Instruction */}
          <p className={`text-sm text-center mb-6 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            {pageContent['mentorship-role-instruction'] ||
              'Please indicate whether you would like to participate as a mentor or as a mentee.'}
          </p>

          {/* Role Selection Buttons */}
          <div className="space-y-3 mb-6">
            <BaseButton
              onClick={() => onSelect('mentor', program)}
              customClass="w-full px-4 py-3 rounded-lg text-base font-extrabold bg-[#053749] hover:bg-[#04222F] text-white flex items-center justify-center gap-2"
              label={pageContent['mentor'] || 'Mentor'}
              imageWidth={24}
              imageHeight={24}
            />
            <BaseButton
              onClick={() => onSelect('mentee', program)}
              customClass={`w-full px-4 py-3 rounded-lg text-base font-extrabold border-2 border-[#053749] flex items-center justify-center gap-2 ${
                darkMode
                  ? 'bg-transparent text-white hover:bg-[#053749]'
                  : 'bg-white text-[#053749] hover:bg-[#053749] hover:text-white'
              }`}
              label={pageContent['mentee'] || 'Mentee'}
              imageWidth={24}
              imageHeight={24}
            />
          </div>

          {/* Close Button */}
          <BaseButton
            onClick={onClose}
            customClass={`w-full px-4 py-2 rounded-lg text-sm font-extrabold border-2 border-[#053749] ${
              darkMode
                ? 'bg-transparent text-white hover:bg-[#053749]'
                : 'bg-white text-[#053749] hover:bg-[#053749] hover:text-white'
            }`}
            label={pageContent['close-tab'] || 'Close tab'}
          />
        </div>
      </div>
    </div>
  );
}
