'use client';

import Image from 'next/image';
import { useTheme } from '@/contexts/ThemeContext';
import { useApp } from '@/contexts/AppContext';
import BaseButton from '@/components/BaseButton';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  programName: string;
  programLogo: string | null;
  onViewMore?: () => void;
}

export default function ConfirmationModal({
  isOpen,
  onClose,
  programName,
  programLogo,
  onViewMore,
}: ConfirmationModalProps) {
  const { darkMode } = useTheme();
  const { pageContent } = useApp();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className={`relative w-full max-w-md mx-4 rounded-lg shadow-xl ${
          darkMode ? 'bg-capx-dark-box-bg' : 'bg-white'
        }`}
      >
        {/* Modal Content */}
        <div className="p-6">
          {/* Logo */}
          {programLogo && programLogo.trim() !== '' && (
            <div className="flex justify-center mb-4">
              <div className="relative w-20 h-20">
                <Image
                  src={programLogo}
                  alt={programName}
                  fill
                  className="object-contain"
                />
              </div>
            </div>
          )}

          {/* Title */}
          <h2
            className={`text-xl md:text-2xl font-bold text-center mb-4 ${
              darkMode ? 'text-white' : 'text-capx-dark-box-bg'
            }`}
          >
            {pageContent['congratulations'] || 'Congratulations!'}
          </h2>

          {/* Message */}
          <p
            className={`text-sm text-center mb-6 ${
              darkMode ? 'text-gray-300' : 'text-gray-600'
            }`}
          >
            {pageContent['mentorship-application-forwarded'] ||
              "I've forwarded your application to the mentorship program. They will contact you directly soon."}
          </p>

          {/* Action Button */}
          <BaseButton
            onClick={onViewMore || onClose}
            customClass={`w-full px-4 py-3 rounded-lg text-base font-extrabold border-2 border-[#053749] ${
              darkMode
                ? 'bg-transparent text-white hover:bg-[#053749]'
                : 'bg-white text-[#053749] hover:bg-[#053749] hover:text-white'
            }`}
            label={pageContent['more-mentorships'] || 'More mentorships'}
          />
        </div>
      </div>
    </div>
  );
}

