'use client';

import BaseButton from '@/components/BaseButton';
import { useDarkMode, useIsMobile, usePageContent } from '@/stores';
import QRCode from 'react-qr-code';
import { useCallback, useMemo, useRef } from 'react';
import { getPublicProfileUrl } from '@/lib/utils/profilePublicUrl';

const QR_EXPORT_SCALE = 2;

function sanitizeProfileQrFilename(username: string): string {
  const base = username.trim() || 'profile';
  const safe = base.replace(/[^a-zA-Z0-9._-]+/g, '-').replace(/^-+|-+$/g, '');
  return safe || 'profile';
}

interface ProfileQrCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  username: string;
}

export default function ProfileQrCodeModal({ isOpen, onClose, username }: ProfileQrCodeModalProps) {
  const qrWrapperRef = useRef<HTMLDivElement>(null);
  const darkMode = useDarkMode();
  const isMobile = useIsMobile();
  const pageContent = usePageContent();

  const profileUrl = useMemo(() => {
    if (!isOpen) return '';
    return getPublicProfileUrl(username).trim();
  }, [isOpen, username]);

  const qrSize = isMobile ? 200 : 256;
  const fgColor = darkMode ? '#F6F6F6' : '#053749';
  const bgColor = darkMode ? '#053749' : '#FFFFFF';

  const handleDownloadQr = useCallback(() => {
    if (!profileUrl || typeof document === 'undefined') return;

    const svgEl = qrWrapperRef.current?.querySelector('svg');
    if (!svgEl) return;

    const exportSize = qrSize * QR_EXPORT_SCALE;
    const serializer = new XMLSerializer();
    const svgClone = svgEl.cloneNode(true) as SVGSVGElement;
    svgClone.setAttribute('width', String(exportSize));
    svgClone.setAttribute('height', String(exportSize));

    const svgString = serializer.serializeToString(svgClone);
    const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    const objectUrl = URL.createObjectURL(svgBlob);

    const img = new Image();
    const safeName = sanitizeProfileQrFilename(username);
    const downloadName = `profile-${safeName}-qr.png`;

    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = exportSize;
      canvas.height = exportSize;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        URL.revokeObjectURL(objectUrl);
        return;
      }

      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, exportSize, exportSize);
      ctx.drawImage(img, 0, 0);
      URL.revokeObjectURL(objectUrl);

      canvas.toBlob(
        pngBlob => {
          if (!pngBlob) return;
          const pngUrl = URL.createObjectURL(pngBlob);
          const anchor = document.createElement('a');
          anchor.href = pngUrl;
          anchor.download = downloadName;
          anchor.rel = 'noopener';
          document.body.appendChild(anchor);
          anchor.click();
          document.body.removeChild(anchor);
          URL.revokeObjectURL(pngUrl);
        },
        'image/png',
        1
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
    };

    img.src = objectUrl;
  }, [profileUrl, qrSize, bgColor, username]);

  if (!isOpen) return null;

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
            ref={qrWrapperRef}
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
            onClick={handleDownloadQr}
            disabled={!profileUrl}
            customClass={`w-full px-4 py-3 rounded-lg text-base font-extrabold ${
              darkMode
                ? 'bg-white text-[#053749] hover:bg-gray-200 disabled:opacity-50 disabled:hover:bg-white'
                : 'bg-[#053749] text-white hover:opacity-90 disabled:opacity-50'
            }`}
            label={pageContent['body-profile-qr-code-download'] ?? 'Download QR Code'}
          />
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
