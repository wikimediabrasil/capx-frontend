'use client';

import { useTheme } from '@/contexts/ThemeContext';
import { useApp } from '@/contexts/AppContext';
import Image from 'next/image';
import { Badge } from '@/types/badge';
// import CheckCircleIcon from "@/public/static/images/check.svg"; TODO: Add this icon
import BaseButton from './BaseButton';
import { useState, useEffect } from 'react';

interface BadgeSelectionModalProps {
  badges: Badge[];
  selectedBadges: number[];
  onClose: () => void;
  onUpdate: (selectedIds: number[]) => void;
}

export default function BadgeSelectionModal({
  badges,
  selectedBadges,
  onClose,
  onUpdate,
}: BadgeSelectionModalProps) {
  const { darkMode } = useTheme();
  const { pageContent, isMobile } = useApp();
  const [selected, setSelected] = useState<number[]>(selectedBadges);

  // Avoid scroll on the page when the modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  const toggleBadge = (badgeId: number) => {
    if (selected.includes(badgeId)) {
      setSelected(selected.filter(id => id !== badgeId));
    } else {
      setSelected([...selected, badgeId]);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div
        className={`relative w-full max-w-2xl rounded-lg ${
          darkMode ? 'bg-capx-dark-bg' : 'bg-white'
        } flex flex-col max-h-[90vh]`}
      >
        {/* Fixed header */}
        <div className="p-6 border-b border-gray-200">
          <h2
            className={`${isMobile ? 'text-lg' : 'text-2xl'} font-bold ${
              darkMode ? 'text-white' : 'text-[#053749]'
            }`}
          >
            {pageContent['badge-selection-modal-title']}
          </h2>
        </div>

        {/* Scrollable content */}
        <div className="p-6 overflow-y-auto flex-1">
          <div className={`grid ${isMobile ? 'grid-cols-2 gap-2' : 'grid-cols-4 gap-4'} mb-6`}>
            {badges.map(badge => (
              <div
                key={badge.id}
                onClick={() => toggleBadge(badge.id)}
                className={`relative cursor-pointer p-4 rounded-lg transition-all ${
                  selected.includes(badge.id)
                    ? 'border-2 border-green-500'
                    : darkMode
                      ? 'border border-gray-700'
                      : 'border border-gray-200'
                }`}
              >
                {/* TODO: Add this icon eventually */}
                {/* {selected.includes(badge.id) && (
                  <div className="absolute top-2 right-2">
                    <Image
                      src={CheckCircleIcon}
                      alt={pageContent["capacity-selection-modal-selected"]}
                      width={24}
                      height={24}
                    />
                  </div>
                )} */}

                <div className="flex flex-col items-center">
                  <div className="relative w-16 h-16 md:w-20 md:h-20 mb-2">
                    <Image
                      src={badge.picture}
                      alt={
                        pageContent['alt-badge']?.replace('{badgeName}', badge.name) ||
                        `Badge: ${badge.name}`
                      }
                      fill
                      className="object-contain"
                    />
                  </div>
                  <span
                    className={`text-xs md:text-sm text-center font-medium ${
                      darkMode ? 'text-white' : 'text-[#053749]'
                    }`}
                  >
                    {badge.name}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Fixed footer */}
        <div className="p-6 border-t border-gray-200 flex justify-end gap-4">
          <BaseButton
            onClick={onClose}
            label={pageContent['delete-confirmation-close-tab']}
            customClass={`
                bg-capx-light-bg hover:bg-capx-primary-green 
                border-capx-dark-box-bg border-2 
                text-capx-dark-box-bg font-extrabold rounded-lg 
                text-sm md:text-lg
                py-2 px-4 md:py-3 md:px-6
                min-w-[100px] md:min-w-[150px]
              `}
          />
          <BaseButton
            onClick={() => onUpdate(selected)}
            label={pageContent['edit-profile-update']}
            customClass={`
                bg-capx-secondary-purple hover:bg-capx-primary-green 
                text-white hover:text-capx-dark-bg font-extrabold rounded-lg
                text-sm md:text-lg
                py-2 px-4 md:py-3 md:px-6
                min-w-[100px] md:min-w-[150px]
              `}
          />
        </div>
      </div>
    </div>
  );
}
