import React, { useState, useEffect } from 'react';
import BaseButton from './BaseButton';
import Image, { StaticImageData } from 'next/image';
import { useTheme } from '@/contexts/ThemeContext';
import { useApp } from '@/contexts/AppContext';

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
  minHeight = 'min-h-[300px] md:min-h-[400px]',
  contentScrollable = false,
}: PopupProps) => {
  const { darkMode } = useTheme();
  const { pageContent } = useApp();
  const [isOpen, setIsOpen] = useState(true);
  const noop = () => {};

  const onCloseTab = () => {
    setIsOpen(false);
    onClose?.();
  };

  const onOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onCloseTab();
    }
  };

  // Handle escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onCloseTab();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // Focus trap - focus the modal when it opens
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  return (
    <div className={customClass}>
      {isOpen && (
        <>
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={onOverlayClick}
            aria-hidden="true"
          />
          <div
            className={`fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50
            w-[90%] md:w-[880px] xl:w-[1024px]
            ${minHeight} max-h-[90vh]
            rounded-3xl shadow-xl ${contentScrollable ? 'overflow-hidden' : 'overflow-hidden'} ${darkMode ? 'bg-[#04222F]' : 'bg-[#FFFFFF]'}`}
            role="dialog"
            aria-modal="true"
            aria-labelledby="popup-title"
            aria-describedby="popup-content"
          >
            <div
              className={`flex flex-col h-full p-4 md:p-8 ${contentScrollable ? 'max-h-[90vh]' : ''}`}
            >
              {/* Header */}
              <div className="flex-none">
                <div className="flex flex-col md:flex-row items-center gap-4 md:gap-8">
                  {image && (
                    <div className="md:w-1/2 flex justify-center items-center">
                      <Image
                        src={image}
                        alt={pageContent['alt-illustration'] || 'Popup illustration'}
                        className={`${imageSize} h-auto`}
                        priority
                      />
                    </div>
                  )}
                  <div
                    className={`${image ? 'md:w-1/2' : 'w-full'} flex items-center justify-center`}
                  >
                    <h2
                      id="popup-title"
                      className={`text-xl md:text-3xl xl:text-4xl font-extrabold font-[Montserrat] leading-normal text-center ${
                        darkMode ? 'text-white' : 'text-[#053749]'
                      } ${titleClassName || ''}`}
                    >
                      {title}
                    </h2>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div
                className={`flex-grow ${contentScrollable ? 'overflow-y-auto' : 'flex items-center justify-center'} ${
                  children ? 'my-4 md:my-6' : 'my-2'
                }`}
              >
                <div
                  id="popup-content"
                  className={`w-full text-center text-base md:text-lg ${
                    darkMode ? 'text-white' : 'text-[#053749]'
                  }`}
                >
                  {children}
                </div>
              </div>

              {/* Footer */}
              <div className="flex-none">
                <div
                  className={`flex flex-row justify-center md:justify-start gap-3 md:gap-4 ${footerClassName || ''}`}
                >
                  {closeButtonLabel && (
                    <BaseButton
                      customClass={
                        closeButtonClassName ||
                        `
                        bg-capx-light-bg hover:bg-capx-primary-green
                        border-capx-dark-box-bg border-2
                        text-capx-dark-box-bg font-extrabold rounded-lg
                        text-sm md:text-lg
                        py-2 px-4 md:py-3 md:px-6
                        min-w-[100px] md:min-w-[150px]
                      `
                      }
                      label={closeButtonLabel}
                      onClick={onCloseTab}
                    />
                  )}
                  {continueButtonLabel && (
                    <BaseButton
                      customClass={`
                        bg-capx-secondary-purple hover:bg-capx-primary-green
                        text-white hover:text-capx-dark-bg font-extrabold rounded-lg
                        text-sm md:text-lg
                        py-2 px-4 md:py-3 md:px-6
                        min-w-[100px] md:min-w-[150px]
                      `}
                      label={continueButtonLabel}
                      onClick={onContinue ?? noop}
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Popup;
