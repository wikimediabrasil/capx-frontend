import { useDarkMode, usePageContent } from '@/stores';
import Image, { StaticImageData } from 'next/image';
import React, { useEffect, useRef, useState } from 'react';
import BaseButton from './BaseButton';

interface PopupProps {
  onContinue?: () => void;
  onClose?: () => void;
  image?: StaticImageData;
  title: string;
  closeButtonLabel?: string;
  continueButtonLabel?: string;
  children?: React.ReactNode;
  customClass?: string;
  imageSize?: string;
  titleClassName?: string;
  closeButtonClassName?: string;
  footerClassName?: string;
  minHeight?: string;
  contentScrollable?: boolean;
}

const Popup = ({
  onContinue,
  onClose,
  image,
  title,
  closeButtonLabel,
  continueButtonLabel,
  children,
  customClass,
  imageSize = 'w-full max-w-[200px] md:max-w-[300px]',
  titleClassName,
  closeButtonClassName,
  footerClassName,
  minHeight = 'min-h-0 md:min-h-[400px]',
  contentScrollable = false,
}: PopupProps) => {
  const darkMode = useDarkMode();
  const pageContent = usePageContent();
  const [isOpen, setIsOpen] = useState(true);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const noop = () => {};

  const onCloseTab = () => {
    setIsOpen(false);
    dialogRef.current?.close();
    onClose?.();
  };

  // Handle dialog open/close
  useEffect(() => {
    if (isOpen && dialogRef.current) {
      dialogRef.current.showModal();
      document.body.style.overflow = 'hidden';
      document.body.style.overflowX = 'hidden';
      document.documentElement.style.overflowX = 'hidden';
    } else if (!isOpen && dialogRef.current) {
      dialogRef.current.close();
      document.body.style.overflow = 'unset';
      document.body.style.overflowX = 'unset';
      document.documentElement.style.overflowX = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
      document.body.style.overflowX = 'unset';
      document.documentElement.style.overflowX = 'unset';
    };
  }, [isOpen]);

  // Handle escape key (dialog handles this natively, but we keep it for consistency)
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        onCloseTab();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);

  const defaultCloseButtonClass = `
    bg-capx-light-bg hover:bg-capx-primary-green
    border-capx-dark-box-bg border-2
    text-capx-dark-box-bg font-extrabold rounded-lg
    text-sm md:text-lg
    py-2.5 px-4 md:py-3 md:px-6
    w-full md:w-auto md:min-w-[150px] md:flex-none
  `;

  const defaultContinueButtonClass = `
    bg-capx-secondary-purple hover:bg-capx-primary-green
    text-white hover:text-capx-dark-bg font-extrabold rounded-lg
    text-sm md:text-lg
    py-2.5 px-4 md:py-3 md:px-6
    w-full md:w-auto md:min-w-[150px] md:flex-none
  `;

  return (
    <div className={customClass}>
      {isOpen && (
        <dialog
          ref={dialogRef}
          className={`fixed inset-0 z-50 m-auto
            w-[85%] max-w-[calc(100vw-24px)] md:w-[700px] md:max-w-[90vw]
            ${minHeight} max-h-[90vh] md:max-h-[95vh]
            rounded-3xl shadow-xl overflow-hidden overflow-x-hidden box-border ${darkMode ? 'bg-[#04222F]' : 'bg-[#FFFFFF]'}
            border-0 p-0 backdrop:bg-black backdrop:bg-opacity-50`}
          aria-modal="true"
          aria-labelledby="popup-title"
          aria-describedby={children ? 'popup-content' : undefined}
          onClose={onCloseTab}
        >
          <div
            className="flex flex-col h-full max-h-[90vh] md:max-h-[95vh] min-h-0 box-border"
            style={{ maxWidth: '100%', overflowX: 'hidden' }}
          >
            {/* Scrollable header + content */}
            <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden custom-scrollbar px-4 pt-4 md:px-10 md:pt-10">
              <div className="flex flex-col gap-3 md:gap-6">
                {/* Header */}
                <div className="shrink-0">
                  <div className="flex flex-col md:flex-row items-center gap-4 md:gap-8">
                    {image && (
                      <div className="md:w-1/2 flex justify-center items-center flex-shrink-0">
                        <Image
                          src={image}
                          alt={pageContent['alt-illustration'] || 'Popup illustration'}
                          className={`${imageSize} h-auto max-h-[150px] md:max-h-none object-contain`}
                          priority
                        />
                      </div>
                    )}
                    <div
                      className={`${image ? 'md:w-1/2' : 'w-full'} flex items-center justify-center`}
                    >
                      <h2
                        id="popup-title"
                        className={`text-xl md:text-3xl xl:text-4xl font-extrabold font-[Montserrat] leading-snug pb-1 text-center ${
                          darkMode ? 'text-white' : 'text-[#053749]'
                        } ${titleClassName || ''}`}
                      >
                        {title}
                      </h2>
                    </div>
                  </div>
                </div>

                {/* Content */}
                {children && (
                  <div
                    id="popup-content"
                    className={`w-full max-w-full text-center text-base md:text-lg shrink-0 ${
                      darkMode ? 'text-white' : 'text-[#053749]'
                    }`}
                    style={{ overflowWrap: 'break-word', wordBreak: 'break-word' }}
                  >
                    {children}
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="flex-none w-full max-w-full box-border px-4 pb-4 pt-3 md:px-10 md:pb-10 md:pt-4">
              <div
                className={`flex flex-col md:flex-row justify-center md:justify-start gap-3 md:gap-4 w-full max-w-full ${footerClassName || ''}`}
              >
                {closeButtonLabel && (
                  <BaseButton
                    customClass={closeButtonClassName || defaultCloseButtonClass}
                    label={closeButtonLabel}
                    onClick={onCloseTab}
                  />
                )}
                {continueButtonLabel && (
                  <BaseButton
                    customClass={defaultContinueButtonClass}
                    label={continueButtonLabel}
                    onClick={onContinue ?? noop}
                  />
                )}
              </div>
            </div>
          </div>
        </dialog>
      )}
    </div>
  );
};

export default Popup;
