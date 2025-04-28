import React, { useState } from "react";
import BaseButton from "./BaseButton";
import Image, { StaticImageData } from "next/image";
import { useTheme } from "@/contexts/ThemeContext";

interface PopupProps {
  onContinue?: () => void;
  onClose: () => void;
  image?: StaticImageData;
  title: string;
  closeButtonLabel?: string;
  continueButtonLabel?: string;
  children?: React.ReactNode;
  customClass?: string;
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
}: PopupProps) => {
  const { darkMode } = useTheme();
  const [isOpen, setIsOpen] = useState(true);
  const noop = () => {};

  const onCloseTab = () => {
    setIsOpen(false);
    onClose();
  };

  const onOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onCloseTab();
    }
  };

  return (
    <div className={customClass}>
      {isOpen && (
        <>
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={onOverlayClick}
          />
          <div
            className={`fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 
            w-[90%] md:w-[880px] xl:w-[1024px]
            h-auto md:h-[543px] xl:h-[600px]
            rounded-3xl shadow-xl ${customClass}`}
          >
            <button
              onClick={onCloseTab}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>

            {/* Layout Mobile (<md) */}
            <div
              className={`flex md:hidden flex-col items-center p-8 h-full ${
                darkMode ? "bg-[#005B3F]" : "bg-white"
              }`}
            >
              {image && (
                <Image
                  src={image}
                  alt="Popup Illustration"
                  className="w-full max-w-[300px] h-auto mb-8"
                  priority
                />
              )}

              <h2
                className={`text-xl text-center font-extrabold mb-8 font-[Montserrat] ${
                  darkMode ? "text-white" : "text-[#053749]"
                }`}
              >
                {title}
              </h2>

              {/* Show children components */}
              <div className="mb-8">{children}</div>

              <div className="flex flex-row gap-4 w-full">
                {continueButtonLabel && (
                  <BaseButton
                    customClass={`flex-1 ${
                      darkMode
                        ? "bg-transparent hover:bg-capx-primary-green border-capx-light-bg border-2 text-capx-light-bg font-extrabold rounded-lg text-center text-[14px] py-2 px-4"
                        : "bg-capx-light-bg hover:bg-capx-primary-green border-capx-dark-box-bg border-2 text-capx-dark-box-bg font-extrabold rounded-lg text-center text-[14px] py-2 px-4"
                    }`}
                    label={closeButtonLabel}
                    onClick={onCloseTab}
                  />
                )}
                {continueButtonLabel && (
                  <BaseButton
                    customClass="flex-1 bg-capx-secondary-purple hover:bg-capx-primary-green text-white hover:text-capx-dark-bg font-extrabold rounded-lg text-center text-[14px] py-2 px-4"
                    label={continueButtonLabel}
                    onClick={onContinue ?? noop}
                  />
                )}
              </div>
            </div>

            {/* Layout Desktop (≥md) */}
            <div className="hidden md:flex flex-col h-full p-8">
              <div className="flex flex-row flex-1 mb-8">
              {image ? (
                <>
                  <div className="w-1/2 flex justify-center items-center mr-8 mb-8">
                    <Image
                      src={image}
                      alt="Popup Illustration"
                      className="w-full max-w-[300px] xl:max-w-[400px] h-auto"
                      priority
                    />
                  </div>
                  <div className="w-1/2 flex items-center justify-center">
                    <h2
                      className={`text-4xl xl:text-5xl font-extrabold font-[Montserrat] leading-[normal] ${customClass}`}
                    >
                      {title}
                    </h2>
                  </div>
                </>
              ) : (
                <div className="w-full flex items-center justify-center mb-8">
                  <h2
                    className={`text-4xl xl:text-5xl font-extrabold font-[Montserrat] leading-[normal] text-center ${customClass}`}
                  >
                    {title}
                  </h2>
                </div>
              )}
            </div>

              {/* Show children components */}
              <div className="mb-8">{children}</div>

              <div className="flex flex-row justify-start gap-4">
                {closeButtonLabel && (
                  <BaseButton
                    customClass="bg-capx-light-bg hover:bg-capx-primary-green border-capx-dark-box-bg border-2 text-capx-dark-box-bg font-extrabold rounded-lg text-center text-xl py-2 px-8"
                    label={closeButtonLabel}
                    onClick={onCloseTab}
                  />
                )}
                {continueButtonLabel && (
                  <BaseButton
                    customClass="bg-capx-secondary-purple hover:bg-capx-primary-green text-white hover:text-capx-dark-bg font-extrabold rounded-lg text-center text-xl py-2 px-8"
                    label={continueButtonLabel}
                    onClick={onContinue ?? noop}
                  />
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Popup;
