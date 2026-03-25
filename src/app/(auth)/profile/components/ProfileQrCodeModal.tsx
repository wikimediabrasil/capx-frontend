'use client';

import BaseButton from '@/components/BaseButton';
import { useDarkMode, useIsMobile, usePageContent } from '@/stores';
import QRCode from 'react-qr-code';
import { useMemo } from 'react';
import { getPublicProfileUrl } from '@/lib/utils/profilePublicUrl';

interface ProfileQrCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  username: string;
}

export default function ProfileQrCodeModal({ isOpen, onClose, username }: ProfileQrCodeModalProps) {
  const darkMode = useDarkMode();
  const isMobile = useIsMobile();
  const pageContent = usePageContent();

  const profileUrl = useMemo(() => {
    if (!isOpen) return '';
    return getPublicProfileUrl(username).trim();
  }, [isOpen, username]);

  if (!isOpen) return null;

  const qrSize = isMobile ? 200 : 256;
  const fgColor = darkMode ? '#F6F6F6' : '#053749';
  const bgColor = darkMode ? '#053749' : '#FFFFFF';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden
      />

      <div
        className={`relative w-full max-w-md rounded-lg shadow-xl ${
          darkMode ? 'bg-capx-dark-box-bg' : 'bg-white'
        }`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="profile-qr-code-modal-title"
      >
        <div className="p-6 flex flex-col items-center gap-4">
          <h2
            id="profile-qr-code-modal-title"
            className={`text-xl md:text-2xl font-bold text-center ${
              darkMode ? 'text-white' : 'text-capx-dark-box-bg'
            }`}
          >
            {pageContent['body-profile-qr-code-modal-title']}
          </h2>

          <p className={`text-sm text-center ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            {pageContent['body-profile-qr-code-hint']}
          </p>

          <div
            className={`p-4 rounded-lg inline-flex ${darkMode ? 'bg-[#053749]' : 'bg-white shadow-sm'}`}
          >
            {profileUrl ? (
              <QRCode
                value={profileUrl}
                size={qrSize}
                level="M"
                fgColor={fgColor}
                bgColor={bgColor}
              />
            ) : (
              <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                {pageContent['loading']}
              </p>
            )}
          </div>

          <BaseButton
            onClick={onClose}
            customClass={`w-full px-4 py-3 rounded-lg text-base font-extrabold border-2 border-[#053749] ${
              darkMode
                ? 'bg-transparent text-white hover:bg-[#053749]'
                : 'bg-white text-[#053749] hover:bg-[#053749] hover:text-white'
            }`}
            label={pageContent['body-profile-qr-code-close']}
          />
        </div>
      </div>
    </div>
  );
}
