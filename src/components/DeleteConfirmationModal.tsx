import React from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { useApp } from '@/contexts/AppContext';
import Image from 'next/image';
import EmojiObjectsIcon from '@/public/static/images/emoji_objects.svg';
import EmojiObjectsIconLight from '@/public/static/images/emoji_objects_white.svg';
import DeleteIcon from '@/public/static/images/delete.svg';

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  capacities: string[];
  description: string;
}

const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  capacities,
  description,
}) => {
  const { pageContent } = useApp();
  const { darkMode } = useTheme();

  if (!isOpen) return null;

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 `}
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-modal-title"
    >
      <div
        className={`rounded-lg shadow-lg p-8 w-full max-w-md flex flex-col gap-6 ${
          darkMode ? 'bg-capx-dark-bg' : 'bg-white'
        }`}
      >
        <h2
          id="delete-modal-title"
          className={`text-center text-capx-font-size-mobile-2xl sm:text-capx-font-size-mobile-2xl md:text-capx-font-size-desktop-2xl lg:text-capx-font-size-desktop-2xl font-extrabold font-Montserrat mb-2 ${
            darkMode ? 'text-white' : 'text-capx-dark-box-bg'
          }`}
        >
          {pageContent['delete-confirmation-title'] || 'Delete event of profile'}
        </h2>
        <div>
          <label
            className={`block text-capx-font-size-mobile-md sm:text-capx-font-size-mobile-md md:text-capx-font-size-desktop-md lg:text-capx-font-size-desktop-md font-bold mb-1 ${
              darkMode ? 'text-white' : 'text-[#507380]'
            }`}
          >
            {pageContent['delete-confirmation-event-title'] || 'Title'}
          </label>
          <input
            type="text"
            value={title}
            disabled
            className="w-full bg-gray-100 rounded px-3 py-2 text-capx-dark-box-bg mb-2 text-capx-font-size-mobile-md sm:text-capx-font-size-mobile-md md:text-capx-font-size-desktop-md lg:text-capx-font-size-desktop-md"
          />
        </div>
        <div className="flex flex-col gap-2">
          <label
            className={`font-extrabold mb-1 flex items-center gap-2 text-capx-font-size-mobile-md sm:text-capx-font-size-mobile-md md:text-capx-font-size-desktop-md lg:text-capx-font-size-desktop-md ${
              darkMode ? 'text-white' : 'text-[#507380]'
            }`}
          >
            <Image
              src={darkMode ? EmojiObjectsIconLight : EmojiObjectsIcon}
              alt={pageContent['alt-capacity'] || 'Capacity icon, view skills and abilities'}
              width={24}
              height={24}
            />
            {pageContent['delete-confirmation-capacities'] || 'Available capacities'}
          </label>
          <div className="flex flex-wrap gap-2 mb-2">
            {capacities.map((cap, idx) => (
              <span
                key={idx}
                className="bg-capx-dark-box-bg text-white px-3 py-1 rounded-[8px] text-capx-font-size-mobile-sm sm:text-capx-font-size-mobile-sm md:text-capx-font-size-desktop-sm lg:text-capx-font-size-desktop-sm"
              >
                {cap}
              </span>
            ))}
          </div>
        </div>
        <div>
          <label
            className={`block font-bold mb-1 text-capx-font-size-mobile-md sm:text-capx-font-size-mobile-md md:text-capx-font-size-desktop-md lg:text-capx-font-size-desktop-md ${
              darkMode ? 'text-white' : 'text-[#507380]'
            }`}
          >
            {pageContent['delete-confirmation-description'] || 'Event description'}
          </label>
          <textarea
            value={description}
            disabled
            rows={4}
            className="w-full bg-gray-100 rounded px-3 py-2 text-capx-dark-box-bg font-normal text-capx-font-size-mobile-md sm:text-capx-font-size-mobile-md md:text-capx-font-size-desktop-md lg:text-capx-font-size-desktop-md"
          />
        </div>
        <div className="flex justify-between gap-4 mt-4">
          <button
            onClick={onClose}
            className={`flex-1 py-3 rounded-lg border font-extrabold text-capx-font-size-mobile-lg sm:text-capx-font-size-mobile-lg md:text-capx-font-size-desktop-lg lg:text-capx-font-size-desktop-lg transition ${
              darkMode
                ? 'bg-white text-capx-dark-box-bg border-capx-dark-box-bg'
                : 'bg-white text-capx-dark-box-bg border-capx-dark-box-bg'
            }`}
          >
            {pageContent['delete-confirmation-close-tab'] || 'Close tab'}
          </button>
          <button
            onClick={handleConfirm}
            className="flex-1 py-3 rounded-lg bg-capx-primary-orange text-white font-extrabold text-capx-font-size-mobile-lg sm:text-capx-font-size-mobile-lg md:text-capx-font-size-desktop-lg lg:text-capx-font-size-desktop-lg flex items-center justify-center gap-4 hover:bg-red-700 transition"
          >
            {pageContent['delete-confirmation-confirm'] || 'Delete'}
            <Image
              src={DeleteIcon}
              alt={pageContent['alt-delete'] || 'Delete item'}
              width={24}
              height={24}
            />
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmationModal;
