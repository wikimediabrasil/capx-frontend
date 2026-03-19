'use client';

import { useSnackbar } from '@/app/providers/SnackbarProvider';
import { useBugReport } from '@/hooks/useBugReport';
import { useDarkMode, usePageContent } from '@/stores';
import React, { useState } from 'react';

interface SuggestCapacityModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SuggestCapacityModal: React.FC<SuggestCapacityModalProps> = ({ isOpen, onClose }) => {
  const pageContent = usePageContent();
  const darkMode = useDarkMode();
  const { showSnackbar } = useSnackbar();
  const { submitBugReport, isSubmitting } = useBugReport();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  if (!isOpen) return null;

  const handleClose = () => {
    setTitle('');
    setDescription('');
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    try {
      await submitBugReport({
        title: title.trim(),
        description: description.trim(),
        bug_type: 'new_capacity',
      });
      showSnackbar(
        pageContent['suggest-capacity-success'] || 'Capacity suggestion submitted successfully!',
        'success'
      );
      handleClose();
    } catch {
      showSnackbar(
        pageContent['suggest-capacity-error'] || 'Failed to submit suggestion. Please try again.',
        'error'
      );
    }
  };

  return (
    <dialog
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40"
      aria-modal="true"
      aria-labelledby="suggest-capacity-modal-title"
    >
      <div
        className={`rounded-lg shadow-lg p-8 w-full max-w-md flex flex-col gap-6 ${
          darkMode ? 'bg-capx-dark-bg' : 'bg-white'
        }`}
      >
        <h2
          id="suggest-capacity-modal-title"
          className={`text-center text-capx-font-size-mobile-2xl sm:text-capx-font-size-mobile-2xl md:text-capx-font-size-desktop-2xl lg:text-capx-font-size-desktop-2xl font-extrabold font-Montserrat mb-2 ${
            darkMode ? 'text-white' : 'text-capx-dark-box-bg'
          }`}
        >
          {pageContent['suggest-capacity-modal-title'] || 'Suggest a new capacity'}
        </h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div>
            <label
              htmlFor="suggest-capacity-title"
              className={`block font-bold mb-1 text-capx-font-size-mobile-md sm:text-capx-font-size-mobile-md md:text-capx-font-size-desktop-md lg:text-capx-font-size-desktop-md ${
                darkMode ? 'text-white' : 'text-[#507380]'
              }`}
            >
              {pageContent['suggest-capacity-title-label'] || 'Title'}
              <span className="text-red-500 ml-1">*</span>
            </label>
            <input
              id="suggest-capacity-title"
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              required
              maxLength={200}
              className={`w-full rounded px-3 py-2 text-capx-font-size-mobile-md sm:text-capx-font-size-mobile-md md:text-capx-font-size-desktop-md lg:text-capx-font-size-desktop-md border focus:outline-none focus:ring-2 focus:ring-capx-dark-box-bg ${
                darkMode
                  ? 'bg-capx-dark-box-bg text-white border-gray-600'
                  : 'bg-gray-100 text-capx-dark-box-bg border-gray-200'
              }`}
              placeholder={
                pageContent['suggest-capacity-title-placeholder'] || 'e.g. Data visualization'
              }
            />
          </div>

          <div>
            <label
              htmlFor="suggest-capacity-description"
              className={`block font-bold mb-1 text-capx-font-size-mobile-md sm:text-capx-font-size-mobile-md md:text-capx-font-size-desktop-md lg:text-capx-font-size-desktop-md ${
                darkMode ? 'text-white' : 'text-[#507380]'
              }`}
            >
              {pageContent['suggest-capacity-description-label'] || 'Description'}
            </label>
            <textarea
              id="suggest-capacity-description"
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={4}
              maxLength={1000}
              className={`w-full rounded px-3 py-2 text-capx-font-size-mobile-md sm:text-capx-font-size-mobile-md md:text-capx-font-size-desktop-md lg:text-capx-font-size-desktop-md border focus:outline-none focus:ring-2 focus:ring-capx-dark-box-bg resize-none ${
                darkMode
                  ? 'bg-capx-dark-box-bg text-white border-gray-600'
                  : 'bg-gray-100 text-capx-dark-box-bg border-gray-200'
              }`}
              placeholder={
                pageContent['suggest-capacity-description-placeholder'] ||
                'Describe the capacity and why it should be added...'
              }
            />
          </div>

          <div className="flex justify-between gap-4 mt-2">
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              className="flex-1 py-3 rounded-lg border font-extrabold text-capx-font-size-mobile-lg sm:text-capx-font-size-mobile-lg md:text-capx-font-size-desktop-lg lg:text-capx-font-size-desktop-lg transition bg-white text-capx-dark-box-bg border-capx-dark-box-bg disabled:opacity-50"
            >
              {pageContent['suggest-capacity-cancel'] || 'Cancel'}
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !title.trim()}
              className="flex-1 py-3 rounded-lg bg-capx-dark-box-bg text-white font-extrabold text-capx-font-size-mobile-lg sm:text-capx-font-size-mobile-lg md:text-capx-font-size-desktop-lg lg:text-capx-font-size-desktop-lg transition hover:opacity-90 disabled:opacity-50"
            >
              {isSubmitting
                ? pageContent['suggest-capacity-submitting'] || 'Submitting...'
                : pageContent['suggest-capacity-submit'] || 'Submit'}
            </button>
          </div>
        </form>
      </div>
    </dialog>
  );
};

export default SuggestCapacityModal;
